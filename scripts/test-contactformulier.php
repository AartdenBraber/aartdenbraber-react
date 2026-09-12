<?php
/**
 * Tests voor public/contact.php.
 *
 *   php scripts/test-contactformulier.php
 *
 * Zonder PHPUnit: de site heeft verder geen PHP, en alles wat hier nodig is zit in PHP zelf. De
 * workflow draait dit voor elke uitrol.
 */

declare(strict_types=1);

require __DIR__ . '/../public/contact.php';

const NU = 1757700000000;
const IP = '203.0.113.7';

$geslaagd = 0;
$mislukt = [];

function verwacht($werkelijk, $verwacht, string $wat): void
{
    global $geslaagd, $mislukt;

    if ($werkelijk === $verwacht) {
        $geslaagd++;

        return;
    }
    $mislukt[] = $wat . "\n    verwacht: " . var_export($verwacht, true) . "\n    kreeg:    " . var_export($werkelijk, true);
}

function verwijder(string $pad): void
{
    if (is_dir($pad)) {
        $namen = scandir($pad);
        foreach ($namen === false ? [] : array_diff($namen, ['.', '..']) as $naam) {
            verwijder($pad . '/' . $naam);
        }
        rmdir($pad);
    } elseif (file_exists($pad)) {
        unlink($pad);
    }
}

$tijdelijk = sys_get_temp_dir() . '/contactformulier-test-' . bin2hex(random_bytes(4));
mkdir($tijdelijk);
register_shutdown_function(function () use ($tijdelijk): void {
    verwijder($tijdelijk);
});

/** Schrijft een configbestand in een eigen map, zodat elke test zijn eigen opslag heeft. */
function maak_config(array $instellingen = []): array
{
    global $tijdelijk;
    static $nummer = 0;

    $nummer++;
    $map = $tijdelijk . '/omgeving-' . $nummer;
    mkdir($map);
    $pad = $map . '/config.php';
    file_put_contents($pad, '<?php return ' . var_export(array_merge([
        'ontvanger' => 'aart@example.com',
        'geheim' => str_repeat('0123456789abcdef', 3),
    ], $instellingen), true) . ';');

    [$config, $fout] = cf_laad_config($pad);
    if ($config === null) {
        throw new RuntimeException('De testconfig is ongeldig: ' . $fout);
    }

    return $config;
}

/** Een server met een nep-Cloudflare en een mailer die alleen onthoudt wat hij had moeten sturen. */
final class Omgeving
{
    public $config;
    public $mails = [];
    public $logs = [];
    public $turnstile = [];
    public $turnstileUitkomst = ['geslaagd', ''];
    public $mailLukt = true;

    public function __construct(?array $config)
    {
        $this->config = $config;
    }

    public function afh(): array
    {
        return [
            'config' => $this->config,
            'configFout' => 'geen config in deze test',
            'turnstile' => function (string $secret, string $token, string $ip): array {
                $this->turnstile[] = [$secret, $token, $ip];

                return $this->turnstileUitkomst;
            },
            'mail' => function (array $mail, array $config): bool {
                $this->mails[] = $mail;

                return $this->mailLukt;
            },
            'log' => function (string $regel): void {
                $this->logs[] = $regel;
            },
        ];
    }

    public function get(int $nuMs, string $ip = IP): array
    {
        return cf_verwerk(['methode' => 'GET', 'inhoud' => '', 'ip' => $ip, 'nuMs' => $nuMs], $this->afh());
    }

    public function post(array $inhoud, int $nuMs, string $ip = IP): array
    {
        return cf_verwerk(['methode' => 'POST', 'inhoud' => (string) json_encode($inhoud), 'ip' => $ip, 'nuMs' => $nuMs], $this->afh());
    }
}

function bericht(string $token, array $anders = []): array
{
    return array_replace_recursive([
        'naam' => 'Jan Jansen',
        'email' => 'jan@example.com',
        'onderwerp' => 'website',
        'bericht' => "Hallo Aart,\nik zoek een nieuwe website.",
        'taal' => 'nl',
        'antibot' => ['challenge' => $token, 'honeypot' => '', 'turnstile' => 'cf-token'],
    ], $anders);
}

function mailtekst(array $mail): string
{
    return (string) base64_decode(str_replace("\r\n", '', $mail['tekst']), true);
}

function decodeer_kop(string $kop): string
{
    if (strpos($kop, '=?UTF-8?B?') === false) {
        return $kop;
    }
    preg_match_all('#=\?UTF-8\?B\?([A-Za-z0-9+/=]*)\?=#', $kop, $treffers);

    return implode('', array_map(function (string $stuk): string {
        return (string) base64_decode($stuk, true);
    }, $treffers[1]));
}

$stil = function (string $regel): void {
};

/*--------------------------------------------------------------
# Instellingen
--------------------------------------------------------------*/

verwacht(cf_laad_config($tijdelijk . '/bestaat-niet.php')[0], null, 'zonder configbestand staat het formulier uit');

$pad = $tijdelijk . '/met-uitvoer.php';
file_put_contents($pad, '<?php return ' . var_export(['ontvanger' => 'aart@example.com', 'geheim' => str_repeat('x', 32)], true) . '; ?>' . PHP_EOL . PHP_EOL . ' uitvoer');
ob_start();
[$metUitvoer] = cf_laad_config($pad);
$doorgelekt = ob_get_clean();
verwacht($metUitvoer === null ? null : $metUitvoer['ontvanger'], 'aart@example.com', 'een config met tekst na ?> wordt gewoon gelezen');
verwacht($doorgelekt, '', 'en die tekst komt niet in het antwoord');

$pad = $tijdelijk . '/kapot.php';
file_put_contents($pad, '<?php return [');
[$kapot, $reden] = cf_laad_config($pad);
verwacht([$kapot, strpos($reden, 'het configbestand geeft een fout') === 0], [null, true], 'een config met een syntaxfout zet het formulier uit in plaats van een 500');

$config = maak_config();
verwacht($config['afzender'], 'noreply@aartdenbraber.nl', 'de afzender heeft een standaardwaarde');
verwacht($config['minLeeftijdMs'], 3000, 'de tijdval staat standaard op drie seconden');
verwacht(basename($config['opslag']), 'opslag', 'de opslag staat standaard naast het configbestand');

foreach ([
    'een leeg geheim' => ['geheim' => ''],
    'een geheim korter dan 32 tekens' => ['geheim' => str_repeat('x', 31)],
    'een ongeldige ontvanger' => ['ontvanger' => 'geen adres'],
    'alleen een sitekey' => ['turnstileSitekey' => 'sitekey'],
    'alleen een secret' => ['turnstileSecret' => 'secret'],
    'een getal als tekst' => ['maxBerichtenPerDag' => '50'],
] as $wat => $instellingen) {
    $pad = $tijdelijk . '/fout-' . md5($wat) . '.php';
    file_put_contents($pad, '<?php return ' . var_export(array_merge([
        'ontvanger' => 'aart@example.com',
        'geheim' => str_repeat('x', 32),
    ], $instellingen), true) . ';');
    verwacht(cf_laad_config($pad)[0], null, 'weigert een config met ' . $wat);
}

/*--------------------------------------------------------------
# Token met tijdval
--------------------------------------------------------------*/

$config = maak_config();
$token = cf_geef_token($config, NU);

verwacht(cf_controleer_token($config, $token, NU + 3000)['ok'], true, 'een token van drie seconden oud is goed');
verwacht(strlen(cf_controleer_token($config, $token, NU + 3000)['nonce']), 32, 'het token draagt een nonce');
verwacht(cf_controleer_token($config, $token, NU + 2999)['reden'], 'te_snel', 'een token van net geen drie seconden is te snel');
verwacht(cf_controleer_token($config, $token, NU - 1)['reden'], 'te_snel', 'een token uit de toekomst wordt geweigerd');
verwacht(cf_controleer_token($config, $token, NU + 6 * 3600 * 1000 + 1)['reden'], 'verlopen', 'een token van ruim zes uur is verlopen');
verwacht(cf_controleer_token($config, '', NU)['reden'], 'ontbreekt', 'zonder token');
verwacht(cf_controleer_token($config, 'v1.rommel.rommel', NU)['reden'], 'ongeldig', 'rommel is geen token');

$anderGeheim = maak_config(['geheim' => str_repeat('y', 32)]);
verwacht(cf_controleer_token($anderGeheim, $token, NU + 3000)['reden'], 'ongeldig', 'een token met een ander geheim wordt geweigerd');

[$versie, , $handtekening] = explode('.', $token);
$vervalst = cf_b64url((string) json_encode(['t' => NU - 60000, 'n' => str_repeat('a', 32)]));
verwacht(
    cf_controleer_token($config, $versie . '.' . $vervalst . '.' . $handtekening, NU)['reden'],
    'ongeldig',
    'een token met een oudere tijd erin valt door de handtekening'
);

/*--------------------------------------------------------------
# Invoer
--------------------------------------------------------------*/

$gelezen = cf_lees_invoer([
    'naam' => '  Jan  ',
    'email' => ' jan@example.com ',
    'onderwerp' => 'website',
    'bericht' => "Regel een\r\nregel twee\x07",
    'taal' => 'en',
]);
verwacht($gelezen['fouten'], [], 'een goed ingevuld bericht heeft geen fouten');
verwacht($gelezen['waarden']['naam'], 'Jan', 'de naam wordt bijgesneden');
verwacht($gelezen['waarden']['email'], 'jan@example.com', 'het e-mailadres wordt bijgesneden');
verwacht($gelezen['waarden']['bericht'], "Regel een\nregel twee", 'regeleinden worden gelijkgetrokken en stuurtekens verdwijnen');
verwacht($gelezen['waarden']['taal'], 'en', 'de taal gaat mee');
verwacht(cf_lees_invoer(['taal' => 'de'])['waarden']['taal'], 'nl', 'een onbekende taal wordt Nederlands');

verwacht(cf_lees_invoer([])['fouten'], ['naam' => 'leeg', 'email' => 'leeg', 'bericht' => 'leeg'], 'een leeg bericht noemt de verplichte velden');
verwacht(cf_lees_invoer(['naam' => ['Jan']])['fouten']['naam'], 'leeg', 'een naam die geen tekst is telt als leeg');
verwacht(cf_lees_invoer(['naam' => str_repeat('é', 100)])['fouten']['naam'] ?? null, null, 'honderd tekens mag, ook als het meer bytes zijn');
verwacht(cf_lees_invoer(['naam' => str_repeat('a', 101)])['fouten']['naam'], 'te_lang', 'een naam van 101 tekens is te lang');
verwacht(cf_lees_invoer(['naam' => "Jan\r\nBcc: iemand@example.com"])['fouten']['naam'], 'ongeldig', 'een regeleinde in de naam wordt geweigerd');
verwacht(cf_lees_invoer(['naam' => "Jan \xC3\x28"])['fouten']['naam'], 'ongeldig', 'kapotte UTF-8 in de naam wordt geweigerd');
verwacht(cf_lees_invoer(['email' => "jan@example.com\r\nBcc: iemand@example.com"])['fouten']['email'], 'ongeldig', 'een regeleinde in het e-mailadres wordt geweigerd');
verwacht(cf_lees_invoer(['email' => 'geen-adres'])['fouten']['email'], 'ongeldig', 'een adres zonder @ wordt geweigerd');
verwacht(cf_lees_invoer(['onderwerp' => 'iets'])['fouten']['onderwerp'], 'ongeldig', 'een onbekend onderwerp wordt geweigerd');
verwacht(cf_lees_invoer(['bericht' => str_repeat('b', 5000)])['fouten']['bericht'] ?? null, null, 'een bericht van 5000 tekens mag');
verwacht(cf_lees_invoer(['bericht' => str_repeat('b', 5001)])['fouten']['bericht'], 'te_lang', 'een bericht van 5001 tekens is te lang');
verwacht(cf_lees_invoer(['bericht' => "Hallo \xFF"])['fouten']['bericht'], 'ongeldig', 'kapotte UTF-8 in het bericht wordt geweigerd');

/*--------------------------------------------------------------
# De mail
--------------------------------------------------------------*/

verwacht(cf_codeer_kop('Contactformulier: bericht van Jan'), 'Contactformulier: bericht van Jan', 'gewone ASCII blijft zoals het is');

$lang = 'Contactformulier: bericht van ' . str_repeat('Zoë Ündërwëg ', 8);
$gecodeerd = cf_codeer_kop($lang);
verwacht(decodeer_kop($gecodeerd), $lang, 'een lange kop met accenten komt heel terug');
verwacht(
    array_values(array_filter(explode("\r\n ", $gecodeerd), function (string $woord): bool {
        return strlen($woord) > 75 || preg_match('//u', (string) base64_decode(substr($woord, 10, -2))) !== 1;
    })),
    [],
    'elk gecodeerd woord is hooguit 75 tekens en bevat alleen hele tekens'
);

$config = maak_config();
$mail = cf_maak_mail(cf_lees_invoer(bericht('x'))['waarden'], $config);
verwacht($mail['aan'], 'aart@example.com', 'de mail gaat naar de ontvanger uit de config');
verwacht($mail['koppen']['From'], '"Contactformulier aartdenbraber.nl" <noreply@aartdenbraber.nl>', 'de afzender staat vast');
verwacht($mail['koppen']['Reply-To'], 'jan@example.com', 'beantwoorden gaat naar de bezoeker');
verwacht(decodeer_kop($mail['onderwerp']), 'Contactformulier: bericht van Jan Jansen', 'de naam staat in het onderwerp');
verwacht(strpos(mailtekst($mail), "Waar gaat het over: Een nieuwe website\r\n") !== false, true, 'het onderwerp staat voluit in de mail');
verwacht(strpos(mailtekst($mail), "Hallo Aart,\r\nik zoek een nieuwe website.") !== false, true, 'het bericht staat in de mail');
verwacht(max(array_map('strlen', explode("\r\n", $mail['tekst']))) <= 76, true, 'geen regel in de mail is langer dan 76 tekens');

$testmap = $tijdelijk . '/mails';
mkdir($testmap);
verwacht(cf_verstuur_mail($mail, maak_config(['testmap' => $testmap])), true, 'met een testmap wordt de mail een bestand');
verwacht(count(glob($testmap . '/*.eml') ?: []), 1, 'er staat één .eml-bestand in de testmap');

/*--------------------------------------------------------------
# Turnstile
--------------------------------------------------------------*/

$aanroepen = [];
$cloudflare = function (?array $antwoord) use (&$aanroepen): callable {
    return function (string $url, string $inhoud) use ($antwoord, &$aanroepen): ?array {
        $aanroepen[] = [$url, $inhoud];

        return $antwoord;
    };
};
$json = function (array $inhoud): array {
    return [200, (string) json_encode($inhoud)];
};

verwacht(cf_turnstile('secret', 'token', IP, $cloudflare($json(['success' => true]))), ['geslaagd', ''], 'Cloudflare zegt dat het een mens is');
parse_str($aanroepen[0][1], $velden);
verwacht($aanroepen[0][0], CF_TURNSTILE_URL, 'de controle gaat naar siteverify');
verwacht($velden, ['secret' => 'secret', 'response' => 'token', 'remoteip' => IP], 'secret, token en IP-adres gaan mee');

foreach ([
    'een afgewezen token' => [$json(['success' => false, 'error-codes' => ['invalid-input-response']]), 'afgewezen'],
    'een al gebruikt token' => [$json(['success' => false, 'error-codes' => ['timeout-or-duplicate']]), 'afgewezen'],
    'een afwijzing zonder codes' => [$json(['success' => false]), 'afgewezen'],
    'een afgewezen secret' => [$json(['success' => false, 'error-codes' => ['invalid-input-secret']]), 'verkeerd_ingesteld'],
    'een afgewezen secret met status 400' => [[400, (string) json_encode(['success' => false, 'error-codes' => ['invalid-input-secret']])], 'verkeerd_ingesteld'],
    'een storing bij Cloudflare' => [$json(['success' => false, 'error-codes' => ['internal-error']]), 'onbereikbaar'],
    'geen antwoord' => [null, 'onbereikbaar'],
    'een 502' => [[502, 'Bad gateway'], 'onbereikbaar'],
    'een antwoord zonder JSON' => [[200, '<html>'], 'onbereikbaar'],
] as $wat => [$antwoord, $uitkomst]) {
    verwacht(cf_turnstile('secret', 'token', IP, $cloudflare($antwoord))[0], $uitkomst, 'Turnstile bij ' . $wat);
}

$aantal = count($aanroepen);
verwacht(cf_turnstile('secret', '', IP, $cloudflare($json(['success' => true])))[0], 'ontbreekt', 'zonder token van de widget');
verwacht(count($aanroepen), $aantal, 'zonder token wordt Cloudflare niet gebeld');

/*--------------------------------------------------------------
# Tellers en eenmalig gebruik
--------------------------------------------------------------*/

$config = maak_config();
verwacht(
    [cf_tel($config, 'a', 3600, 2, 7200, $stil), cf_tel($config, 'a', 3600, 2, 7201, $stil), cf_tel($config, 'a', 3600, 2, 7202, $stil)],
    [true, true, false],
    'de teller houdt op bij het maximum'
);
verwacht(cf_tel($config, 'b', 3600, 2, 7203, $stil), true, 'een andere sleutel telt apart');
verwacht(cf_tel($config, 'a', 3600, 2, 10800, $stil), true, 'in het volgende venster begint de teller opnieuw');

cf_tel($config, 'bericht|' . IP, 3600, 5, 7200, $stil);
$opgeslagen = '';
foreach (glob($config['opslag'] . '/tellers/*') ?: [] as $pad) {
    $opgeslagen .= basename($pad) . (string) file_get_contents($pad);
}
verwacht($opgeslagen !== '' && strpos($opgeslagen, IP) === false, true, 'er komt geen IP-adres op schijf');

$nonce = str_repeat('ab', 16);
verwacht([cf_verbruik_nonce($config, $nonce, $stil), cf_verbruik_nonce($config, $nonce, $stil)], [true, false], 'een token werkt maar één keer');
cf_geef_nonce_vrij($config, $nonce, $stil);
verwacht(cf_verbruik_nonce($config, $nonce, $stil), true, 'een vrijgegeven token werkt weer');

$oud = $config['opslag'] . '/tokens/' . str_repeat('cd', 16);
touch($oud, 1000);
cf_ruim_op($config, time(), $stil);
verwacht([file_exists($oud), file_exists($config['opslag'] . '/tokens/' . $nonce)], [false, true], 'opruimen gooit alleen oude tokens weg');

$bestand = $tijdelijk . '/een-bestand';
file_put_contents($bestand, '');
$logs = [];
$log = function (string $regel) use (&$logs): void {
    $logs[] = $regel;
};
$zonderOpslag = maak_config(['opslag' => $bestand . '/opslag']);
verwacht(cf_tel($zonderOpslag, 'a', 3600, 0, 7200, $log), true, 'zonder bruikbare opslag laat de teller het verzoek door');
verwacht(cf_verbruik_nonce($zonderOpslag, $nonce, $log), true, 'en de tokenadministratie ook');
verwacht(count($logs), 2, 'allebei met een regel in het log');

/*--------------------------------------------------------------
# Het hele verzoek
--------------------------------------------------------------*/

$omgeving = new Omgeving(maak_config());
verwacht(cf_verwerk(['methode' => 'PUT', 'inhoud' => '', 'ip' => IP, 'nuMs' => NU], $omgeving->afh())[0], 405, 'PUT wordt geweigerd');
verwacht((new Omgeving(null))->get(NU), [503, ['ok' => false, 'code' => 'niet_ingesteld']], 'zonder config staat het formulier uit');

[$status, $antwoord] = $omgeving->get(NU);
verwacht([$status, $antwoord['ok'], $antwoord['minLeeftijdMs'], $antwoord['turnstileSitekey']], [200, true, 3000, null], 'GET geeft een token uit');
$token = $antwoord['token'];

verwacht($omgeving->post(bericht($token), NU + 500), [400, ['ok' => false, 'code' => 'challenge_te_snel']], 'meteen posten valt in de tijdval');
verwacht(cf_verwerk(['methode' => 'POST', 'inhoud' => '{kapot', 'ip' => IP, 'nuMs' => NU], $omgeving->afh())[1]['code'], 'ongeldig_verzoek', 'kapotte JSON wordt geweigerd');
verwacht(cf_verwerk(['methode' => 'POST', 'inhoud' => str_repeat('a', CF_MAX_VERZOEK_BYTES + 1), 'ip' => IP, 'nuMs' => NU], $omgeving->afh())[0], 413, 'een te groot verzoek wordt geweigerd');

verwacht(
    $omgeving->post(bericht($token, ['email' => 'geen-adres']), NU + 4000),
    [400, ['ok' => false, 'code' => 'ongeldig', 'velden' => ['email' => 'ongeldig']]],
    'een fout adres komt terug met een foutcode per veld'
);
verwacht($omgeving->mails, [], 'tot hier is er niets verstuurd');

verwacht($omgeving->post(bericht($token), NU + 5000), [200, ['ok' => true]], 'na de verbetering gaat hetzelfde token gewoon door');
verwacht(count($omgeving->mails), 1, 'er gaat precies één mail uit');
verwacht($omgeving->mails[0]['koppen']['Reply-To'] ?? null, 'jan@example.com', 'met het adres van de bezoeker als Reply-To');

verwacht($omgeving->post(bericht($token), NU + 6000), [400, ['ok' => false, 'code' => 'challenge_hergebruikt']], 'hetzelfde token een tweede keer wordt geweigerd');
verwacht(count($omgeving->mails), 1, 'en er gaat geen tweede mail uit');

$omgeving = new Omgeving(maak_config());
$token = $omgeving->get(NU)[1]['token'];
verwacht(
    $omgeving->post(bericht($token, ['antibot' => ['honeypot' => 'https://spam.example']]), NU + 4000),
    [200, ['ok' => true]],
    'een ingevulde honeypot krijgt hetzelfde antwoord als een echt bericht'
);
verwacht($omgeving->mails, [], 'maar er gaat niets uit');

$omgeving = new Omgeving(maak_config(['turnstileSitekey' => 'sitekey', 'turnstileSecret' => 'secret']));
[, $antwoord] = $omgeving->get(NU);
verwacht($antwoord['turnstileSitekey'], 'sitekey', 'met Turnstile aan krijgt de site de sitekey');
$token = $antwoord['token'];

$omgeving->turnstileUitkomst = ['afgewezen', 'invalid-input-response'];
verwacht($omgeving->post(bericht($token), NU + 4000), [400, ['ok' => false, 'code' => 'botcheck_mislukt']], 'Cloudflare wijst het bericht af');
verwacht($omgeving->turnstile[0] ?? null, ['secret', 'cf-token', IP], 'de secret, het token van de widget en het IP-adres gaan naar Cloudflare');

$omgeving->turnstileUitkomst = ['ontbreekt', ''];
verwacht($omgeving->post(bericht($token), NU + 4000)[1]['code'], 'botcheck_mislukt', 'zonder token van de widget');
verwacht($omgeving->mails, [], 'en er gaat niets uit');

$omgeving->turnstileUitkomst = ['onbereikbaar', 'geen antwoord'];
$logsVoor = count($omgeving->logs);
verwacht($omgeving->post(bericht($token), NU + 4000)[0], 200, 'is Cloudflare onbereikbaar, dan gaat het bericht toch door');
verwacht(count($omgeving->logs) > $logsVoor, true, 'met een regel in het log');

$token = $omgeving->get(NU)[1]['token'];
$omgeving->turnstileUitkomst = ['verkeerd_ingesteld', 'invalid-input-secret'];
verwacht($omgeving->post(bericht($token), NU + 4000)[0], 200, 'een afgewezen secret houdt geen berichten tegen');
verwacht(strpos((string) end($omgeving->logs), 'TURNSTILE-SECRET') !== false, true, 'maar staat luid in het log');

$aantal = count($omgeving->turnstile);
$token = $omgeving->get(NU)[1]['token'];
$omgeving->post(bericht($token, ['antibot' => ['honeypot' => 'ja']]), NU + 4000);
verwacht(count($omgeving->turnstile), $aantal, 'voor een ingevulde honeypot wordt Cloudflare niet gebeld');

$omgeving = new Omgeving(maak_config());
$token = $omgeving->get(NU)[1]['token'];
$omgeving->mailLukt = false;
verwacht($omgeving->post(bericht($token), NU + 4000), [500, ['ok' => false, 'code' => 'verzenden_mislukt']], 'mislukt de mail, dan krijgt de bezoeker een fout');
$omgeving->mailLukt = true;
verwacht($omgeving->post(bericht($token), NU + 5000)[0], 200, 'en werkt hetzelfde token bij de volgende poging');

/*--------------------------------------------------------------
# Limieten
--------------------------------------------------------------*/

$omgeving = new Omgeving(maak_config(['maxBerichtenPerUurPerIp' => 2]));
$omgeving->post(['x' => 1], NU);
$omgeving->post(['x' => 1], NU);
verwacht($omgeving->post(['x' => 1], NU), [429, ['ok' => false, 'code' => 'te_veel']], 'de derde poging binnen het uur van hetzelfde adres');
verwacht($omgeving->post(['x' => 1], NU, '198.51.100.1')[1]['code'], 'challenge_ontbreekt', 'een ander adres heeft daar geen last van');

$omgeving = new Omgeving(maak_config(['maxBerichtenPerDag' => 1]));
$eerste = $omgeving->get(NU)[1]['token'];
$tweede = $omgeving->get(NU)[1]['token'];
verwacht($omgeving->post(bericht($eerste), NU + 4000)[0], 200, 'het eerste bericht van de dag gaat door');
verwacht($omgeving->post(bericht($tweede), NU + 4000, '198.51.100.1'), [429, ['ok' => false, 'code' => 'te_veel']], 'boven het maximum per dag wordt geweigerd');
verwacht(
    cf_verbruik_nonce($omgeving->config, cf_controleer_token($omgeving->config, $tweede, NU + 4000)['nonce'], $stil),
    true,
    'het token van het geweigerde bericht is weer vrijgegeven'
);

$omgeving = new Omgeving(maak_config(['maxTokensPerUurPerIp' => 1]));
$omgeving->get(NU);
verwacht($omgeving->get(NU), [429, ['ok' => false, 'code' => 'te_veel']], 'ook het ophalen van tokens heeft een limiet per adres');

/*--------------------------------------------------------------
# Uitslag
--------------------------------------------------------------*/

foreach ($mislukt as $melding) {
    fwrite(STDERR, 'MISLUKT: ' . $melding . "\n");
}
printf("%d geslaagd, %d mislukt\n", $geslaagd, count($mislukt));
exit($mislukt === [] ? 0 : 1);
