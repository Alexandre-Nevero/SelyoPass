#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STELLAR_BIN="${STELLAR_CLI:-stellar}"
ANCHOR_WASM="$ROOT_DIR/contracts/target/wasm32v1-none/release/selyopass_anchor_registry.wasm"
CREDENTIAL_WASM="$ROOT_DIR/contracts/target/wasm32v1-none/release/selyopass_credential_registry.wasm"
TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT

if [[ "$("$STELLAR_BIN" --version)" != stellar\ 27.0.0* ]]; then
  echo "Stellar CLI 27.0.0 is required to verify generated bindings." >&2
  exit 1
fi
for wasm in "$ANCHOR_WASM" "$CREDENTIAL_WASM"; do
  if [[ ! -f "$wasm" ]]; then
    echo "Missing release WASM: $wasm" >&2
    exit 1
  fi
done

"$STELLAR_BIN" contract bindings typescript \
  --wasm "$ANCHOR_WASM" \
  --output-dir "$TEMP_DIR/anchor-registry" \
  --overwrite
"$STELLAR_BIN" contract bindings typescript \
  --wasm "$CREDENTIAL_WASM" \
  --output-dir "$TEMP_DIR/credential-registry" \
  --overwrite

diff -ru "$ROOT_DIR/src/contracts/anchor-registry" "$TEMP_DIR/anchor-registry"
diff -ru "$ROOT_DIR/src/contracts/credential-registry" "$TEMP_DIR/credential-registry"
echo "Generated contract bindings match the release WASMs."
