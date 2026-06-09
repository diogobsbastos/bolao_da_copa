#!/usr/bin/env python3
# Normaliza figurinhas (corta moldura branca, encaixa em 480x672 SEM cortar nem distorcer) + classifica + OCR.
# uso: python3 prep_folder.py <PASTA> [modo]   modo = all | ocr
import os, sys, re, glob, json, subprocess
from PIL import Image
import numpy as np

APP = "/home/ubuntu/bolao-copa26"
FIG = os.path.join(APP, "figurinhas")
CW, CH = 480, 672


def autocrop(im, thr=240):
    g = np.asarray(im.convert("L"))
    mask = g < thr
    if not mask.any():
        return im
    rows = np.where(mask.any(axis=1))[0]
    cols = np.where(mask.any(axis=0))[0]
    return im.crop((int(cols[0]), int(rows[0]), int(cols[-1]) + 1, int(rows[-1]) + 1))


def encaixa(im, W, H):
    # escala mantendo proporcao ate caber em WxH (sem cortar) e centraliza em fundo branco
    w, h = im.size
    scale = min(W / w, H / h)
    nw, nh = max(1, int(round(w * scale))), max(1, int(round(h * scale)))
    im = im.resize((nw, nh), Image.LANCZOS)
    bg = Image.new("RGB", (W, H), (255, 255, 255))
    bg.paste(im, ((W - nw) // 2, (H - nh) // 2))
    return bg


def normalize(path, out):
    im = Image.open(path).convert("RGB")
    im = autocrop(im)
    w, h = im.size
    if w < 8 or h < 8:
        return False
    encaixa(im, CW, CH).save(out)
    return True


def classifica(path):
    try:
        im = Image.open(path).convert("RGB")
        im = autocrop(im)
    except Exception:
        return "jogador"
    w, h = im.size
    if w > h * 1.12:
        return "time"
    a = np.asarray(im).astype(int)
    R, G, B = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    skin = ((R > 95) & (G > 40) & (B > 20) & (R > G) & (R > B) & ((R - G) > 15)).mean()
    white = ((R > 230) & (G > 230) & (B > 230)).mean()
    if skin < 0.012 and white > 0.14:
        return "escudo"
    return "jogador"


def limpa(s):
    toks = re.findall(r"[A-Za-zÀ-ÿ]+", s or "")
    toks = [t for t in toks if len(t) >= 3]
    return " ".join(toks).upper().strip()


def tess(img, psm):
    img.save("/tmp/_ocrn.png")
    try:
        return subprocess.run(["tesseract", "/tmp/_ocrn.png", "-", "--psm", str(psm)],
                              capture_output=True, text=True, timeout=20).stdout
    except Exception:
        return ""


def melhor(txt):
    cand = ""
    for ln in (txt or "").splitlines():
        c = limpa(ln)
        if len(c) > len(cand):
            cand = c
    return cand


def ocr_faixa(path, y0, y1):
    try:
        im = Image.open(path).convert("RGB")
    except Exception:
        return ""
    w, h = im.size
    b = im.crop((0, int(h * y0), w, int(h * y1)))
    a = np.asarray(b)
    mask = (a.min(axis=2) > 160)
    out = np.where(mask, 0, 255).astype("uint8")
    g = Image.fromarray(out).resize((max(1, a.shape[1] * 3), max(1, a.shape[0] * 3)))
    return melhor(tess(g, 7))


def main():
    if len(sys.argv) < 2:
        print("falta pasta"); return
    folder = sys.argv[1]
    modo = sys.argv[2] if len(sys.argv) > 2 else "all"
    d = os.path.join(FIG, folder)
    if not os.path.isdir(d):
        print("pasta nao existe:", d); return
    nd = os.path.join(d, "norm")
    os.makedirs(nd, exist_ok=True)
    ocr, tipo = {}, {}
    for f in sorted(glob.glob(os.path.join(d, "*.png"))):
        name = os.path.basename(f)
        outp = os.path.join(nd, name)
        if modo != "ocr":
            try:
                normalize(f, outp)
            except Exception as e:
                print("erro norm", name, e)
        tipo[name] = classifica(f)
        if tipo[name] == "jogador":
            base = outp if os.path.exists(outp) else f
            nome = ""
            for (y0, y1) in [(0.80, 0.90), (0.785, 0.875), (0.82, 0.915)]:
                nome = ocr_faixa(base, y0, y1)
                if len(nome) >= 4:
                    break
            if len(nome) < 4:
                nome = ocr_faixa(f, 0.74, 0.905)
            ocr[name] = nome
        else:
            ocr[name] = ""
    json.dump(ocr, open(os.path.join(d, "_ocr5.json"), "w", encoding="utf-8"), ensure_ascii=False)
    json.dump(tipo, open(os.path.join(d, "_tipo.json"), "w", encoding="utf-8"), ensure_ascii=False)
    print("ok", len(ocr))


if __name__ == "__main__":
    main()
