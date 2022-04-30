#!/usr/bin/env bash

# TODO: save SVG from node instead
\cp "$(pwd)/pass-sticker-right.svg" "$(pwd)/source.svg"

inkscape --export-type="png" --export-filename="$(pwd)/print.png" "$(pwd)/source.svg"

printer="$(brother_ql --backend pyusb discover | head -1 | cut -d "_" -f 1)"

echo "Using printer on USB: ${printer}" >&2

# TODO: do an actual print
cat << EOF
brother_ql \
    --backend pyusb \
    --model QL-810W \
    --printer "${printer}" \
    print \
    --rotate 90 \
    --label 38 \
    ./print.png

EOF