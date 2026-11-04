#!/bin/sh
# Скачать корпус русской классики (общественное достояние) в .cache/lit (в git не хранится).
#  1) RusLit (github.com/d0rj/RusLit): проза Пушкина, Лермонтова, Гоголя, Тургенева, Достоевского, Л. Толстого,
#     Чехова, Горького, Герцена, Брюсова, Блока; стихи Пушкина, Лермонтова, Некрасова, Блока.
#  2) az.lib.ru: Аксаков, Бунин, Куприн, Тютчев, Фет, Есенин, Пришвин, Гончаров, Лесков, Короленко, Гаршин, Салтыков-Щедрин.
# Затем: python3 tools/lit/build.py  → .cache/lit/sent.jsonl;  поиск: node tools/lit/find.js "<регулярка>" --a "Чехов"
set -e
D="$(dirname "$0")/../../.cache/lit"; mkdir -p "$D/az"; cd "$D"
[ -d ruslit ] || git clone --depth 1 https://github.com/d0rj/RusLit.git ruslit
while read code url; do [ -s "az/$code.html" ] || curl -s -m 90 "http://az.lib.ru/$url.shtml" -o "az/$code.html"; done <<'L'
bg a/aksakow_s_t/text_0020
ay b/bunin_i_a/text_1150
iz k/kuprin_a_i/text_1864
bp k/kuprin_a_i/text_1642
ol k/kuprin_a_i/text_0130
tu t/tjutchew_f_i/text_0010
pr p/prishwin_m_m/text_1915_avgustovskie_lesa
oblomov g/goncharow_i_a/text_0020
strannik l/leskow_n_s/text_0029
levsha l/leskow_n_s/text_0246
podzem k/korolenko_w_g/text_0060
cvetok g/garshin_w_m/text_0040
lyagushka g/garshin_w_m/text_0080
piskar s/saltykow_m_e/text_0450
fet f/fet_a_a/text_0042
esenin e/esenin_s_a/text_0420
L
echo "готово: $D"
