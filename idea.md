---
status: draft
schema_version: 3.0.0
origin: "existing SelyoPass brief; recovery plan approved 2026-07-29"
payer_status: none-found
---

# Idea: SelyoPass

## 1. Problem statement

Early-stage Philippine startups repeatedly submit substantially the same corporate-identity
documents to each bank and payment provider. Each institution must retain its own compliance
judgment, but document collection and parsing are duplicated. The result is repeated founder work
and avoidable integration delay. Generalization beyond one founder account remains unvalidated.

## 2. Target segment

Philippine startups in roughly their first 18 months that complete at least two regulated financial
integrations. The initial user is a founder or operator preparing corporate records; the other
participants are a regulated anchor and a relying institution. For this build, the anchor is
simulated, all records are synthetic, and no institution has agreed to accept the output.

## 3. Evidence

| Claim | Evidence type | Source / date | Confidence | What remains unknown |
|---|---|---|---|---|
| One Manila startup repeatedly submitted similar documents to several partners and associated the process with launch delay. | did, unlogged | Dserve founder account, date unconfirmed | low | No dated artifact; n=1; recurrence across the segment is unknown. |
| Corporate onboarding can take weeks and duplicate collection occurs across parties. | said | secondary industry sources captured in the prior brief, 2025–2026 | low | Sources are not PH-startup behavioral evidence. |
| A relying institution will accept a portable credential as preferred intake. | none | — | unvalidated | This is the riskiest demand-side assumption. |
| A buyer will pay for issuance or reuse. | paid | none | none | Buyer, budget owner, price, and procurement path are unknown. |

**Evidence boundary:** there is one weak `did` signal, zero `paid` evidence, no anchor commitment,
and no relying-party acceptance evidence. This document must remain `draft`.

## 4. Root cause (the WHY)

Compliance judgment and liability remain with each regulated institution, so the judgment cannot be
outsourced merely by presenting a credential. The duplicative part is the collection, normalization,
and integrity checking that precedes that judgment. No adopted, business-held, institution-readable
package currently carries those records between partners in this segment.

## 5. Market & alternatives

The real alternative is a shared-drive document pack plus manual forms and follow-up. Institution-side
KYB vendors serve the relying institution and typically keep reuse inside their own network.
Government business-registration systems are adjacent but are not established here as outbound,
bank-queryable portable KYB services. The prior startup-side estimate was assumption-heavy and is not
used as a market fact. SEP-9 supplies a useful organization-field precedent, but does not itself prove
demand for SelyoPass.

## 6. Value proposition

For early-stage Philippine startups repeating corporate-document intake, SelyoPass is a portable,
hash-verifiable evidence package issued by an authorized anchor and independently checkable by a
financial partner. It is a **secure data courier, not a compliance stamp**: it can reduce collection
and integrity-checking work, but never replaces the institution's KYB decision.

## 7. Feature set

This section is the canonical seed feature registry. It owns each immutable `F-###` identity, the
seed intent attached to that identity, and its current MoSCoW priority. Downstream feature tables
are projections for traceability; they may shorten labels but must not mint, rename, renumber, or
reprioritize a feature. A priority or seed-intent change starts here and is then reconciled outward.

| `F-###` | Feature | Priority | Solves (problem from §1/§3) | Why not / what would change it |
|---|---|---|---|---|
| F-001 | Philippine KYB presentation schema for synthetic SEC, BIR, permit, incorporation, GIS, and beneficial-ownership document descriptors | Must | No shared, institution-readable package | — |
| F-002 | Subject-requested and authorized-anchor-issued Soroban credential lifecycle on Stellar testnet | Must | Reusable provenance cannot be independently inspected | — |
| F-003 | Local document hashing with hash-only on-chain anchoring | Must | Integrity must be checkable without SelyoPass custody | — |
| F-004 | Wallet-free relying-party integrity reader | Must | A portable record has no value without independent consumption | — |
| F-005 | Responsive founder, anchor, and relying-party workflows | Must | Submission and field use include mobile contexts | — |
| F-006 | Explicit loading, transaction, rejection, expiry, revocation, and recovery states | Must | Blockchain and wallet failures otherwise become ambiguous | — |
| F-007 | Target multi-wallet support through Stellar Wallets Kit | Must | Authorization must not depend on one wallet extension | Target adapters: Freighter and Albedo; support remains unproven until real connection tests pass. |
| F-008 | Observable transaction lifecycle and near-real-time RPC event synchronization | Must | Users need durable evidence instead of indefinite spinners | — |
| F-101 | Continuous re-verification updates | Won't | Credentials become stale | Reason: Level 4 work requires written approval. Reconsider after approval and a real-anchor lifecycle design. |
| F-102 | Cross-jurisdiction schema extensions | Won't | Regional reuse | Reason: Philippines-only scope. Reconsider after written Level 4 approval and jurisdiction research. |
| F-103 | Two meaningful contracts: Anchor Registry authorizes issuers; Credential Registry manages requests and lifecycle through a real cross-contract call | Must | Advanced authorization must be inspectable rather than simulated by artificial layers | — |
| F-104 | Real regulated-anchor onboarding | Won't | A simulated anchor does not validate institutional adoption | Reason: no anchor commitment or Level 4 approval. Reconsider after written approval and partner agreement. |

## 8. Success metrics

- **Activation:** a public user submits one real testnet credential request through the frontend.
- **Lifecycle proof:** an authorized simulated-anchor wallet issues it through the second contract,
  and the UI observes the transaction and contract event.
- **Integrity proof:** a relying party verifies existence, issuer authorization, document hashes,
  active status, and transaction/event provenance without connecting a wallet.
- **Delivery proof:** frontend, contract, integration, accessibility, and browser gates are green for
  one release SHA; the deployed GitHub Pages build passes post-deploy smoke checks.
- **Learning:** obtain a relying institution's written accept/reject decision on preferred intake.
  No revenue target is claimed because willingness to pay is unvalidated.

## 9. Constraints, risks & kill criteria

**Single riskiest assumption:** at least one regulated institution will accept the package as
preferred intake while retaining its own compliance decision.

**Kill criteria (explicit fail-states):**

- **Institutional:** no target institution will use the structured package or hashes to reduce
  collection work; narrow to document-portability tooling or stop.
- **Regulatory:** counsel or regulator interpretation makes the proposed presentation unusable;
  stop external rollout and retain a synthetic testnet demonstrator only.
- **Unit economics:** no identifiable buyer or budget owner will pay after repeated use is proven;
  do not claim a viable business model.
- **Technical:** two-wallet request, authorized cross-contract issue, event observation, and public
  integrity verification cannot be reproduced on testnet; do not submit the corresponding claim.

**Invariants (`INV-###`) — hard product rules that must hold across every pivot:**

- **INV-001** — SelyoPass must never claim that credential integrity equals compliance approval or
  transfers the relying institution's KYB responsibility.
- **INV-002** — Real personal data is prohibited throughout the build. Identity-shaped values are
  allowed only when explicitly synthetic and confined to local fixtures/browser-local packages;
  document bytes, identity fields, and free-text rejection reasons must never enter Stellar state,
  events, logs, or public/submission evidence.
- **INV-003** — No private key or secret seed may enter source, browser storage, fixtures,
  documentation, logs, or CI artifacts; wallets perform signing.
- **INV-004** — Credential issuance and rejection require current Anchor Registry membership plus
  issuer authorization. Revocation requires authorization by the record's original issuer and must
  remain possible after that issuer is later removed from Anchor Registry.
- **INV-005** — A subject request must never be submitted without that subject's wallet
  authorization, and public verification must never require a wallet.
- **INV-006** — Production-visible evidence must never describe simulated, testnet, planned, or
  unverified behavior as real, mainnet, deployed, validated, or regulator-approved.
- **INV-007** — Level 4-only development and real-data handling must never begin without written
  Stellar Builder Team approval and the applicable privacy/security gates.

## 10. Out of scope (for now) — non-feature exclusions only

- Mainnet and real corporate or beneficial-owner data.
- Jurisdictions outside the Philippines.
- A SelyoPass server, database, document custody, or institution decision engine.
- Sanctions, PEP, risk, credit, or compliance decisioning.
- A real anchor relationship or claim of institutional acceptance.
- Level 4 implementation before written approval.
