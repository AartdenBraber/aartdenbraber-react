"""Laat zien wat er in een map op de server staat.

    python scripts/server_lijst.py                    de beginmap van het FTP-account
    python scripts/server_lijst.py public_html contactformulier
    python scripts/server_lijst.py --proef            alleen verbinding en certificaat, zonder inloggen

Paden gaan uit van de beginmap van het FTP-account. Het script leest alleen
namen, soorten en groottes en haalt nooit de inhoud van een bestand op, dus
ook niet die van een configbestand met geheimen erin.
"""

import ftplib
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import server_ftp  # noqa: E402


def main():
    if "--proef" in sys.argv[1:]:
        server_ftp.proef_tls()
        return

    paden = [a for a in sys.argv[1:] if not a.startswith("--")] or [""]
    ftp = server_ftp.verbind()
    try:
        for pad in paden:
            print()
            print(pad or "(beginmap)")
            try:
                regels = server_ftp.inhoud(ftp, pad)
            except ftplib.all_errors as fout:
                print(f"  kan niet lezen: {fout}")
                continue
            if not regels:
                print("  (leeg)")
            for naam, soort, grootte in regels:
                print(f"  {naam}/" if soort == "dir" else f"  {naam}  ({grootte} bytes)")
    finally:
        try:
            ftp.quit()
        except ftplib.all_errors:
            ftp.close()


if __name__ == "__main__":
    main()
