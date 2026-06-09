#!/usr/bin/env python3
# OCR do nome de cada figurinha recortada de UMA pasta -> grava _ocr2.json
# uso: python3 ocr_folder.py <PASTA>   (ex.: BRASIL)
import os, sys, re, glob, json, subprocess
from PIL import Image
import numpy as np

APP = "/home/ubuntu/bolao-copa26"
FIG = os.path.join(APP, "figurinhas")


def limpa(s):
    # mantem so palavras de 3+ letras (tira numero da camisa, codigo de clube, sobras)
    toks = re.findall(r"[A-Za-zÀ-ÿ]+", s or "")
    toks = [t for t in toks if len(t) >= 3]
    return " ".join(toks).upper().strip()


def ocr_name(path):
    try:
        im = Image.open(path).convert("RGB")
    except Exception:
        return ""
    w, h = im.size
    # faixa do nome (fita colorida), evitando a linha do clube embaixo
    b = im.crop((0, int(h * 0.775), w, int(h * 0.865)))
    a = np.asarray(b)
    mask = (a.min(axis=2) > 170)
    out = np.where(mask, 0, 255).astype("uint8")
    g = Image.fromarray(out)
    g = g.resize((g.width * 2, g.height * 2))
    g.save("/tmp/_ocrf.png")
    try:
        t = subprocess.run(["tesseract", "/tmp/_ocrf.png", "-", "--psm", "7"],
                           capture_output=True, text=True, timeout=20).stdout
    except Exception:
        return ""
    cand = ""
    for ln in t.splitlines():
        c = limpa(ln)
        if len(c) > len(cand):
            cand = c
    return cand


def main():
    if len(sys.argv) < 2:
        print("falta pasta"); return
    folder = sys.argv[1]
    d = os.path.join(FIG, folder)
    if not os.path.isdir(d):
        print("pasta nao existe:", d); return
    out = {}
    for f in sorted(glob.glob(os.path.join(d, "*.png"))):
        out[os.path.basename(f)] = ocr_name(f)
    json.dump(out, open(os.path.join(d, "_ocr2.json"), "w", encoding="utf-8"), ensure_ascii=False)
    print("ok", len(out))


if __name__ == "__main__":
    main()
