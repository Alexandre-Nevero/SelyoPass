---
schema_version: 2.1.0
status: draft
last_updated: 2026-07-29
doc: security-compliance
owns: hard rules / invariants (INV-###) and their authority · challenge records (CHAL-###) · threat model (T-###) · data classification · authn/authz model · secrets & audit policy · the pre-milestone go/no-go gate
---

# Security & Compliance / Threat Model — SelyoPass

> Testnet demonstrator, synthetic data, simulated anchor. This is engineering guidance, not legal
> advice. Exact Philippine regulatory obligations require current primary-source and counsel review
> before any real-data or production launch.

## 1. Hard Rules — Invariants (`INV-###`)

| ID | The system SHALL NEVER | Rationale | Authority |
|---|---|---|---|
| INV-001 | equate integrity with compliance approval or transfer the relying institution's KYB decision | Load-bearing product boundary | `idea.md` §6/§9; BR-003 |
| INV-002 | use real PII anywhere, or put document bytes, identity fields, or free-text reasons in chain state/events, logs, or public/submission evidence; explicitly synthetic identity-shaped values may exist only in local fixtures/browser-local packages | Public and logged surfaces are incompatible with identity content; synthetic fixtures are required for this demonstrator | BR-002; RA 10173 pre-real-data review |
| INV-003 | handle or persist a private key/secret seed in source, browser storage, fixtures, docs, logs, or artifacts | A leaked key defeats issuer and user authorization | Stellar wallet/auth model |
| INV-004 | allow issue/reject without issuer auth and current Anchor Registry membership, block an authenticated original issuer from revoking solely because of later anchor removal, or allow non-original-issuer revocation | Prevent forged actions while preserving the original issuer's duty to revoke an already-issued record | BR-001; contract authorization design |
| INV-005 | submit a request without subject authorization or require a wallet for public verification | Consent for writes; public independent reads | contract authorization design; F-002/F-004 |
| INV-006 | present simulated/testnet/planned/unverified behavior as real, mainnet, deployed, validated, or regulator-approved | Submission and user claims must be auditable | context/idea evidence boundary |
| INV-007 | begin Level 4 implementation or real-data handling without written approval and privacy/security gates | Prevent unauthorized scope and unsafe data processing | approved phase gate |

Invariant changes require a logged `invariant-change` decision and negative-test update. An open
challenge does not suspend the rule.

## 2. Constraints Under Review (`CHAL-###`)

| ID | Constraint | Concern | What would settle it | Status | Resolved by |
|---|---|---|---|---|---|
| CHAL-001 | INV-001 | Whether “preferred intake” language is acceptable to a relying institution | Written compliance-owner feedback | open | — |
| CHAL-002 | INV-002 | Exact PH KYB fields and retention obligations for future real data | Current primary regulations plus Philippine counsel | open | — |
| CHAL-003 | INV-007 | Whether Level 4 scope is authorized | Written Stellar Builder Team approval | open | — |

## 3. Data Classification

| Class | Examples | Allowed location | Handling |
|---|---|---|---|
| Secret | account secret seed, private key | wallet/approved deployment secret store only | never read by SPA; never log/artifact |
| Restricted personal data | real beneficial-owner/director identity, document bytes | out of scope everywhere | never fixture/chain/event/log/evidence; real use blocked |
| Local synthetic package data | synthetic display names, manifest descriptors | browser memory/download | user-controlled; no server |
| Public pseudonymous metadata | addresses, IDs, hashes, status, ledger, reason code | Stellar testnet state/events | preview before write; permanent/public warning |
| Public release evidence | contract IDs, WASM hashes, tx hashes, CI/Pages URLs | repository/submission manifest | bind to release SHA |

A hash can still be personal data or support correlation depending on source and context; “hash-only”
does not waive privacy analysis. Real-data use remains blocked.

## 4. Authn / Authz Model

| Surface/action | Authentication | Authorization |
|---|---|---|
| `AnchorRegistry.add_anchor/remove_anchor` | Stellar account authorization | stored admin address requires auth |
| `AnchorRegistry.is_authorized` | none | public read |
| `CredentialRegistry.request` | subject wallet | `subject.require_auth()` for exact call |
| `issue/reject` | issuer wallet | `issuer.require_auth()` plus Anchor Registry membership |
| `revoke` | issuer wallet | auth plus record issuer equality; no current-membership recheck, so original issuer can revoke after removal |
| `get/status/exists` and event reads | none | public |
| Founder/anchor SPA action | Wallets Kit | testnet network + contract rules |
| Verify/package hashing | none | local/public read |
| Testnet release workflow | repository environment protection | authorized release operator; identities not exposed to browser |

Admin and anchor parameters never establish authority by themselves. Issue/reject compare against
current cross-contract membership; revoke compares the authenticated caller with the issuer stored
on the record and intentionally does not recheck current membership.

## 5. Threat Model (`T-###`)

| ID | Threat (STRIDE) | Vector | Impact | Mitigation | Enforces |
|---|---|---|---|---|---|
| T-001 | Spoofing | attacker calls issue/reject as arbitrary address | forged lifecycle action | issuer auth + current Anchor Registry call | INV-004 |
| T-002 | Spoofing | malicious page/adapter substitutes subject | unauthorized request | subject auth binds call args; payload preview | INV-005 |
| T-003 | Tampering | presented file differs from manifest | false evidence | local SHA-256 and independent row | F-003 |
| T-004 | Tampering | stale/generated binding calls wrong ABI | incorrect transaction | generate from release WASM; drift gate | BR-008 |
| T-005 | Repudiation | user disputes action | unverifiable lifecycle | transaction hash + typed event + ledger receipt | BR-004 |
| T-006 | Information disclosure | PII or bytes enter state/event/log | permanent exposure | type/schema bans, source scan, negative tests | INV-002 |
| T-007 | Information disclosure | secret seed committed/artifacted | issuer/admin compromise | wallet custody, protected secrets, scanners | INV-003 |
| T-008 | Denial of service | RPC/wallet timeout | blocked or ambiguous workflow | explicit state, backoff, cleanup, preserved receipt | F-006/F-008 |
| T-009 | Denial of service | oversized local file | browser exhaustion | bounded file size/count and test | INV-002 |
| T-010 | Elevation of privilege | wrong issuer revokes, or anchor removal disables the original issuer's revocation duty | integrity loss or unrevocable stale record | issuer equality + auth without membership recheck | INV-004 |
| T-011 | Integrity/claim abuse | UI calls active record “approved business” | relying-party deception | banned-copy scan and adjacent caveat | INV-001/INV-006 |
| T-012 | Replay/stale evidence | old screenshot/manifest used for new release | false submission | release-SHA manifest checker | INV-006 |

## 6. Abuse & Safety Risks

- A presenter may use a genuine credential to imply approval beyond its evidence; neutral headings
  and adjacent caveat reduce but do not eliminate this.
- Public addresses/hashes allow correlation; users must preview the payload.
- A simulated anchor can be mistaken for a partner; the console and pitch must label it every time.
- Bounded reason codes avoid defamatory/free-text public claims.
- Package files can be malicious inputs; parsing must reject unexpected types, size, network, and
  embedded bytes.

## 7. Secrets, Audit & Compliance

The SPA has no secret configuration. Public RPC URLs and contract IDs are not secrets. Deployment
identities belong in protected operator tooling and must never be echoed. Wallets sign; SelyoPass
never requests seed phrases.

Audit evidence consists of transaction hashes, contract IDs, WASM hashes, typed events, deployment
manifest, release SHA, and CI/browser artifacts. It proves technical behavior only.

Applicable legal topics before real data include RA 10173/Data Privacy Act controls and registration
analysis, current NPC circulars, BSP rules on reliance/retained responsibility, AML/CFT obligations,
and current SEC beneficial-ownership requirements. The prior brief used secondary summaries; a
current primary-source review and counsel sign-off are required before converting them into controls.

## 8. Pre-Milestone Hard Gate

### Before testnet demo/submission

- No secrets/PII in repository, history scan scope, build, WASMs, events, screenshots, or traces.
- Contract auth, illegal transitions, cross-contract call, events, TTL, and hash-only tests pass.
- Both wallets are observed on testnet; public verification is wallet-free.
- UI copy scan and browser result retain the integrity/compliance boundary.
- Deployment and submission evidence resolve to one release SHA.

### Before Level 4 development

- Written Stellar Builder Team approval is recorded.

### Before real anchor, mainnet, or real data

- Separate written authorization, threat-model update, key-custody design, privacy impact assessment,
  current primary-source legal review, counsel approval, incident plan, retention/deletion policy,
  access control, monitoring, and production operations review.

Failure of any applicable line is a **no-go**, not a warning.

## 9. Incident Response Basics

| Incident | Immediate action | Recovery/evidence |
|---|---|---|
| suspected admin/anchor secret leak | stop releases/actions; preserve logs without secret; notify owner | rotate identity, remove anchor if admin safe, redeploy if needed, invalidate claims |
| unintended PII/public payload | stop demo and evidence publication | chain data cannot be deleted; assess exposure and legal response |
| unauthorized lifecycle event | preserve tx/event; stop affected deployment | investigate auth path; corrected forward deployment |
| stale/missing RPC history | stop claiming event evidence | use current state plus retained release artifacts; add indexer only in approved scope |
| Pages/release mismatch | remove candidate from submission | redeploy exact green release SHA and repeat smoke |

## 10. Doc Integrity Check

- Every invariant has a negative QA case and threat mapping.
- Every network-exposed action has auth/authz.
- Compliance unknowns are gates, not invented controls.
- Secret and data boundaries match architecture/data model.

## References

- [`idea.md`](../idea.md)
- [`technical-design.md`](technical-design.md)
- [`data-model.md`](data-model.md)
- [`qa-test-plan.md`](qa-test-plan.md)
