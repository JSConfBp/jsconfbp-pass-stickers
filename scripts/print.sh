#!/usr/bin/env bash

printer="$(brother_ql --backend pyusb discover | head -1 | cut -d "_" -f 1)"

if [ -z "${printer}" ]; then
    echo "Error: no printer found!" >&2
    exit 1
fi

inkscape --export-type="png" --export-filename="$(pwd)/print.png" "$1"

echo "Using printer on USB: ${printer}" >&2


#cat << EOF
brother_ql \
    --backend pyusb \
    --model QL-810W \
    --printer "${printer}" \
    print \
    --rotate 90 \
    --label 38 \
   "$(pwd)/print.png"
#EOF