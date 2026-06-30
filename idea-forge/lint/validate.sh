#!/usr/bin/env bash
# Thin wrapper around the deterministic gate. Python stdlib only -- no deps.
# Usage: lint/validate.sh idea.md [--override "reason"]
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec python3 "${HERE}/validate.py" "$@"
