#!/usr/bin/env python3
# Normaliza a base (silhueta) para o tamanho EXATO da figurinha real (440x584):
#  1) apara borda quase-branca (leak do nano);
#  2) preenche bordas replicando o ultimo pixel (edge) ate a proporcao real;
#  3) redimensiona para 440x584.
# Assim TODAS as bases ficam identicas e o texto sempre cai no lugar. PIL puro (sem numpy).
# Uso: python3 normalizar_base.py <entrada.png> <saida.png> [TW] [TH]
import sys, json

def fail(m): print(json.dumps({"ok": False, "erro": m})); sys.exit(0)

def main(inp, out, TW, TH):
    try:
        from PIL import Image, ImageChops
    except Exception as e:
        fail("PIL indisponivel: " + str(e))

    AR = TW / TH

    def trim_white(im, tol=11):
        bg = Image.new("RGB", im.size, (255, 255, 255))
        diff = ImageChops.difference(im.convert("RGB"), bg).convert("L").point(lambda p: 255 if p > tol else 0)
        bbox = diff.getbbox()
        return im.crop(bbox) if bbox else im

    def pad_edge(im, t, b, l, r):
        w, h = im.size; nw, nh = w + l + r, h + t + b
        o = Image.new("RGB", (nw, nh)); o.paste(im, (l, t))
        if t > 0: o.paste(im.crop((0, 0, w, 1)).resize((w, t)), (l, 0))
        if b > 0: o.paste(im.crop((0, h - 1, w, h)).resize((w, b)), (l, t + h))
        if l > 0: o.paste(o.crop((l, 0, l + 1, nh)).resize((l, nh)), (0, 0))
        if r > 0: o.paste(o.crop((l + w - 1, 0, l + w, nh)).resize((r, nh)), (l + w, 0))
        return o

    try:
        im = Image.open(inp).convert("RGB")
    except Exception as e:
        fail("entrada nao encontrada: " + str(e))

    im = trim_white(im).convert("RGB")
    w, h = im.size; ar = w / h
    if ar > AR:                       # falta altura -> preenche cima/baixo (peso maior embaixo)
        newh = int(round(w / AR)); pad = max(0, newh - h); top = pad // 3; bot = pad - top
        if pad: im = pad_edge(im, top, bot, 0, 0)
    elif ar < AR:                     # falta largura -> preenche laterais
        neww = int(round(h * AR)); pad = max(0, neww - w); l = pad // 2; r = pad - l
        if pad: im = pad_edge(im, 0, 0, l, r)

    im = im.resize((TW, TH), Image.LANCZOS)
    im.save(out, "PNG")
    print(json.dumps({"ok": True, "w": TW, "h": TH}))

if __name__ == "__main__":
    if len(sys.argv) < 3: fail("uso: normalizar_base.py <entrada> <saida> [TW] [TH]")
    TW = int(sys.argv[3]) if len(sys.argv) > 3 else 440
    TH = int(sys.argv[4]) if len(sys.argv) > 4 else 584
    main(sys.argv[1], sys.argv[2], TW, TH)
