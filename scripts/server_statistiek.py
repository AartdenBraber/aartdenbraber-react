"""Haalt de bezoekersstatistiek van aartdenbraber.nl op en vat hem samen.

    python scripts/server_statistiek.py                       de laatste 30 dagen
    python scripts/server_statistiek.py --dagen 7
    python scripts/server_statistiek.py --van 2026-09-01 --tot 2026-09-15
    python scripts/server_statistiek.py --bron cgbuitenpost   alleen bezoeken met die herkomst, elk uitgeschreven
    python scripts/server_statistiek.py --alle                alle bezoeken uitgeschreven, niet alleen de laatste
    python scripts/server_statistiek.py --ruw                 de gebeurtenissen zelf, een JSON-regel per stuk
    python scripts/server_statistiek.py --nieuwe-sleutel      maakt een nieuwe leessleutel

De gegevens komen van public/meet.php. De leessleutel staat als
AADB_STATISTIEK_SLEUTEL in .env.server; meet.php kent alleen de SHA-256 ervan.
Met --url kun je een lokale server lezen, bijvoorbeeld http://127.0.0.1:8080.

Een bezoek is een paginalading. Herladen telt dus als een nieuw bezoek, en
wie een week later terugkomt is niet te herkennen: meten.ts bewaart niets in
de browser.
"""

import argparse
import datetime
import hashlib
import json
import os
import secrets
import statistics
import sys
import urllib.error
import urllib.request
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import server_ftp  # noqa: E402

SITE = "https://aartdenbraber.nl"
SLEUTELNAAM = "AADB_STATISTIEK_SLEUTEL"
HERKOMST = ("rel", "ref", "utm_source", "utm_medium", "utm_campaign", "utm_content")
DAGNAMEN = ("ma", "di", "wo", "do", "vr", "za", "zo")


def nieuwe_sleutel():
    """Zet een nieuwe sleutel in .env.server en laat de hash zien die in meet.php hoort."""
    sleutel = secrets.token_urlsafe(32)
    pad = server_ftp.BASIS / ".env.server"
    if pad.exists():
        regels = pad.read_text(encoding="utf-8").splitlines()
    else:
        voorbeeld = server_ftp.REPO / ".env.server.example"
        regels = voorbeeld.read_text(encoding="utf-8").splitlines()

    nieuw = f"{SLEUTELNAAM}={sleutel}"
    for index, regel in enumerate(regels):
        if regel.strip().startswith(SLEUTELNAAM + "="):
            regels[index] = nieuw
            break
    else:
        regels.append(nieuw)
    pad.write_text("\n".join(regels) + "\n", encoding="utf-8")

    print(f"Nieuwe leessleutel staat in {pad}.")
    print("Zet deze hash in public/meet.php, als ST_LEESSLEUTEL_SHA256:")
    print()
    print("    " + hashlib.sha256(sleutel.encode("utf-8")).hexdigest())
    print()
    print("Tot die versie live staat, werkt lezen niet: de server kent de oude hash nog.")


def haal_op(site, van, tot):
    server_ftp.lees_env()
    sleutel = os.environ.get(SLEUTELNAAM, "")
    if not sleutel:
        sys.exit(f"{SLEUTELNAAM} staat niet in {server_ftp.BASIS / '.env.server'}. Maak er een met --nieuwe-sleutel.")

    url = f"{site.rstrip('/')}/meet.php?lees&van={van}&tot={tot}"
    verzoek = urllib.request.Request(url, headers={"X-Statistiek-Sleutel": sleutel, "User-Agent": "server_statistiek.py"})
    try:
        with urllib.request.urlopen(verzoek, timeout=30) as antwoord:
            soort = antwoord.headers.get("Content-Type", "")
            inhoud = antwoord.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as fout:
        if fout.code == 403:
            sys.exit(
                "meet.php weigert de sleutel (403). Staat de hash van de sleutel uit .env.server "
                "in de versie van meet.php die live staat?"
            )
        sys.exit(f"meet.php gaf status {fout.code}.")
    except urllib.error.URLError as fout:
        sys.exit(f"Geen verbinding met {site}: {fout.reason}")

    # De rewrite in .htaccess geeft index.html terug voor een pad dat niet bestaat.
    if "html" in soort:
        sys.exit(f"{url} gaf HTML terug in plaats van gebeurtenissen. Staat meet.php op de server?")

    gebeurtenissen = []
    for regel in inhoud.splitlines():
        try:
            gebeurtenis = json.loads(regel)
        except json.JSONDecodeError:
            continue
        if isinstance(gebeurtenis, dict) and isinstance(gebeurtenis.get("t"), int) and isinstance(gebeurtenis.get("b"), str):
            gebeurtenissen.append(gebeurtenis)
    return gebeurtenissen


def bundel(gebeurtenissen):
    """Voegt de gebeurtenissen per paginalading samen, oudste bezoek eerst."""
    bezoeken = {}
    for g in sorted(gebeurtenissen, key=lambda g: g["t"]):
        bezoek = bezoeken.setdefault(
            g["b"],
            {"start": g["t"], "klikken": [], "berichten": [], "tijd": 0, "diepte": 0, "cv": 0, "cvVan": 0, "geladen": False},
        )
        soort = g.get("s")
        if soort == "bezoek":
            bezoek["geladen"] = True
            bezoek["start"] = g["t"]
            for veld in ("pad", "taal", "anker", "breed", "os", "browser", "van", *HERKOMST):
                if veld in g:
                    bezoek[veld] = g[veld]
        elif soort == "klik":
            bezoek["klikken"].append(g)
        elif soort == "eind":
            # Een pagina die vaker uit beeld gaat, stuurt vaker een eind. De tijd is dan al
            # opgeteld, dus het hoogste getal is het goede.
            for veld in ("tijd", "diepte", "cv", "cvVan"):
                bezoek[veld] = max(bezoek[veld], g.get(veld, 0))
        elif soort == "bericht":
            bezoek["berichten"].append(g)
    return sorted(bezoeken.values(), key=lambda b: b["start"])


def herkomst(bezoek):
    if not bezoek["geladen"]:
        return "onbekend"
    for veld in ("rel", "ref", "utm_source"):
        if bezoek.get(veld):
            return f"{veld}={bezoek[veld]}"
    return bezoek.get("van") or "direct"


def past_bij(bezoek, zoek):
    zoek = zoek.lower()
    return any(zoek in str(bezoek.get(veld, "")).lower() for veld in (*HERKOMST, "van"))


def tijdsduur(seconden):
    if seconden < 60:
        return f"{seconden}s"
    if seconden < 3600:
        return f"{seconden // 60}m{seconden % 60:02d}s"
    return f"{seconden // 3600}u{seconden % 3600 // 60:02d}m"


def moment(tijd):
    """In de tijdzone van deze machine, en die staat in Nederland."""
    t = datetime.datetime.fromtimestamp(tijd)
    return f"{DAGNAMEN[t.weekday()]} {t:%d-%m %H:%M}"


def klik_label(klik):
    label = klik.get("doel", "?")
    if klik.get("plek"):
        label += f" ({klik['plek']})"
    return label


def schrijf_bezoek(bezoek):
    apparaat = " ".join(str(bezoek[v]) for v in ("os", "browser") if bezoek.get(v))
    if bezoek.get("breed"):
        apparaat += f" {bezoek['breed']}px"
    kop = [moment(bezoek["start"]), herkomst(bezoek), bezoek.get("taal", "?").upper(), apparaat.strip()]
    print("  " + "  ".join(deel for deel in kop if deel))

    details = []
    if bezoek.get("anker"):
        details.append(f"binnen op {bezoek['anker']}")
    if bezoek.get("van") and herkomst(bezoek) != bezoek["van"]:
        details.append(f"via {bezoek['van']}")
    if bezoek["tijd"] or bezoek["diepte"]:
        details.append(f"{tijdsduur(bezoek['tijd'])} in beeld")
        details.append(f"{bezoek['diepte']}% gescrold")
    if bezoek["cvVan"]:
        details.append(f"cv {bezoek['cv']}/{bezoek['cvVan']}")
    if details:
        print("      " + ", ".join(details))
    if bezoek["klikken"]:
        print("      " + " > ".join(klik_label(k) for k in bezoek["klikken"]))
    for bericht in bezoek["berichten"]:
        if bericht.get("fout"):
            print(f"      contactformulier gaf een fout: {bericht['fout']}")
        else:
            print(f"      contactformulier verstuurd, onderwerp {bericht.get('onderwerp', '?')}")


def tabel(titel, rijen):
    if not rijen:
        return
    print()
    print(titel)
    breedte = max(len(str(naam)) for naam, *_ in rijen)
    for naam, *getallen in rijen:
        print(f"  {str(naam):<{breedte}}  " + "  ".join(f"{g:>5}" for g in getallen))


def overzicht(bezoeken, van, tot, alle):
    geladen = [b for b in bezoeken if b["geladen"]]
    talen = Counter(b.get("taal", "?") for b in geladen)
    smal = sum(1 for b in geladen if b.get("breed", 9999) < 768)

    print(f"Statistiek aartdenbraber.nl, {van:%d-%m-%Y} t/m {tot:%d-%m-%Y}")
    print(
        f"{len(geladen)} bezoeken ({talen.get('nl', 0)} Nederlands, {talen.get('en', 0)} Engels), "
        f"{smal} op een scherm smaller dan 768px"
    )
    if not bezoeken:
        return

    per_dag = Counter(datetime.date.fromtimestamp(b["start"]) for b in geladen)
    print()
    print("Per dag")
    dag = van
    while dag <= tot:
        aantal = per_dag.get(dag, 0)
        print(f"  {DAGNAMEN[dag.weekday()]} {dag:%d-%m}  {aantal:>3}  {'#' * aantal}")
        dag += datetime.timedelta(days=1)

    tabel("Herkomst", Counter(herkomst(b) for b in bezoeken).most_common())

    # Het Nederlandse cv heeft elf pagina's, het Engelse tien. Alleen de regels waar iets in staat.
    met_cv = [b for b in geladen if b["cvVan"]]
    rijen = [("cv niet bereikt", sum(1 for b in met_cv if b["cv"] == 0))]
    for pagina in range(1, max((b["cvVan"] for b in met_cv), default=0) + 1):
        rijen.append((f"tot cv-pagina {pagina}", sum(1 for b in met_cv if b["cv"] == pagina)))
    rijen.append(("geen eindmelding", len(geladen) - len(met_cv)))
    tabel("Hoe ver in het cv", [rij for rij in rijen if rij[1]])
    tijden = [b["tijd"] for b in geladen if b["tijd"]]
    if tijden:
        print(f"  mediane tijd in beeld: {tijdsduur(int(statistics.median(tijden)))}")

    klikken = Counter()
    in_bezoeken = Counter()
    for b in bezoeken:
        labels = [klik_label(k) for k in b["klikken"]]
        klikken.update(labels)
        in_bezoeken.update(set(labels))
    tabel("Klikken (aantal, in hoeveel bezoeken)", [(naam, n, in_bezoeken[naam]) for naam, n in klikken.most_common()])

    berichten = [g for b in bezoeken for g in b["berichten"]]
    if berichten:
        verstuurd = sum(1 for g in berichten if not g.get("fout"))
        print()
        print(f"Contactformulier: {verstuurd} verstuurd, {len(berichten) - verstuurd} keer een fout")

    print()
    toon = bezoeken if alle else bezoeken[-15:]
    print("Alle bezoeken" if alle or len(toon) == len(bezoeken) else f"Laatste {len(toon)} bezoeken (--alle voor de rest)")
    for bezoek in reversed(toon):
        schrijf_bezoek(bezoek)


def datum(tekst):
    return datetime.date.fromisoformat(tekst)


def main():
    # De Bash-tool en een omgeleide uitvoer gebruiken op Windows anders cp1252.
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    parser = argparse.ArgumentParser(description="Bezoekersstatistiek van aartdenbraber.nl")
    parser.add_argument("--dagen", type=int, default=30, help="zoveel dagen terug, vandaag meegeteld (standaard 30)")
    parser.add_argument("--van", type=datum, help="eerste dag, JJJJ-MM-DD")
    parser.add_argument("--tot", type=datum, help="laatste dag, JJJJ-MM-DD (standaard vandaag)")
    parser.add_argument("--bron", help="alleen bezoeken waarvan rel, ref, een utm-veld of de verwijzer dit bevat")
    parser.add_argument("--alle", action="store_true", help="alle bezoeken uitschrijven")
    parser.add_argument("--ruw", action="store_true", help="de gebeurtenissen zelf, een JSON-regel per stuk")
    parser.add_argument("--url", default=SITE, help=f"de site (standaard {SITE})")
    parser.add_argument("--nieuwe-sleutel", action="store_true", help="maak een nieuwe leessleutel")
    args = parser.parse_args()

    if args.nieuwe_sleutel:
        nieuwe_sleutel()
        return

    tot = args.tot or datetime.date.today()
    van = args.van or tot - datetime.timedelta(days=max(args.dagen, 1) - 1)
    gebeurtenissen = haal_op(args.url, van.isoformat(), tot.isoformat())

    if args.ruw:
        for g in gebeurtenissen:
            print(json.dumps(g, ensure_ascii=False))
        return

    bezoeken = bundel(gebeurtenissen)
    if args.bron:
        gevonden = [b for b in bezoeken if past_bij(b, args.bron)]
        print(f"{len(gevonden)} bezoeken met '{args.bron}' in de herkomst, {van:%d-%m-%Y} t/m {tot:%d-%m-%Y}")
        for bezoek in reversed(gevonden):
            schrijf_bezoek(bezoek)
        return

    overzicht(bezoeken, van, tot, args.alle)


if __name__ == "__main__":
    main()
