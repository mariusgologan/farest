#!/bin/sh
# Lighthouse on the main pages, mobile and desktop. Runs inside the Playwright (node) image: `make lighthouse`
# audits a local copy of mockup/, `make lighthouse URL=https://farest.scrollout.net/` the live site.
# Writes /out/<page>-<form>.report.{html,json} and /out/summary.md.
set -e
LH_VERSION=${LH_VERSION:-12.6.0}
export CHROME_PATH=$(ls -d /ms-playwright/chromium-*/chrome-linux*/chrome | head -1)
npm i -s --no-save --prefix /tmp/lh "lighthouse@$LH_VERSION" >/dev/null
BASE=$URL
if [ -z "$BASE" ]; then
  cp -r /src /tmp/site && (cd /tmp/site && python3 -m http.server 8765 --bind 127.0.0.1 >/dev/null 2>&1 &)
  sleep 1; BASE=http://127.0.0.1:8765/
fi
rm -f /out/*.report.* /out/summary.md
for p in "home|" "windows|#/c/windows" "product|#/p/fereastra-pvc-4-camere-alb-56x56-cm" "calculator|#/calculator" "corporate|corporate/"; do
  name=${p%%|*}; url=$BASE${p#*|}
  for form in mobile desktop; do
    preset=""; [ $form = desktop ] && preset="--preset=desktop"
    /tmp/lh/node_modules/.bin/lighthouse "$url" --quiet $preset --chrome-flags="--headless=new --no-sandbox" \
      --output=json --output=html --output-path="/out/$name-$form" || echo "lighthouse failed: $name $form"
  done
done
node /tools/lighthouse-summary.mjs /out "$BASE" > /out/summary.md
cat /out/summary.md
