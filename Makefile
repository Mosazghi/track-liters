NAME=trackliters
DOMAIN=mosazghi
STAGING=staging

.PHONY: all pack install clean run

all: dist/extension.js

node_modules/.package-lock.json: package.json
	pnpm install

dist/extension.js: node_modules/.package-lock.json $(wildcard *.ts)
	pnpm build

schemas/gschemas.compiled: schemas/org.gnome.shell.extensions.$(NAME).gschema.xml
	glib-compile-schemas schemas

$(NAME).zip: dist/extension.js schemas/gschemas.compiled
	@rm -rf $(STAGING)
	@mkdir -p $(STAGING)
	@cp -r dist/* $(STAGING)/
	@cp -r schemas $(STAGING)/
	@cp metadata.json $(STAGING)/
	@(cd $(STAGING) && zip ../$(NAME).zip -9r .)
	@rm -rf $(STAGING)

pack: $(NAME).zip

install: $(NAME).zip
	gnome-extensions install --force $(NAME).zip

clean:
	@rm -rf dist node_modules $(NAME).zip $(STAGING)

run: install
	dbus-run-session gnome-shell --devkit --wayland
