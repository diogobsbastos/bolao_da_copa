#!/usr/bin/env python3
# Silhueta deterministica (GRATIS).
# - CABECA: rembg acha a pessoa; corta no ombro/colarinho (modo cabeca, adaptativo).
# - TARJAS: AUTO-DETECTA cada banda (varre a coluna da pontinha) e preenche exatamente,
#   expandindo um tiquinho pra cima pra comer o filete branco. Cor pescada na pontinha.
import sys, json

def fail(msg):
    print(json.dumps({"ok": False, "erro": msg})); sys.exit(0)

def main(src, out, cfg):
    try:
        from PIL import Image, ImageDraw, ImageFilter
        import numpy as np
    except Exception as e:
        fail("PIL/numpy indisponivel: " + str(e))
    try:
        from rembg import remove
    except Exception as e:
        fail("rembg nao instalado: " + str(e))

    def g(k, d):
        v = cfg.get(k, d); return v if v is not None else d

    cinza = tuple(int(x) for x in g("cinza", [152, 156, 162]))[:3] + (255,)
    blur = float(g("blur", 1.0))
    modo = str(g("modo", "cabeca"))
    ombro = float(g("ombro", 0.72))
    cab_y = float(g("cab_y", 0.46))
    tarja_modo = str(g("tarja_modo", "cor_real"))   # cor_real(auto) | fixo | preta | off
    pal_x = float(g("pal_x", 0.085))
    x0 = float(g("x0", 0.062)); x1 = float(g("x1", 0.745))
    ny0 = float(g("nome_y0", 0.822)); ny1 = float(g("nome_y1", 0.900))
    py0 = float(g("pos_y0", 0.908)); py1 = float(g("pos_y1", 0.960))
    y_ini = float(g("y_ini", 0.79)); hmin = float(g("hmin", 0.025)); hmax = float(g("hmax", 0.12))
    exp_top = float(g("exp_top", 0.007))   # expande pra CIMA (come o filete branco)
    exp_bot = float(g("exp_bot", 0.003))   # expande pra BAIXO

    img = Image.open(src).convert("RGBA")
    W, H = img.size
    orig = np.array(img.convert("RGB"))

    # --- cabeca via rembg ---
    try:
        cut = remove(img)
        if not isinstance(cut, Image.Image):
            import io; cut = Image.open(io.BytesIO(cut)).convert("RGBA")
    except Exception as e:
        fail("falha no rembg: " + str(e))
    alpha = cut.convert("RGBA").split()[-1]
    if blur > 0:
        alpha = alpha.filter(ImageFilter.GaussianBlur(blur))
    aa = np.array(alpha)
    if modo == "cab_fixo":
        aa[int(cab_y * H):, :] = 0
    elif modo == "cabeca":
        m = aa > 60; cols = m.sum(axis=1); rows = np.where(cols > 0)[0]
        if len(rows):
            top = int(rows[0]); maxw = int(cols.max()) or 1; corte = H
            for y in range(top, H):
                if cols[y] >= ombro * maxw: corte = y; break
            aa[corte:, :] = 0
    alpha = Image.fromarray(aa)
    gray = Image.new("RGBA", (W, H), cinza)
    base = Image.composite(gray, img, alpha)

    # --- tarjas ---
    if tarja_modo != "off":
        d = ImageDraw.Draw(base); rad = int(0.012 * W)
        et = int(exp_top * H); eb = int(exp_bot * H)
        xs = int(pal_x * W)
        def warm(p):
            r, gg, b = int(p[0]), int(p[1]), int(p[2]); return r > 115 and r > gg + 22 and r > b + 22
        def cor(y0, y1):
            cy = (y0 + y1) // 2
            patch = orig[max(0, cy - 6):cy + 6, max(0, xs - 6):xs + 6].reshape(-1, 3)
            med = np.median(patch, axis=0).astype(int) if patch.size else np.array([10, 10, 10])
            return (int(med[0]), int(med[1]), int(med[2]), 255)
        bandas = []
        if tarja_modo in ("cor_real", "preta"):
            col = [warm(orig[y, xs]) for y in range(H)]
            y = int(y_ini * H)
            while y < H:
                if col[y]:
                    a = y
                    while y < H and col[y]: y += 1
                    h = (y - a) / H
                    if hmin <= h <= hmax: bandas.append((a, y - 1))
                else: y += 1
            bandas = bandas[:2]
        if not bandas:
            bandas = [(int(ny0 * H), int(ny1 * H)), (int(py0 * H), int(py1 * H))]
        for (y0, y1) in bandas:
            c = (10, 10, 10, 255) if tarja_modo == "preta" else cor(y0, y1)
            d.rounded_rectangle([x0 * W, max(0, y0 - et), x1 * W, min(H, y1 + eb)], radius=rad, fill=c)

    base.convert("RGB").save(out, "PNG")
    print(json.dumps({"ok": True, "w": W, "h": H, "bandas": len(bandas) if tarja_modo != "off" else 0}))

if __name__ == "__main__":
    if len(sys.argv) < 3:
        fail("uso: silhueta.py <entrada> <saida> [cfgJSON]")
    cfg = {}
    if len(sys.argv) >= 4 and sys.argv[3].strip():
        try: cfg = json.loads(sys.argv[3])
        except Exception: cfg = {}
    main(sys.argv[1], sys.argv[2], cfg)
