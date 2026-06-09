#!/usr/bin/env python3
# Casa figurinhas reais (alta resolucao) com o elenco da football-data (so quem vai jogar).
# Matcher: OCR do nome -> melhor palavra + nome sem espacos, atribuicao 1-para-1.
# Faltantes: card-base limpo (silhueta + nome auto-ajustado).
import os, re, glob, difflib, subprocess
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import psycopg2

APP = "/home/ubuntu/bolao-copa26"
FIGDIR = os.path.join(APP, "figurinhas")
OUT = os.path.join(FIGDIR, "cards")
os.makedirs(OUT, exist_ok=True)
FONTB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
POS = {"Goalkeeper": "GOLEIRO", "Defence": "DEFENSOR", "Midfield": "MEIA", "Offence": "ATACANTE"}
CUTOFF = 0.74

MAP = {
    "AFRICA": "South Africa", "ALEMANHA": "Germany", "ARABIA": "Saudi Arabia", "ARGELIA": "Algeria",
    "ARGENTINA": "Argentina", "AUSTRALIA": "Australia", "AUSTRIA": "Austria", "BELGICA": "Belgium",
    "BOSNIA": "Bosnia-Herzegovina", "BRASIL": "Brazil", "CABO VERDE": "Cape Verde Islands", "CANADA": "Canada",
    "COLÔMBIA": "Colombia", "CONGO": "Congo DR", "CROACIA": "Croatia", "CURACAO": "Curaçao", "EGYTO": "Egypt",
    "EQUADOR": "Ecuador", "ESCOCIA": "Scotland", "ESPANHA": "Spain", "FRANÇA": "France", "GANA": "Ghana",
    "HAITI": "Haiti", "HOLANDA": "Netherlands", "INGLATERRA": "England", "IRAN": "Iran", "IRAQUE": "Iraq",
    "JAPAN": "Japan", "JORDANIA": "Jordan", "KOREA": "South Korea", "MARFIM": "Ivory Coast", "MARROCOS": "Morocco",
    "MÉXICO": "Mexico", "NORUEGA": "Norway", "NOVA ZELANDIA": "New Zealand", "PANAMA": "Panama", "PARAGUAI": "Paraguay",
    "PORTUGAL": "Portugal", "QATAR": "Qatar", "SENEGAL": "Senegal", "SUECIA": "Sweden", "SUICA": "Switzerland",
    "TCHEQUIA": "Czechia", "TUNISIA": "Tunisia", "TURQUIA": "Turkey", "URUGUAI": "Uruguay", "USA": "United States",
    "UZBEQUISTAO": "Uzbekistan",
}

env = {}
for line in open(os.path.join(APP, ".env")):
    line = line.strip()
    if "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1)
        env[k] = v
conn = psycopg2.connect(host=env.get("PGHOST", "127.0.0.1"), port=env.get("PGPORT", "5432"),
                        user=env["PGUSER"], password=env["PGPASSWORD"], dbname=env["PGDATABASE"])
cur = conn.cursor()
cur.execute("DELETE FROM figurinhas WHERE tipo='jogador'")
cur.execute("UPDATE jogadores SET figurinha=NULL")
conn.commit()


def norm(s):
    return re.sub(r"\s+", " ", "".join(c for c in (s or "").lower() if c.isalnum() or c == " ")).strip()


def ocr_name(path):
    im = Image.open(path).convert("RGB"); w, h = im.size
    b = im.crop((0, int(h * 0.76), w, int(h * 0.90))); a = np.asarray(b)
    mask = (a.min(axis=2) > 175); out = np.where(mask, 0, 255).astype("uint8")
    g = Image.fromarray(out); g = g.resize((g.width * 2, g.height * 2)); g.save("/tmp/_o.png")
    try:
        t = subprocess.run(["tesseract", "/tmp/_o.png", "-", "--psm", "6"], capture_output=True, text=True, timeout=20).stdout
    except Exception:
        return ""
    for ln in t.splitlines():
        ln = ln.strip()
        if re.search(r"[A-Za-z]{3,}", ln) and not re.search(r"\d{2,}", ln):
            return ln
    return ""


def R(a, b):
    return difflib.SequenceMatcher(None, a, b).ratio()


def best_match(key, alvos):
    kt = [w for w in key.split() if len(w) > 2]
    best = None; bsc = 0.0
    for sn, info in alvos.items():
        st = [w for w in sn.split() if len(w) > 2]
        tp = max((R(a, b) for a in kt for b in st), default=0.0)
        strip = R(key.replace(" ", ""), sn.replace(" ", ""))
        sc = max(tp * 0.92, strip)
        if sc > bsc:
            bsc = sc; best = info
    return best, bsc


def fit(draw, text, fp, max_w, start):
    s = start
    while s > 9:
        f = ImageFont.truetype(fp, s)
        if draw.textlength(text, font=f) <= max_w:
            return f
        s -= 1
    return ImageFont.truetype(fp, 9)


def card_base(nome, posicao, out):
    W, H = 360, 470
    img = Image.new("RGB", (W, H), (244, 245, 248)); d = ImageDraw.Draw(img)
    d.rounded_rectangle([10, 10, W - 10, H - 10], radius=26, fill=(255, 255, 255), outline=(223, 226, 233), width=2)
    sg = (210, 213, 219)
    d.ellipse([W // 2 - 52, 86, W // 2 + 52, 196], fill=sg)
    d.rounded_rectangle([W // 2 - 92, 196, W // 2 + 92, 330], radius=62, fill=sg)
    d.rectangle([W // 2 - 92, 300, W // 2 + 92, 330], fill=sg)
    fb = fit(d, nome.upper(), FONTB, W - 56, 24)
    d.text((W // 2, 372), nome.upper(), fill=(28, 34, 46), font=fb, anchor="mm")
    d.line([62, 398, W - 62, 398], fill=(226, 229, 236), width=1)
    d.text((W // 2, 420), POS.get(posicao, posicao or ""), fill=(92, 98, 110), font=ImageFont.truetype(FONT, 15), anchor="mm")
    img.save(out)


tot_real = 0; tot_base = 0
for folder, selecao in MAP.items():
    d = os.path.join(FIGDIR, folder)
    if not os.path.isdir(d):
        print("sem pasta:", folder); continue
    figs = sorted(glob.glob(os.path.join(d, "*.png")))
    if not figs:
        continue
    cur.execute("SELECT id, nome, COALESCE(posicao,'') FROM jogadores WHERE selecao=%s", (selecao,))
    squad = cur.fetchall()
    alvos = {norm(n): (i, n, p) for i, n, p in squad}
    cand = []
    for f in figs:
        key = norm(ocr_name(f))
        if not key:
            continue
        info, sc = best_match(key, alvos)
        if info:
            cand.append((sc, f, info))
    cand.sort(key=lambda x: -x[0])
    usados = set(); matched = {}
    for sc, f, info in cand:
        if sc < CUTOFF:
            break
        jid = info[0]
        if jid in usados or f in matched.values():
            continue
        usados.add(jid); matched[jid] = f
    for jid, f in matched.items():
        outp = os.path.join(OUT, f"{jid}.png"); Image.open(f).convert("RGB").save(outp)
        cur.execute("UPDATE jogadores SET figurinha=%s WHERE id=%s", (f"cards/{jid}.png", jid))
        cur.execute("INSERT INTO figurinhas (tipo, selecao, nome, jogador_id, imagem) SELECT 'jogador', %s, nome, %s, %s FROM jogadores WHERE id=%s",
                    (selecao, jid, f"cards/{jid}.png", jid))
        tot_real += 1
    for i, n, p in squad:
        if i in matched:
            continue
        outp = os.path.join(OUT, f"{i}.png"); card_base(n, p, outp)
        cur.execute("UPDATE jogadores SET figurinha=%s WHERE id=%s", (f"cards/{i}.png", i))
        cur.execute("INSERT INTO figurinhas (tipo, selecao, nome, jogador_id, imagem, raridade) VALUES ('jogador', %s, %s, %s, %s, 'gerada')",
                    (selecao, n, i, f"cards/{i}.png"))
        tot_base += 1
    print(f"{selecao}: {len(matched)} reais, {len(squad) - len(matched)} geradas")
conn.commit()
print(f"TOTAL: {tot_real} figurinhas reais, {tot_base} cards gerados")
