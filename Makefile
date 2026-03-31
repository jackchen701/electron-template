.PHONY: help dev build build-win build-mac build-linux \
        tar-win tar-mac tar-linux \
        lint lint-fix format install

# ── Variables ────────────────────────────────────────────────
VERSION     := $(shell node -p "require('./package.json').version")
PRODUCT     := $(shell node -p "(require('./package.json').productName || require('./package.json').name).replace(/\\s+/g,'-')")
RELEASE_DIR := release/$(VERSION)

# Default target
.DEFAULT_GOAL := help

# ── Help ─────────────────────────────────────────────────────
help: ## Show this help message
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} \
		/^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2 } \
		/^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) }' $(MAKEFILE_LIST)

##@ Setup

install: ## Install dependencies
	npm install

##@ Development

dev: ## Start development server
	npm run dev

##@ Code Quality

format: ## Format source code with Prettier
	npm run format

lint: ## Lint source code with ESLint
	npm run lint

lint-fix: ## Lint and auto-fix source code
	npm run lint:fix

##@ Build

build: ## Build for current platform
	npm run build

build-win: ## Build for Windows x64
	npm run build:win

build-mac: ## Build for macOS (must run on macOS)
	npm run build:mac

build-linux: ## Build for Linux (AppImage)
	npm run build:linux

##@ Release — tar packaging

tar-win: ## Package Windows release artifacts into tar.gz
	@if [ ! -d "$(RELEASE_DIR)" ]; then \
		echo "Error: $(RELEASE_DIR) not found. Run 'make build-win' first."; exit 1; fi
	npm run tar:win
	@echo "Created: $(RELEASE_DIR)/$(PRODUCT)-$(VERSION)-win.tar.gz"

tar-mac: ## Package macOS release artifacts into tar.gz
	@if [ ! -d "$(RELEASE_DIR)" ]; then \
		echo "Error: $(RELEASE_DIR) not found. Run 'make build-mac' first."; exit 1; fi
	npm run tar:mac
	@echo "Created: $(RELEASE_DIR)/$(PRODUCT)-$(VERSION)-mac.tar.gz"

tar-linux: ## Package Linux release artifacts into tar.gz
	@if [ ! -d "$(RELEASE_DIR)" ]; then \
		echo "Error: $(RELEASE_DIR) not found. Run 'make build-linux' first."; exit 1; fi
	npm run tar:linux
	@echo "Created: $(RELEASE_DIR)/$(PRODUCT)-$(VERSION)-linux.tar.gz"
