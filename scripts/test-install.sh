#!/usr/bin/env bash
# Installs every @dentil item into fresh Next.js and Vite apps, on both a Radix and a Base UI style, from a locally
# served registry, then builds them.
# This is the only check that catches a missing registryDependencies entry or an import that only resolves here.
set -euo pipefail

port="${PORT:-4321}"
root="$(cd "$(dirname "$0")/.." && pwd)"
work="$(mktemp -d)"

cd "$root"
npm run registry:build
items=$(node -p "require('./registry.json').items.map((item) => '@dentil/' + item.name).join(' ')")

# 127.0.0.1 rather than localhost: Node resolves localhost to ::1, and http.server only listens on IPv4.
python3 -m http.server "$port" --bind 127.0.0.1 -d public >/dev/null 2>&1 &
server=$!
trap 'kill "$server"; rm -rf "$work"' EXIT
for _ in {1..40}; do curl -sf "http://127.0.0.1:$port/r/registry.json" >/dev/null && break || sleep 0.25; done

for base in radix base; do
  for template in next vite; do
    app="$base-$template"
    echo "::group::$app"
    (cd "$work" && npx --yes shadcn@latest init -t "$template" -b "$base" -p nova -n "$app" -y --no-monorepo </dev/null)
    cd "$work/$app"
    node -e '
      const fs = require("fs");
      const config = JSON.parse(fs.readFileSync("components.json", "utf8"));
      config.registries = { "@dentil": process.argv[1] };
      fs.writeFileSync("components.json", JSON.stringify(config, null, 2));
    ' "http://127.0.0.1:$port/r/{name}.json"
    # shellcheck disable=SC2086
    npx --yes shadcn@latest add $items -y -o </dev/null
    npm run build
    cd "$root"
    echo "::endgroup::"
  done
done

echo "Installed and built with radix and base, in next and vite: $items"
