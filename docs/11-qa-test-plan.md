# QA — Test Plan & Test Cases (SelyoPass MVP)

> Generated from `03-prd.md`, `06-system-design.md`, and `idea.md` (the only source of truth).
> This is the **traceability home**: every feature `F-001..F-006` from PRD §Feature list (idea.md
> §7) and every business rule `BR-001..BR-006` from PRD §Business rules has at least one covering
> test, and every test carries an explicit `Covers: F-###` tag the consistency-checker matches on.
> Scope is the June 30 Stellar Level 3 + APAC submission: **testnet only, Freighter only,
> Philippines only, anchor simulated** (PRD §Non-goals; idea.md §10). Claims that upstream docs tag
> `[unverified]` or `said`-grade are carried forward with the same tag — the simulated-anchor and
> related items are **test-environment caveats, not validated facts**. No numeric targets (latency,
> coverage %, load) are invented; where idea.md / PRD are silent they are marked out of scope or an
> open question. The only hard submission numbers come from idea.md §8.

## Test strategy
Three levels, matched to the backend-less browser-dApp architecture (06-system-design §Components):

- **Unit tests** — the KYB schema validator (F-001, BR-005), the per-document content-hash
  computation and comparison (F-003, BR-002/004), and the signature-verification logic the reader
  uses (F-004, BR-001). These are pure functions and carry most of the assertion weight.
- **Contract tests** — the Soroban credential contract: issuance produces a signed credential and
  anchors only the document hash (F-002, F-003), and issuance is authorized to the anchor key
  (BR-001). Run against testnet / local Soroban per the repo toolchain.
- **Integration / e2e** — one happy path per journey: UJ-001 issuance (F-001→F-002→F-003) and
  UJ-002 read/verify (F-004), plus the wallet-connect and failure-surface flows (F-006) and the
  mobile-responsive render check (F-005).

Automated and run on every change in CI (idea.md §8 requires a green pipeline). The submission bar
is **≥3 passing tests across contract and frontend** (idea.md §8); this plan exceeds that floor but
that floor is the only hard count. Ownership: solo developer (idea.md header) owns all levels;
there is no separate QA function for this build.

> **Caveat carried forward (not a validated fact):** the anchor is a **simulated testnet keypair**,
> not a live regulated anchor (06-system-design §Components; idea.md §9/§10). Every test that
> "verifies the anchor signature" or "gates issuance to the anchor" therefore proves the *mechanism*
> against a synthetic issuer, **not** that a real regulated anchor participates. Institution
> acceptance is untested by design (see §Out of scope).

## Scope
### In scope
- Features **F-001..F-006** (PRD §Feature list).
- Business rules **BR-001..BR-006** (PRD §Business rules), to the extent testable in a testnet,
  backend-less MVP.
- Journeys **UJ-001** (issuance) and **UJ-002** (read/verify) from PRD §User journeys.
- The negative/failure cases named in the PRD acceptance criteria: missing required KYB field
  rejected (F-001); bad issuer signature rejected (F-004); mismatched document hash rejected
  (F-003/F-004); wallet-connect failure / missing Freighter / declined signature surfaced as a
  legible error (F-006); mobile-responsive rendering (F-005).
- The submission deliverables that are mechanically checkable: published contract deployment
  address + interaction transaction hash, ≥3 passing tests, green CI/CD, live demo URL,
  mobile-responsive UI (idea.md §8).

### Out of scope
- **Institution acceptance of the credential as preferred intake** — the single riskiest assumption
  and most likely kill criterion (idea.md §9). It is a demand-side question about real institutions
  and **cannot be tested by this build**; deferred per idea.md §10. Listed here so the gap is
  explicit, not silently dropped.
- **Willingness-to-pay** and **whether Dserve's pain generalizes** — deferred customer-development
  questions (idea.md §8/§9/§10), not software behavior. Not testable in this build.
- **Live regulated-anchor behavior / PDAX participation** — simulated for the MVP; a business
  development track, not a build deliverable (PRD §Non-goals; idea.md §10).
- **BR-006 full obligation** (NPC registration, DPO, privacy management program under RA 10173) —
  an organizational/legal control required before federating *real* corporate data, which the MVP
  does not do. Only the testable slice (no real corporate data federated on testnet) is asserted
  (TC-017). The rest is N/A for QA — because it is a legal/process control, not runtime behavior.
- **Performance, availability, load, durability targets** — none exist in idea.md or the PRD
  (06-system-design §Scaling); not invented here. Flagged as open questions.
- **Mainnet, non-Freighter wallets, non-PH jurisdictions** — explicitly out of MVP scope (idea.md
  §10).
- **Off-chain document-store internals** — mechanism is under-specified (`[unverified]`,
  06-system-design §Open questions); tests treat documents as startup-held local files and assert
  only the hash behavior, not a specific storage backend.

## Environments
- **Frontend:** React + Vite SPA (`react ^18.3.1`, `vite ^5.4.2`, verified in `package.json` per
  06-system-design). Unit + e2e run locally and in CI. **No test framework or CI config exists in
  the repo yet** (`[unverified]`, 06-system-design §Key technology choices / §Open questions) —
  standing one up is a prerequisite, flagged as an open question below.
- **Contract:** one Soroban credential contract on **Stellar testnet** (idea.md §8/§10). Contract
  tests exercise issuance/read against testnet or a local Soroban sandbox per the repo toolchain.
- **Wallet:** **Freighter only** (idea.md §10), via `@stellar/freighter-api ^2.0.0`. Connect /
  decline / missing-extension / wrong-network are first-class error states (F-006).
- **Network access:** `https://horizon-testnet.stellar.org` (verified in steering). The Soroban RPC
  endpoint is **not pinned** in repo config (`[unverified]`, 06-system-design §Integration points).
- **Test data:** **synthetic KYB fixtures only — no real corporate data, no real beneficial-owner
  PII** (upholds BR-006 for the MVP). Any issuer/test keys are referenced from CI secrets, never
  inlined.

## Traceability matrix
<!--
The core artifact. EVERY F-### from idea.md §7 / the PRD appears with ≥1 test case; EVERY
BR-### from the PRD §Business rules is covered by ≥1 test. The consistency-checker parses this:
an F-### with no row is an orphaned feature (FAIL); a test case covering an F-### that does not
exist is a stray test (FAIL).
-->

### Features → test cases

| F-ID  | Feature | Test case ID(s) | Type | Status |
|-------|---------|-----------------|------|--------|
| F-001 | SEP-12-extended PH KYB credential schema | TC-001, TC-002, TC-003, TC-017 | unit | todo |
| F-002 | Anchor-issued signed credential via Soroban contract (testnet) | TC-004, TC-005 | contract | todo |
| F-003 | Document hash anchoring (hash on-chain, docs off-chain) | TC-006, TC-007, TC-008, TC-011 | unit, contract | todo |
| F-004 | Relying-party reader (verify signature + hashes) | TC-009, TC-010, TC-011, TC-012 | unit, e2e | todo |
| F-005 | Mobile-responsive issuance + reader views | TC-013 | e2e | todo |
| F-006 | Error handling + loading states (wallet, issuance, verification) | TC-014, TC-015, TC-016 | e2e | todo |

### Business rules → test cases

| BR-ID | Business rule | Test case ID(s) |
|-------|---------------|-----------------|
| BR-001 | Anchor is verifier of record (issuance gated to anchor key) | TC-005, TC-009 |
| BR-002 | Only hashes on-chain, never documents | TC-006, TC-011 |
| BR-003 | Credential transfers no compliance liability — no "trust-this-business" stamp | TC-012 |
| BR-004 | Startup retains its documents | TC-008 |
| BR-005 | Credential carries current UBO fields (SEC MC No. 15 s.2025) | TC-003 |
| BR-006 | Personal-information-controller posture (RA 10173) — testable slice only | TC-017 |

## Test cases
<!-- Per case: ID, the F-### it covers (and any BR-###), preconditions, steps, expected result. -->

### TC-001 — Valid KYB credential validates against the extended SEP-12 schema
- **Covers:** F-001
- **Preconditions:** extended SEP-12 KYB schema loaded; synthetic fixture with all required PH
  fields (SEC, BIR, Mayor's Permit, Articles of Incorporation, beneficial ownership, GIS).
- **Steps:** build a credential from the complete fixture; run schema validation.
- **Expected result:** validation passes; all required `organization.*` + PH-extension fields are
  recognized; no error.

### TC-002 — Missing required KYB field is rejected with a field-level error
- **Covers:** F-001
- **Preconditions:** same schema; fixture with one required field omitted (e.g., missing BIR).
- **Steps:** build the credential from the incomplete fixture; run schema validation.
- **Expected result:** validation fails with a **specific field-level error** naming the missing
  field; nothing is issued. (PRD F-001 acceptance: "a credential missing a required field is
  rejected with a field-level error.")

### TC-003 — UBO fields required by SEC MC No. 15 s.2025 are present and enforced
- **Covers:** F-001 (BR-005)
- **Preconditions:** schema includes the tightened ultimate-beneficial-owner fields (idea.md §9,
  `said`-grade).
- **Steps:** (a) validate a fixture carrying the current UBO fields; (b) validate a fixture missing
  a required UBO field.
- **Expected result:** (a) passes; (b) is rejected with a field-level error. Confirms the schema
  stays aligned to SEC MC No. 15 s.2025 (BR-005).

### TC-004 — Issuance via the Soroban contract yields a contract address, an interaction tx hash, and a signed credential
- **Covers:** F-002
- **Preconditions:** Soroban credential contract deployed to testnet; simulated anchor keypair
  available (`[unverified]` — synthetic issuer); Freighter connected.
- **Steps:** invoke `issue(credential, doc_hash[])` with a valid synthetic credential.
- **Expected result:** a **published contract deployment address** and an **interaction transaction
  hash** are produced (idea.md §8); the issued credential carries the anchor's signature. Issuance
  is a contract invocation, **not** an XLM payment-with-memo (06-system-design §Trade-offs).

### TC-005 — Issuance is authorized to the anchor key; a non-anchor caller is rejected
- **Covers:** F-002 (BR-001)
- **Preconditions:** contract enforces an authorization rule on `issue` (06-system-design §Open
  questions / proposed ADR-6: gate issuance to the anchor key, keep read/verify public).
- **Steps:** (a) call `issue` signed by the simulated anchor key; (b) call `issue` signed by a
  different (non-anchor) key.
- **Expected result:** (a) succeeds; (b) is rejected / panics with an authorization failure.
  Confirms the **anchor is the verifier of record** (BR-001). *Caveat: proves the mechanism against
  a simulated anchor only — see strategy caveat.*

### TC-006 — Only the document content hash is stored on-chain, never the document
- **Covers:** F-003 (BR-002)
- **Preconditions:** a synthetic document and its computed content hash.
- **Steps:** issue a credential; inspect the on-chain contract state / transaction payload.
- **Expected result:** on-chain state contains **only the content hash(es)** — no document bytes,
  no document filename, no embedded PII. (PRD F-003 acceptance + BR-002.)

### TC-007 — Recomputed hash matches the anchored hash; a modified document fails the match
- **Covers:** F-003
- **Preconditions:** a startup-held document whose hash was anchored at issuance.
- **Steps:** (a) recompute the hash from the original document and compare to the anchored hash;
  (b) alter one byte of the document, recompute, and compare.
- **Expected result:** (a) matches (integrity confirmed); (b) does **not** match. (PRD F-003
  acceptance: "a modified document fails the match.")

### TC-008 — The startup retains its documents; nothing is uploaded or custodied
- **Covers:** F-003 (BR-004)
- **Preconditions:** issuance flow with a local synthetic document.
- **Steps:** run UJ-001 issuance and observe what leaves the browser.
- **Expected result:** the document never leaves the startup's side; only its hash is transmitted
  on-chain. No SelyoPass-operated store receives the document (backend-less, non-custodial —
  06-system-design §Components; BR-004).

### TC-009 — Reader accepts a credential with a valid anchor signature and matching hash
- **Covers:** F-004 (BR-001)
- **Preconditions:** a credential issued by the simulated anchor; the startup presents the matching
  document; reader has the anchor public key.
- **Steps:** open the reader view (UJ-002); verify the issuer signature against the anchor public
  key; recompute and compare the document hash.
- **Expected result:** signature verifies and hash matches → result is **accept (verified by the
  named anchor)**. Confirms the consumer side reads who issued it (BR-001).

### TC-010 — Reader rejects a credential with a bad/invalid issuer signature
- **Covers:** F-004
- **Preconditions:** a credential whose signature does not verify against the anchor public key
  (tampered or wrong-key signature).
- **Steps:** load the credential into the reader; run signature verification.
- **Expected result:** **rejected with a clear reason** ("issuer signature does not verify"); the
  reader does not present it as valid. (PRD F-004 acceptance: bad signature rejected.)

### TC-011 — Reader rejects a credential whose document hash does not match the presented document
- **Covers:** F-004, F-003 (BR-002)
- **Preconditions:** a validly signed credential, but the startup presents a document whose hash
  differs from the anchored hash.
- **Steps:** load the credential; recompute the presented document's hash; compare to the anchored
  hash.
- **Expected result:** **rejected with a clear reason** ("document hash mismatch"); integrity fails.
  (PRD F-004/F-003 acceptance: mismatched document hash rejected.)

### TC-012 — Reader presents the result WITHOUT asserting compliance approval (no "trust-this-business" stamp)
- **Covers:** F-004 (BR-003)
- **Preconditions:** a credential that passes signature + hash verification (TC-009 accept path).
- **Steps:** inspect the reader's rendered result for an accepted credential.
- **Expected result:** the UI states only **what was verified and by which anchor** (structured,
  signed, hash-verified transmission). It does **not** display a "verified / trust-this-business /
  compliance-approved" stamp, and it surfaces that the relying party makes its own compliance
  judgment. (BR-003; idea.md §6 "secure data courier, not a compliance stamp.")

### TC-013 — Issuance and reader views render and are usable on a mobile viewport
- **Covers:** F-005
- **Preconditions:** built SPA; mobile viewport (≤ the 600px breakpoint noted in project steering).
- **Steps:** load the issuance view and the reader view at a mobile width; exercise the primary
  controls.
- **Expected result:** both views render legibly and the primary actions are usable on mobile
  (mobile-responsive UI — idea.md §8). *No specific device matrix or performance target is set —
  none is specified upstream.*

### TC-014 — Wallet-connect failure / missing Freighter surfaces a specific error
- **Covers:** F-006
- **Preconditions:** Freighter extension absent OR connection unavailable.
- **Steps:** attempt to connect the wallet.
- **Expected result:** a **specific, legible error** (e.g., "Freighter not detected" / "connection
  failed") and an appropriate state — **not** a silent crash. (PRD F-006 acceptance; Freighter only,
  idea.md §10.)

### TC-015 — Declined signature surfaces a specific error
- **Covers:** F-006
- **Preconditions:** Freighter connected; user declines the signing prompt during issuance.
- **Steps:** start issuance; reject the Freighter signature request.
- **Expected result:** a clear "signature declined / transaction cancelled" error and a recoverable
  state; no silent failure. (PRD F-006 acceptance.)

### TC-016 — Issuance failure and verification failure each show a specific error and a loading state
- **Covers:** F-006
- **Preconditions:** induce a failure (e.g., RPC timeout / contract panic on issue; malformed
  credential on read).
- **Steps:** (a) trigger an issuance failure; (b) trigger a verification failure.
- **Expected result:** each path shows a **loading state during the call** and a **specific error
  on failure** rather than a silent crash (PRD F-006 acceptance; 06-system-design §Integration
  points failure modes).

### TC-017 — Only synthetic data is used; no real corporate data / PII is federated on testnet
- **Covers:** F-001 (BR-006)
- **Preconditions:** the MVP test + demo environment.
- **Steps:** review the fixtures and any issued credentials used across the suite and the demo.
- **Expected result:** all data is **synthetic** — no real officer or beneficial-owner PII, no real
  corporate documents are federated (upholds the testnet-MVP slice of BR-006; idea.md §9). *The full
  RA 10173 obligation — NPC registration, DPO, privacy program — is a legal/process control required
  before any real data and is **out of scope for QA** (see §Out of scope), N/A here because it is
  not runtime behavior.*

## Acceptance criteria
Derived from PRD §Acceptance criteria (per F-ID). Testing is "passing the bar" when:

- **F-001** — valid full-field credential validates (TC-001); a missing required field is rejected
  with a field-level error (TC-002); UBO fields per SEC MC No. 15 s.2025 are enforced (TC-003,
  BR-005).
- **F-002** — issuance through the Soroban contract produces a published contract address + an
  interaction tx hash and a signed credential (TC-004); issuance is gated to the anchor key (TC-005,
  BR-001). *Anchor simulated — caveat carried.*
- **F-003** — only the content hash is on-chain (TC-006, BR-002); recomputed hash matches and a
  modified document fails (TC-007); the startup retains documents (TC-008, BR-004).
- **F-004** — valid signature + matching hash accepts (TC-009, BR-001); bad signature rejected
  (TC-010); mismatched hash rejected (TC-011, BR-002); the result asserts no compliance approval
  (TC-012, BR-003).
- **F-005** — issuance and reader views are usable on a mobile viewport (TC-013).
- **F-006** — wallet-connect failure / missing Freighter (TC-014), declined signature (TC-015), and
  issuance/verification failures (TC-016) each surface a specific error and loading state.

Submission bar (idea.md §8, the only hard counts): ≥3 passing tests across contract and frontend;
green CI/CD; published contract address + interaction tx hash; live demo URL; mobile-responsive UI.

## Regression plan
The suite is small enough to **run in full on every change** in CI (mirrors the ReconLens example;
no selective regression needed at this scale). Any change to the schema (F-001), the contract
(F-002/F-003), or the verification logic (F-004) re-runs the entire unit + contract + e2e set. CI
must be green for the submission (idea.md §8). No scheduled/periodic runs are defined — out of scope
for a demo-scale MVP.

## Exit criteria
Testing is "done" for the submission when:

- Every `F-001..F-006` has at least one **passing** mapped test (traceability matrix all green).
- Every `BR-001..BR-006` has at least one passing covering test (to the testable extent defined
  above; BR-006 limited to TC-017).
- The named negative cases pass: missing field (TC-002), bad signature (TC-010), hash mismatch
  (TC-011), wallet/declined/failure surfacing (TC-014–TC-016).
- The submission deliverables hold: **≥3 passing tests across contract and frontend**, green CI/CD,
  a published contract deployment address + interaction tx hash, a live demo URL, and a
  mobile-responsive UI (idea.md §8).
- **No open critical defects** in the in-scope flows.

Explicitly **not** part of exit criteria (deferred / untestable in this build): institution
acceptance, willingness-to-pay, generalization of Dserve's pain, live-anchor participation, and any
performance/availability/load/durability target (none specified upstream). These remain open
questions, not pass/fail gates.

## Open questions / coverage gaps
Carried from PRD §Open questions and 06-system-design §Open questions; each is a real gap, not a
guess:

- **No test framework / CI config exists in the repo yet** (`[unverified]`), but idea.md §8 requires
  ≥3 passing tests and a green pipeline — standing these up is a prerequisite to executing this plan.
- **Soroban contract authorization model is unspecified** (proposed ADR-6); TC-005 assumes issuance
  is anchor-gated. If the rule lands differently, TC-005 must be updated.
- **Off-chain document-storage mechanism is under-specified** (`[unverified]`); TC-006/007/008 treat
  documents as startup-held local files and assert only hash behavior, not a storage backend.
- **No performance, availability, scale, or durability targets** exist upstream — not tested, not
  invented.
- **Institution acceptance, willingness-to-pay, and pain generalization** are **not testable in this
  build** (deferred per idea.md §10) — listed as out of scope, surfaced here so they are not
  silently dropped.
