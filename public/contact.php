<?php
/**
 * Het contactformulier van aartdenbraber.nl.
 *
 *   GET  /contact.php  geeft een getekend token uit, plus de sitekey van Turnstile als die aanstaat.
 *   POST /contact.php  neemt een bericht aan en stuurt het per mail door.
 *
 * De botwering is dezelfde als die van de EV Company-formulieren in wecatalyze-apis, in lagen:
 *
 *   1. Token met tijdval. Een bericht moet een token dragen dat dit script zelf heeft uitgegeven en
 *      met HMAC heeft getekend. Het moet minstens drie seconden oud zijn (een mens vult geen
 *      formulier in onder die tijd, een bot die ophaalt en meteen post wel), het verloopt na zes
 *      uur en het werkt maar één keer. De site haalt het token op zodra de pagina laadt.
 *   2. Honeypot. Het formulier heeft een veld "fax" dat mensen niet zien en niet kunnen bereiken.
 *      Staat daar iets in, dan antwoordt dit script alsof het bericht verstuurd is en gooit het weg.
 *      Zo leert de bot niet wat hem verraadde.
 *   3. Controle van de invoer en een limiet per IP-adres en per dag.
 *   4. Cloudflare Turnstile, stil: de widget laat zich alleen zien als Cloudflare twijfelt. Is
 *      Cloudflare zelf onbereikbaar, dan gaat het bericht toch door, met een regel in het
 *      foutenlog. Liever af en toe spam dan een gemiste aanvraag.
 *
 * Er zit bewust geen filter op de inhoud in. Dat is fragiel en houdt vooral echte berichten tegen.
 *
 * De instellingen staan niet in dit bestand en niet in de repo, want die is openbaar. Ze staan in
 * contactformulier/config.php, een map boven de webroot. Zie de README en
 * deploy/contactformulier-config.voorbeeld.php.
 *
 * Geschreven voor PHP 7.4 en hoger, omdat niet vaststaat welke versie de server draait.
 */

declare(strict_types=1);

const CF_TOKENVERSIE = 'v1';
const CF_MAX_VERZOEK_BYTES = 20000;
const CF_MAX_NAAM = 100;
const CF_MAX_EMAIL = 254;
const CF_MAX_BERICHT = 5000;
const CF_TURNSTILE_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/** De keuzes in het formulier, met hoe ze in de mail komen te staan. */
const CF_ONDERWERPEN = [
    'opdracht' => 'Een opdracht als developer',
    'website' => 'Een nieuwe website',
    'anders' => 'Iets anders',
];

/*--------------------------------------------------------------
# Instellingen
--------------------------------------------------------------*/

function cf_config_pad(): string
{
    $uitOmgeving = getenv('CONTACTFORMULIER_CONFIG');
    if (is_string($uitOmgeving) && $uitOmgeving !== '') {
        return $uitOmgeving;
    }

    // Eén map boven de webroot, dus /home/aartdenbraber/domains/aartdenbraber.nl/contactformulier.
    // Het FTP-account van de uitrol begint in de webroot en komt daar niet bij.
    return dirname(__DIR__) . '/contactformulier/config.php';
}

/**
 * Leest het configbestand en vult aan met de standaardwaarden.
 *
 * @return array{0: ?array, 1: string} de instellingen, of null met de reden waarom niet
 */
function cf_laad_config(string $pad): array
{
    if (!is_file($pad)) {
        return [null, 'er staat geen configbestand op ' . $pad];
    }

    $ingelezen = require $pad;
    if (!is_array($ingelezen)) {
        return [null, 'het configbestand geeft geen array terug'];
    }

    $config = array_merge([
        'ontvanger' => '',
        'afzender' => 'noreply@aartdenbraber.nl',
        'geheim' => '',
        'turnstileSitekey' => '',
        'turnstileSecret' => '',
        'minLeeftijdMs' => 3000,
        'maxLeeftijdMs' => 6 * 3600 * 1000,
        'maxBerichtenPerUurPerIp' => 10,
        'maxTokensPerUurPerIp' => 60,
        'maxBerichtenPerDag' => 50,
        'opslag' => dirname($pad) . '/opslag',
        'testmap' => '',
    ], $ingelezen);

    foreach (['ontvanger', 'afzender', 'geheim', 'turnstileSitekey', 'turnstileSecret', 'opslag', 'testmap'] as $sleutel) {
        if (!is_string($config[$sleutel])) {
            return [null, $sleutel . ' moet tekst zijn'];
        }
    }
    foreach (['minLeeftijdMs', 'maxLeeftijdMs', 'maxBerichtenPerUurPerIp', 'maxTokensPerUurPerIp', 'maxBerichtenPerDag'] as $sleutel) {
        if (!is_int($config[$sleutel]) || $config[$sleutel] < 0) {
            return [null, $sleutel . ' moet een geheel getal van 0 of meer zijn'];
        }
    }
    foreach (['ontvanger', 'afzender'] as $sleutel) {
        if (filter_var($config[$sleutel], FILTER_VALIDATE_EMAIL) === false) {
            return [null, $sleutel . ' is geen geldig e-mailadres'];
        }
    }
    if (strlen($config['geheim']) < 32) {
        return [null, 'geheim moet minstens 32 tekens lang zijn'];
    }

    // Half ingesteld is erger dan uit. Een sitekey zonder secret toont de widget en controleert
    // niets; een secret zonder sitekey wijst elk bericht af.
    if (($config['turnstileSitekey'] === '') !== ($config['turnstileSecret'] === '')) {
        return [null, 'turnstileSitekey en turnstileSecret moeten allebei gevuld of allebei leeg zijn'];
    }

    return [$config, ''];
}

/*--------------------------------------------------------------
# Token met tijdval
--------------------------------------------------------------*/

function cf_b64url(string $bytes): string
{
    return rtrim(strtr(base64_encode($bytes), '+/', '-_'), '=');
}

function cf_b64url_terug(string $tekst): ?string
{
    if (preg_match('/^[A-Za-z0-9_-]+$/', $tekst) !== 1) {
        return null;
    }
    $bytes = base64_decode(strtr($tekst, '-_', '+/'), true);

    return $bytes === false ? null : $bytes;
}

/**
 * Een eigen sleutel per doel, afgeleid van het geheim. Zo is het geheim zelf nooit de sleutel van
 * een HMAC die ergens naar buiten gaat.
 */
function cf_sleutel(array $config, string $doel): string
{
    return hash_hmac('sha256', 'contactformulier|' . $doel, $config['geheim'], true);
}

function cf_geef_token(array $config, int $nuMs): string
{
    $payload = cf_b64url((string) json_encode(['t' => $nuMs, 'n' => bin2hex(random_bytes(16))]));
    $handtekening = cf_b64url(hash_hmac('sha256', $payload, cf_sleutel($config, 'token'), true));

    return CF_TOKENVERSIE . '.' . $payload . '.' . $handtekening;
}

/**
 * Controleert handtekening en leeftijd. Het token wordt hier nog niet verbruikt: dat gebeurt pas
 * vlak voor het versturen, zodat een typefout in het e-mailadres het token niet opmaakt.
 *
 * @return array{ok: bool, reden: string, nonce: string}
 */
function cf_controleer_token(array $config, string $token, int $nuMs): array
{
    $afgewezen = function (string $reden): array {
        return ['ok' => false, 'reden' => $reden, 'nonce' => ''];
    };

    if ($token === '') {
        return $afgewezen('ontbreekt');
    }

    $delen = explode('.', $token);
    if (count($delen) !== 3 || $delen[0] !== CF_TOKENVERSIE) {
        return $afgewezen('ongeldig');
    }

    $verwacht = cf_b64url(hash_hmac('sha256', $delen[1], cf_sleutel($config, 'token'), true));
    if (!hash_equals($verwacht, $delen[2])) {
        return $afgewezen('ongeldig');
    }

    $json = cf_b64url_terug($delen[1]);
    $payload = $json === null ? null : json_decode($json, true);
    if (
        !is_array($payload)
        || !is_int($payload['t'] ?? null)
        || !is_string($payload['n'] ?? null)
        || preg_match('/^[0-9a-f]{32}$/', $payload['n']) !== 1
    ) {
        return $afgewezen('ongeldig');
    }

    $leeftijd = $nuMs - $payload['t'];
    if ($leeftijd > $config['maxLeeftijdMs']) {
        return $afgewezen('verlopen');
    }
    // Een token uit de toekomst komt ook niet van hier.
    if ($leeftijd < $config['minLeeftijdMs']) {
        return $afgewezen('te_snel');
    }

    return ['ok' => true, 'reden' => '', 'nonce' => $payload['n']];
}

/*--------------------------------------------------------------
# Tellers en eenmalig gebruik, in bestanden
--------------------------------------------------------------*/
// Er draait geen proces dat iets kan onthouden tussen twee verzoeken, dus dat gaat via kleine
// bestanden in de opslagmap. Lukt lezen of schrijven daar niet, dan laten de functies het verzoek
// door en schrijven ze een regel in het foutenlog. Het token en Turnstile houden dan nog steeds
// tegen; een kapotte map mag geen echte berichten kosten.

function cf_map(array $config, string $sub, callable $log): ?string
{
    $map = rtrim($config['opslag'], '/\\') . '/' . $sub;
    if (is_dir($map) || @mkdir($map, 0700, true) || is_dir($map)) {
        return $map;
    }
    $log('de map ' . $map . ' bestaat niet en kan niet worden aangemaakt');

    return null;
}

/**
 * Telt een poging in een vast venster. Geeft false zodra het maximum in dit venster al bereikt is.
 *
 * In de bestandsnaam staat een HMAC van de sleutel, dus er komt geen IP-adres op schijf.
 */
function cf_tel(array $config, string $sleutel, int $vensterSec, int $max, int $nuSec, callable $log): bool
{
    $map = cf_map($config, 'tellers', $log);
    if ($map === null) {
        return true;
    }

    $pad = $map . '/' . substr(hash_hmac('sha256', $sleutel, cf_sleutel($config, 'teller')), 0, 32);
    $handvat = @fopen($pad, 'c+');
    if ($handvat === false) {
        $log('kan de teller ' . $pad . ' niet openen');

        return true;
    }

    try {
        if (!flock($handvat, LOCK_EX)) {
            return true;
        }

        $venster = intdiv($nuSec, $vensterSec);
        $stand = json_decode((string) stream_get_contents($handvat), true);
        $aantal = is_array($stand) && ($stand['venster'] ?? null) === $venster && is_int($stand['aantal'] ?? null)
            ? $stand['aantal']
            : 0;

        if ($aantal >= $max) {
            return false;
        }

        ftruncate($handvat, 0);
        rewind($handvat);
        fwrite($handvat, (string) json_encode(['venster' => $venster, 'aantal' => $aantal + 1]));
        fflush($handvat);

        return true;
    } finally {
        flock($handvat, LOCK_UN);
        fclose($handvat);
    }
}

/**
 * Markeert het token als gebruikt. Geeft false als dat al eerder gebeurd was.
 *
 * Het aanmaken met modus "x" slaagt maar voor één verzoek, ook als er twee tegelijk binnenkomen.
 */
function cf_verbruik_nonce(array $config, string $nonce, callable $log): bool
{
    $map = cf_map($config, 'tokens', $log);
    if ($map === null) {
        return true;
    }

    $pad = $map . '/' . $nonce;
    $handvat = @fopen($pad, 'x');
    if ($handvat !== false) {
        fclose($handvat);

        return true;
    }
    if (file_exists($pad)) {
        return false;
    }
    $log('kan ' . $pad . ' niet aanmaken');

    return true;
}

/** Geeft een token weer vrij als er na het verbruiken toch niets verstuurd is. */
function cf_geef_nonce_vrij(array $config, string $nonce, callable $log): void
{
    $map = cf_map($config, 'tokens', $log);
    if ($map !== null) {
        @unlink($map . '/' . $nonce);
    }
}

/** Gooit tokens en tellers weg die niets meer tegenhouden. */
function cf_ruim_op(array $config, int $nuSec, callable $log): void
{
    $maxLeeftijden = [
        'tokens' => intdiv($config['maxLeeftijdMs'], 1000) + 60,
        'tellers' => 2 * 86400,
    ];

    foreach ($maxLeeftijden as $sub => $maxLeeftijd) {
        $map = cf_map($config, $sub, $log);
        $paden = $map === null ? false : glob($map . '/*');
        if ($paden === false) {
            continue;
        }
        foreach ($paden as $pad) {
            $gewijzigd = @filemtime($pad);
            if ($gewijzigd !== false && $nuSec - $gewijzigd > $maxLeeftijd) {
                @unlink($pad);
            }
        }
    }
}

/*--------------------------------------------------------------
# Invoer
--------------------------------------------------------------*/

/** Het aantal tekens, of null als het geen geldige UTF-8 is. */
function cf_lengte(string $tekst): ?int
{
    $aantal = preg_match_all('/./su', $tekst);

    return $aantal === false ? null : $aantal;
}

/**
 * Leest de velden uit het bericht. De foutcodes gaan terug naar de site, die er per taal een tekst
 * bij zoekt.
 *
 * @return array{waarden: array<string, string>, fouten: array<string, string>}
 */
function cf_lees_invoer(array $invoer): array
{
    $tekst = function (string $veld) use ($invoer): string {
        $waarde = $invoer[$veld] ?? '';

        return is_string($waarde) ? $waarde : '';
    };
    $fouten = [];

    $naam = trim($tekst('naam'));
    $lengte = cf_lengte($naam);
    if ($lengte === null || preg_match('/[\x00-\x1F\x7F]/', $naam) === 1) {
        $fouten['naam'] = 'ongeldig';
    } elseif ($lengte === 0) {
        $fouten['naam'] = 'leeg';
    } elseif ($lengte > CF_MAX_NAAM) {
        $fouten['naam'] = 'te_lang';
    }

    // FILTER_VALIDATE_EMAIL laat geen regeleinden door, dus dit adres kan veilig in Reply-To.
    $email = trim($tekst('email'));
    if ($email === '') {
        $fouten['email'] = 'leeg';
    } elseif (strlen($email) > CF_MAX_EMAIL || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
        $fouten['email'] = 'ongeldig';
    }

    $onderwerp = $tekst('onderwerp');
    if ($onderwerp !== '' && !array_key_exists($onderwerp, CF_ONDERWERPEN)) {
        $fouten['onderwerp'] = 'ongeldig';
    }

    // Regeleinden gelijktrekken en onzichtbare stuurtekens weghalen. Tabs en regeleinden blijven.
    $bericht = preg_replace('/[\x00-\x08\x0B-\x1F\x7F]/u', '', str_replace(["\r\n", "\r"], "\n", $tekst('bericht')));
    $bericht = $bericht === null ? null : trim($bericht);
    $lengte = $bericht === null ? null : cf_lengte($bericht);
    if ($lengte === null) {
        $fouten['bericht'] = 'ongeldig';
    } elseif ($lengte === 0) {
        $fouten['bericht'] = 'leeg';
    } elseif ($lengte > CF_MAX_BERICHT) {
        $fouten['bericht'] = 'te_lang';
    }

    return [
        'waarden' => [
            'naam' => $naam,
            'email' => $email,
            'onderwerp' => $onderwerp,
            'bericht' => (string) $bericht,
            'taal' => $tekst('taal') === 'en' ? 'en' : 'nl',
        ],
        'fouten' => $fouten,
    ];
}

/*--------------------------------------------------------------
# Turnstile
--------------------------------------------------------------*/

/**
 * Een POST met een timeout. Curl als die er is, anders een stream.
 *
 * @return array{0: int, 1: string}|null status en inhoud, of null als er geen antwoord kwam
 */
function cf_http_post(string $url, string $inhoud): ?array
{
    if (function_exists('curl_init')) {
        $curl = curl_init($url);
        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $inhoud,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 3,
            CURLOPT_TIMEOUT => 5,
            CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
        ]);
        $antwoord = curl_exec($curl);
        $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);

        return is_string($antwoord) ? [$status, $antwoord] : null;
    }

    $context = stream_context_create(['http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
        'content' => $inhoud,
        'timeout' => 5,
        'ignore_errors' => true,
    ]]);
    $antwoord = @file_get_contents($url, false, $context);
    if ($antwoord === false) {
        return null;
    }
    $koppen = function_exists('http_get_last_response_headers')
        ? (http_get_last_response_headers() ?? [])
        : ($http_response_header ?? []);
    preg_match('#^HTTP/\S+\s+(\d{3})#', (string) ($koppen[0] ?? ''), $treffer);

    return [(int) ($treffer[1] ?? 0), $antwoord];
}

/**
 * Legt het token van de widget voor aan Cloudflare.
 *
 * De uitkomst is één van:
 *   geslaagd            Cloudflare zegt dat het een mens is.
 *   afgewezen           Cloudflare wijst het token af: een bot, of een token dat al gebruikt is.
 *   ontbreekt           Er kwam geen token mee.
 *   onbereikbaar        Cloudflare gaf geen bruikbaar antwoord. Tijdelijk, dus het bericht gaat door.
 *   verkeerd_ingesteld  Cloudflare wijst de secret af. Dat gaat niet vanzelf over.
 *
 * @param callable $post zie cf_http_post; de tests geven hier een nep-Cloudflare mee
 * @return array{0: string, 1: string} de uitkomst en een toelichting voor het log
 */
function cf_turnstile(string $secret, string $token, string $ip, callable $post): array
{
    if ($token === '') {
        return ['ontbreekt', ''];
    }

    $velden = ['secret' => $secret, 'response' => $token];
    if ($ip !== '') {
        $velden['remoteip'] = $ip;
    }
    $antwoord = $post(CF_TURNSTILE_URL, http_build_query($velden));
    if ($antwoord === null) {
        return ['onbereikbaar', 'geen antwoord'];
    }

    // Niet eerst op de status afgaan. Bij een afgewezen secret antwoordt Cloudflare met 400 en
    // staat de reden gewoon in de JSON; op de status alleen leek dat een storing, en zakte de
    // luide melding in het log weg. Alleen zonder bruikbare JSON is Cloudflare onbereikbaar.
    $inhoud = json_decode($antwoord[1], true);
    if (!is_array($inhoud)) {
        return ['onbereikbaar', 'status ' . $antwoord[0] . ', geen JSON'];
    }
    if (($inhoud['success'] ?? null) === true) {
        return ['geslaagd', ''];
    }

    $codes = is_array($inhoud['error-codes'] ?? null)
        ? array_values(array_filter($inhoud['error-codes'], 'is_string'))
        : [];
    $toelichting = $codes === [] ? 'token afgewezen' : implode(', ', $codes);

    if (array_intersect($codes, ['missing-input-secret', 'invalid-input-secret', 'bad-request']) !== []) {
        return ['verkeerd_ingesteld', $toelichting];
    }
    if ($codes !== [] && array_diff($codes, ['internal-error']) === []) {
        return ['onbereikbaar', $toelichting];
    }

    return ['afgewezen', $toelichting];
}

/*--------------------------------------------------------------
# De mail
--------------------------------------------------------------*/

/**
 * Codeert een kopregel volgens RFC 2047 als er iets anders dan gewone ASCII in staat.
 *
 * Elk stuk is hooguit 45 bytes, dat wordt 60 tekens base64 en blijft zo onder de 75 tekens die
 * een gecodeerd woord mag zijn. Er wordt alleen tussen hele tekens geknipt.
 */
function cf_codeer_kop(string $tekst): string
{
    if (preg_match('/^[\x20-\x7E]*$/', $tekst) === 1) {
        return $tekst;
    }

    $stukken = [];
    $stuk = '';
    foreach (preg_split('//u', $tekst, -1, PREG_SPLIT_NO_EMPTY) ?: [] as $teken) {
        if ($stuk !== '' && strlen($stuk) + strlen($teken) > 45) {
            $stukken[] = $stuk;
            $stuk = '';
        }
        $stuk .= $teken;
    }
    if ($stuk !== '') {
        $stukken[] = $stuk;
    }

    return implode("\r\n ", array_map(function (string $stuk): string {
        return '=?UTF-8?B?' . base64_encode($stuk) . '?=';
    }, $stukken));
}

/**
 * @param array<string, string> $waarden uit cf_lees_invoer
 * @return array{aan: string, onderwerp: string, tekst: string, koppen: array<string, string>}
 */
function cf_maak_mail(array $waarden, array $config): array
{
    $onderwerp = $waarden['onderwerp'] === '' ? 'niets gekozen' : CF_ONDERWERPEN[$waarden['onderwerp']];

    $tekst = implode("\n", [
        'Naam: ' . $waarden['naam'],
        'E-mailadres: ' . $waarden['email'],
        'Waar gaat het over: ' . $onderwerp,
        'Taal van de pagina: ' . ($waarden['taal'] === 'en' ? 'Engels' : 'Nederlands'),
        '',
        $waarden['bericht'],
        '',
        '',
        'Verstuurd met het contactformulier op aartdenbraber.nl. Met Beantwoorden schrijf je '
            . $waarden['email'] . ' terug.',
    ]);

    return [
        'aan' => $config['ontvanger'],
        'onderwerp' => cf_codeer_kop('Contactformulier: bericht van ' . $waarden['naam']),
        // Base64, zodat regellengte en tekens in het bericht nooit een probleem worden.
        'tekst' => rtrim(chunk_split(base64_encode(str_replace("\n", "\r\n", $tekst)), 76, "\r\n")),
        'koppen' => [
            'From' => '"Contactformulier aartdenbraber.nl" <' . $config['afzender'] . '>',
            'Reply-To' => $waarden['email'],
            'MIME-Version' => '1.0',
            'Content-Type' => 'text/plain; charset=UTF-8',
            'Content-Transfer-Encoding' => 'base64',
        ],
    ];
}

/**
 * Verstuurt met mail(), of schrijft een .eml-bestand als testmap is ingesteld.
 *
 * De afzender staat altijd op het eigen domein en het adres van de bezoeker gaat alleen in
 * Reply-To. De SPF-record van aartdenbraber.nl staat de server toe, en met -f is het domein van de
 * envelope gelijk aan dat in From. Zo komt de mail door SPF en klopt de afzender.
 */
function cf_verstuur_mail(array $mail, array $config): bool
{
    if ($config['testmap'] !== '') {
        $koppen = 'To: ' . $mail['aan'] . "\r\nSubject: " . $mail['onderwerp'] . "\r\n";
        foreach ($mail['koppen'] as $naam => $waarde) {
            $koppen .= $naam . ': ' . $waarde . "\r\n";
        }
        $pad = rtrim($config['testmap'], '/\\') . '/' . date('Ymd-His') . '-' . bin2hex(random_bytes(4)) . '.eml';

        return @file_put_contents($pad, $koppen . "\r\n" . $mail['tekst'] . "\r\n") !== false;
    }

    return mail($mail['aan'], $mail['onderwerp'], $mail['tekst'], $mail['koppen'], '-f' . $config['afzender']);
}

/*--------------------------------------------------------------
# Het verzoek
--------------------------------------------------------------*/

/**
 * Verwerkt één verzoek en geeft de status en het antwoord terug.
 *
 * Staat los van de superglobals, zodat de tests hem aanroepen met hun eigen klok, Cloudflare en
 * mailer.
 *
 * @param array{methode: string, inhoud: string, ip: string, nuMs: int} $verzoek
 * @param array{config: ?array, configFout: string, turnstile: callable, mail: callable, log: callable} $afh
 * @return array{0: int, 1: array<string, mixed>}
 */
function cf_verwerk(array $verzoek, array $afh): array
{
    $log = $afh['log'];
    $weiger = function (int $status, string $code): array {
        return [$status, ['ok' => false, 'code' => $code]];
    };

    if ($verzoek['methode'] !== 'GET' && $verzoek['methode'] !== 'POST') {
        return $weiger(405, 'methode_niet_toegestaan');
    }

    $config = $afh['config'];
    if ($config === null) {
        $log('staat uit: ' . $afh['configFout']);

        return $weiger(503, 'niet_ingesteld');
    }

    $nuSec = intdiv($verzoek['nuMs'], 1000);

    if ($verzoek['methode'] === 'GET') {
        if (!cf_tel($config, 'token|' . $verzoek['ip'], 3600, $config['maxTokensPerUurPerIp'], $nuSec, $log)) {
            return $weiger(429, 'te_veel');
        }

        return [200, [
            'ok' => true,
            'token' => cf_geef_token($config, $verzoek['nuMs']),
            'minLeeftijdMs' => $config['minLeeftijdMs'],
            'turnstileSitekey' => $config['turnstileSitekey'] === '' ? null : $config['turnstileSitekey'],
        ]];
    }

    if (strlen($verzoek['inhoud']) > CF_MAX_VERZOEK_BYTES) {
        return $weiger(413, 'te_groot');
    }
    $invoer = json_decode($verzoek['inhoud'], true);
    if (!is_array($invoer)) {
        return $weiger(400, 'ongeldig_verzoek');
    }

    // De limiet per adres komt voor al het andere werk: goedkoop, en het houdt één bron af.
    if (!cf_tel($config, 'bericht|' . $verzoek['ip'], 3600, $config['maxBerichtenPerUurPerIp'], $nuSec, $log)) {
        return $weiger(429, 'te_veel');
    }

    $antibot = is_array($invoer['antibot'] ?? null) ? $invoer['antibot'] : [];
    $antibotveld = function (string $naam) use ($antibot): string {
        $waarde = $antibot[$naam] ?? '';

        return is_string($waarde) ? $waarde : '';
    };

    $token = cf_controleer_token($config, $antibotveld('challenge'), $verzoek['nuMs']);
    if (!$token['ok']) {
        $log('bericht geweigerd, token ' . $token['reden']);

        return $weiger(400, 'challenge_' . $token['reden']);
    }

    $gelezen = cf_lees_invoer($invoer);
    if ($gelezen['fouten'] !== []) {
        return [400, ['ok' => false, 'code' => 'ongeldig', 'velden' => $gelezen['fouten']]];
    }

    // Hetzelfde antwoord als bij een verstuurd bericht, zodat een bot er niets van leert.
    if ($antibotveld('honeypot') !== '') {
        $log('honeypot ingevuld, bericht stil weggegooid');

        return [200, ['ok' => true]];
    }

    if ($config['turnstileSecret'] !== '') {
        [$uitkomst, $toelichting] = ($afh['turnstile'])($config['turnstileSecret'], $antibotveld('turnstile'), $verzoek['ip']);

        if ($uitkomst === 'afgewezen' || $uitkomst === 'ontbreekt') {
            $log('bericht geweigerd door Turnstile: ' . $uitkomst . ($toelichting === '' ? '' : ' (' . $toelichting . ')'));

            return $weiger(400, 'botcheck_mislukt');
        }
        if ($uitkomst === 'onbereikbaar') {
            $log('Turnstile gaf geen antwoord (' . $toelichting . '), bericht toch doorgelaten');
        }
        if ($uitkomst === 'verkeerd_ingesteld') {
            $log('CLOUDFLARE WIJST DE TURNSTILE-SECRET AF (' . $toelichting . '). De botcheck houdt nu niets tegen; herstel turnstileSecret in de config.');
        }
    }

    if (!cf_verbruik_nonce($config, $token['nonce'], $log)) {
        $log('bericht geweigerd, token al gebruikt');

        return $weiger(400, 'challenge_hergebruikt');
    }

    if (!cf_tel($config, 'dag', 86400, $config['maxBerichtenPerDag'], $nuSec, $log)) {
        cf_geef_nonce_vrij($config, $token['nonce'], $log);
        $log('het maximum aantal berichten per dag is bereikt');

        return $weiger(429, 'te_veel');
    }

    if (!($afh['mail'])(cf_maak_mail($gelezen['waarden'], $config), $config)) {
        cf_geef_nonce_vrij($config, $token['nonce'], $log);
        $log('mail() gaf false terug, bericht niet verstuurd');

        return $weiger(500, 'verzenden_mislukt');
    }

    return [200, ['ok' => true]];
}

// Vanaf de opdrachtregel doet dit bestand niets, zodat de tests het kunnen inladen.
if (PHP_SAPI !== 'cli') {
    $cfLog = function (string $bericht): void {
        error_log('contactformulier: ' . $bericht);
    };
    [$cfConfig, $cfConfigFout] = cf_laad_config(cf_config_pad());

    if ($cfConfig !== null && random_int(1, 50) === 1) {
        cf_ruim_op($cfConfig, time(), $cfLog);
    }

    [$cfStatus, $cfAntwoord] = cf_verwerk([
        'methode' => (string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'),
        'inhoud' => (string) file_get_contents('php://input', false, null, 0, CF_MAX_VERZOEK_BYTES + 1),
        'ip' => (string) ($_SERVER['REMOTE_ADDR'] ?? ''),
        'nuMs' => (int) floor(microtime(true) * 1000),
    ], [
        'config' => $cfConfig,
        'configFout' => $cfConfigFout,
        'turnstile' => function (string $secret, string $token, string $ip): array {
            return cf_turnstile($secret, $token, $ip, 'cf_http_post');
        },
        'mail' => 'cf_verstuur_mail',
        'log' => $cfLog,
    ]);

    http_response_code($cfStatus);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    if ($cfStatus === 405) {
        header('Allow: GET, POST');
    }
    echo json_encode($cfAntwoord);
}
