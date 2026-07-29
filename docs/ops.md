---
schema_version: 1.0.0
status: draft
last_updated: 2026-07-29
doc: ops
---

# OPS — SelyoPass

## Deploy

1. Require green CI for the exact release SHA.
2. Manually approve the protected testnet contract-release workflow.
3. Build optimized WASMs; record SHA-256 hashes.
4. Deploy Anchor Registry with the admin address.
5. Deploy Credential Registry with the Anchor Registry ID.
6. Add the simulated anchor through the admin-authorized call.
7. Execute a synthetic request and authorized issue; capture txs/events.
8. Review and commit `deployments/testnet.json`.
9. Deploy that SHA to GitHub Pages; run HTTP and browser smoke.

Do not deploy mainnet or Cloudflare from this runbook. Exact workflow commands are implementation
owned and must be printed by the protected release job, not improvised here.

## Configuration & secrets

Public configuration: testnet network passphrase, RPC URL, contract IDs, Explorer base URL, release
SHA. Secrets: deployment/admin/anchor signing material, held only by approved operator/wallet or
protected environment. The SPA must build and run without any secret. Never print environment
contents or seeds.

## Observability

Observe GitHub Actions/Pages status, post-deploy route/console smoke, RPC health/latest ledger,
transaction results, typed contract events, event cursor age, and release-manifest consistency.
Direct RPC polling is not a production monitoring system.

## Alerts & thresholds

Release blocks on any failed required job, manifest/SHA mismatch, missing tx/event, secret/PII scan,
binding drift, Pages route failure, browser console error, or security gate failure. Runtime polling
shows a visible degraded state after bounded retries; no uptime target is claimed.

## Runbook — common incidents

- **RPC unavailable:** preserve cursor/receipt; back off; show degraded state; do not claim a fresh event.
- **Transaction pending:** retain hash/Explorer link; do not resubmit until status/replay safety is known.
- **Unauthorized anchor:** stop action; verify deployed registry IDs and membership transaction.
- **Pages mismatch:** stop submission; redeploy exact green SHA and repeat smoke.
- **Secret suspected:** stop workflows; revoke/rotate through approved operator; inspect history and artifacts.
- **PII suspected:** stop demo/publication; preserve evidence; invoke the security incident path.

## Backup & recovery

Source, CI artifacts, WASMs/hashes, deployment manifest, and chain history are the recovery record.
There is no application database or server backup. Local presentation packages are holder-owned and
not recoverable by SelyoPass. Contract recovery is forward-only through corrected deployment or an
explicitly audited upgrade; chain history cannot be rolled back.
