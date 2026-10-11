# One entry point for local runs and CI. `make` lists the targets; CI runs `make ci`.
# Tests run in the stock Playwright image (no build); the crawl uses the farest-browser container (docker-compose.yml).

PW_VERSION := 1.62.0
PW_IMAGE   := mcr.microsoft.com/playwright/python:v$(PW_VERSION)-noble
NODE_IMAGE := mcr.microsoft.com/playwright:v$(PW_VERSION)-noble
SHARP_VERSION := 0.33.5
AXE_VERSION := 4.10.2
AXE        := .cache/axe-$(AXE_VERSION).min.js
PORT       ?= 8080
ORBIT      ?= $(HOME)/orbit
JS         := $(shell find mockup -name '*.js')
JSON       := $(shell find mockup -name '*.json' -o -name '*.webmanifest')

.DEFAULT_GOAL := help
.PHONY: help lint test ci serve images lighthouse docs up crawl crawl-log shot

help: ## list the targets
	@grep -hE '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{ printf "  make %-10s %s\n", $$1, $$2 }'

lint: ## syntax-check every mockup script and JSON file (needs node)
	@for f in $(JS); do node --check $$f || exit 1; done
	@node -e 'for (const f of process.argv.slice(1)) JSON.parse(require("fs").readFileSync(f, "utf8"))' $(JSON)
	@echo "lint: $(words $(JS)) scripts, $(words $(JSON)) JSON files ok"

$(AXE):
	@mkdir -p $(dir $@)
	curl -fsSL -o $@ https://cdnjs.cloudflare.com/ajax/libs/axe-core/$(AXE_VERSION)/axe.min.js

test: $(AXE) ## Playwright suite (tests/mockup_test.py) on a writable copy of mockup/, inside the Playwright image
	docker run --rm --init --ipc=host \
	  -v "$(CURDIR)/mockup:/src:ro" -v "$(CURDIR)/tests:/tests:ro" -v "$(CURDIR)/$(AXE):/axe.min.js:ro" -e AXE=/axe.min.js \
	  $(PW_IMAGE) sh -c 'pip install -q --break-system-packages --root-user-action=ignore playwright==$(PW_VERSION) \
	    && cp -r /src /tmp/site && cd /tmp/site && (python3 -m http.server 8765 --bind 127.0.0.1 >/tmp/server.log 2>&1 &) \
	    && sleep 1 && python3 /tests/mockup_test.py /tmp/site 8765'

ci: lint test ## everything CI runs before a deploy

serve: ## preview mockup/ at http://127.0.0.1:PORT, default 8080 (server in a container, never in WSL)
	docker run --rm --init -p 127.0.0.1:$(PORT):8000 -v "$(CURDIR)/mockup:/site:ro" -w /site $(PW_IMAGE) python3 -m http.server 8000

images: ## convert new JPG/PNG in mockup/images to WebP and update the references (tools/images.mjs)
	docker run --rm --init --user "$$(id -u):$$(id -g)" -e HOME=/tmp -v "$(CURDIR):/repo" -w /repo $(NODE_IMAGE) sh -c \
	  'mkdir -p /tmp/t && cp tools/images.mjs /tmp/t/ && cd /tmp/t && npm i -s --no-save sharp@$(SHARP_VERSION) >/dev/null && cd /repo && node /tmp/t/images.mjs'

lighthouse: ## Lighthouse, 5 pages x mobile/desktop, of a local copy (or URL=https://...); reports in .cache/lighthouse
	mkdir -p .cache/lighthouse
	docker run --rm --init --ipc=host --user "$$(id -u):$$(id -g)" -e HOME=/tmp -e URL="$(URL)" \
	  -v "$(CURDIR)/mockup:/src:ro" -v "$(CURDIR)/tools:/tools:ro" -v "$(CURDIR)/.cache/lighthouse:/out" $(NODE_IMAGE) sh /tools/lighthouse.sh

docs: ## validate the okf bundle (local only: okf/ is not versioned)
	node $(ORBIT)/scripts/validate-okf.mjs --root .

up: ## start the crawl browser (farest-browser); up, crawl and shot need the main checkout (browser/ is not versioned)
	docker compose up -d

crawl: ## polite, resumable crawl of www.farest.ro into capture/ (MAX_PAGES, DELAY_MIN, DELAY_MAX, START)
	docker compose exec -d $(foreach v,MAX_PAGES DELAY_MIN DELAY_MAX START,$(if $($(v)),-e $(v)=$($(v)))) browser sh -c 'python /work/crawl.py > /capture/crawl.log 2>&1'

crawl-log: ## follow the crawl log
	tail -f capture/crawl.log

shot: ## one-off capture: make shot URL=https://www.farest.ro/ NAME=home
	docker compose exec browser python /work/shot.py "$(URL)" $(NAME)
