# System Design — SelyoPass (MVP, HLD)

> Generated from `03-prd.md` and `idea.md` by the `architect` subagent. Scope is the June 30
> Stellar Level 3 + APAC submission: **testnet only, Freighter only, Philippines only, anchor
> simulated** (PRD §Non-goals; idea.md §10). Every component traces to an `F-###` from PRD §Feature
> list and is constrained by the business rules `BR-001..BR-006`. Nothing here is invented beyond
> the PRD / idea.md surface; gaps are flagged `[unverified]` or promoted to OPEN QUESTIONS rather
> than guessed. Library versions are taken **only** from the repo's `package.json`; anything not
> found there is marked `[unverified]`.

## Context diagram

The system is a browser-only dApp (no SelyoPass-operated backend in MVP) talking to the Stellar
testnet through Freighter. The "anchor" is simulated by a controlled testnet keypair, not a live
regulated entity (PRD §Dependencies, `[unverified]`; idea.md §10).

```
                          ┌───────────────────────────────────────────────┐
                          │                Stellar TESTNET                  │
                          │   ┌─────────────────────────────────────────┐   │
   ┌──────────────┐       │   │  Soroban credential contract (F-002)     │   │
   │  Founder /    │       │   │  - issue(credential, doc_hash[])         │   │
   │  issuer-side  │──────►│   │  - read/verify state (publicly callable) │   │
   │  browser (UI) │  sign │   └─────────────────────────────────────────┘   │
   └──────┬───────┘  via   │            ▲                  ▲                  │
          │          Freighter          │ submit tx        │ read state       │
          │ holds docs   │              │                  │                  │
          ▼ locally      │      ┌───────┴───────┐   ┌──────┴───────┐          │
   ┌──────────────┐      │      │ RPC / Horizon  │   │ RPC / Horizon │         │
   │ Off-chain doc │      │      │  (testnet)     │   │  (testnet)    │         │
   │ store (F-003) │      └──────┴───────┬───────┴───┴──────┬───────┘          │
   │ [unverified:  │                     │ submit / query   │ query state      │
   │  mechanism]   │                     │                  │                  │
   └──────────────┘            ┌─────────┴──────────┐  ┌────┴──────────────┐
          ▲ recompute hash     │ Simulated anchor    │  │ Relying-party      │
          │ to compare         │ keypair (issuer key)│  │ reader browser (UI)│
          └────────────────────┤ [unverified: not a  │  │ (F-004)            │
                               │  live regulated     │  │ verifies sig +     │
                               │  anchor]            │  │ doc hashes         │
                               └─────────────────────┘  └────────────────────┘

  External actors: Founder (issuer side, UJ-001) · Relying party (consumer side, UJ-002) ·
  Freighter browser extension (wallet/signing, F-006) · Stellar testnet + Soroban (F-002) ·
  Simulated anchor (verifier of record per BR-001, but simulated for MVP).
```

> **Auth/authz call-out at the boundary:** there is **no SelyoPass-operated server** in the MVP, so
> there is no server-side auth layer to design. The trust boundary is the Soroban contract and the
> wallet. Every network-exposed surface is enumerated and its auth posture flagged in
> *Integration points* and *Scaling strategy* below. The contract is **publicly callable on
> testnet** — this is the surface that most needs explicit authorization rules (see OPEN QUESTIONS).

## Components & responsibilities

- **Issuance UI (issuer-side web app)** — *implements F-001, F-005, F-006.*
  Renders the KYB form bound to the extended SEP-12 schema (F-001), computes a content hash per
  document locally (F-003), drives wallet connect and the issuance transaction, and surfaces
  loading/error states (F-006) on a mobile-responsive layout (F-005). **Owns:** the in-browser
  form state and the local document → hash computation. **Depends on:** Freighter (signing), the
  Soroban contract (issuance), and the off-chain doc store. **Does not own** documents long-term —
  the startup retains them (BR-002, BR-004).

- **Relying-party reader UI (consumer-side web app or view)** — *implements F-004, F-005, F-006.*
  Reads a credential's structured fields, verifies the issuer signature against the anchor public
  key, and validates document hashes against what the startup presents (F-004); shows accept/reject
  **without asserting compliance approval** (BR-003). **Owns:** the verification result
  presentation. **Depends on:** the Soroban contract / chain state (to read the credential and the
  anchor key) and the document the startup presents (to recompute hashes). Could be the same SPA
  with a second route or a separate app — PRD allows "a view (or second app)" (idea.md §7 F-004).

- **Soroban credential contract (on testnet)** — *implements F-002, anchors F-003.*
  Records an anchor-issued, signed credential as contract state and stores the **document content
  hash(es)** on-chain — never the documents themselves (BR-002). Issuance is a contract invocation,
  **not an XLM payment-with-memo** (idea.md §7 F-002; this is the rejected alternative below).
  **Owns:** the authoritative on-chain credential record and anchored hashes. **Depends on:** the
  Stellar testnet runtime. **The only persistent, network-exposed state surface; publicly callable
  on testnet — authorization rules must be explicit (see OPEN QUESTIONS).**

- **Simulated anchor (issuer keypair)** — *enables F-002, embodies BR-001 in simulated form.*
  Holds the signing key that issues credentials and whose public key the reader verifies against.
  Per BR-001 the anchor is the *verifier of record*, but for the MVP it is **simulated on testnet**,
  not a live regulated anchor (PRD §Dependencies, `[unverified]`; idea.md §9/§10). **Owns:** the
  issuer signing key. **The custody, generation, and exposure of this key is a security-critical
  open question (see OPEN QUESTIONS).**

- **Off-chain document store** — *implements F-003 (off-chain half), upholds BR-002/BR-004.*
  The startup retains the actual documents; only their hash is anchored. **Owns:** the documents.
  **The concrete mechanism is under-specified** — idea.md §3/§7 says "the startup retains
  documents (e.g., locally)"; the steering doc mentions IPFS as a candidate, but idea.md itself does
  not commit to it. PRD §Dependencies and §Open questions flag this as `[unverified]`. Treated here
  as "local/startup-held" with mechanism deferred (see OPEN QUESTIONS).

- **Freighter wallet (external extension)** — *enables F-002, scoped by F-006.*
  Connects the account and signs the issuance transaction. **The only supported wallet** (idea.md
  §10). **Owns:** the user's keys and signing consent. **Depends on:** nothing of ours; we depend on
  it. Connect/declined/missing-extension failures are first-class error states (F-006).

- **Stellar SDK / RPC + Horizon access (testnet client libs)** — *plumbing for F-002, F-004.*
  Builds, submits, and queries transactions and contract state from the browser. `package.json`
  pins `@stellar/stellar-sdk ^12.3.0` and `@stellar/freighter-api ^2.0.0` (verified in repo).
  Endpoint `https://horizon-testnet.stellar.org` appears in the steering doc; the Soroban RPC
  endpoint for contract calls is not pinned in repo config `[unverified]`.

> N/A — **no application database, no object storage service, no auth provider** in the MVP, because
> the system is non-custodial (BR-002), backend-less, and wallet-authenticated. (Contrast the
> ReconLens example, which has all three — different domain.)

## Data flow

**UJ-001 — Startup issues a credential (F-001, F-002, F-003, F-005, F-006; BR-001/002/004):**
1. Founder connects Freighter; connect/decline/missing-extension errors are caught (F-006).
2. Founder fills KYB fields conforming to the extended SEP-12 schema; client-side validation rejects
   a missing required field with a field-level error, including the SEC MC No. 15 s.2025 UBO fields
   (F-001, BR-005).
3. Browser computes a **content hash per document locally**; documents never leave the startup
   (F-003, BR-002, BR-004).
4. The (simulated) anchor signs and the Soroban contract records the credential + the document
   hash(es) on testnet (F-002). This yields a **contract deployment address and an interaction
   transaction hash** (PRD F-002 acceptance; idea.md §8).
5. UI shows progress then the resulting tx hash / contract interaction, or a specific error (F-006,
   F-005).

**UJ-002 — Relying party reads/verifies (F-004, F-005, F-006; BR-001/002/003):**
1. Reader opens the reader view (F-004, F-005).
2. Reads the credential's structured fields from chain state (F-001, F-004).
3. Verifies the issuer signature against the anchor public key (F-004, BR-001).
4. Recomputes the hash of the document the startup presents and compares it to the anchored hash —
   match ⇒ integrity confirmed; mismatch ⇒ reject with a clear reason (F-004, F-003, BR-002).
5. Relying party accepts/rejects on **its own compliance judgment**; the credential transfers no
   liability and the UI must not present a "verified, trust-this-business" stamp (BR-003). Loading/
   error states throughout (F-006).

## Key technology choices + rationale

| Choice | Why | Trade-off accepted | Alternative rejected |
|--------|-----|--------------------|----------------------|
| **Soroban smart contract for issuance** (F-002) | idea.md §7 F-002 explicitly wants issuance, not a fee transfer; supports the Level 3 "advanced smart contract" dimension | More complexity than a payment; contract authz must be designed | **XLM payment-with-memo** (current Level 1 demo) — rejected because a memo is not a verifiable, structured credential and carries no signature/authz semantics |
| **On-chain document *hash* only; documents off-chain** (F-003) | Non-custodial by design (BR-002, BR-004); lets a relying party confirm integrity without anyone custodying paperwork (idea.md §3) | Off-chain availability/retrieval becomes the startup's problem; an unavailable document can't be hash-checked | **Storing the document on-chain** — rejected: violates BR-002/BR-004, leaks regulated personal data (RA 10173, BR-006), and is impractical on-chain |
| **Simulated anchor keypair on testnet** | A live regulated anchor (PDAX) is unconfirmed and out of build scope (idea.md §9/§10) | The riskiest real-world assumption (institution acceptance) is **not** tested by this; demo trust is synthetic `[unverified]` | **Wiring a live regulated anchor for MVP** — rejected: PDAX participation is a non-blocking BD track, not a deliverable (PRD §Non-goals) |
| **Extend published SEP-9/SEP-12 `organization.*` schema** (F-001) | "Extend a standard, don't invent one"; SEP-9 already has thin org fields (idea.md §5) | SEP-9 org fields lack UBO %, GIS, Mayor's Permit, BIR — must be extended and kept aligned to SEC MC No. 15 s.2025 (BR-005) | **A bespoke proprietary schema** — rejected: undermines the "any SEP-12 institution can read it" positioning (idea.md §6) |
| **Backend-less browser dApp** (F-005, F-006) | Non-custodial posture (BR-002) and submission scope; no server reduces attack surface and ops | No server-side validation, no persistence across refresh (steering §Known Limitations), no place to enforce rate limits | **A SelyoPass backend/API** — rejected for MVP: would imply custody/processing of regulated data (BR-006) and is out of submission scope |
| **React + Vite frontend** | Already shipped at Level 1; reuse over rewrite | SPA-only; ties us to the existing single-component structure (steering §Known Limitations) | **A new framework** — rejected: no upside before June 30; wastes the only scarce resource (time) |
| **Freighter as the only wallet** (F-006) | idea.md §10 constrains to Freighter; standard for Stellar submissions | No wallet choice; users without Freighter are blocked (handled as an error state, F-006) | **Multi-wallet support** — rejected: explicitly out of scope (idea.md §10) |

> Verified versions (from repo `package.json`): `react ^18.3.1`, `react-dom ^18.3.1`,
> `vite ^5.4.2`, `@stellar/stellar-sdk ^12.3.0`, `@stellar/freighter-api ^2.0.0`. These are caret
> ranges, not exact pins. **No test framework or CI config is present in the repo** — yet PRD F-002
> acceptance and idea.md §8 require ≥3 passing tests and green CI/CD. Flagged as an OPEN QUESTION.

## Integration points

Each surface below is external and therefore gets an explicit auth/authz call-out (never designed
silently).

- **Soroban credential contract (testnet).** Protocol: Soroban contract invocation via RPC.
  **Auth/authz: UNDER-SPECIFIED — flagged.** The contract is *publicly callable on testnet*. The
  design must define who may call `issue` (only the anchor key? gated by `require_auth` on the
  issuer?) and whether read/verify is intentionally open. BR-001 says the anchor is the verifier of
  record, which implies **issuance must be authorized to the anchor key**; read/verify can be public
  by design (F-004 is a public reader). This authorization model is an OPEN QUESTION and a proposed
  ADR. Failure modes: tx rejected, contract panic, RPC timeout → surface via F-006.
- **Freighter wallet.** Protocol: browser extension API (`@stellar/freighter-api`). **Auth/authz:**
  the wallet *is* the user-side auth — signing consent gates any state-changing tx. Missing
  extension / declined signature / wrong network are explicit error states (F-006). We do not, and
  must not, handle the user's private key.
- **Stellar Horizon / Soroban RPC (testnet).** Protocol: HTTPS JSON. **Auth/authz:** public testnet
  endpoints, no credentials. Failure modes: endpoint down, rate-limited, chain congestion → loading/
  error states (F-006). Horizon endpoint verified in steering (`horizon-testnet.stellar.org`); the
  Soroban RPC endpoint is not pinned in repo config `[unverified]`.
- **Off-chain document retrieval path (F-003).** Protocol: **under-specified** (local file vs IPFS
  vs other). **Auth/authz: cannot be designed until the mechanism is chosen — flagged.** If IPFS or
  any networked store is used, who can fetch a document, and how access is controlled, is undefined
  and security-sensitive given BR-006 (regulated personal data). OPEN QUESTION + proposed ADR.
- **Simulated anchor key.** **Auth/authz:** whoever holds the issuer private key can mint
  credentials. For a demo this may be an env-held testnet key, but its custody/exposure is a
  security-critical OPEN QUESTION (a leaked issuer key forges credentials).

> N/A — **no third-party financial APIs, no KYB-vendor APIs, no live anchor API** are integrated in
> the MVP, because verification is performed by the (simulated) anchor and the reader, not by an
> external service (idea.md §10).

## Deployment topology

- **Frontend:** a static SPA build (`vite build` → `dist/`, per steering) served from a public demo
  URL (required by idea.md §8 / PRD §Dependencies). Hosting provider is not specified in repo or
  idea.md `[unverified]`.
- **Contract:** one Soroban contract **deployed to Stellar testnet**, with a published deployment
  address and at least one interaction tx hash (idea.md §8, PRD F-002 acceptance).
- **Environments:** testnet only — **no mainnet, no staging chain** (idea.md §10). A staging vs
  prod frontend split is not specified `[unverified]`; the submission asks only for one live demo
  URL.
- **CI/CD:** idea.md §8 requires a green pipeline; **no CI config exists in the repo yet**
  `[unverified]` — flagged as an OPEN QUESTION.
- **Boundaries:** the only trust boundary that persists state is the on-chain contract; the browser
  and the off-chain document store hold everything else. No SelyoPass server exists to breach.

## Scaling strategy

MVP load is a **demo**: a handful of issuances and reads on testnet for judges and interviews. A
single static frontend and a single contract handle this trivially; there is nothing to
horizontally scale and over-engineering would waste the June 30 runway.

**Assumptions (stated, not invented as targets):**
- Demo-scale traffic only; no production user volume is claimed for MVP `[unverified]`.
- Testnet performance/availability is treated as "good enough for a demo"; we set **no** latency,
  throughput, uptime, or finality targets — see OPEN QUESTIONS.

**Non-functional requirements at risk / unspecified — do NOT invent targets (OPEN QUESTIONS):**
- **Performance:** no issuance/verification latency target stated anywhere (idea.md/PRD silent).
- **Availability:** no uptime target for the demo URL or dependency on testnet/Horizon uptime.
- **Scale:** no concurrent-user or credential-volume target; the §5 "~2,500 businesses/yr" figure is
  an order-of-magnitude *market* estimate, **not** a system load target, and must not be treated as
  one.
- **Security:** issuer-key custody, contract authorization model, and off-chain document access
  control are all unspecified (see below). RA 10173 / BR-006 obligations (NPC registration, privacy
  program) apply before any *real* corporate data is federated — explicitly not in MVP scope, but a
  hard gate for anything beyond the demo.
- **Durability:** off-chain document availability is the startup's responsibility; loss of a
  document makes its anchored hash unverifiable (F-003/F-004 implication) — no durability guarantee
  is specified.

## Trade-offs considered

The load-bearing decisions are the issuance mechanism (Soroban contract over payment-with-memo), the
non-custodial hash-only model (on-chain hash over on-chain document), the simulated-anchor stance
(synthetic trust for the demo over wiring a live regulated anchor), and the backend-less posture
(no server over a SelyoPass API). Each is justified in the table above with its rejected
alternative. The honest risk that no design choice resolves: BR-001's anchor-as-verifier-of-record
is **simulated**, so the single riskiest assumption — that a regulated institution will accept the
credential as preferred intake (idea.md §9) — is untested by this build. The architecture is
deliberately as simple as the submission allows; the significant decisions below are promoted to
proposed ADRs.

**Proposed ADRs (see `fmd/templates/_adr.md` shape):**
1. **ADR — Issue credentials via a Soroban contract rather than XLM payment-with-memo.**
2. **ADR — Anchor only the document hash on-chain; keep documents off-chain with the startup
   (non-custodial).**
3. **ADR — Use a simulated anchor keypair on testnet for the MVP instead of a live regulated
   anchor.**
4. **ADR — Extend the published SEP-9/SEP-12 `organization.*` schema instead of a bespoke KYB
   schema.**
5. **ADR — Ship a backend-less, wallet-authenticated browser dApp (no SelyoPass server) for the
   MVP.**
6. **ADR — Define the Soroban contract authorization model: gate issuance to the anchor key, keep
   read/verify public.**

## Open questions (missing/under-specified — not converted into guesses)

- **F-003 off-chain document storage mechanism is under-specified.** idea.md §3/§7 says only "the
  startup retains documents (e.g., locally)"; the steering doc floats IPFS but idea.md does not
  commit. Access control for any networked store is undefined. `[unverified]`
- **Soroban contract authorization model is unspecified.** The contract is publicly callable on
  testnet; who may invoke `issue` vs read/verify needs an explicit rule (BR-001 implies issuance is
  anchor-gated). `[open]`
- **Simulated-anchor issuer-key custody is unspecified and security-critical.** A leaked issuer key
  forges credentials. `[open]`
- **No performance, availability, scale, or durability targets exist** in idea.md or the PRD.
  `[open]`
- **No test framework and no CI/CD config in the repo**, yet idea.md §8 requires ≥3 passing tests
  and a green pipeline. `[open]`
- **Hosting/demo-URL provider and Soroban RPC endpoint are not pinned** in repo config or idea.md.
  `[unverified]`
- **For the MVP, is the anchor a simulated test issuer rather than a live regulated anchor?** idea.md
  implies yes (testnet-only, anchor unconfirmed), carried from PRD §Open questions. `[unverified]`
