<?php
/**
 * Tests voor public/meet.php.
 *
 *   php scripts/test-statistiek.php
 *
 * Zonder PHPUnit, net als scripts/test-contactformulier.php. De workflow draait dit voor elke
 * uitrol.
 */

declare(strict_types=1);

require __DIR__ . '/../public/meet.php';

// 18 september 2026, 12:00 in Nederland.
const NU = 1789725600;
const CHROME = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';
const BEZOEK = '0123456789abcdef';

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

$tijdelijk = sys_get_temp_dir() . '/statistiek-test-' . bin2hex(random_bytes(4));
mkdir($tijdelijk);
register_shutdown_function(function () use ($tijdelijk): void {
    verwijder($tijdelijk);
});

/** Een eigen map per test, die nog niet bestaat: meet.php hoort hem zelf aan te maken. */
function nieuwe_map(): string
{
    global $tijdelijk;
    static $nummer = 0;

    $nummer++;

    return $tijdelijk . '/map-' . $nummer . '/statistiek';
}

$logregels = [];
$log = function (string $bericht) use (&$logregels): void {
    $logregels[] = $bericht;
};

function verzoek(array $anders = []): array
{
    return array_merge([
        'methode' => 'POST',
        'query' => [],
        'inhoud' => '',
        'ua' => CHROME,
        'host' => 'aartdenbraber.nl',
        'origin' => 'https://aartdenbraber.nl',
        'fetchSite' => 'same-origin',
        'sleutel' => '',
        'nietMeten' => false,
        'https' => true,
        'nu' => NU,
    ], $anders);
}

function post(array $gebeurtenis, array $anders = []): array
{
    return verzoek(array_merge(['inhoud' => (string) json_encode($gebeurtenis)], $anders));
}

/** @return array[] de regels in het dagbestand van NU */
function regels(string $map): array
{
    $pad = $map . '/2026-09-18.jsonl';
    if (!is_file($pad)) {
        return [];
    }

    return array_map(function (string $regel): array {
        return json_decode($regel, true);
    }, array_values(array_filter(explode("\n", (string) file_get_contents($pad)))));
}

/*--------------------------------------------------------------
# Een bezoek met herkomst
--------------------------------------------------------------*/

$map = nieuwe_map();
$uit = st_verwerk(post([
    's' => 'bezoek',
    'b' => BEZOEK,
    'pad' => '/en',
    'taal' => 'en',
    'anker' => '#contact',
    'breed' => 390,
    'rel' => 'cgbuitenpost',
    'utm_source' => 'linkedin',
    'van' => 'www.LinkedIn.com',
    'onbekend' => 'gaat niet mee',
], ['ua' => IPHONE]), $map, $log);
verwacht($uit['status'], 204, 'een bezoek wordt aangenomen');
verwacht(regels($map), [[
    't' => NU,
    's' => 'bezoek',
    'b' => BEZOEK,
    'pad' => '/en',
    'taal' => 'en',
    'anker' => '#contact',
    'breed' => 390,
    'rel' => 'cgbuitenpost',
    'utm_source' => 'linkedin',
    'van' => 'www.linkedin.com',
    'os' => 'iOS',
    'browser' => 'Safari',
]], 'het bezoek staat met alleen bekende velden in het bestand van de Nederlandse dag');
verwacht(is_dir($map), true, 'meet.php maakt de map zelf aan');

/*--------------------------------------------------------------
# Klik, eind en bericht
--------------------------------------------------------------*/

$map = nieuwe_map();
st_verwerk(post(['s' => 'klik', 'b' => BEZOEK, 'doel' => "cv\n downloaden", 'plek' => 'cv', 'naar' => '/CV-Aart-den-Braber-NL.pdf']), $map, $log);
st_verwerk(post(['s' => 'eind', 'b' => BEZOEK, 'tijd' => 95.4, 'diepte' => 140, 'cv' => 2, 'cvVan' => 2]), $map, $log);
st_verwerk(post(['s' => 'bericht', 'b' => BEZOEK, 'onderwerp' => 'opdracht']), $map, $log);
$gelezen = regels($map);
verwacht($gelezen[0]['doel'] ?? null, 'cv downloaden', 'stuurtekens in een klik worden een spatie');
verwacht($gelezen[0]['naar'] ?? null, '/CV-Aart-den-Braber-NL.pdf', 'de bestemming van een link gaat mee');
verwacht($gelezen[1]['tijd'] ?? null, 95, 'een tijd met decimalen wordt afgerond');
verwacht($gelezen[1]['diepte'] ?? null, 100, 'de diepte kan niet boven 100 procent');
verwacht($gelezen[2]['onderwerp'] ?? null, 'opdracht', 'een verstuurd bericht komt met zijn onderwerp in het bestand');
verwacht(count($gelezen), 3, 'drie gebeurtenissen, drie regels');

$map = nieuwe_map();
st_verwerk(post(['s' => 'klik', 'b' => BEZOEK, 'doel' => "rood\u{1B}[31m \u{9B}31m omgedraaid\u{202E}tekst"]), $map, $log);
verwacht(regels($map)[0]['doel'] ?? null, 'rood [31m 31m omgedraaid tekst', 'escapes, C1-tekens en richtingstekens gaan eruit');
st_verwerk(post(['s' => 'klik', 'b' => BEZOEK, 'doel' => "geen utf-8 \xff"]), $map, $log);
verwacht(count(regels($map)), 1, 'een klik met ongeldige UTF-8 wordt niet bewaard');

$lang = str_repeat('é', 200);
$map = nieuwe_map();
st_verwerk(post(['s' => 'klik', 'b' => BEZOEK, 'doel' => $lang]), $map, $log);
verwacht(regels($map)[0]['doel'] ?? null, str_repeat('é', 80), 'een lange tekst wordt op 80 tekens afgekapt, niet midden in een teken');

/*--------------------------------------------------------------
# Wat niet wordt aangenomen
--------------------------------------------------------------*/

$map = nieuwe_map();
verwacht(st_verwerk(post(['s' => 'bezoek', 'b' => 'kort']), $map, $log)['status'], 400, 'een ongeldig bezoeknummer geeft 400');
verwacht(st_verwerk(post(['s' => 'iets', 'b' => BEZOEK]), $map, $log)['status'], 400, 'een onbekende soort geeft 400');
verwacht(st_verwerk(post(['s' => 'klik', 'b' => BEZOEK]), $map, $log)['status'], 400, 'een klik zonder doel geeft 400');
verwacht(st_verwerk(verzoek(['inhoud' => 'geen json']), $map, $log)['status'], 400, 'geen JSON geeft 400');
verwacht(st_verwerk(verzoek(['inhoud' => str_repeat('x', ST_MAX_VERZOEK_BYTES + 1)]), $map, $log)['status'], 413, 'een te groot verzoek geeft 413');
verwacht(st_verwerk(post(['s' => 'bezoek', 'b' => BEZOEK], ['origin' => 'https://elders.example']), $map, $log)['status'], 403, 'een andere origin geeft 403');
verwacht(st_verwerk(post(['s' => 'bezoek', 'b' => BEZOEK], ['fetchSite' => 'cross-site']), $map, $log)['status'], 403, 'een verzoek van een andere site geeft 403');
verwacht(regels($map), [], 'niets daarvan staat in het bestand');

$map = nieuwe_map();
foreach ([
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/140.0.0.0 Safari/537.36',
    'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)',
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'curl/8.4.0',
    '',
] as $ua) {
    verwacht(st_verwerk(post(['s' => 'bezoek', 'b' => BEZOEK], ['ua' => $ua]), $map, $log)['status'], 204, 'een bot krijgt gewoon 204: ' . $ua);
}
verwacht(st_verwerk(post(['s' => 'bezoek', 'b' => BEZOEK], ['nietMeten' => true]), $map, $log)['status'], 204, 'met het cookie niet_meten ook 204');
verwacht(regels($map), [], 'bots en wie niet meetelt komen niet in het bestand');

verwacht(st_verwerk(post(['s' => 'bezoek', 'b' => BEZOEK], ['origin' => 'http://127.0.0.1:8080', 'host' => '127.0.0.1']), nieuwe_map(), $log)['status'], 204, 'lokaal, met poort in de origin, telt het wel');
verwacht(st_verwerk(post(['s' => 'bezoek', 'b' => BEZOEK], ['origin' => '', 'fetchSite' => '']), nieuwe_map(), $log)['status'], 204, 'zonder origin en Sec-Fetch-Site, zoals in oudere browsers, ook');

/*--------------------------------------------------------------
# Browser en besturingssysteem
--------------------------------------------------------------*/

verwacht(st_browser('Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22G86 [LinkedInApp]/9.31.1'), 'LinkedIn-app', 'de app van LinkedIn wordt herkend');
verwacht(st_browser('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0'), 'Edge', 'Edge is geen Chrome');
verwacht(st_browser(CHROME), 'Chrome', 'Chrome is geen Safari');
verwacht(st_os('Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36'), 'Android', 'Android is geen Linux');
verwacht(st_os('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15'), 'macOS', 'een Mac');

/*--------------------------------------------------------------
# Het cookie om zelf niet mee te tellen
--------------------------------------------------------------*/

$uit = st_verwerk(verzoek(['methode' => 'GET', 'query' => ['niet-meten' => '']]), nieuwe_map(), $log);
verwacht($uit['status'], 200, '?niet-meten geeft 200');
verwacht(strpos($uit['koppen']['Set-Cookie'] ?? '', 'niet_meten=1; Path=/; Max-Age=34560000; HttpOnly; SameSite=Lax; Secure') === 0, true, '?niet-meten zet het cookie voor 400 dagen');
$uit = st_verwerk(verzoek(['methode' => 'GET', 'query' => ['wel-meten' => ''], 'https' => false]), nieuwe_map(), $log);
verwacht($uit['koppen']['Set-Cookie'] ?? '', 'niet_meten=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax', '?wel-meten haalt het weg, en zonder https zonder Secure');

/*--------------------------------------------------------------
# Lezen
--------------------------------------------------------------*/

$map = nieuwe_map();
mkdir($map, 0700, true);
foreach (['2026-08-01', '2026-09-01', '2026-09-17', '2026-09-18', 'niet-een-dag'] as $dag) {
    file_put_contents($map . '/' . $dag . '.jsonl', "{}\n");
}

// De echte sleutel staat niet in de repo, alleen zijn hash. Hier dus een eigen sleutel.
$proefHash = hash('sha256', 'proefsleutel');
$lees = function (array $query, string $sleutel, ?string $hash = null) use ($map, $log, $proefHash): array {
    return st_verwerk(verzoek([
        'methode' => 'GET',
        'query' => array_merge(['lees' => ''], $query),
        'sleutel' => $sleutel,
    ]), $map, $log, $hash ?? $proefHash);
};
$namen = function (array $antwoord): array {
    return array_map('basename', $antwoord['bestanden']);
};

verwacht($lees([], '')['status'], 403, 'lezen zonder sleutel geeft 403');
verwacht($lees([], 'fout')['status'], 403, 'lezen met een verkeerde sleutel geeft 403');
verwacht($lees([], 'fout')['bestanden'], [], 'en dan geen bestanden');
verwacht($lees([], '', '')['status'], 403, 'zonder hash staat lezen uit, ook met een lege sleutel');

$uit = $lees([], 'proefsleutel');
verwacht($uit['status'], 200, 'lezen met de goede sleutel geeft 200');
verwacht($uit['koppen']['Content-Type'] ?? '', 'application/x-ndjson; charset=utf-8', 'als NDJSON');
verwacht($namen($uit), ['2026-09-01.jsonl', '2026-09-17.jsonl', '2026-09-18.jsonl'], 'standaard de laatste dertig dagen, oudste eerst, zonder vreemde bestanden');
verwacht($namen($lees(['van' => '2026-09-17', 'tot' => '2026-09-17'], 'proefsleutel')), ['2026-09-17.jsonl'], 'van en tot kiezen één dag');
verwacht($namen($lees(['van' => '2020-01-01'], 'proefsleutel')), ['2026-08-01.jsonl', '2026-09-01.jsonl', '2026-09-17.jsonl', '2026-09-18.jsonl'], 'een vroege van haalt alles op');
verwacht($namen($lees(['van' => '../../etc'], 'proefsleutel')), ['2026-09-01.jsonl', '2026-09-17.jsonl', '2026-09-18.jsonl'], 'een van die geen datum is, valt terug op dertig dagen');
verwacht(preg_match('/^([0-9a-f]{64})?$/', ST_LEESSLEUTEL_SHA256), 1, 'de sleutelhash in meet.php is leeg of een SHA-256 in hex');
verwacht(st_datum('2026-02-30'), null, 'een datum die niet bestaat, telt niet');
verwacht(st_datum('../../etc'), null, 'een pad is geen datum');

st_ruim_op($map, NU);
verwacht(is_file($map . '/2026-08-01.jsonl'), true, 'opruimen laat een bestand van zeven weken staan');
st_ruim_op($map, NU + 400 * 86400);
verwacht(is_file($map . '/2026-09-18.jsonl'), true, 'na 400 dagen staat vandaag er nog, net');
verwacht(is_file($map . '/2026-09-17.jsonl'), false, 'en gisteren is weg');
verwacht(is_file($map . '/niet-een-dag.jsonl'), true, 'een bestand zonder datum in de naam blijft staan');

/*--------------------------------------------------------------
# Kale GET en andere methodes
--------------------------------------------------------------*/

$map = nieuwe_map();
$uit = st_verwerk(verzoek(['methode' => 'GET']), $map, $log);
verwacht([$uit['status'], $uit['inhoud']], [200, '{"ok":true}'], 'een kale GET zegt dat de opslag werkt');
verwacht(st_verwerk(verzoek(['methode' => 'PUT']), $map, $log)['status'], 405, 'PUT geeft 405');

// Een map die niet gemaakt kan worden: onder een bestand.
file_put_contents($tijdelijk . '/een-bestand', '');
$uit = st_verwerk(verzoek(['methode' => 'GET']), $tijdelijk . '/een-bestand/statistiek', $log);
verwacht($uit['status'], 503, 'kan de map er niet komen, dan geeft de kale GET 503');
$uit = st_verwerk(post(['s' => 'bezoek', 'b' => BEZOEK]), $tijdelijk . '/een-bestand/statistiek', $log);
verwacht($uit['status'], 503, 'en een gebeurtenis ook');
verwacht(count(array_filter($logregels, function (string $regel): bool {
    return strpos($regel, 'kan niet worden aangemaakt') !== false;
})) > 0, true, 'met een regel in het log');

/*--------------------------------------------------------------
# Uitslag
--------------------------------------------------------------*/

if ($mislukt !== []) {
    fwrite(STDERR, count($mislukt) . " van " . (count($mislukt) + $geslaagd) . " controles mislukt:\n\n" . implode("\n\n", $mislukt) . "\n");
    exit(1);
}

echo $geslaagd . " controles geslaagd\n";
