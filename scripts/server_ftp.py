"""FTPS-verbinding met de server van aartdenbraber.nl, voor beheer vanaf je eigen machine.

Versio staat hier geen SSH toe, dus ook geen SFTP: alleen FTP met expliciete
TLS op poort 21. Dit is de enige plek in de repo waar een script die
verbinding opzet. De uitrol in .github/workflows/deploy.yml doet het met lftp
en een eigen FTP-account, en gebruikt dit bestand niet.

Opgezet naar het voorbeeld van scripts/wmb_ftp.py in warmonbikes. Wat hier
bewust in zit:

1. TLS voor het inloggen, zonder terugval. Lukt de handshake of de controle van
   het certificaat niet, dan stopt het script en is het wachtwoord nooit over
   de lijn gegaan.

2. ProFTPD stuurt de tussenliggende CA niet mee. Het certificaat verifieert
   daarom alleen met deploy/PerfectSSL.pem erbij, net als in de workflow.

3. Het datakanaal hervat de TLS-sessie van het besturingskanaal. Veel
   FTP-servers eisen dat, en Python doet het niet uit zichzelf.
"""

import ftplib
import os
import posixpath
import ssl
import sys
from pathlib import Path

# In een worktree onder .claude/worktrees staat .env.server niet: dat bestand zit niet
# in git. Het staat dan in de hoofdcheckout, boven .claude.
REPO = Path(__file__).resolve().parent.parent
if ".claude" in REPO.parts:
    BASIS = Path(*REPO.parts[: REPO.parts.index(".claude")])
else:
    BASIS = REPO

PERFECTSSL = REPO / "deploy" / "PerfectSSL.pem"


def lees_env():
    """Zet wat in .env.server staat in os.environ, zonder iets te overschrijven.

    Een variabele die al in de omgeving staat, wint van het bestand.
    """
    pad = BASIS / ".env.server"
    if not pad.exists():
        return
    for regel in pad.read_text(encoding="utf-8").splitlines():
        regel = regel.strip()
        if not regel or regel.startswith("#") or "=" not in regel:
            continue
        naam, waarde = regel.split("=", 1)
        naam = naam.strip()
        waarde = waarde.strip().strip('"').strip("'")
        if naam and naam not in os.environ:
            os.environ[naam] = waarde


def maak_context():
    """De standaard vertrouwde CA's plus de tussenliggende CA van de server."""
    ctx = ssl.create_default_context()
    ctx.load_verify_locations(cafile=str(PERFECTSSL))
    return ctx


class FTPSHergebruik(ftplib.FTP_TLS):
    """FTP_TLS die de TLS-sessie van het besturingskanaal hergebruikt."""

    def ntransfercmd(self, cmd, rest=None):
        conn, size = ftplib.FTP.ntransfercmd(self, cmd, rest)
        if self._prot_p:
            conn = self.context.wrap_socket(
                conn,
                server_hostname=self.host,
                session=self.sock.session,
            )
        return conn, size


def _host_en_poort():
    lees_env()
    host = os.environ.get("AADB_FTP_HOST", "vserver99.axc.eu")
    poort = int(os.environ.get("AADB_FTP_PORT", "21") or 21)
    return host, poort


def _open_tls(host, poort):
    """Verbindt en doet AUTH TLS. Stopt het script als dat niet lukt."""
    ftp = FTPSHergebruik(context=maak_context())
    ftp.encoding = "utf-8"
    ftp.connect(host, poort, timeout=30)
    try:
        ftp.auth()
    except (ftplib.all_errors, ssl.SSLError) as fout:
        print(
            "\nTLS met de server lukte niet: " + str(fout) + "\n"
            "Gestopt voor het inloggen, dus het wachtwoord is niet verstuurd.",
            file=sys.stderr,
        )
        ftp.close()
        sys.exit(1)
    return ftp


def proef_tls():
    """Controleert verbinding en certificaat, zonder in te loggen.

    Kan dus ook zonder gegevens in .env.server, en telt op de server niet als
    mislukte inlogpoging.
    """
    host, poort = _host_en_poort()
    print(f"Verbinden met {host}:{poort}, zonder in te loggen")
    ftp = _open_tls(host, poort)
    cert = ftp.sock.getpeercert()
    onderwerp = dict(deel[0] for deel in cert.get("subject", ()))
    uitgever = dict(deel[0] for deel in cert.get("issuer", ()))
    print(f"TLS: {ftp.sock.version()}")
    print(f"Certificaat: {onderwerp.get('commonName')}, uitgegeven door {uitgever.get('commonName')}, geldig tot {cert.get('notAfter')}")
    try:
        ftp.quit()
    except ftplib.all_errors:
        ftp.close()


def verbind(stil=False):
    host, poort = _host_en_poort()
    gebruiker = os.environ.get("AADB_FTP_USER", "")
    wachtwoord = os.environ.get("AADB_FTP_PASS", "")

    ontbreekt = [n for n, v in (("AADB_FTP_USER", gebruiker), ("AADB_FTP_PASS", wachtwoord)) if not v]
    if ontbreekt:
        print(
            "Niet ingevuld in " + str(BASIS / ".env.server") + ": " + ", ".join(ontbreekt) + "\n"
            "Zie .env.server.example.",
            file=sys.stderr,
        )
        sys.exit(1)

    if not stil:
        print(f"Verbinden met {host}:{poort} als {gebruiker}")

    ftp = _open_tls(host, poort)
    ftp.login(gebruiker, wachtwoord)
    ftp.prot_p()
    ftp.set_pasv(True)

    # Binair, en niet pas bij de eerste overdracht. In ASCII-modus antwoordt
    # ProFTPD op SIZE met een 550, en dan lijkt elk bestand te ontbreken.
    ftp.voidcmd("TYPE I")

    if not stil:
        print(f"Verbonden. TLS: {ftp.sock.version()}, datakanaal versleuteld. Beginmap: {ftp.pwd()}")
    return ftp


def inhoud(ftp, pad=""):
    """Mappen en bestanden in `pad`, als gesorteerde lijst van (naam, soort, grootte).

    Soort is 'dir' of 'file'. MLSD als de server het kan, anders LIST uitlezen.
    """
    uit = []
    try:
        for naam, feiten in ftp.mlsd(pad, facts=["type", "size"]):
            if naam in (".", ".."):
                continue
            soort = "dir" if feiten.get("type") == "dir" else "file"
            uit.append((naam, soort, int(feiten.get("size", 0) or 0)))
        return sorted(uit)
    except (ftplib.error_perm, ftplib.error_proto):
        pass

    regels = []
    ftp.retrlines(f"LIST {pad}".strip(), regels.append)
    for regel in regels:
        delen = regel.split(maxsplit=8)
        if len(delen) < 9 or delen[8] in (".", ".."):
            continue
        try:
            grootte = int(delen[4])
        except ValueError:
            grootte = 0
        uit.append((delen[8], "dir" if regel[0] == "d" else "file", grootte))
    return sorted(uit)


def soort(ftp, pad):
    """'file', 'dir' of None als het pad niet bestaat.

    SIZE geeft alleen bij bestanden antwoord; de verbinding staat daarvoor al op
    binair. Een map herken je doordat je erin kunt.
    """
    try:
        ftp.size(pad)
        return "file"
    except ftplib.all_errors:
        pass

    hier = ftp.pwd()
    try:
        ftp.cwd(pad)
        ftp.cwd(hier)
        return "dir"
    except ftplib.all_errors:
        pass

    ouder, naam = posixpath.split(pad.rstrip("/"))
    try:
        for n, s, _ in inhoud(ftp, ouder):
            if n == naam:
                return s
    except ftplib.all_errors:
        pass
    return None
