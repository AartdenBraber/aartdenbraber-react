<?php
/**
 * Voorbeeld van de instellingen voor public/contact.php.
 *
 * Zet een kopie op de server als
 *
 *   /home/aartdenbraber/domains/aartdenbraber.nl/contactformulier/config.php
 *
 * dus naast public_html en niet erin. Dit bestand zelf gaat niet mee met de uitrol. Zolang de
 * kopie ontbreekt of niet klopt, staat het formulier uit en zie je het niet op de site; de reden
 * staat dan in het foutenlog van het domein.
 */

return [
    // Waar de berichten heen gaan.
    'ontvanger' => 'jij@example.com',

    // De afzender. Moet op aartdenbraber.nl staan, anders valt de mail door SPF.
    'afzender' => 'noreply@aartdenbraber.nl',

    // Minstens 32 willekeurige tekens. Maak er een met:
    //
    //   php -r "echo bin2hex(random_bytes(32)), PHP_EOL;"
    //
    // Verander je het, dan werkt het token in een tabblad dat al openstaat niet meer. De site
    // haalt dan zelf een nieuw.
    'geheim' => '',

    // Cloudflare Turnstile: allebei invullen of allebei leeg laten. Leeg betekent geen Turnstile;
    // het token, de honeypot en de limieten werken dan nog wel.
    'turnstileSitekey' => '',
    'turnstileSecret' => '',

    // Wat hieronder staat is optioneel. Dit zijn de standaardwaarden.
    //
    // 'minLeeftijdMs' => 3000,             // zo jong mag een token zijn bij het versturen
    // 'maxLeeftijdMs' => 6 * 3600 * 1000,  // daarna is het verlopen
    // 'maxBerichtenPerUurPerIp' => 10,
    // 'maxTokensPerUurPerIp' => 60,
    // 'maxBerichtenPerDag' => 50,
    // 'opslag' => __DIR__ . '/opslag',     // tellers en gebruikte tokens
    // 'testmap' => '',                     // een map: berichten worden dan .eml-bestanden
];
