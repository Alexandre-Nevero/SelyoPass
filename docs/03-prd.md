# PRD — SelyoPass (MVP)

> Generated from `../idea.md` (the only source of truth). Features reuse the `F-###` IDs from
> idea.md §7; nothing is renumbered. MVP scope = F-001..F-006 (Stellar Level 3 + APAC June 30
> submission). Final-vision features (F-101..F-104) appear only under "Non-goals / future".
> Evidence base is n=1 (Dserve) and unlogged; claims that idea.md tags `[unverified]` or
> `said`-grade are carried forward with the same tag.

## Overview & goals
SelyoPass is a portable KYB credential for early-stage Philippine startups: get verified once by
a regulated anchor and present a signed, independently verifiable record to each subsequent
financial partner instead of re-submitting the same document pack from scratch (idea.md §1, §6).
It is positioned as a secure data courier — it eliminates the document *collection and parsing*
step, never the institution's compliance judgment (idea.md §6).

Goals for this build are the June 30 Stellar Level 3 + APAC submission (idea.md §8): working
credential issuance and verification on Stellar **testnet**, with a published contract deployment
address and an interaction transaction hash, ≥3 passing tests across contract and frontend, a
green CI/CD pipeline, a live demo URL, a mobile-responsive UI, and a 1–2 minute demo video.

## Personas & use cases
Pulled from idea.md §2 and §4. Customer interviews are deferred until after June 30 (idea.md
§10), so persona detail beyond what Dserve volunteered is `[unverified]`.

- **Startup founder / issuer-side user (primary):** an early-stage PH startup in its first ~18
  months doing two or more financial integrations (a bank plus one or more payment providers).
  Submits KYB documents once and obtains a credential to present to each new partner. Grounded
  in the Dserve account (n=1, idea.md §3). Generalization across PH startups is `[unverified]`.
- **Regulated anchor (verifier of record):** reviews the startup's documents and issues the
  signed credential. PDAX is the bootstrap candidate but is **unconfirmed** and is a
  business-development track, not a build deliverable (idea.md §9, §10). For the MVP the anchor
  is simulated on testnet `[unverified]`.
- **Relying party / institution (consumer-side user):** a bank, payment provider, or marketplace
  that reads a credential, verifies the issuer signature, and validates document hashes. Whether
  any real institution will accept the credential as preferred intake is the single riskiest
  assumption and is `[unverified]` (idea.md §9).

## User stories
Grouped by persona. Each traces to an idea.md problem (§1/§4) or feature (§7).

**Startup founder (issuer side)**
- As a founder, I want my PH business documents (SEC, BIR, Mayor's Permit, Articles of
  Incorporation, beneficial ownership, GIS) captured in one structured schema, so there is a
  shared, institution-readable format instead of re-assembling packets per partner (F-001; §4).
- As a founder, I want a regulated anchor to issue me a signed credential on testnet, so I can
  present a verifiable record instead of re-proving my identity from scratch each time (F-002;
  §1).
- As a founder, I want to keep my documents myself and have only their hash anchored on-chain,
  so no one custodies my paperwork yet a partner can still confirm it is unchanged (F-003; §3).

**Relying party (consumer side)**
- As a relying party, I want to read a credential and verify the issuer's signature against the
  anchor's public key, so I can trust who issued it without re-doing the anchor's collection work
  (F-004; §6).
- As a relying party, I want to validate that the document hashes in the credential match the
  documents the startup holds, so I can confirm integrity before relying on the data (F-004,
  F-003; §3).

**Both sides**
- As either user, I want issuance and verification to work on my phone, so the flows are usable
  on a mobile-responsive UI (F-005; Level 3 requirement, §8).
- As either user, I want clear errors and loading states across wallet connect, issuance, and
  verification, so failures are legible rather than silent crashes (F-006; Level 3 requirement,
  §8).

## User journeys
Each core journey has a stable ID. Referenced by QA and design system.

- **UJ-001** — Startup issues a credential: a founder submits KYB documents to a regulated anchor
  → the anchor issues a signed credential as a Soroban contract on testnet → the document hash is
  anchored on-chain while the startup retains the documents → the founder holds a presentable,
  verifiable credential. (F-001, F-002, F-003, F-005, F-006.)
- **UJ-002** — Relying party reads/verifies a credential: a relying party opens the reader view →
  reads the credential's structured fields → verifies the issuer signature against the anchor's
  public key → validates the document hashes against what the startup presents → accepts or
  rejects based on its own compliance judgment. (F-004, F-005, F-006.)

## Feature list (with priorities)
Each row reuses the F-### ID from idea.md §7. "Solves" cites the idea.md problem (§1/§3/§4).
Every F-### must appear in the QA test plan.

| F-ID  | Feature | Priority | Solves (problem) | Notes |
|-------|---------|----------|------------------|-------|
| F-001 | SEP-12-extended KYB credential schema for PH business docs (SEC, BIR, Mayor's Permit, Articles of Incorporation, beneficial ownership, GIS) | MVP | "No shared, institution-readable format" root cause (§4) | Extends published SEP-9/SEP-12 `organization.*` fields; must carry current UBO fields (SEC MC No. 15 s.2025, §9) |
| F-002 | Anchor-issued signed credential flow as a Soroban smart contract on testnet | MVP | Re-verification from scratch with every partner (§1) | Issuance, not an XLM payment-with-memo; anchor simulated on testnet `[unverified]` |
| F-003 | Document hash anchoring — docs stay off-chain with the startup, only the content hash on-chain | MVP | Trust gap: confirm the doc read matches what the anchor verified, without SelyoPass custodying anything (§3) | Non-custodial by design (§10) |
| F-004 | Relying-party reader — read credential, verify issuer signature vs anchor public key, validate document hashes | MVP | Proves the consumption side of the network exists, not just issuance (§7) | Consumer side of UJ-002 |
| F-005 | Mobile-responsive frontend for issuance + relying-party views | MVP | Level 3 submission requirement (§8) | Both views |
| F-006 | Error handling and loading states across wallet connect, issuance, verification | MVP | Level 3 submission requirement (§8) | Freighter only (§10) |

## Business rules
Each rule has a stable ID. Derived strictly from idea.md §4/§6/§9/§10. FRD/QA reference these.

- **BR-001** — The regulated **anchor is the verifier of record, not SelyoPass.** SelyoPass is
  non-custodial infrastructure; the anchor performs verification and issues the credential
  (idea.md §6, §10).
- **BR-002** — **SelyoPass never custodies documents — only hashes.** Documents stay off-chain
  with the startup; only the content hash is anchored on-chain (idea.md §3, §7 F-003, §10).
- **BR-003** — **The credential does not transfer compliance liability.** Under BSP Circular 1170
  the relying covered person retains ultimate responsibility for identification and verification;
  the credential must be framed as structured, signed, hash-verifiable document *transmission*,
  never as a "verified, trust-this-business" stamp (idea.md §4, §6, §9).
- **BR-004** — **The startup retains its documents.** The startup is the holder of record for the
  underlying paperwork; the credential and on-chain hash do not replace or seize them (idea.md
  §3, §10).
- **BR-005** — **The credential carries current UBO fields.** The KYB schema must stay aligned
  with SEC Memorandum Circular No. 15, s.2025 (tightened ultimate-beneficial-owner disclosure,
  effective January 2026) — `said`-grade (idea.md §9).
- **BR-006** — **SelyoPass is a personal-information controller under RA 10173.** Collecting
  officer / beneficial-owner personal data crosses the NPC 1,000-individual threshold; NPC
  registration and a privacy management program are required before federating any real corporate
  data — `said`-grade (idea.md §9). For the testnet MVP no real corporate data is federated
  `[unverified]`.

## User flows
Step-by-step for the core journeys (UJ-001, UJ-002).

**UJ-001 — Startup issues a credential**
1. Founder connects the Freighter wallet (F-006 handles connect errors / missing extension).
2. Founder enters KYB fields conforming to the extended SEP-12 schema (F-001).
3. Founder supplies documents locally; the system computes a content hash for each (F-003).
4. The regulated anchor issues a signed credential via the Soroban contract on testnet; the
   document hash is anchored on-chain while the documents stay with the startup (F-002, F-003,
   BR-001, BR-002, BR-004).
5. The UI shows progress and the resulting transaction hash / contract interaction; on failure it
   shows a specific, legible error (F-006, F-005).

**UJ-002 — Relying party reads/verifies a credential**
1. Relying party opens the reader view (F-004, F-005).
2. The reader reads the credential's structured fields (F-001, F-004).
3. The reader verifies the issuer's signature against the anchor's public key (F-004, BR-001).
4. The reader validates the document hashes against what the startup presents (F-004, F-003,
   BR-002).
5. The relying party accepts or rejects on its own compliance judgment — the credential transfers
   no liability (BR-003); loading/error states are shown throughout (F-006).

## Acceptance criteria
Per feature (by F-ID), testable conditions. These become QA cases keyed to the same F-ID. Where a
criterion depends on a deferred or unconfirmed fact, it is tagged `[unverified]`.

- **F-001:** a credential built with all required PH KYB fields (SEC, BIR, Mayor's Permit,
  Articles of Incorporation, beneficial ownership, GIS) validates against the extended SEP-12
  schema; a credential missing a required field is rejected with a field-level error. UBO fields
  required by SEC MC No. 15 s.2025 are present (BR-005).
- **F-002:** issuing a credential through the Soroban contract on testnet produces a published
  contract deployment address and an interaction transaction hash (idea.md §8); the issued
  credential carries the anchor's signature. Anchor is simulated on testnet `[unverified]`.
- **F-003:** the credential stores only a document content hash on-chain, never the document
  itself (BR-002); recomputing the hash from the startup-held document matches the anchored hash,
  and a modified document fails the match.
- **F-004:** the reader verifies a valid issuer signature against the anchor's public key and
  validates matching hashes (accept); a credential with a bad signature or a mismatched hash is
  rejected with a clear reason. The reader presents the result without asserting compliance
  approval (BR-003).
- **F-005:** both the issuance and relying-party views render and are usable on a mobile viewport
  (mobile-responsive, idea.md §8).
- **F-006:** wallet-connect failure (missing/declined Freighter), issuance failure, and
  verification failure each surface a specific error and a loading state rather than a silent
  crash (idea.md §8). Freighter only (§10).

## Non-goals
Mirrors idea.md §10. SelyoPass deliberately does **not**:
- Replace or perform the institution's compliance judgment (sanctions/PEP screening,
  beneficial-ownership decisioning, financial decisioning) — the anchor and institution own this
  (BR-003).
- Custody documents — the startup retains them; only hashes are anchored (BR-002, BR-004).
- Deploy to mainnet — testnet only for this submission.
- Support wallets other than Freighter.
- Serve jurisdictions beyond the Philippines for the MVP.
- Secure the actual PDAX partnership as a build deliverable — it is a business-development track
  and must not block the Level 3 submission.
- Run customer interviews / willingness-to-pay validation before June 30 — strategically
  deferred (this is why the brief stays DRAFT).

**Future (final vision — out of MVP scope, idea.md §7):** F-101 continuous credentials
(re-verification events streamed as updates); F-102 cross-jurisdiction schema extension
(Indonesia OJK-compatible UBO fields, Bahasa-language fields, jurisdiction-tagged hashes); F-103
inter-contract communication (issuer, registry, relying-party contracts coordinating on-chain);
F-104 anchor onboarding integration so a regulated anchor (PDAX bootstrap candidate) issues
SelyoPass credentials by default. These are explicitly **not** built in the MVP.

## Dependencies
Grounded in idea.md; items not stated there are flagged.
- Stellar **testnet** and Soroban smart-contract runtime for issuance and verification (idea.md
  §7, §8, §10).
- **Freighter** wallet — the only supported wallet (idea.md §10).
- A regulated **anchor** as verifier of record; PDAX is the bootstrap candidate but is
  **unconfirmed**, and for the MVP the anchor is simulated on testnet (idea.md §9, §10)
  `[unverified]`.
- The published **SEP-9 / SEP-12** standards, which F-001 extends for PH KYB (idea.md §5).
- Off-chain document storage held by the startup (e.g., locally); only the content hash is
  anchored on-chain (idea.md §3, §7). Specific storage mechanism beyond "startup retains
  documents" is `[unverified]`.
- CI/CD pipeline and a live demo URL required by the Level 3 submission (idea.md §8).

## Open questions
Never converted into confident guesses; each derives from an idea.md gap or `[unverified]` tag.
- Does Dserve's pain generalize beyond n=1? The "Large" test is unverified; this is the explicit
  question for the deferred interviews (idea.md §3, §9). `[open]`
- Will at least one regulated institution accept the credential as **preferred intake** rather
  than still demanding original PDFs? This is the single riskiest, most likely kill-criterion
  assumption (idea.md §9). `[open]`
- Will PDAX (or an equivalent anchor) agree to be the bootstrap issuer and first relying party?
  Unconfirmed; outreach is a separate, non-blocking track (idea.md §9, §10). `[open]`
- Will startups pay per credential to skip the document chase across multiple integrations?
  Willingness-to-pay is unvalidated and deferred (idea.md §8, §9). `[open]`
- What document-storage mechanism backs F-003 beyond "the startup retains documents"? Not
  specified in idea.md. `[unverified]`
- For the MVP, is the anchor a simulated test issuer rather than a live regulated anchor? idea.md
  implies testnet-only with anchor participation unconfirmed. `[unverified]`
