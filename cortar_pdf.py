#!/usr/bin/env python3
# Corta um PDF de album (2 paginas, grade 4x4) em figurinhas perfeitas + le os nomes (OCR).
# Receita validada: bbox de conteudo (fracoes) -> 4x4 por pagina -> descarta brancas -> OCR tarja fixa.
# uso: python3 cortar_pdf.py <pdf> <PASTA_DESTINO>   (ex.: .../album.pdf BRASIL)
import sys, os, re, json, glob, subprocess, tempfile, shutil
from PIL import Image
import numpy as np

APP = "/home/ubuntu/bolao-copa26"
FIG = os.path.join(APP, "figurinhas")

# fracoes do bbox de conteudo (independente de resolucao) + grade 4x4
FX0, FY0, FX1, FY1 = 0.0470, 0.0715, 0.9525, 0.9288
COLS = ROWS = 4
DPI = 300


def limpa(s):
    toks = re.findall(r"[A-Za-z]+", s or "")
    toks = [t for t in toks if len(t) >= 3]
    return " ".join(toks).upper().strip()


def ocr_nome(t):
    w, h = t.size
    b = t.crop((0, int(h * 0.80), w, int(h * 0.875)))
    a = np.asarray(b)
    mask = (a.min(axis=2) > 175)
    out = np.where(mask, 0, 255).astype("uint8")
    g = Image.fromarray(out).resize((b.width * 3, b.height * 3))
    g.save("/tmp/_cn.png")
    try:
        txt = subprocess.run(["tesseract", "/tmp/_cn.png", "-", "--psm", "7"],
                             capture_output=True, text=True, timeout=20).stdout
    except Exception:
        txt = ""
    return limpa(txt)


def whiteness(t):
    a = np.asarray(t.convert("L"))
    return float((a > 235).mean())


def main():
    if len(sys.argv) < 3:
        print(json.dumps({"erro": "uso: cortar_pdf.py <pdf> <PASTA>"})); return
    pdf = sys.argv[1]
    folder = sys.argv[2]
    if not shutil.which("pdftoppm"):
        print(json.dumps({"erro": "pdftoppm (poppler) nao instalado no servidor"})); return
    if not os.path.isfile(pdf):
        print(json.dumps({"erro": "pdf nao encontrado: " + pdf})); return
    dest = os.path.join(FIG, folder)
    os.makedirs(dest, exist_ok=True)

    tmp = tempfile.mkdtemp()
    try:
        subprocess.run(["pdftoppm", "-png", "-r", str(DPI), pdf, os.path.join(tmp, "pg")],
                       capture_output=True, timeout=160)
        pgs = sorted(glob.glob(os.path.join(tmp, "pg*.png")))
        if not pgs:
            print(json.dumps({"erro": "falha ao renderizar o pdf"})); return
        # limpa cortes antigos da pasta (mantem subpastas como cards externas nao tem aqui)
        for old in glob.glob(os.path.join(dest, "*.png")):
            try: os.remove(old)
            except Exception: pass
        if os.path.isdir(os.path.join(dest, "norm")):
            shutil.rmtree(os.path.join(dest, "norm"), ignore_errors=True)

        ocr, tipo = {}, {}
        idx = 0
        for pg in pgs:
            im = Image.open(pg).convert("RGB"); W, H = im.size
            X0, Y0, X1, Y1 = int(FX0 * W), int(FY0 * H), int(FX1 * W), int(FY1 * H)
            cw = (X1 - X0) / COLS; ch = (Y1 - Y0) / ROWS
            for r in range(ROWS):
                for c in range(COLS):
                    t = im.crop((int(X0 + c * cw), int(Y0 + r * ch), int(X0 + (c + 1) * cw), int(Y0 + (r + 1) * ch)))
                    if whiteness(t) > 0.85:
                        continue
                    name = "%02d.png" % idx
                    t.save(os.path.join(dest, name))
                    nome = ocr_nome(t)
                    ocr[name] = nome
                    tipo[name] = "jogador" if len(nome) >= 4 else "especial"
                    idx += 1
        json.dump(ocr, open(os.path.join(dest, "_ocr5.json"), "w", encoding="utf-8"), ensure_ascii=False)
        json.dump(tipo, open(os.path.join(dest, "_tipo.json"), "w", encoding="utf-8"), ensure_ascii=False)
        print(json.dumps({"ok": True, "tiles": idx, "jogadores": sum(1 for v in tipo.values() if v == "jogador")}))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
