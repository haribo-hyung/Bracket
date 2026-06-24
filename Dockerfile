# syntax=docker/dockerfile:1
# Stage 1 — compile JSX to plain JS
FROM node:20-alpine AS builder
WORKDIR /tmp/npm
RUN npm init -y && \
    npm install -D @babel/core @babel/cli @babel/preset-react --silent && \
    echo '{"presets":[["@babel/preset-react",{"runtime":"classic"}]]}' > babel.config.json

COPY web/ /build/
# Optional explicit version; when unset we derive a content hash so each distinct
# build gets unique ?v= asset URLs (cache-bust). A constant default would pin every
# release to the same immutable-cached URLs — stale JS until users clear their cache.
ARG BUILD_VER=
RUN set -eux; \
    for f in ds-patches topbar calendar modals app; do \
      npx babel /build/ui_kits/bracket-calendar/$f.jsx -o /tmp/$f.js; \
      printf '(function(){\n' > /build/ui_kits/bracket-calendar/$f.js; \
      cat /tmp/$f.js >> /build/ui_kits/bracket-calendar/$f.js; \
      printf '\n})();\n' >> /build/ui_kits/bracket-calendar/$f.js; \
      node --check /build/ui_kits/bracket-calendar/$f.js; \
    done && \
    VER="$BUILD_VER"; \
    if [ -z "$VER" ]; then \
      VER=$(cat /build/ui_kits/bracket-calendar/*.js /build/styles.css 2>/dev/null \
            | md5sum | cut -c1-12); \
    fi; \
    sed "s/__VER__/$VER/g" /build/ui_kits/bracket-calendar/index.template.html \
      > /build/ui_kits/bracket-calendar/index.html

# Stage 2 — Python runtime
FROM python:3.12-slim
WORKDIR /app
COPY api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY api/app ./app
COPY --from=builder /build ./web
ENV WEB_DIR=/app/web
EXPOSE 8080
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
