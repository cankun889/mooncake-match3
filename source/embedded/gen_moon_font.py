"""Generate a 1bpp LVGL font for the mooncake UI vocabulary."""
import os
from PIL import Image, ImageDraw, ImageFont

CHARS = "月饼消乐初上弦满分数步蛋黄过关圆人团再来一局提示目标用尽没有可做出掉已完点按继续恭喜失败"
FONT_CANDIDATES = [
    r"C:\Windows\Fonts\simhei.ttf",
    r"C:\Windows\Fonts\msyh.ttc",
    r"C:\Windows\Fonts\simsun.ttc",
    r"C:\Windows\Fonts\msyhbd.ttc",
]
SIZE = 16
OUT = os.path.join(os.path.dirname(__file__), "src", "moon_font.c")


def load_font():
    for path in FONT_CANDIDATES:
        if os.path.exists(path):
            return ImageFont.truetype(path, SIZE), path
    raise SystemExit("no Chinese font found")


def pack_glyph(font, ch):
    ascent, descent = font.getmetrics()
    canvas_h = ascent + descent
    img = Image.new("L", (SIZE * 2, canvas_h + 4), 0)
    draw = ImageDraw.Draw(img)
    draw.text((1, 0), ch, font=font, fill=255)
    bbox = img.getbbox()
    if bbox is None:
        return None
    left, top, right, bottom = bbox
    box_w = right - left
    box_h = bottom - top
    ofs_x = left - 1
    ofs_y = ascent - bottom
    row_bytes = (box_w + 7) // 8
    bitmap = bytearray(row_bytes * box_h)
    crop = img.crop(bbox)
    for y in range(box_h):
        for x in range(box_w):
            if crop.getpixel((x, y)) > 80:
                bitmap[y * row_bytes + (x // 8)] |= 1 << (7 - (x % 8))
    adv = max(box_w + 2, SIZE)
    return {
        "cp": ord(ch),
        "box_w": box_w,
        "box_h": box_h,
        "ofs_x": ofs_x,
        "ofs_y": ofs_y,
        "adv": adv,
        "bitmap": bytes(bitmap),
    }


def main():
    font, path = load_font()
    ascent, descent = font.getmetrics()
    glyphs = []
    for ch in dict.fromkeys(CHARS):
        g = pack_glyph(font, ch)
        if g:
            glyphs.append(g)
    glyphs.sort(key=lambda g: g["cp"])
    blobs = []
    index = 0
    dsc_lines = [
        "    {.bitmap_index = 0, .adv_w = 0, .box_w = 0, .box_h = 0, .ofs_x = 0, .ofs_y = 0} /* id = 0 */,"
    ]
    for g in glyphs:
        blobs.append(g["bitmap"])
        dsc_lines.append(
            "    {.bitmap_index = %d, .adv_w = %d, .box_w = %d, .box_h = %d, .ofs_x = %d, .ofs_y = %d},"
            % (index, g["adv"] * 16, g["box_w"], g["box_h"], g["ofs_x"], g["ofs_y"])
        )
        index += len(g["bitmap"])
    raw = b"".join(blobs)
    start = glyphs[0]["cp"]
    end = glyphs[-1]["cp"]
    uni = ", ".join(str(g["cp"] - start) for g in glyphs)
    hexes = ", ".join("0x%02x" % b for b in raw)
    text = """#include "lvgl.h"

static const uint8_t glyph_bitmap[] = {
%s
};

static const lv_font_fmt_txt_glyph_dsc_t glyph_dsc[] = {
%s
};

static const uint16_t unicode_list[] = { %s };

static const lv_font_fmt_txt_cmap_t cmaps[] = {
    {
        .range_start = %d,
        .range_length = %d,
        .glyph_id_start = 1,
        .unicode_list = unicode_list,
        .glyph_id_ofs_list = NULL,
        .list_length = %d,
        .type = LV_FONT_FMT_TXT_CMAP_SPARSE_TINY,
    }
};

static const lv_font_fmt_txt_dsc_t font_dsc = {
    .glyph_bitmap = glyph_bitmap,
    .glyph_dsc = glyph_dsc,
    .cmaps = cmaps,
    .kern_dsc = NULL,
    .kern_scale = 0,
    .cmap_num = 1,
    .bpp = 1,
    .kern_classes = 0,
    .bitmap_format = 0,
};

const lv_font_t moon_font_16 = {
    .get_glyph_dsc = lv_font_get_glyph_dsc_fmt_txt,
    .get_glyph_bitmap = lv_font_get_bitmap_fmt_txt,
    .line_height = %d,
    .base_line = %d,
    .subpx = LV_FONT_SUBPX_NONE,
    .underline_position = -1,
    .underline_thickness = 1,
    .dsc = &font_dsc,
    .fallback = &lv_font_montserrat_14,
};
""" % (
        hexes,
        "\n".join(dsc_lines),
        uni,
        start,
        end - start + 1,
        len(glyphs),
        ascent + descent,
        descent,
    )
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write(text)
    print("font", path, "glyphs", len(glyphs), "bytes", len(raw), "->", OUT)


if __name__ == "__main__":
    main()
