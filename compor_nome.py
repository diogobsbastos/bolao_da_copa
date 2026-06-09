#!/usr/bin/env python3
# 1) NORMALIZA a base p/ 440x584 (apara borda branca, preenche bordas, redimensiona) e, se a
#    base no disco nao estiver nesse tamanho, REESCREVE a base ja corrigida (autocorrecao);
# 2) escreve NOME (faixa de cima) e POSICAO (faixa de baixo) com FONTE FIXA padronizada.
# Estilo por campo via cfg JSON: nome_caps/nome_bold/nome_cor/nome_tam/nome_dx/nome_dy e pos_*.
#   *_tam = % da fonte. *_dx = desloc. HORIZONTAL em % (- esquerda / + direita).
#   *_dy = desloc. VERTICAL em % (- sobe / + desce).
# Salva <saida>.thumb.txt e <dir>/_dbg_base.txt (base64 JPEG). Pillow puro.
import sys, json, os, base64, io

TW, TH = 440, 584
AR = TW / TH
NOME_PX = 0.055
POS_PX = 0.040

FONTS_BOLD = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
]
FONTS_REG = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
]

def fail(m): print(json.dumps({"ok": False, "erro": m})); sys.exit(0)
def pick(paths): return next((f for f in paths if os.path.exists(f)), None)

def parse_cor(v, default=(255, 255, 255)):
    try:
        if isinstance(v, str):
            s = v.strip().lstrip("#")
            if len(s) == 6: return (int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16))
        if isinstance(v, (list, tuple)) and len(v) >= 3: return tuple(int(x) for x in v[:3])
    except Exception: pass
    return default

def clampf(v, lo, hi, dv):
    try: v = float(v)
    except Exception: return dv
    return max(lo, min(hi, v))

def normalizar(im, Image, ImageChops):
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
    im = trim_white(im).convert("RGB")
    w, h = im.size; ar = w / h
    if ar > AR:
        newh = int(round(w / AR)); pad = max(0, newh - h); top = pad // 3; bot = pad - top
        if pad: im = pad_edge(im, top, bot, 0, 0)
    elif ar < AR:
        neww = int(round(h * AR)); pad = max(0, neww - w); l = pad // 2; r = pad - l
        if pad: im = pad_edge(im, 0, 0, l, r)
    return im.resize((TW, TH), Image.LANCZOS)

def dump(path, im, Image):
    try:
        th = im.copy(); th.thumbnail((150, 210))
        bio = io.BytesIO(); th.save(bio, "JPEG", quality=70)
        open(path, "w").write(base64.b64encode(bio.getvalue()).decode())
    except Exception: pass

def main(base, out, cfg):
    try:
        from PIL import Image, ImageDraw, ImageFont, ImageChops
    except Exception as e:
        fail("PIL indisponivel: " + str(e))

    fp_bold = pick(FONTS_BOLD); fp_reg = pick(FONTS_REG) or fp_bold

    nome = str(cfg.get("nome", "") or "").strip()
    posicao = str(cfg.get("posicao", "") or "").strip()
    nome_caps = bool(cfg.get("nome_caps", True)); nome_bold = bool(cfg.get("nome_bold", True))
    pos_caps = bool(cfg.get("pos_caps", True)); pos_bold = bool(cfg.get("pos_bold", False))
    nome_cor = parse_cor(cfg.get("nome_cor", cfg.get("cor")))
    pos_cor = parse_cor(cfg.get("pos_cor", cfg.get("cor")))
    nome_tam = clampf(cfg.get("nome_tam", 100), 40, 220, 100) / 100.0
    pos_tam = clampf(cfg.get("pos_tam", 100), 40, 220, 100) / 100.0
    nome_dx = clampf(cfg.get("nome_dx", 0), -40, 40, 0) / 100.0
    pos_dx = clampf(cfg.get("pos_dx", 0), -40, 40, 0) / 100.0
    nome_dy = clampf(cfg.get("nome_dy", 0), -40, 40, 0) / 100.0
    pos_dy = clampf(cfg.get("pos_dy", 0), -40, 40, 0) / 100.0
    if nome_caps: nome = nome.upper()
    if pos_caps: posicao = posicao.upper()

    x0 = float(cfg.get("tx0", 0.062)); x1 = float(cfg.get("tx1", 0.745))
    n0 = float(cfg.get("nome_y0", 0.822)); n1 = float(cfg.get("nome_y1", 0.900))
    p0 = float(cfg.get("pos_y0", 0.918)); p1 = float(cfg.get("pos_y1", 0.970))
    mx = float(cfg.get("margem_x", 0.03))

    try:
        orig = Image.open(base).convert("RGB")
    except Exception as e:
        fail("base nao encontrada: " + str(e))

    img = orig
    if cfg.get("normalizar", True):
        try:
            img = normalizar(orig, Image, ImageChops)
            if orig.size != (TW, TH):
                try: img.save(base, "PNG")
                except Exception: pass
        except Exception:
            img = orig

    try: dump(os.path.join(os.path.dirname(out), "_dbg_base.txt"), img, Image)
    except Exception: pass

    W, H = img.size
    d = ImageDraw.Draw(img)

    def font(path, s):
        try: return ImageFont.truetype(path, max(8, int(s))) if path else ImageFont.load_default()
        except Exception: return ImageFont.load_default()
    def fit_width(path, txt, px, maxw):
        f = font(path, px)
        while px > 9:
            bb = d.textbbox((0, 0), txt, font=f)
            if (bb[2] - bb[0]) <= maxw: return f
            px -= 1; f = font(path, px)
        return f
    def center(txt, box, f, cor):
        bx0, by0, bx1, by1 = box; bb = d.textbbox((0, 0), txt, font=f)
        tw, th = bb[2] - bb[0], bb[3] - bb[1]
        d.text((bx0 + (bx1 - bx0 - tw) / 2 - bb[0], by0 + (by1 - by0 - th) / 2 - bb[1]), txt, font=f, fill=cor)

    bx0 = int((x0 + mx) * W); bx1 = int((x1 - mx) * W); maxw = bx1 - bx0
    if nome:
        f = fit_width(fp_bold if nome_bold else fp_reg, nome, int(NOME_PX * H * nome_tam), maxw)
        dx = int(nome_dx * W)
        center(nome, (bx0 + dx, int((n0 + nome_dy) * H), bx1 + dx, int((n1 + nome_dy) * H)), f, nome_cor)
    if posicao:
        f = fit_width(fp_bold if pos_bold else fp_reg, posicao, int(POS_PX * H * pos_tam), maxw)
        dx = int(pos_dx * W)
        center(posicao, (bx0 + dx, int((p0 + pos_dy) * H), bx1 + dx, int((p1 + pos_dy) * H)), f, pos_cor)

    img.save(out, "PNG")
    dump(out + ".thumb.txt", img, Image)
    print(json.dumps({"ok": True, "w": W, "h": H}))

if __name__ == "__main__":
    if len(sys.argv) < 3: fail("uso: compor_nome.py <base> <saida> [cfgJSON]")
    cfg = {}
    if len(sys.argv) >= 4 and sys.argv[3].strip():
        try: cfg = json.loads(sys.argv[3])
        except Exception: cfg = {}
    main(sys.argv[1], sys.argv[2], cfg)
