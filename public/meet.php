<?php
/**
 * Bezoekersstatistiek van aartdenbraber.nl, alleen voor eigen gebruik.
 *
 *   POST /meet.php               neemt één gebeurtenis aan van src/utils/meten.ts
 *   GET  /meet.php               zegt of de opslag werkt, zonder verdere details
 *   GET  /meet.php?niet-meten    zet een cookie waarmee deze browser niet meer meetelt
 *   GET  /meet.php?wel-meten     haalt dat cookie weer weg
 *   GET  /meet.php?lees          geeft de gebeurtenissen terug, alleen met de leessleutel
 *
 * De gebeurtenissen komen per dag in een eigen bestand, één JSON-regel per gebeurtenis, in een map
 * boven de webroot: /home/aartdenbraber/domains/aartdenbraber.nl/statistiek. Het script maakt die
 * map zelf aan, dus er hoeft op de server niets klaargezet te worden.
 *
 * Het IP-adres en de user agent komen niet op schijf. Van de user agent blijven alleen het
 * besturingssysteem en de browserfamilie over. Bezoekers krijgen geen cookie; alleen wie zelf
 * ?niet-meten opent, krijgt er een.
 *
 * Lezen gaat met scripts/server_statistiek.py. De leessleutel staat in .env.server op de eigen
 * machine en gaat mee in de kop X-Statistiek-Sleutel, niet in het adres, zodat hij niet in de
 * toegangslogs van de server belandt. Hier staat alleen de SHA-256 ervan; de repo is openbaar.
 *
 * Geschreven voor PHP 7.4 en hoger, net als contact.php.
 */

declare(strict_types=1);

/** Maak een nieuwe met `python scripts/server_statistiek.py --nieuwe-sleutel`. Leeg zet lezen uit. */
const ST_LEESSLEUTEL_SHA256 = '2cecc0360fb8678b1548036ad1e8fdc04043e93424ed816d2d510220c6c8f7b1';

const ST_MAX_VERZOEK_BYTES = 2048;
const ST_MAX_DAGBESTAND_BYTES = 5 * 1024 * 1024;
const ST_BEWAARDAGEN = 400;
const ST_TIJDZONE = 'Europe/Amsterdam';
const ST_COOKIE = 'niet_meten';

/** De parameters uit het adres die meten.ts meestuurt als herkomst. */
const ST_HERKOMST = ['rel', 'ref', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];

/*--------------------------------------------------------------
# Opslag
--------------------------------------------------------------*/

function st_map(): string
{
    $uitOmgeving = getenv('STATISTIEK_MAP');
    if (is_string($uitOmgeving) && $uitOmgeving !== '') {
        return rtrim($uitOmgeving, '/\\');
    }

    // Eén map boven de webroot, naast contactformulier/. De uitrol komt daar niet, dus hij kan de
    // gegevens ook niet per ongeluk weghalen.
    return dirname(__DIR__) . '/statistiek';
}

function st_zorg_voor_map(string $map): bool
{
    return is_dir($map) || @mkdir($map, 0700, true) || is_dir($map);
}

/** De dag van een tijdstip in Nederland, want daar kijkt de lezer. */
function st_dag(int $tijd): string
{
    return (new DateTimeImmutable('@' . $tijd))->setTimezone(new DateTimeZone(ST_TIJDZONE))->format('Y-m-d');
}

/**
 * Zet één gebeurtenis achteraan het bestand van vandaag.
 *
 * Zonder lock. Een regel is hooguit een paar honderd bytes en gaat in één write() met O_APPEND
 * naar het bestand, en twee van die schrijfacties lopen op een lokaal bestandssysteem niet door
 * elkaar. Een lock zou er alleen een plek bij maken waar een verzoek op kan blijven wachten; zie
 * cf_tel in contact.php over 12 september 2026.
 */
function st_bewaar(array $gebeurtenis, string $map, callable $log): bool
{
    if (!st_zorg_voor_map($map)) {
        $log('de map ' . $map . ' bestaat niet en kan niet worden aangemaakt');

        return false;
    }

    $pad = $map . '/' . st_dag($gebeurtenis['t']) . '.jsonl';

    // Een rem op wie de schijf vol wil schrijven. Een echte dag komt hier bij lange na niet.
    clearstatcache(true, $pad);
    if (is_file($pad) && (int) filesize($pad) > ST_MAX_DAGBESTAND_BYTES) {
        if (random_int(1, 100) === 1) {
            $log('het bestand van vandaag is groter dan ' . ST_MAX_DAGBESTAND_BYTES . ' bytes, gebeurtenissen worden weggegooid');
        }

        return true;
    }

    $regel = json_encode($gebeurtenis, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($regel === false || @file_put_contents($pad, $regel . "\n", FILE_APPEND) === false) {
        $log('kan niet schrijven naar ' . $pad);

        return false;
    }

    return true;
}

/** Gooit dagbestanden weg die ouder zijn dan ST_BEWAARDAGEN. */
function st_ruim_op(string $map, int $nu): void
{
    $grens = st_dag($nu - ST_BEWAARDAGEN * 86400);
    foreach (glob($map . '/*.jsonl') ?: [] as $pad) {
        $dag = basename($pad, '.jsonl');
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $dag) === 1 && $dag < $grens) {
            @unlink($pad);
        }
    }
}

/**
 * De dagbestanden van $van tot en met $tot, oudste eerst.
 *
 * @return string[]
 */
function st_bestanden(string $map, string $van, string $tot): array
{
    $paden = [];
    foreach (glob($map . '/*.jsonl') ?: [] as $pad) {
        $dag = basename($pad, '.jsonl');
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $dag) === 1 && $dag >= $van && $dag <= $tot) {
            $paden[] = $pad;
        }
    }
    sort($paden);

    return $paden;
}

/*--------------------------------------------------------------
# Invoer
--------------------------------------------------------------*/

/**
 * Een schone tekst van hooguit $max tekens, of null. Witruimte wordt één spatie. Stuurtekens gaan
 * eruit, ook de C1-reeks en de tekens die de leesrichting omdraaien: wat hier doorkomt, belandt
 * later in een terminal, en daar kan zo'n teken de weergave overnemen.
 */
function st_tekst($waarde, int $max): ?string
{
    if (!is_string($waarde)) {
        return null;
    }
    $schoon = preg_replace('/[\x00-\x1F\x7F\x{80}-\x{9F}\x{200B}-\x{200F}\x{202A}-\x{202E}\x{2066}-\x{2069}]+/u', ' ', $waarde);
    if ($schoon === null) {
        return null;
    }
    $schoon = trim((string) preg_replace('/\s+/u', ' ', $schoon));
    if ($schoon === '') {
        return null;
    }
    if (preg_match('/^.{0,' . $max . '}/su', $schoon, $treffer) === 1) {
        $schoon = $treffer[0];
    }

    return $schoon;
}

function st_getal($waarde, int $min, int $max): ?int
{
    if (is_float($waarde) && is_finite($waarde)) {
        $waarde = (int) round($waarde);
    }
    if (!is_int($waarde)) {
        return null;
    }

    return max($min, min($max, $waarde));
}

/** Zoekmachines, linkvoorvertoningen en scripts. Die draaien meestal geen javascript, maar toch. */
function st_is_bot(string $ua): bool
{
    return $ua === '' || preg_match(
        '/bot\b|bot\/|crawl|spider|slurp|headless|lighthouse|pagespeed|pingdom|uptime|preview|facebookexternalhit|embedly|python|curl|wget|httpclient|go-http|java\/|axios|node-fetch|scrapy|phantomjs|puppeteer|playwright|selenium/i',
        $ua
    ) === 1;
}

function st_os(string $ua): string
{
    $regels = [
        '/iPhone|iPad|iPod/' => 'iOS',
        '/Android/' => 'Android',
        '/CrOS/' => 'ChromeOS',
        '/Windows/' => 'Windows',
        '/Macintosh|Mac OS X/' => 'macOS',
        '/Linux/' => 'Linux',
    ];
    foreach ($regels as $patroon => $naam) {
        if (preg_match($patroon, $ua) === 1) {
            return $naam;
        }
    }

    return 'overig';
}

/** De in-app-browsers eerst: wie via de app van LinkedIn binnenkomt, is voor een cv het interessantst. */
function st_browser(string $ua): string
{
    $regels = [
        '/LinkedInApp/i' => 'LinkedIn-app',
        '/FBAN|FBAV|Instagram/' => 'Meta-app',
        '/Edg(e|A|iOS)?\//' => 'Edge',
        '/OPR\/|Opera/' => 'Opera',
        '/SamsungBrowser/' => 'Samsung',
        '/Firefox|FxiOS/' => 'Firefox',
        '/Chrome|CriOS/' => 'Chrome',
        '/Safari/' => 'Safari',
    ];
    foreach ($regels as $patroon => $naam) {
        if (preg_match($patroon, $ua) === 1) {
            return $naam;
        }
    }

    return 'overig';
}

/**
 * Maakt van wat de site stuurde de regel die op schijf komt. Alleen bekende velden gaan mee, elk
 * met een grens. Geeft null als het geen gebeurtenis van meten.ts kan zijn.
 */
function st_lees_gebeurtenis(string $inhoud, string $ua, int $nu): ?array
{
    $invoer = json_decode($inhoud, true);
    if (!is_array($invoer)) {
        return null;
    }

    $soort = $invoer['s'] ?? null;
    $bezoek = $invoer['b'] ?? null;
    if (!is_string($bezoek) || preg_match('/^[0-9a-f]{16}$/', $bezoek) !== 1) {
        return null;
    }

    $uit = ['t' => $nu, 's' => $soort, 'b' => $bezoek];
    $tekst = function (string $veld, int $max) use ($invoer, &$uit): void {
        $waarde = st_tekst($invoer[$veld] ?? null, $max);
        if ($waarde !== null) {
            $uit[$veld] = $waarde;
        }
    };
    $getal = function (string $veld, int $min, int $max) use ($invoer, &$uit): void {
        $waarde = st_getal($invoer[$veld] ?? null, $min, $max);
        if ($waarde !== null) {
            $uit[$veld] = $waarde;
        }
    };

    switch ($soort) {
        case 'bezoek':
            $tekst('pad', 100);
            $uit['taal'] = ($invoer['taal'] ?? '') === 'en' ? 'en' : 'nl';
            $tekst('anker', 40);
            $getal('breed', 0, 10000);
            foreach (ST_HERKOMST as $veld) {
                $tekst($veld, 80);
            }
            $van = st_tekst($invoer['van'] ?? null, 100);
            if ($van !== null && preg_match('/^[a-z0-9.-]+$/i', $van) === 1) {
                $uit['van'] = strtolower($van);
            }
            $uit['os'] = st_os($ua);
            $uit['browser'] = st_browser($ua);
            break;

        case 'klik':
            $tekst('doel', 80);
            if (!isset($uit['doel'])) {
                return null;
            }
            $tekst('plek', 30);
            $tekst('naar', 120);
            break;

        case 'eind':
            $getal('tijd', 0, 86400);
            $getal('diepte', 0, 100);
            $getal('cv', 0, 50);
            $getal('cvVan', 0, 50);
            break;

        case 'bericht':
            $tekst('onderwerp', 20);
            $tekst('fout', 40);
            break;

        default:
            return null;
    }

    return $uit;
}

/*--------------------------------------------------------------
# Het verzoek
--------------------------------------------------------------*/

function st_sleutel_klopt(string $sleutel, string $hash): bool
{
    return $hash !== '' && $sleutel !== '' && hash_equals($hash, hash('sha256', $sleutel));
}

/** Een datum als JJJJ-MM-DD, of null. */
function st_datum($waarde): ?string
{
    if (!is_string($waarde) || preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $waarde, $delen) !== 1) {
        return null;
    }

    return checkdate((int) $delen[2], (int) $delen[3], (int) $delen[1]) ? $waarde : null;
}

/**
 * Verwerkt één verzoek. Staat los van de superglobals, zodat de tests hem aanroepen met hun eigen
 * klok, map en leessleutel.
 *
 * @param array{methode: string, query: array, inhoud: string, ua: string, host: string, origin: string, fetchSite: string, sleutel: string, nietMeten: bool, https: bool, nu: int} $verzoek
 * @return array{status: int, koppen: array<string, string>, inhoud: string, bestanden: string[]}
 */
function st_verwerk(array $verzoek, string $map, callable $log, string $leesHash = ST_LEESSLEUTEL_SHA256): array
{
    $antwoord = function (int $status, string $inhoud = '', array $koppen = [], array $bestanden = []): array {
        return ['status' => $status, 'koppen' => $koppen, 'inhoud' => $inhoud, 'bestanden' => $bestanden];
    };
    $json = function (int $status, array $inhoud) use ($antwoord): array {
        return $antwoord($status, (string) json_encode($inhoud), ['Content-Type' => 'application/json; charset=utf-8']);
    };
    $query = $verzoek['query'];

    if ($verzoek['methode'] === 'POST') {
        if (strlen($verzoek['inhoud']) > ST_MAX_VERZOEK_BYTES) {
            return $antwoord(413);
        }

        // Alleen van de eigen site. Een script zonder browser kan dit nabootsen, maar zo telt een
        // andere site in elk geval niet via de browser van zijn bezoekers mee.
        $origin = $verzoek['origin'];
        if ($origin !== '' && strcasecmp((string) parse_url($origin, PHP_URL_HOST), $verzoek['host']) !== 0) {
            return $antwoord(403);
        }
        if (in_array($verzoek['fetchSite'], ['cross-site', 'same-site'], true)) {
            return $antwoord(403);
        }

        // Aart zelf, en wat geen mens is, telt niet mee. Het antwoord is hetzelfde als bij een
        // bewaarde gebeurtenis.
        if ($verzoek['nietMeten'] || st_is_bot($verzoek['ua'])) {
            return $antwoord(204);
        }

        $gebeurtenis = st_lees_gebeurtenis($verzoek['inhoud'], $verzoek['ua'], $verzoek['nu']);
        if ($gebeurtenis === null) {
            return $antwoord(400);
        }
        if (!st_bewaar($gebeurtenis, $map, $log)) {
            return $antwoord(503);
        }
        if (random_int(1, 200) === 1) {
            st_ruim_op($map, $verzoek['nu']);
        }

        return $antwoord(204);
    }

    if ($verzoek['methode'] !== 'GET') {
        return $antwoord(405, '', ['Allow' => 'GET, POST']);
    }

    if (array_key_exists('niet-meten', $query) || array_key_exists('wel-meten', $query)) {
        $uit = array_key_exists('niet-meten', $query);
        $cookie = ST_COOKIE . '=' . ($uit ? '1' : '') . '; Path=/; Max-Age=' . ($uit ? 400 * 86400 : 0)
            . '; HttpOnly; SameSite=Lax' . ($verzoek['https'] ? '; Secure' : '');
        $tekst = $uit
            ? "Deze browser telt niet meer mee in de statistiek van aartdenbraber.nl.\nWeer meetellen: /meet.php?wel-meten\n"
            : "Deze browser telt weer mee in de statistiek van aartdenbraber.nl.\n";

        return $antwoord(200, $tekst, ['Content-Type' => 'text/plain; charset=utf-8', 'Set-Cookie' => $cookie]);
    }

    if (array_key_exists('lees', $query)) {
        if (!st_sleutel_klopt($verzoek['sleutel'], $leesHash)) {
            return $json(403, ['ok' => false]);
        }

        $vandaag = st_dag($verzoek['nu']);
        $van = st_datum($query['van'] ?? null) ?? st_dag($verzoek['nu'] - 30 * 86400);
        $tot = st_datum($query['tot'] ?? null) ?? $vandaag;

        return $antwoord(200, '', ['Content-Type' => 'application/x-ndjson; charset=utf-8'], st_bestanden($map, $van, $tot));
    }

    // Een kale GET, zoals de controle na de uitrol: werkt de opslag?
    $werkt = st_zorg_voor_map($map) && is_writable($map);
    if (!$werkt) {
        $log('de map ' . $map . ' is er niet of is niet schrijfbaar');
    }

    return $json($werkt ? 200 : 503, ['ok' => $werkt]);
}

// Vanaf de opdrachtregel doet dit bestand niets, zodat de tests het kunnen inladen.
if (PHP_SAPI !== 'cli') {
    $stAntwoord = st_verwerk([
        'methode' => (string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'),
        'query' => $_GET,
        'inhoud' => (string) file_get_contents('php://input', false, null, 0, ST_MAX_VERZOEK_BYTES + 1),
        'ua' => (string) ($_SERVER['HTTP_USER_AGENT'] ?? ''),
        'host' => (string) preg_replace('/:\d+$/', '', (string) ($_SERVER['HTTP_HOST'] ?? '')),
        'origin' => (string) ($_SERVER['HTTP_ORIGIN'] ?? ''),
        'fetchSite' => (string) ($_SERVER['HTTP_SEC_FETCH_SITE'] ?? ''),
        'sleutel' => (string) ($_SERVER['HTTP_X_STATISTIEK_SLEUTEL'] ?? ''),
        'nietMeten' => ($_COOKIE[ST_COOKIE] ?? '') === '1',
        'https' => ($_SERVER['HTTPS'] ?? '') !== '' && ($_SERVER['HTTPS'] ?? '') !== 'off',
        'nu' => time(),
    ], st_map(), function (string $bericht): void {
        error_log('statistiek: ' . $bericht);
    });

    http_response_code($stAntwoord['status']);
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    header('X-Robots-Tag: noindex');
    foreach ($stAntwoord['koppen'] as $naam => $waarde) {
        header($naam . ': ' . $waarde);
    }
    echo $stAntwoord['inhoud'];
    foreach ($stAntwoord['bestanden'] as $stPad) {
        readfile($stPad);
    }
}
