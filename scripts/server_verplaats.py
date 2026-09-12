"""Verplaatst of hernoemt een bestand op de server.

    python scripts/server_verplaats.py <van> <naar>           proefrit: laat zien wat er zou gebeuren
    python scripts/server_verplaats.py <van> <naar> --echt    doet het

Paden gaan uit van de beginmap van het FTP-account. Met een account dat in
domains/aartdenbraber.nl begint, zet dit de config van het contactformulier
buiten de webroot:

    python scripts/server_verplaats.py public_html/contactformulier/config.php contactformulier/config.php --echt

Het hernoemen gebeurt op de server zelf, met RNFR en RNTO. De inhoud gaat dus
niet over de lijn en komt ook niet op deze machine. Staat er op de doelplek al
iets, dan gebeurt er niets. Ontbreekt de doelmap, dan wordt die aangemaakt.
"""

import ftplib
import posixpath
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import server_ftp  # noqa: E402


def maak_mappen(ftp, pad):
    """Maakt `pad` en de mappen erboven aan, voor zover ze nog niet bestaan."""
    deel = ""
    for stuk in [s for s in pad.split("/") if s]:
        deel = posixpath.join(deel, stuk) if deel else ("/" + stuk if pad.startswith("/") else stuk)
        if server_ftp.soort(ftp, deel) is None:
            ftp.mkd(deel)
            print(f"Map aangemaakt: {deel}")


def main():
    argumenten = [a for a in sys.argv[1:] if not a.startswith("--")]
    echt = "--echt" in sys.argv[1:]
    if len(argumenten) != 2:
        print(__doc__, file=sys.stderr)
        sys.exit(2)
    van, naar = argumenten

    ftp = server_ftp.verbind()
    try:
        if server_ftp.soort(ftp, van) != "file":
            print(f"\n{van} bestaat niet of is geen bestand. Er is niets veranderd.", file=sys.stderr)
            sys.exit(1)
        if server_ftp.soort(ftp, naar) is not None:
            print(f"\nOp {naar} staat al iets. Er is niets veranderd.", file=sys.stderr)
            sys.exit(1)

        doelmap = posixpath.dirname(naar)
        doelmap_ontbreekt = bool(doelmap) and server_ftp.soort(ftp, doelmap) is None

        print()
        print(f"{van}  ->  {naar}")
        if doelmap_ontbreekt:
            print(f"De map {doelmap} bestaat nog niet en wordt aangemaakt.")

        if not echt:
            print("\nProefrit: er is niets veranderd. Voeg --echt toe om het te doen.")
            return

        if doelmap_ontbreekt:
            maak_mappen(ftp, doelmap)
        ftp.rename(van, naar)

        if server_ftp.soort(ftp, naar) == "file" and server_ftp.soort(ftp, van) is None:
            print("Verplaatst.")
        else:
            print("\nDe server meldde geen fout, maar het bestand staat niet waar het hoort. Kijk het na.", file=sys.stderr)
            sys.exit(1)
    finally:
        try:
            ftp.quit()
        except ftplib.all_errors:
            ftp.close()


if __name__ == "__main__":
    main()
