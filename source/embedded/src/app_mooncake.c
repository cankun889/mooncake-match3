#include "app_mooncake.h"

#include "tal_api.h"
#include "tkl_output.h"
#include "lvgl.h"
#include "lv_vendor.h"
#include "board_com_api.h"
#include "tdl_display_manage.h"
#include "tdl_led_manage.h"
#include "tdl_button_manage.h"
#include "tdl_audio_manage.h"

#include <stdio.h>
#include <string.h>

#define COLS 6
#define ROWS 7
#define TILE 44
#define GAP 3
#define ORIGIN_X 14
#define ORIGIN_Y 102

#define KIND_MAX 5
#define CAKE_YOLK 3

#define SPEC_NONE 0
#define SPEC_ROW 1
#define SPEC_COL 2
#define SPEC_BOMB 3
#define SPEC_COLOR 4

#define PHASE_IDLE 0
#define PHASE_POP 1
#define PHASE_DROP 2

#define COL_BG 0x0B1020
#define COL_CARD 0x1A2438
#define COL_GOLD 0xE8C872
#define COL_CREAM 0xFFF3D1
#define COL_MUTED 0x9BB0C9
#define COL_BOARD 0x243147

extern const lv_font_t moon_font;

typedef struct {
    uint8_t kind;
    uint8_t spec;
} cell_t;

typedef struct {
    const char *name;
    const char *goal;
    int moves;
    int score_goal;
    int yolk_goal;
    int need_moon;
} level_def_t;

static const level_def_t LEVELS[] = {
    {"初月", "分数", 15, 800, 0, 0},
    {"上弦", "蛋黄", 18, 0, 12, 0},
    {"满月", "分数", 20, 1200, 0, 0}, /* 分数达标即过关 */
};

static const uint32_t CAKE_COLOR[KIND_MAX + 1] = {
    0x000000,
    0xC47A3A, /* 豆沙：焦糖暖棕皮 */
    0xEBC46A, /* 莲蓉：金黄油皮 */
    0xDFA24A, /* 蛋黄：琥珀皮 */
    0xC9925C, /* 五仁：麦芽方模 */
    0xF6EEE8, /* 冰皮：粉白软皮 */
};
static const uint32_t CAKE_RING[KIND_MAX + 1] = {
    0x000000,
    0x7A4520,
    0xB07A28,
    0x9A6828,
    0x8A5A32,
    0xD4C2B6,
};
static const uint32_t CAKE_SHADOW[KIND_MAX + 1] = {
    0x000000,
    0x8E5528,
    0xC89440,
    0xB87830,
    0xA07040,
    0xE0D0C8,
};
static const uint32_t CAKE_LIGHT[KIND_MAX + 1] = {
    0x000000,
    0xE0A868,
    0xFFF0B8,
    0xF0C878,
    0xE8C090,
    0xFFFFFF,
};

static cell_t s_board[ROWS][COLS];
static uint8_t s_mask[ROWS][COLS];
static uint8_t s_spawn[ROWS][COLS];
static lv_obj_t *s_tile[ROWS * COLS];
static lv_obj_t *s_title;
static lv_obj_t *s_level;
static lv_obj_t *s_score_num;
static lv_obj_t *s_move_num;
static lv_obj_t *s_goal_num;
static lv_obj_t *s_goal_cap;
static lv_obj_t *s_hint_btn;
static lv_obj_t *s_hint_lbl;
static lv_obj_t *s_overlay;
static lv_obj_t *s_dialog;
static lv_obj_t *s_dialog_glow;
static lv_obj_t *s_dialog_moon;
static lv_obj_t *s_action_btn;
static lv_obj_t *s_banner;
static lv_obj_t *s_banner_sub;

static int s_level_i;
static int s_score;
static int s_moves;
static int s_yolk;
static int s_moon_made;
static int s_cascade;
static int s_phase;
static int s_phase_tick;
static int s_sel;
static int s_hint_a;
static int s_hint_b;
static int s_hint_left;
static int s_hint_ttl;
static int s_reject_a;
static int s_reject_b;
static int s_reject_ttl;
static int s_overlay_win;
static volatile int s_hint_req;
static uint32_t s_rng = 0x4D4F4F4Eu;

/* 0=圆 1=花瓣圆 2=方模 3=扁圆 */
#define SHAPE_ROUND 0
#define SHAPE_FLOWER 1
#define SHAPE_SQUARE 2
#define SHAPE_OVAL 3

static TDL_LED_HANDLE_T s_led;
static TDL_DISP_HANDLE_T s_disp;
static TDL_AUDIO_HANDLE_T s_audio;
static TDL_AUDIO_INFO_T s_audio_info;
static int s_audio_ok;

static void soft_beep(int hz, int ms, int peak);
static void update_hint_label(void);

static uint32_t rnd(void)
{
    s_rng ^= s_rng << 13;
    s_rng ^= s_rng >> 17;
    s_rng ^= s_rng << 5;
    return s_rng;
}

static int idx_of(int row, int col)
{
    return row * COLS + col;
}

static void set_brightness(uint8_t value)
{
    if (s_disp) {
        tdl_disp_set_brightness(s_disp, value);
    }
}

static void led_pulse(void)
{
    TDL_LED_BLINK_CFG_T cfg;

    if (!s_led) {
        return;
    }
    memset(&cfg, 0, sizeof(cfg));
    cfg.cnt = 2;
    cfg.start_stat = TDL_LED_ON;
    cfg.end_stat = TDL_LED_OFF;
    cfg.first_half_cycle_time = 70;
    cfg.latter_half_cycle_time = 70;
    tdl_led_blink(s_led, &cfg);
}

static void mic_cb(TDL_AUDIO_FRAME_FORMAT_E type, TDL_AUDIO_STATUS_E status, uint8_t *data, uint32_t len)
{
    (void)type;
    (void)status;
    (void)data;
    (void)len;
}

/* Soft triangle wave with attack/decay — warmer than a square beep. */
static void soft_beep(int hz, int ms, int peak)
{
    int16_t frame[256];
    int samples;
    int sent;
    int attack;
    int release;

    if (!s_audio_ok || hz < 60 || s_audio_info.frame_size < 2) {
        return;
    }
    samples = (s_audio_info.sample_rate * ms) / 1000;
    if (samples < 32) {
        samples = 32;
    }
    if (samples > 2400) {
        samples = 2400;
    }
    attack = samples / 8;
    release = samples / 3;
    if (attack < 8) {
        attack = 8;
    }
    if (release < 16) {
        release = 16;
    }
    sent = 0;
    while (sent < samples) {
        int chunk = s_audio_info.frame_size / (int)sizeof(int16_t);
        int n;
        if (chunk > (int)(sizeof(frame) / sizeof(frame[0]))) {
            chunk = (int)(sizeof(frame) / sizeof(frame[0]));
        }
        if (chunk > samples - sent) {
            chunk = samples - sent;
        }
        for (n = 0; n < chunk; n++) {
            int i = sent + n;
            int phase = (i * hz) % s_audio_info.sample_rate;
            int half = s_audio_info.sample_rate / 2;
            int tri;
            int amp = peak;
            int remain = samples - i;
            if (phase < half) {
                tri = (phase * 2 * peak) / half - peak;
            } else {
                tri = peak - ((phase - half) * 2 * peak) / half;
            }
            if (i < attack) {
                amp = (peak * i) / attack;
            } else if (remain < release) {
                amp = (peak * remain) / release;
            }
            frame[n] = (int16_t)((tri * amp) / (peak ? peak : 1));
        }
        tdl_audio_play(s_audio, (uint8_t *)frame, (uint32_t)(chunk * (int)sizeof(int16_t)));
        sent += chunk;
    }
}

static void play_notes(const uint16_t *hz, const uint8_t *ms, int count, int peak)
{
    int i;
    for (i = 0; i < count; i++) {
        soft_beep((int)hz[i], (int)ms[i], peak);
    }
}

static void sfx_match(int cascade)
{
    if (cascade > 2) {
        static const uint16_t hz[] = {523, 659, 784, 988};
        static const uint8_t ms[] = {45, 45, 45, 70};
        play_notes(hz, ms, 4, 9000);
    } else if (cascade > 1) {
        static const uint16_t hz[] = {587, 740, 880};
        static const uint8_t ms[] = {50, 50, 70};
        play_notes(hz, ms, 3, 8500);
    } else {
        static const uint16_t hz[] = {659, 784};
        static const uint8_t ms[] = {55, 75};
        play_notes(hz, ms, 2, 8000);
    }
}

static void sfx_win(void)
{
    static const uint16_t hz[] = {523, 659, 784, 1046};
    static const uint8_t ms[] = {70, 70, 70, 140};
    play_notes(hz, ms, 4, 9500);
}

static void sfx_lose(void)
{
    static const uint16_t hz[] = {392, 330, 262};
    static const uint8_t ms[] = {90, 90, 130};
    play_notes(hz, ms, 3, 6500);
}

static void sfx_reject(void)
{
    /* 短促下行双音：明确「未消除」 */
    soft_beep(300, 55, 7500);
    soft_beep(190, 90, 6000);
}

static void sfx_hint(void)
{
    static const uint16_t hz[] = {784, 988, 1175};
    static const uint8_t ms[] = {40, 40, 70};
    play_notes(hz, ms, 3, 8000);
}

static int cake_shape(int kind)
{
    if (kind == 2) {
        return SHAPE_FLOWER; /* 莲蓉花瓣模 */
    }
    if (kind == 4) {
        return SHAPE_SQUARE; /* 五仁传统方模 */
    }
    if (kind == 5) {
        return SHAPE_OVAL; /* 冰皮软扁圆 */
    }
    return SHAPE_ROUND; /* 豆沙 / 蛋黄：经典圆月饼 */
}

static void draw_line_xy(lv_layer_t *layer, int x1, int y1, int x2, int y2, uint32_t color, int width, lv_opa_t opa)
{
    lv_draw_line_dsc_t dsc;
    lv_draw_line_dsc_init(&dsc);
    dsc.color = lv_color_hex(color);
    dsc.width = width;
    dsc.opa = opa;
    dsc.round_start = 1;
    dsc.round_end = 1;
    dsc.p1.x = x1;
    dsc.p1.y = y1;
    dsc.p2.x = x2;
    dsc.p2.y = y2;
    lv_draw_line(layer, &dsc);
}

static void draw_dot(lv_layer_t *layer, int cx, int cy, int r, uint32_t color, lv_opa_t opa)
{
    lv_draw_rect_dsc_t dsc;
    lv_area_t a;
    lv_draw_rect_dsc_init(&dsc);
    dsc.radius = LV_RADIUS_CIRCLE;
    dsc.bg_opa = opa;
    dsc.bg_color = lv_color_hex(color);
    a.x1 = cx - r;
    a.y1 = cy - r;
    a.x2 = cx + r;
    a.y2 = cy + r;
    lv_draw_rect(layer, &dsc, &a);
}

static void draw_arc_ring(lv_layer_t *layer, int cx, int cy, int radius, int width, uint32_t color, lv_opa_t opa)
{
    lv_draw_arc_dsc_t dsc;
    lv_draw_arc_dsc_init(&dsc);
    dsc.color = lv_color_hex(color);
    dsc.width = width;
    dsc.opa = opa;
    dsc.center.x = cx;
    dsc.center.y = cy;
    dsc.radius = (uint16_t)radius;
    dsc.start_angle = 0;
    dsc.end_angle = 360;
    dsc.rounded = 1;
    lv_draw_arc(layer, &dsc);
}

static void draw_cake_pattern(lv_layer_t *layer, const lv_area_t *body, int kind)
{
    int cx = (body->x1 + body->x2) / 2;
    int cy = (body->y1 + body->y2) / 2;
    int rw = (body->x2 - body->x1) / 2;
    int i;

    if (kind == 1) {
        /* 豆沙：广式圆模 — 双环 + 八角花心 */
        draw_arc_ring(layer, cx, cy, rw - 3, 2, 0x6A3818, LV_OPA_70);
        draw_arc_ring(layer, cx, cy, rw - 7, 2, 0x6A3818, LV_OPA_50);
        for (i = 0; i < 8; i++) {
            static const int ox[8] = {0, 7, 10, 7, 0, -7, -10, -7};
            static const int oy[8] = {-10, -7, 0, 7, 10, 7, 0, -7};
            draw_line_xy(layer, cx + ox[i] / 3, cy + oy[i] / 3, cx + ox[i], cy + oy[i],
                         0x7A4520, 2, LV_OPA_70);
        }
        draw_dot(layer, cx, cy, 5, 0x8B4A22, LV_OPA_COVER);
        draw_dot(layer, cx, cy, 3, 0x5A2E14, LV_OPA_COVER);
        draw_dot(layer, cx - 1, cy - 1, 1, 0xD4A06A, LV_OPA_70);
    } else if (kind == 2) {
        /* 莲蓉：六瓣莲花印 */
        for (i = 0; i < 6; i++) {
            static const int ox[6] = {0, 8, 8, 0, -8, -8};
            static const int oy[6] = {-9, -4, 5, 9, 5, -4};
            draw_dot(layer, cx + ox[i], cy + oy[i], 5, 0xFFF2C0, LV_OPA_80);
            draw_dot(layer, cx + ox[i], cy + oy[i], 3, 0xE0A848, LV_OPA_70);
        }
        draw_dot(layer, cx, cy, 5, 0xFFF8D8, LV_OPA_COVER);
        draw_dot(layer, cx, cy, 3, 0xD49838, LV_OPA_COVER);
        draw_dot(layer, cx - 1, cy - 1, 1, 0xFFFFFF, LV_OPA_80);
    } else if (kind == 3) {
        /* 蛋黄：切开俯视 — 外皮 + 流心蛋黄 */
        draw_arc_ring(layer, cx, cy, rw - 3, 3, 0xA87028, LV_OPA_60);
        draw_dot(layer, cx, cy, 10, 0xF4C878, LV_OPA_COVER);
        draw_dot(layer, cx, cy, 7, 0xF0A820, LV_OPA_COVER);
        draw_dot(layer, cx, cy, 5, 0xFFD040, LV_OPA_COVER);
        draw_dot(layer, cx - 2, cy - 2, 2, 0xFFF6C8, LV_OPA_80);
        draw_dot(layer, cx + 2, cy + 3, 1, 0xD48818, LV_OPA_60);
    } else if (kind == 4) {
        /* 五仁：方模井字格 + 五色果仁 */
        {
            int inset = 5;
            draw_line_xy(layer, body->x1 + inset, cy, body->x2 - inset, cy, 0x8A5A30, 2, LV_OPA_60);
            draw_line_xy(layer, cx, body->y1 + inset, cx, body->y2 - inset, 0x8A5A30, 2, LV_OPA_60);
            draw_line_xy(layer, body->x1 + inset, body->y1 + inset,
                         body->x2 - inset, body->y1 + inset, 0x8A5A30, 2, LV_OPA_50);
            draw_line_xy(layer, body->x1 + inset, body->y2 - inset,
                         body->x2 - inset, body->y2 - inset, 0x8A5A30, 2, LV_OPA_50);
            draw_line_xy(layer, body->x1 + inset, body->y1 + inset,
                         body->x1 + inset, body->y2 - inset, 0x8A5A30, 2, LV_OPA_50);
            draw_line_xy(layer, body->x2 - inset, body->y1 + inset,
                         body->x2 - inset, body->y2 - inset, 0x8A5A30, 2, LV_OPA_50);
        }
        {
            static const int ox[5] = {0, 7, 5, -5, -7};
            static const int oy[5] = {-7, -1, 7, 7, -1};
            static const uint32_t nut[5] = {0x6B3A18, 0xC87830, 0xF0E0B8, 0xB86838, 0x8B5A2B};
            for (i = 0; i < 5; i++) {
                draw_dot(layer, cx + ox[i], cy + oy[i], 3, nut[i], LV_OPA_COVER);
                draw_dot(layer, cx + ox[i] - 1, cy + oy[i] - 1, 1, 0xFFF0D0, LV_OPA_50);
            }
        }
    } else if (kind == 5) {
        /* 冰皮：软白 + 桂叶桂花 */
        draw_arc_ring(layer, cx, cy, rw - 4, 2, 0xE8D0C8, LV_OPA_70);
        draw_line_xy(layer, cx, cy - 8, cx, cy + 7, 0xA8C888, 2, LV_OPA_80);
        draw_line_xy(layer, cx, cy - 3, cx - 7, cy - 8, 0xA8C888, 2, LV_OPA_70);
        draw_line_xy(layer, cx, cy - 1, cx + 7, cy - 7, 0xA8C888, 2, LV_OPA_70);
        draw_line_xy(layer, cx, cy + 2, cx - 6, cy + 7, 0xA8C888, 2, LV_OPA_60);
        draw_line_xy(layer, cx, cy + 3, cx + 6, cy + 7, 0xA8C888, 2, LV_OPA_60);
        draw_dot(layer, cx + 7, cy + 2, 2, 0xF8B8C8, LV_OPA_80);
        draw_dot(layer, cx - 7, cy + 1, 2, 0xF0C8D8, LV_OPA_70);
        draw_dot(layer, cx + 1, cy - 1, 2, 0xFFE8F0, LV_OPA_60);
    }
}

static void draw_spec_stamp(lv_layer_t *layer, const lv_area_t *a, int spec)
{
    int cx = (a->x1 + a->x2) / 2;
    int cy = (a->y1 + a->y2) / 2;

    if (spec == SPEC_COLOR) {
        /* 满月金印 */
        draw_arc_ring(layer, cx, cy, 14, 3, 0xFFE08A, LV_OPA_80);
        draw_dot(layer, cx, cy, 6, 0xFFF6D0, LV_OPA_COVER);
        draw_dot(layer, cx, cy, 3, 0xE8C872, LV_OPA_COVER);
    } else if (spec == SPEC_BOMB) {
        /* 玉兔剪影 */
        draw_dot(layer, cx - 4, cy - 6, 4, 0xFFF8F0, LV_OPA_COVER);
        draw_dot(layer, cx + 4, cy - 6, 4, 0xFFF8F0, LV_OPA_COVER);
        draw_dot(layer, cx, cy + 2, 7, 0xFFF8F0, LV_OPA_COVER);
        draw_dot(layer, cx - 2, cy + 1, 1, 0x5A4A3A, LV_OPA_COVER);
        draw_dot(layer, cx + 2, cy + 1, 1, 0x5A4A3A, LV_OPA_COVER);
    } else if (spec == SPEC_ROW || spec == SPEC_COL) {
        /* 桂花金条印 */
        draw_line_xy(layer,
                     spec == SPEC_ROW ? a->x1 + 6 : cx,
                     spec == SPEC_ROW ? cy : a->y1 + 6,
                     spec == SPEC_ROW ? a->x2 - 6 : cx,
                     spec == SPEC_ROW ? cy : a->y2 - 6,
                     0xFFE9A8, 4, LV_OPA_COVER);
        draw_dot(layer, cx, cy, 3, 0xF0D060, LV_OPA_COVER);
    }
}

static void draw_pop_fx(lv_layer_t *layer, const lv_area_t *a, int tick)
{
    int cx = (a->x1 + a->x2) / 2;
    int cy = (a->y1 + a->y2) / 2;
    int rad = 10 + tick * 5;
    int i;
    lv_opa_t opa = (tick < 3) ? LV_OPA_80 : LV_OPA_40;

    draw_arc_ring(layer, cx, cy, rad, 3, 0xFFE08A, opa);
    draw_arc_ring(layer, cx, cy, rad + 6, 2, 0xFFF6D0, LV_OPA_40);
    /* 四散碎屑 / 金粉 */
    for (i = 0; i < 8; i++) {
        static const int ox[8] = {0, 10, 14, 10, 0, -10, -14, -10};
        static const int oy[8] = {-14, -10, 0, 10, 14, 10, 0, -10};
        int dist = 6 + tick * 4;
        draw_dot(layer, cx + (ox[i] * dist) / 14, cy + (oy[i] * dist) / 14,
                 (i & 1) ? 2 : 3, (i & 1) ? 0xFFF0C0 : 0xE8C872, LV_OPA_70);
    }
    draw_dot(layer, cx, cy, 4 + tick, 0xFFFFFF, LV_OPA_50);
}

static void draw_soft_shadow(lv_layer_t *layer, const lv_area_t *a, int shape)
{
    lv_draw_rect_dsc_t dsc;
    lv_area_t sh = *a;

    lv_draw_rect_dsc_init(&dsc);
    dsc.bg_opa = LV_OPA_30;
    dsc.bg_color = lv_color_hex(0x000000);
    dsc.radius = (shape == SHAPE_SQUARE) ? 8 : LV_RADIUS_CIRCLE;
    sh.x1 += 2;
    sh.y1 += 3;
    sh.x2 += 2;
    sh.y2 += 3;
    if (shape == SHAPE_OVAL) {
        sh.y1 += 2;
        sh.y2 -= 1;
    }
    lv_draw_rect(layer, &dsc, &sh);
}

static void draw_cake_body(lv_layer_t *layer, const lv_area_t *outer, const lv_area_t *body, int kind, int pop)
{
    lv_draw_rect_dsc_t dsc;
    lv_area_t shine;
    lv_area_t shade;
    lv_area_t mold = *outer;
    lv_area_t face = *body;
    lv_area_t mid;
    int shape = cake_shape(kind);
    int cx = (outer->x1 + outer->x2) / 2;
    int cy = (outer->y1 + outer->y2) / 2;
    int i;
    lv_opa_t face_opa = pop ? LV_OPA_50 : LV_OPA_COVER;

    if (!pop) {
        draw_soft_shadow(layer, outer, shape);
    }

    lv_draw_rect_dsc_init(&dsc);
    dsc.bg_opa = LV_OPA_COVER;
    dsc.bg_color = lv_color_hex(CAKE_RING[kind]);

    if (shape == SHAPE_SQUARE) {
        dsc.radius = 8;
        lv_draw_rect(layer, &dsc, &mold);
        dsc.bg_color = lv_color_hex(CAKE_SHADOW[kind]);
        dsc.radius = 7;
        mid = face;
        mid.x1 -= 1;
        mid.y1 -= 1;
        mid.x2 += 1;
        mid.y2 += 1;
        lv_draw_rect(layer, &dsc, &mid);
        dsc.bg_color = lv_color_hex(CAKE_COLOR[kind]);
        dsc.bg_opa = face_opa;
        dsc.radius = 6;
        lv_draw_rect(layer, &dsc, &face);
    } else if (shape == SHAPE_OVAL) {
        mold.y1 += 4;
        mold.y2 -= 4;
        face.y1 += 4;
        face.y2 -= 4;
        dsc.radius = LV_RADIUS_CIRCLE;
        lv_draw_rect(layer, &dsc, &mold);
        dsc.bg_color = lv_color_hex(CAKE_SHADOW[kind]);
        mid = face;
        mid.x1 -= 1;
        mid.y1 -= 1;
        mid.x2 += 1;
        mid.y2 += 1;
        lv_draw_rect(layer, &dsc, &mid);
        dsc.bg_color = lv_color_hex(CAKE_COLOR[kind]);
        dsc.bg_opa = face_opa;
        lv_draw_rect(layer, &dsc, &face);
        draw_arc_ring(layer, cx, cy - 1, (face.x2 - face.x1) / 2 - 1, 2, 0xF0D8D0, LV_OPA_50);
    } else if (shape == SHAPE_FLOWER) {
        for (i = 0; i < 8; i++) {
            static const int ox[8] = {0, 11, 15, 11, 0, -11, -15, -11};
            static const int oy[8] = {-15, -11, 0, 11, 15, 11, 0, -11};
            draw_dot(layer, cx + ox[i], cy + oy[i], 8, CAKE_RING[kind], LV_OPA_COVER);
        }
        for (i = 0; i < 8; i++) {
            static const int ox[8] = {0, 11, 15, 11, 0, -11, -15, -11};
            static const int oy[8] = {-15, -11, 0, 11, 15, 11, 0, -11};
            draw_dot(layer, cx + ox[i], cy + oy[i], 6, CAKE_COLOR[kind], face_opa);
        }
        dsc.radius = LV_RADIUS_CIRCLE;
        lv_draw_rect(layer, &dsc, &mold);
        dsc.bg_color = lv_color_hex(CAKE_SHADOW[kind]);
        mid = face;
        mid.x1 -= 1;
        mid.y1 -= 1;
        mid.x2 += 1;
        mid.y2 += 1;
        lv_draw_rect(layer, &dsc, &mid);
        dsc.bg_color = lv_color_hex(CAKE_COLOR[kind]);
        dsc.bg_opa = face_opa;
        lv_draw_rect(layer, &dsc, &face);
    } else {
        dsc.radius = LV_RADIUS_CIRCLE;
        lv_draw_rect(layer, &dsc, &mold);
        dsc.bg_color = lv_color_hex(CAKE_SHADOW[kind]);
        mid = face;
        mid.x1 -= 1;
        mid.y1 -= 1;
        mid.x2 += 1;
        mid.y2 += 1;
        lv_draw_rect(layer, &dsc, &mid);
        dsc.bg_color = lv_color_hex(CAKE_COLOR[kind]);
        dsc.bg_opa = face_opa;
        lv_draw_rect(layer, &dsc, &face);
        draw_arc_ring(layer, cx, cy, (face.x2 - face.x1) / 2 - 1, 2, CAKE_RING[kind], LV_OPA_60);
        draw_arc_ring(layer, cx, cy, (face.x2 - face.x1) / 2 - 4, 1, CAKE_RING[kind], LV_OPA_40);
    }

    /* 底部暗部 */
    dsc.bg_opa = LV_OPA_30;
    dsc.bg_color = lv_color_hex(CAKE_SHADOW[kind]);
    dsc.radius = (shape == SHAPE_SQUARE) ? 5 : LV_RADIUS_CIRCLE;
    shade.x1 = face.x1 + 3;
    shade.y1 = face.y2 - ((shape == SHAPE_OVAL) ? 7 : 10);
    shade.x2 = face.x2 - 3;
    shade.y2 = face.y2 - 2;
    lv_draw_rect(layer, &dsc, &shade);

    /* 顶部新月高光 + 镜面点 */
    dsc.bg_opa = LV_OPA_50;
    dsc.bg_color = lv_color_hex(CAKE_LIGHT[kind]);
    dsc.radius = (shape == SHAPE_SQUARE) ? 5 : LV_RADIUS_CIRCLE;
    shine.x1 = face.x1 + 6;
    shine.y1 = face.y1 + 3;
    shine.x2 = face.x2 - 10;
    shine.y2 = face.y1 + ((shape == SHAPE_OVAL) ? 7 : 10);
    lv_draw_rect(layer, &dsc, &shine);
    draw_dot(layer, face.x1 + 10, face.y1 + 7, 2, 0xFFFFFF, LV_OPA_60);
}

static void draw_mark(lv_layer_t *layer, const lv_area_t *a, int kind, int spec)
{
    draw_cake_pattern(layer, a, kind);
    if (spec != SPEC_NONE) {
        draw_spec_stamp(layer, a, spec);
    }
}

static void tile_draw(lv_event_t *e)
{
    lv_obj_t *obj = lv_event_get_target(e);
    lv_layer_t *layer = lv_event_get_layer(e);
    int index = (int)(uintptr_t)lv_obj_get_user_data(obj);
    int row = index / COLS;
    int col = index % COLS;
    cell_t cell = s_board[row][col];
    lv_area_t a;
    lv_area_t body;
    int pop = (s_mask[row][col] && s_phase == PHASE_POP);

    if (cell.kind == 0 || layer == NULL) {
        return;
    }
    lv_obj_get_coords(obj, &a);
    body = a;
    body.x1 += 2;
    body.y1 += 2;
    body.x2 -= 2;
    body.y2 -= 2;
    if (pop) {
        body.x1 += 2 + s_phase_tick;
        body.y1 += 2 + s_phase_tick;
        body.x2 -= 2 + s_phase_tick;
        body.y2 -= 2 + s_phase_tick;
    }

    draw_cake_body(layer, &a, &body, cell.kind, pop);
    if (!pop || s_phase_tick < 2) {
        draw_mark(layer, &body, cell.kind, cell.spec);
    }
    if (pop) {
        draw_pop_fx(layer, &a, s_phase_tick);
    }
}

static int same_kind(int r, int c, int kind)
{
    if (r < 0 || c < 0 || r >= ROWS || c >= COLS) {
        return 0;
    }
    return s_board[r][c].kind == (uint8_t)kind && kind != 0;
}

static int collect_matches(void)
{
    int r;
    int c;
    int count = 0;
    int guard;

    memset(s_mask, 0, sizeof(s_mask));
    memset(s_spawn, 0, sizeof(s_spawn));

    for (r = 0; r < ROWS; r++) {
        c = 0;
        while (c < COLS) {
            int kind = s_board[r][c].kind;
            int end = c + 1;
            int len;
            int mid;
            if (kind == 0) {
                c++;
                continue;
            }
            while (end < COLS && s_board[r][end].kind == (uint8_t)kind) {
                end++;
            }
            len = end - c;
            if (len >= 3) {
                mid = c + len / 2;
                if (len >= 5) {
                    s_spawn[r][mid] = SPEC_COLOR;
                } else if (len == 4 && s_spawn[r][mid] != SPEC_COLOR) {
                    s_spawn[r][mid] = SPEC_ROW;
                }
                for (; c < end; c++) {
                    s_mask[r][c] = 1;
                }
            } else {
                c = end;
            }
        }
    }

    for (c = 0; c < COLS; c++) {
        r = 0;
        while (r < ROWS) {
            int kind = s_board[r][c].kind;
            int end = r + 1;
            int len;
            int mid;
            if (kind == 0) {
                r++;
                continue;
            }
            while (end < ROWS && s_board[end][c].kind == (uint8_t)kind) {
                end++;
            }
            len = end - r;
            if (len >= 3) {
                mid = r + len / 2;
                if (len >= 5) {
                    s_spawn[mid][c] = SPEC_COLOR;
                } else if (len == 4 && s_spawn[mid][c] != SPEC_COLOR) {
                    s_spawn[mid][c] = SPEC_COL;
                }
                for (; r < end; r++) {
                    s_mask[r][c] = 1;
                }
            } else {
                r = end;
            }
        }
    }

    for (r = 0; r < ROWS; r++) {
        for (c = 0; c < COLS; c++) {
            int hor;
            int ver;
            int kind;
            if (!s_mask[r][c] || s_spawn[r][c] == SPEC_COLOR) {
                continue;
            }
            kind = s_board[r][c].kind;
            hor = same_kind(r, c - 1, kind) || same_kind(r, c + 1, kind);
            ver = same_kind(r - 1, c, kind) || same_kind(r + 1, c, kind);
            if (hor && ver && s_mask[r][c]) {
                int hlen = 1;
                int vlen = 1;
                int k;
                for (k = c - 1; same_kind(r, k, kind); k--) {
                    hlen++;
                }
                for (k = c + 1; same_kind(r, k, kind); k++) {
                    hlen++;
                }
                for (k = r - 1; same_kind(k, c, kind); k--) {
                    vlen++;
                }
                for (k = r + 1; same_kind(k, c, kind); k++) {
                    vlen++;
                }
                if (hlen >= 3 && vlen >= 3) {
                    s_spawn[r][c] = SPEC_BOMB;
                }
            }
        }
    }

    for (r = 0; r < ROWS; r++) {
        for (c = 0; c < COLS; c++) {
            if (s_spawn[r][c]) {
                s_mask[r][c] = 0;
            }
        }
    }

    for (guard = 0; guard < 6; guard++) {
        int grew = 0;
        uint8_t extra[ROWS][COLS];
        memset(extra, 0, sizeof(extra));
        for (r = 0; r < ROWS; r++) {
            for (c = 0; c < COLS; c++) {
                int rr;
                int cc;
                if (!s_mask[r][c]) {
                    continue;
                }
                if (s_board[r][c].spec == SPEC_ROW) {
                    for (cc = 0; cc < COLS; cc++) {
                        extra[r][cc] = 1;
                    }
                } else if (s_board[r][c].spec == SPEC_COL) {
                    for (rr = 0; rr < ROWS; rr++) {
                        extra[rr][c] = 1;
                    }
                } else if (s_board[r][c].spec == SPEC_BOMB) {
                    for (rr = r - 1; rr <= r + 1; rr++) {
                        for (cc = c - 1; cc <= c + 1; cc++) {
                            if (rr >= 0 && cc >= 0 && rr < ROWS && cc < COLS) {
                                extra[rr][cc] = 1;
                            }
                        }
                    }
                } else if (s_board[r][c].spec == SPEC_COLOR) {
                    int kind = s_board[r][c].kind;
                    for (rr = 0; rr < ROWS; rr++) {
                        for (cc = 0; cc < COLS; cc++) {
                            if (s_board[rr][cc].kind == (uint8_t)kind) {
                                extra[rr][cc] = 1;
                            }
                        }
                    }
                }
            }
        }
        for (r = 0; r < ROWS; r++) {
            for (c = 0; c < COLS; c++) {
                if (extra[r][c] && !s_spawn[r][c] && !s_mask[r][c] && s_board[r][c].kind) {
                    s_mask[r][c] = 1;
                    grew = 1;
                }
            }
        }
        if (!grew) {
            break;
        }
    }

    for (r = 0; r < ROWS; r++) {
        for (c = 0; c < COLS; c++) {
            if (s_mask[r][c]) {
                count++;
            }
        }
    }
    return count;
}

static int has_move(void)
{
    int r;
    int c;
    static const int dr[2] = {0, 1};
    static const int dc[2] = {1, 0};
    int k;

    for (r = 0; r < ROWS; r++) {
        for (c = 0; c < COLS; c++) {
            for (k = 0; k < 2; k++) {
                int rr = r + dr[k];
                int cc = c + dc[k];
                cell_t tmp;
                int n;
                if (rr >= ROWS || cc >= COLS) {
                    continue;
                }
                tmp = s_board[r][c];
                s_board[r][c] = s_board[rr][cc];
                s_board[rr][cc] = tmp;
                n = collect_matches();
                s_board[rr][cc] = s_board[r][c];
                s_board[r][c] = tmp;
                if (n > 0) {
                    memset(s_mask, 0, sizeof(s_mask));
                    memset(s_spawn, 0, sizeof(s_spawn));
                    return 1;
                }
            }
        }
    }
    memset(s_mask, 0, sizeof(s_mask));
    memset(s_spawn, 0, sizeof(s_spawn));
    return 0;
}

static void fill_board(void)
{
    int attempt;
    int r;
    int c;

    for (attempt = 0; attempt < 12; attempt++) {
        int fix;
        for (r = 0; r < ROWS; r++) {
            for (c = 0; c < COLS; c++) {
                s_board[r][c].kind = (uint8_t)(1 + (rnd() % KIND_MAX));
                s_board[r][c].spec = SPEC_NONE;
            }
        }
        for (fix = 0; fix < 80 && collect_matches() > 0; fix++) {
            for (r = 0; r < ROWS; r++) {
                for (c = 0; c < COLS; c++) {
                    if (s_mask[r][c] || s_spawn[r][c]) {
                        s_board[r][c].kind = (uint8_t)(1 + (rnd() % KIND_MAX));
                        s_board[r][c].spec = SPEC_NONE;
                    }
                }
            }
        }
        memset(s_mask, 0, sizeof(s_mask));
        memset(s_spawn, 0, sizeof(s_spawn));
        if (collect_matches() == 0 && has_move()) {
            memset(s_mask, 0, sizeof(s_mask));
            memset(s_spawn, 0, sizeof(s_spawn));
            return;
        }
    }
}


static void refresh_hud(void)
{
    char buf[16];
    const level_def_t *level = &LEVELS[s_level_i];
    int cur = s_score;
    int goal = level->score_goal;

    lv_label_set_text(s_level, level->name);
    lv_label_set_text(s_goal_cap, level->goal);
    snprintf(buf, sizeof(buf), "%d", s_score);
    lv_label_set_text(s_score_num, buf);
    snprintf(buf, sizeof(buf), "%d", s_moves);
    lv_label_set_text(s_move_num, buf);
    if (level->yolk_goal) {
        cur = s_yolk;
        goal = level->yolk_goal;
    }
    if (goal > 0) {
        snprintf(buf, sizeof(buf), "%d/%d", cur, goal);
    } else {
        snprintf(buf, sizeof(buf), "%d", cur);
    }
    lv_label_set_text(s_goal_num, buf);
}

static void style_tile(int index)
{
    lv_obj_t *obj = s_tile[index];
    int selected = (index == s_sel);
    int hinted = (s_hint_ttl > 0 && (index == s_hint_a || index == s_hint_b));
    int rejected = (s_reject_ttl > 0 && (index == s_reject_a || index == s_reject_b));
    int hot = selected || hinted || rejected;
    uint32_t border = COL_GOLD;

    if (selected) {
        border = 0xFFFFFF;
    } else if (rejected) {
        border = 0xE07070;
    }

    lv_obj_set_style_border_width(obj, hot ? 3 : 0, 0);
    lv_obj_set_style_border_color(obj, lv_color_hex(border), 0);
    lv_obj_set_style_border_opa(obj, hot ? LV_OPA_COVER : LV_OPA_TRANSP, 0);
    lv_obj_set_style_shadow_width(obj, hot ? 12 : 0, 0);
    lv_obj_set_style_shadow_color(obj, lv_color_hex(rejected ? 0xE07070 : COL_GOLD), 0);
    lv_obj_set_style_shadow_opa(obj, hot ? LV_OPA_60 : LV_OPA_TRANSP, 0);
}

static void refresh_tiles(void)
{
    int i;
    for (i = 0; i < ROWS * COLS; i++) {
        style_tile(i);
        lv_obj_invalidate(s_tile[i]);
    }
    refresh_hud();
}

static void hide_overlay(void)
{
    lv_obj_add_flag(s_overlay, LV_OBJ_FLAG_HIDDEN);
}

static void dialog_draw(lv_event_t *e)
{
    lv_layer_t *layer = lv_event_get_layer(e);
    lv_obj_t *obj = lv_event_get_target(e);
    lv_area_t a;
    int cx;
    int cy;
    int i;

    if (layer == NULL || obj == NULL) {
        return;
    }
    lv_obj_get_coords(obj, &a);
    cx = (a.x1 + a.x2) / 2;
    cy = a.y1 + 36;

    /* 外晕 */
    draw_arc_ring(layer, cx, cy, 28, 6, s_overlay_win ? 0xFFE08A : 0x8899AA,
                  s_overlay_win ? LV_OPA_40 : LV_OPA_20);
    /* 满月本体 */
    draw_dot(layer, cx, cy, 18, s_overlay_win ? 0xF7E7B2 : 0x8A9AAC, LV_OPA_COVER);
    draw_dot(layer, cx - 4, cy - 4, 5, 0xFFFFFF, LV_OPA_50);
    draw_arc_ring(layer, cx, cy, 18, 2, s_overlay_win ? COL_GOLD : 0x6A7A90, LV_OPA_80);
    /* 金粉点缀 */
    if (s_overlay_win) {
        static const int ox[6] = {-48, -36, 36, 48, -42, 42};
        static const int oy[6] = {8, -6, -6, 8, 28, 28};
        for (i = 0; i < 6; i++) {
            draw_dot(layer, cx + ox[i], cy + oy[i], (i & 1) ? 2 : 3, 0xE8C872, LV_OPA_70);
        }
    }
}

static void style_clean_obj(lv_obj_t *obj)
{
    lv_obj_remove_style_all(obj);
    lv_obj_set_style_pad_all(obj, 0, 0);
    lv_obj_set_style_border_width(obj, 0, 0);
    lv_obj_set_style_radius(obj, 0, 0);
    lv_obj_set_style_bg_opa(obj, LV_OPA_TRANSP, 0);
    lv_obj_remove_flag(obj, LV_OBJ_FLAG_SCROLLABLE);
}

static void show_overlay(int win)
{
    s_overlay_win = win;
    if (win && s_level_i == (int)(sizeof(LEVELS) / sizeof(LEVELS[0])) - 1) {
        lv_label_set_text(s_banner, "月圆人团圆");
    } else if (win) {
        lv_label_set_text(s_banner, "恭喜过关");
    } else {
        lv_label_set_text(s_banner, "步数用尽");
    }
    lv_label_set_text(s_banner_sub, "再来一局");

    if (s_dialog) {
        lv_obj_set_style_border_color(s_dialog, lv_color_hex(win ? COL_GOLD : 0x7A8AA0), 0);
        lv_obj_set_style_bg_color(s_dialog, lv_color_hex(win ? 0x1E2A42 : 0x1A2030), 0);
        lv_obj_set_style_shadow_width(s_dialog, win ? 30 : 14, 0);
        lv_obj_set_style_shadow_color(s_dialog, lv_color_hex(win ? COL_GOLD : 0x000000), 0);
        lv_obj_set_style_shadow_opa(s_dialog, win ? LV_OPA_50 : LV_OPA_30, 0);
        lv_obj_invalidate(s_dialog);
    }
    if (s_dialog_glow) {
        lv_obj_set_style_bg_opa(s_dialog_glow, win ? LV_OPA_30 : LV_OPA_10, 0);
        lv_obj_set_style_bg_color(s_dialog_glow, lv_color_hex(win ? 0xF5E2A4 : 0x8899AA), 0);
    }
    if (s_action_btn) {
        lv_obj_set_style_bg_color(s_action_btn, lv_color_hex(win ? 0x3D4F2E : 0x2A3448), 0);
        lv_obj_set_style_border_color(s_action_btn, lv_color_hex(win ? COL_GOLD : 0x7A8AA0), 0);
    }
    if (s_banner) {
        lv_obj_set_style_text_color(s_banner, lv_color_hex(win ? COL_GOLD : COL_MUTED), 0);
        lv_obj_align(s_banner, LV_ALIGN_TOP_MID, 0, 72);
    }
    if (s_banner_sub) {
        lv_obj_set_style_text_color(s_banner_sub, lv_color_hex(COL_CREAM), 0);
        lv_obj_align(s_banner_sub, LV_ALIGN_CENTER, 0, 0);
    }

    lv_obj_remove_flag(s_overlay, LV_OBJ_FLAG_HIDDEN);
    lv_obj_move_foreground(s_overlay);
}

static int level_won(void)
{
    const level_def_t *level = &LEVELS[s_level_i];
    if (level->score_goal && s_score < level->score_goal) {
        return 0;
    }
    if (level->yolk_goal && s_yolk < level->yolk_goal) {
        return 0;
    }
    if (level->need_moon && !s_moon_made) {
        return 0;
    }
    return 1;
}

static void start_level(int index)
{
    int n = (int)(sizeof(LEVELS) / sizeof(LEVELS[0]));
    if (index < 0) {
        index = 0;
    }
    if (index >= n) {
        index = 0;
    }
    s_level_i = index;
    s_score = 0;
    s_moves = LEVELS[index].moves;
    s_yolk = 0;
    s_moon_made = 0;
    s_cascade = 1;
    s_phase = PHASE_IDLE;
    s_sel = -1;
    s_hint_a = -1;
    s_hint_b = -1;
    s_hint_left = 3;
    s_hint_ttl = 0;
    s_reject_a = -1;
    s_reject_b = -1;
    s_reject_ttl = 0;
    fill_board();
    hide_overlay();
    set_brightness(78);
    update_hint_label();
    refresh_tiles();
    PR_NOTICE("mooncake level %s moves %d", LEVELS[index].name, s_moves);
}

static void apply_clear(void)
{
    int r;
    int c;
    int n = 0;
    int pts;

    for (r = 0; r < ROWS; r++) {
        for (c = 0; c < COLS; c++) {
            if (s_spawn[r][c] == SPEC_COLOR) {
                s_moon_made = 1;
            }
            if (!s_mask[r][c]) {
                continue;
            }
            if (s_board[r][c].kind == CAKE_YOLK) {
                s_yolk++;
            }
            s_board[r][c].kind = 0;
            s_board[r][c].spec = SPEC_NONE;
            n++;
        }
    }
    for (r = 0; r < ROWS; r++) {
        for (c = 0; c < COLS; c++) {
            if (s_spawn[r][c]) {
                s_board[r][c].spec = s_spawn[r][c];
            }
        }
    }
    if (n > 0) {
        pts = 30 + (n > 3 ? (n - 3) * 20 : 0);
        pts *= s_cascade;
        s_score += pts;
    }
    for (c = 0; c < COLS; c++) {
        int write = ROWS - 1;
        for (r = ROWS - 1; r >= 0; r--) {
            if (s_board[r][c].kind == 0) {
                continue;
            }
            if (write != r) {
                s_board[write][c] = s_board[r][c];
                s_board[r][c].kind = 0;
                s_board[r][c].spec = SPEC_NONE;
            }
            write--;
        }
        while (write >= 0) {
            s_board[write][c].kind = (uint8_t)(1 + (rnd() % KIND_MAX));
            s_board[write][c].spec = SPEC_NONE;
            write--;
        }
    }
    memset(s_mask, 0, sizeof(s_mask));
    memset(s_spawn, 0, sizeof(s_spawn));
}

static void begin_pop(void)
{
    int n = collect_matches();
    if (n <= 0 && s_spawn[0][0] == 0) {
        int any = 0;
        int r;
        int c;
        for (r = 0; r < ROWS && !any; r++) {
            for (c = 0; c < COLS; c++) {
                if (s_spawn[r][c]) {
                    any = 1;
                    break;
                }
            }
        }
        if (!any) {
            s_phase = PHASE_IDLE;
            s_cascade = 1;
            set_brightness(70);
            if (level_won()) {
                set_brightness(100);
                sfx_win();
                show_overlay(1);
            } else if (s_moves <= 0) {
                set_brightness(25);
                sfx_lose();
                show_overlay(0);
            } else if (!has_move()) {
                fill_board();
            }
            refresh_tiles();
            return;
        }
    }
    s_phase = PHASE_POP;
    s_phase_tick = 0;
    set_brightness((uint8_t)(50 + s_cascade * 12 > 100 ? 100 : 50 + s_cascade * 12));
    led_pulse();
    sfx_match(s_cascade);
    refresh_tiles();
}

static void try_swap(int a, int b)
{
    int ar = a / COLS;
    int ac = a % COLS;
    int br = b / COLS;
    int bc = b % COLS;
    cell_t tmp;
    int n;

    if ((ar == br && (ac - bc == 1 || bc - ac == 1)) || (ac == bc && (ar - br == 1 || br - ar == 1))) {
        tmp = s_board[ar][ac];
        s_board[ar][ac] = s_board[br][bc];
        s_board[br][bc] = tmp;
        n = collect_matches();
        if (n <= 0) {
            int any = 0;
            int r;
            int c;
            for (r = 0; r < ROWS && !any; r++) {
                for (c = 0; c < COLS; c++) {
                    if (s_spawn[r][c]) {
                        any = 1;
                    }
                }
            }
            if (!any) {
                s_board[br][bc] = s_board[ar][ac];
                s_board[ar][ac] = tmp;
                memset(s_mask, 0, sizeof(s_mask));
                memset(s_spawn, 0, sizeof(s_spawn));
                s_reject_a = a;
                s_reject_b = b;
                s_reject_ttl = 12;
                s_sel = -1;
                sfx_reject();
                refresh_tiles();
                return;
            }
        }
        s_moves--;
        s_cascade = 1;
        s_sel = -1;
        begin_pop();
        return;
    }
    s_sel = b;
    refresh_tiles();
}

static void on_tile(lv_event_t *e)
{
    lv_obj_t *obj = lv_event_get_target(e);
    int index = (int)(uintptr_t)lv_obj_get_user_data(obj);

    if (s_phase != PHASE_IDLE || !lv_obj_has_flag(s_overlay, LV_OBJ_FLAG_HIDDEN)) {
        return;
    }
    s_hint_ttl = 0;
    if (s_sel < 0 || s_sel == index) {
        s_sel = (s_sel == index) ? -1 : index;
        refresh_tiles();
        return;
    }
    try_swap(s_sel, index);
}

static void on_overlay(lv_event_t *e)
{
    (void)e;
    if (s_overlay_win) {
        start_level(s_level_i + 1);
    } else {
        start_level(s_level_i);
    }
}

static void update_hint_label(void)
{
    char buf[16];
    if (!s_hint_lbl) {
        return;
    }
    if (s_hint_left > 0) {
        snprintf(buf, sizeof(buf), "提示x%d", s_hint_left);
        lv_label_set_text(s_hint_lbl, buf);
        lv_obj_set_style_text_color(s_hint_lbl, lv_color_hex(COL_CREAM), 0);
        lv_obj_set_style_text_opa(s_hint_lbl, LV_OPA_COVER, 0);
        if (s_hint_btn) {
            lv_obj_set_style_bg_color(s_hint_btn, lv_color_hex(0x3A4A63), 0);
            lv_obj_set_style_border_color(s_hint_btn, lv_color_hex(COL_GOLD), 0);
        }
    } else {
        lv_label_set_text(s_hint_lbl, "已用完");
        lv_obj_set_style_text_color(s_hint_lbl, lv_color_hex(COL_MUTED), 0);
        lv_obj_set_style_text_opa(s_hint_lbl, LV_OPA_70, 0);
        if (s_hint_btn) {
            lv_obj_set_style_bg_color(s_hint_btn, lv_color_hex(0x2A3448), 0);
            lv_obj_set_style_border_color(s_hint_btn, lv_color_hex(0x5A6A80), 0);
        }
    }
    if (s_hint_lbl) {
        lv_obj_align(s_hint_lbl, LV_ALIGN_CENTER, 0, 0);
    }
}

static void do_hint(void)
{
    int r;
    int c;
    int k;
    static const int dr[2] = {0, 1};
    static const int dc[2] = {1, 0};

    if (s_phase != PHASE_IDLE || !lv_obj_has_flag(s_overlay, LV_OBJ_FLAG_HIDDEN)) {
        return;
    }
    if (s_hint_left <= 0) {
        sfx_reject();
        return;
    }
    for (r = 0; r < ROWS; r++) {
        for (c = 0; c < COLS; c++) {
            for (k = 0; k < 2; k++) {
                int rr = r + dr[k];
                int cc = c + dc[k];
                cell_t tmp;
                int n;
                if (rr >= ROWS || cc >= COLS) {
                    continue;
                }
                tmp = s_board[r][c];
                s_board[r][c] = s_board[rr][cc];
                s_board[rr][cc] = tmp;
                n = collect_matches();
                s_board[rr][cc] = s_board[r][c];
                s_board[r][c] = tmp;
                memset(s_mask, 0, sizeof(s_mask));
                memset(s_spawn, 0, sizeof(s_spawn));
                if (n > 0) {
                    s_hint_a = idx_of(r, c);
                    s_hint_b = idx_of(rr, cc);
                    s_hint_ttl = 50;
                    s_hint_left--;
                    update_hint_label();
                    sfx_hint();
                    led_pulse();
                    refresh_tiles();
                    return;
                }
            }
        }
    }
    sfx_reject();
}

static void on_hint(lv_event_t *e)
{
    (void)e;
    do_hint();
}

static void game_timer(lv_timer_t *timer)
{
    (void)timer;
    if (s_hint_req) {
        s_hint_req = 0;
        do_hint();
    }
    if (s_hint_ttl > 0) {
        s_hint_ttl--;
        if (s_hint_ttl == 0) {
            refresh_tiles();
        }
    }
    if (s_reject_ttl > 0) {
        s_reject_ttl--;
        if (s_reject_ttl == 0) {
            s_reject_a = -1;
            s_reject_b = -1;
            refresh_tiles();
        }
    }
    if (s_phase == PHASE_IDLE) {
        return;
    }
    s_phase_tick++;
    if (s_phase == PHASE_POP && s_phase_tick >= 7) {
        apply_clear();
        s_phase = PHASE_DROP;
        s_phase_tick = 0;
        refresh_tiles();
    } else if (s_phase == PHASE_POP) {
        refresh_tiles(); /* 刷新粒子扩散动画 */
    } else if (s_phase == PHASE_DROP && s_phase_tick >= 2) {
        s_cascade++;
        begin_pop();
    }
}

static void button_cb(char *name, TDL_BUTTON_TOUCH_EVENT_E event, void *argc)
{
    (void)name;
    (void)argc;
    if (event == TDL_BUTTON_PRESS_SINGLE_CLICK) {
        s_hint_req = 1;
    }
}

static lv_obj_t *make_label(lv_obj_t *parent, const char *text, int x, int y, const lv_font_t *font, uint32_t color)
{
    lv_obj_t *label = lv_label_create(parent);
    lv_label_set_text(label, text);
    lv_obj_set_pos(label, x, y);
    lv_obj_set_style_text_font(label, font, 0);
    lv_obj_set_style_text_color(label, lv_color_hex(color), 0);
    return label;
}

static lv_obj_t *make_panel(lv_obj_t *parent, int x, int y, int w, int h, uint32_t bg, uint32_t border)
{
    lv_obj_t *panel = lv_obj_create(parent);
    lv_obj_set_pos(panel, x, y);
    lv_obj_set_size(panel, w, h);
    lv_obj_set_style_radius(panel, 16, 0);
    lv_obj_set_style_bg_color(panel, lv_color_hex(bg), 0);
    lv_obj_set_style_bg_opa(panel, LV_OPA_COVER, 0);
    lv_obj_set_style_border_width(panel, 2, 0);
    lv_obj_set_style_border_color(panel, lv_color_hex(border), 0);
    lv_obj_set_style_pad_all(panel, 0, 0);
    lv_obj_remove_flag(panel, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_remove_flag(panel, LV_OBJ_FLAG_CLICKABLE);
    return panel;
}

static void paint_sky(lv_obj_t *screen)
{
    static const int stars[][2] = {
        {28, 24}, {56, 58}, {92, 18}, {140, 42}, {188, 22},
        {236, 50}, {278, 28}, {304, 62},
    };
    int i;
    lv_obj_t *moon;
    lv_obj_t *glow;

    glow = lv_obj_create(screen);
    lv_obj_set_size(glow, 180, 180);
    lv_obj_set_pos(glow, 70, 150);
    lv_obj_set_style_radius(glow, LV_RADIUS_CIRCLE, 0);
    lv_obj_set_style_bg_color(glow, lv_color_hex(0xF5E2A4), 0);
    lv_obj_set_style_bg_opa(glow, LV_OPA_10, 0);
    lv_obj_set_style_border_width(glow, 0, 0);
    lv_obj_remove_flag(glow, LV_OBJ_FLAG_CLICKABLE | LV_OBJ_FLAG_SCROLLABLE);

    moon = lv_obj_create(screen);
    lv_obj_set_size(moon, 96, 96);
    lv_obj_set_pos(moon, 112, 168);
    lv_obj_set_style_radius(moon, LV_RADIUS_CIRCLE, 0);
    lv_obj_set_style_bg_color(moon, lv_color_hex(0xF7E7B2), 0);
    lv_obj_set_style_bg_opa(moon, LV_OPA_30, 0);
    lv_obj_set_style_border_width(moon, 0, 0);
    lv_obj_remove_flag(moon, LV_OBJ_FLAG_CLICKABLE | LV_OBJ_FLAG_SCROLLABLE);

    for (i = 0; i < (int)(sizeof(stars) / sizeof(stars[0])); i++) {
        lv_obj_t *star = lv_obj_create(screen);
        int size = (i % 3 == 0) ? 4 : 3;
        lv_obj_set_size(star, size, size);
        lv_obj_set_pos(star, stars[i][0], stars[i][1]);
        lv_obj_set_style_radius(star, LV_RADIUS_CIRCLE, 0);
        lv_obj_set_style_bg_color(star, lv_color_hex(COL_CREAM), 0);
        lv_obj_set_style_bg_opa(star, (i % 2) ? LV_OPA_70 : LV_OPA_40, 0);
        lv_obj_set_style_border_width(star, 0, 0);
        lv_obj_remove_flag(star, LV_OBJ_FLAG_CLICKABLE | LV_OBJ_FLAG_SCROLLABLE);
    }
}

static void open_audio(void)
{
#if defined(AUDIO_CODEC_NAME)
    char name[] = AUDIO_CODEC_NAME;
    if (tdl_audio_find(name, &s_audio) != OPRT_OK) {
        return;
    }
    if (tdl_audio_open(s_audio, mic_cb) != OPRT_OK) {
        s_audio = NULL;
        return;
    }
    if (tdl_audio_get_info(s_audio, &s_audio_info) != OPRT_OK || s_audio_info.frame_size == 0) {
        return;
    }
    tdl_audio_volume_set(s_audio, 60);
    s_audio_ok = 1;
#else
    (void)mic_cb;
#endif
}

static void open_led_button(void)
{
#if defined(LED_NAME)
    char led_name[] = LED_NAME;
    s_led = tdl_led_find_dev(led_name);
    if (s_led) {
        tdl_led_open(s_led);
        tdl_led_set_status(s_led, TDL_LED_OFF);
    }
#endif
#if defined(BUTTON_NAME)
    {
        char btn_name[] = BUTTON_NAME;
        TDL_BUTTON_CFG_T cfg;
        TDL_BUTTON_HANDLE handle = NULL;
        memset(&cfg, 0, sizeof(cfg));
        cfg.long_start_valid_time = 3000;
        cfg.long_keep_timer = 1000;
        cfg.button_debounce_time = 40;
        cfg.button_repeat_valid_count = 2;
        cfg.button_repeat_valid_time = 300;
        if (tdl_button_create(btn_name, &cfg, &handle) == OPRT_OK) {
            tdl_button_event_register(handle, TDL_BUTTON_PRESS_SINGLE_CLICK, button_cb);
        }
    }
#endif
}

void app_mooncake_start(void)
{
    lv_obj_t *screen;
    lv_obj_t *hud;
    lv_obj_t *board;
    lv_obj_t *dialog;
    int r;
    int c;
    int board_w = COLS * TILE + (COLS - 1) * GAP + 16;
    int board_h = ROWS * TILE + (ROWS - 1) * GAP + 16;

    s_rng ^= (uint32_t)tal_system_get_millisecond();
    open_audio();
    open_led_button();

#if defined(DISPLAY_NAME)
    lv_vendor_init(DISPLAY_NAME);
    {
        char disp_name[] = DISPLAY_NAME;
        s_disp = tdl_disp_find_dev(disp_name);
    }
#else
    PR_ERR("display is not enabled");
    return;
#endif

    lv_vendor_disp_lock();
    screen = lv_screen_active();
    lv_obj_set_style_bg_color(screen, lv_color_hex(COL_BG), 0);
    lv_obj_set_style_bg_opa(screen, LV_OPA_COVER, 0);
    lv_obj_remove_flag(screen, LV_OBJ_FLAG_SCROLLABLE);

    paint_sky(screen);

    hud = make_panel(screen, 10, 10, 300, 84, COL_CARD, 0x3A4A63);
    s_title = make_label(hud, "月饼消消乐", 14, 10, &moon_font, COL_GOLD);
    s_level = make_label(hud, "初月", 220, 10, &moon_font, COL_CREAM);
    make_label(hud, "分数", 14, 42, &moon_font, COL_MUTED);
    s_score_num = make_label(hud, "0", 58, 44, &lv_font_montserrat_14, COL_CREAM);
    make_label(hud, "步数", 120, 42, &moon_font, COL_MUTED);
    s_move_num = make_label(hud, "0", 164, 44, &lv_font_montserrat_14, COL_CREAM);
    s_goal_cap = make_label(hud, "分数", 14, 62, &moon_font, COL_GOLD);
    s_goal_num = make_label(hud, "0/800", 58, 64, &lv_font_montserrat_14, COL_CREAM);

    /* 提示键放在 HUD 右侧，避免贴底点不到 */
    s_hint_btn = lv_obj_create(hud);
    lv_obj_set_pos(s_hint_btn, 210, 52);
    lv_obj_set_size(s_hint_btn, 80, 28);
    lv_obj_set_style_radius(s_hint_btn, 12, 0);
    lv_obj_set_style_bg_color(s_hint_btn, lv_color_hex(0x3A4A63), 0);
    lv_obj_set_style_bg_opa(s_hint_btn, LV_OPA_COVER, 0);
    lv_obj_set_style_border_width(s_hint_btn, 2, 0);
    lv_obj_set_style_border_color(s_hint_btn, lv_color_hex(COL_GOLD), 0);
    lv_obj_set_style_pad_all(s_hint_btn, 0, 0);
    lv_obj_remove_flag(s_hint_btn, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_add_flag(s_hint_btn, LV_OBJ_FLAG_CLICKABLE);
    lv_obj_add_event_cb(s_hint_btn, on_hint, LV_EVENT_CLICKED, NULL);
    s_hint_lbl = make_label(s_hint_btn, "提示x3", 0, 0, &moon_font, COL_CREAM);
    lv_obj_align(s_hint_lbl, LV_ALIGN_CENTER, 0, 0);
    lv_obj_add_flag(s_hint_lbl, LV_OBJ_FLAG_EVENT_BUBBLE);

    board = make_panel(screen, (320 - board_w) / 2, ORIGIN_Y - 8, board_w, board_h, COL_BOARD, 0x4A3B22);
    lv_obj_set_style_border_color(board, lv_color_hex(0xC9A24A), 0);

    for (r = 0; r < ROWS; r++) {
        for (c = 0; c < COLS; c++) {
            int index = idx_of(r, c);
            lv_obj_t *tile = lv_obj_create(board);
            s_tile[index] = tile;
            lv_obj_set_user_data(tile, (void *)(uintptr_t)index);
            lv_obj_set_pos(tile, 8 + c * (TILE + GAP), 8 + r * (TILE + GAP));
            lv_obj_set_size(tile, TILE, TILE);
            lv_obj_set_style_bg_opa(tile, LV_OPA_TRANSP, 0);
            lv_obj_set_style_radius(tile, 10, 0);
            lv_obj_set_style_pad_all(tile, 0, 0);
            lv_obj_set_style_border_width(tile, 0, 0);
            lv_obj_remove_flag(tile, LV_OBJ_FLAG_SCROLLABLE);
            lv_obj_add_flag(tile, LV_OBJ_FLAG_CLICKABLE);
            lv_obj_add_event_cb(tile, tile_draw, LV_EVENT_DRAW_MAIN, NULL);
            lv_obj_add_event_cb(tile, on_tile, LV_EVENT_CLICKED, NULL);
        }
    }

    s_overlay = lv_obj_create(screen);
    style_clean_obj(s_overlay);
    lv_obj_set_size(s_overlay, 320, 480);
    lv_obj_set_pos(s_overlay, 0, 0);
    lv_obj_set_style_bg_color(s_overlay, lv_color_hex(0x05080F), 0);
    lv_obj_set_style_bg_opa(s_overlay, LV_OPA_70, 0);
    lv_obj_add_flag(s_overlay, LV_OBJ_FLAG_CLICKABLE);

    /* 背后月晕 */
    s_dialog_glow = lv_obj_create(s_overlay);
    style_clean_obj(s_dialog_glow);
    lv_obj_set_size(s_dialog_glow, 220, 220);
    lv_obj_align(s_dialog_glow, LV_ALIGN_CENTER, 0, -8);
    lv_obj_set_style_radius(s_dialog_glow, LV_RADIUS_CIRCLE, 0);
    lv_obj_set_style_bg_color(s_dialog_glow, lv_color_hex(0xF5E2A4), 0);
    lv_obj_set_style_bg_opa(s_dialog_glow, LV_OPA_20, 0);
    lv_obj_add_flag(s_dialog_glow, LV_OBJ_FLAG_EVENT_BUBBLE);

    /* 结算卡片 */
    s_dialog = lv_obj_create(s_overlay);
    style_clean_obj(s_dialog);
    dialog = s_dialog;
    lv_obj_set_size(dialog, 268, 210);
    lv_obj_align(dialog, LV_ALIGN_CENTER, 0, 0);
    lv_obj_set_style_radius(dialog, 24, 0);
    lv_obj_set_style_bg_color(dialog, lv_color_hex(0x1E2A42), 0);
    lv_obj_set_style_bg_opa(dialog, LV_OPA_COVER, 0);
    lv_obj_set_style_border_width(dialog, 3, 0);
    lv_obj_set_style_border_color(dialog, lv_color_hex(COL_GOLD), 0);
    lv_obj_set_style_shadow_width(dialog, 30, 0);
    lv_obj_set_style_shadow_color(dialog, lv_color_hex(COL_GOLD), 0);
    lv_obj_set_style_shadow_opa(dialog, LV_OPA_50, 0);
    lv_obj_add_flag(dialog, LV_OBJ_FLAG_EVENT_BUBBLE);
    lv_obj_add_event_cb(dialog, dialog_draw, LV_EVENT_DRAW_MAIN, NULL);

    s_dialog_moon = NULL; /* 月亮改由 dialog_draw 绘制，避免主题样式干扰 */

    s_banner = make_label(dialog, "恭喜过关", 0, 0, &moon_font, COL_GOLD);
    lv_obj_align(s_banner, LV_ALIGN_TOP_MID, 0, 72);

    s_action_btn = lv_obj_create(dialog);
    style_clean_obj(s_action_btn);
    lv_obj_set_size(s_action_btn, 150, 42);
    lv_obj_align(s_action_btn, LV_ALIGN_BOTTOM_MID, 0, -24);
    lv_obj_set_style_radius(s_action_btn, 21, 0);
    lv_obj_set_style_bg_color(s_action_btn, lv_color_hex(0x3D4F2E), 0);
    lv_obj_set_style_bg_opa(s_action_btn, LV_OPA_COVER, 0);
    lv_obj_set_style_border_width(s_action_btn, 2, 0);
    lv_obj_set_style_border_color(s_action_btn, lv_color_hex(COL_GOLD), 0);
    lv_obj_add_flag(s_action_btn, LV_OBJ_FLAG_EVENT_BUBBLE | LV_OBJ_FLAG_CLICKABLE);

    s_banner_sub = make_label(s_action_btn, "再来一局", 0, 0, &moon_font, COL_CREAM);
    lv_obj_align(s_banner_sub, LV_ALIGN_CENTER, 0, 0);
    lv_obj_add_flag(s_banner_sub, LV_OBJ_FLAG_EVENT_BUBBLE);

    lv_obj_add_event_cb(s_overlay, on_overlay, LV_EVENT_CLICKED, NULL);
    lv_obj_add_flag(s_overlay, LV_OBJ_FLAG_HIDDEN);

    start_level(0);
    lv_timer_create(game_timer, 40, NULL);
    lv_vendor_disp_unlock();

    set_brightness(78);
    lv_vendor_start(5, 1024 * 16);
}
