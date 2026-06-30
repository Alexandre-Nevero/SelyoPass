---
status: draft
schema_version: 1.1.0
---

<!--
  idea.md — THE CONTRACT (idea-forge schema v1.1.0)

  Status is intentionally DRAFT. Customer interviews are strategically deferred
  to ship the Stellar Level 3 + APAC submission by June 30 (solo developer,
  competing academic load). The evidence floor is therefore NOT met by design:
  validation is n=1 (Dserve) and unlogged. Do not set status: frozen until the
  behavioral evidence exists. Unverified claims are tagged [unverified] honestly
  rather than reworded to pass the gate.

  2026-06-30: Added desk-research leads (verified against primary/secondary
  sources) to §5, §6, §9 — all `said`-grade. These do NOT touch the evidence
  floor (still zero behavioral did/paid). Fabricated items from the source
  research (a non-existent "Acredia" protocol) and unconfirmed competitor
  claims (VYB Solutions) were deliberately excluded.
-->

# Idea: SelyoPass — verify your business once, stop re-proving it to every financial partner

## 1. Problem statement

Early-stage Philippine startups that connect to banks, payment gateways, and other regulated financial institutions must prove their corporate identity from scratch with every single partner. Each institution asks for nearly identical business documents — SEC registration, BIR certificate, Mayor's Permit, Articles of Incorporation, beneficial-ownership disclosure — and each runs its own independent intake and review cycle, even though they are all confirming the exact same legal entity. A founder connecting four partners assembles, submits, and chases the same paperwork four separate times, absorbing weeks of compounded delay before a single connection goes live, then repeats the entire ordeal for every new partner afterward. The work is duplicated, the founder bears the cost, and nothing they did for the last institution carries over to the next.

## 2. Target segment

Early-stage Philippine startups in their first ~18 months that complete two or more financial integrations (a bank plus one or more payment providers). Concretely: fintech startups subject to BSP licensing, marketplace platforms needing multiple banking partners, and B2B SaaS companies with embedded payments. Findable this week: the founder of **Dserve** (a Manila marketplace platform), plus the founders lined up for the Thursday interview round in the same Manila startup network. "All SMEs" is explicitly not the segment — the pain concentrates in startups doing several regulated integrations in a short window.

## 3. Evidence

> Validation is strategically deferred. The bullets below reflect what is actually known today. Behavioral evidence is n=1 and not yet logged as a dated artifact, so most claims are marked `[unverified]`. This section will not satisfy the linter's evidence floor, and that is the honest current state.

- The Dserve founder, unprompted, described submitting near-identical compliance documents separately to UnionBank, Xendit, GCash for Business, and Google programs — different forms and timelines for each, despite all verifying the same entity — and tied it directly to a delayed product launch. This is real past behavior (a `did`-grade signal for the problem), but the conversation is not yet logged with a confirmed date or interview artifact. [unverified]
- Independent industry sources quantify the same commercial-onboarding pain: Deloitte (via Backbase) reports commercial client onboarding takes 16+ weeks at $20k–$30k per client; McKinsey (via Dakota) reports 43–64 days for corporate onboarding at traditional institutions. These are secondary `said`-grade sources, not first-person evidence for SelyoPass's segment. [unverified]
- fintech.global (June 2025) articulates the thesis without naming it: the same client being onboarded multiple times by different parties, with no single source of truth. Secondary `said`-grade. [unverified]
- No startup has paid, pre-paid, or signed a binding commitment for this. No institution has agreed to accept the output as preferred intake. There is zero `paid` evidence. [unverified]

### Four tests

| Test | Pass/Fail | Why |
|------|-----------|-----|
| Real (does it actually happen?) | Pass | Confirmed n=1 (Dserve, past behavior) and corroborated by independent industry quantification. |
| Large (enough people?) | Unverified | One founder. Generalization across PH startups is the explicit open question for the deferred interviews. |
| Significant (do they care?) | Likely | The pain was volunteered as a launch-blocker, not extracted — a strong signal, but still n=1. |
| Urgent (now, not someday?) | Pass (windowed) | Acute specifically during the integration window in a startup's first 18 months; outside that window the pain fades. |

## 4. Root cause (the WHY)

Why do institutions re-collect the same documents? Because each regulated entity must independently satisfy its own customer-due-diligence obligation. Why can't one entity trust another's collection? Because compliance liability is non-transferable — BSP Circular 1170 and the AMLA implementing rules place the obligation on the regulated entity itself, and no contract reassigns it. Why doesn't a shared, reusable record of the collected documents exist? Because there is no neutral, trusted format for the collected-and-verified package that an institution can read and rely on without re-doing the work. Why has no neutral party built it? Because the institution-side vendors are paid per verification — a reusable record that travels with the business would cannibalize their revenue, so they have no incentive to build it.

Structural root cause: the duplicated work is not the compliance *judgment* (which legally cannot be shared) — it is the document *collection and parsing* step in front of the judgment, and no business-owned, institution-readable format for that step exists. It stays unsolved because the parties with the incentive to fix it (institutions) are on the wrong side of the economics, and the party with the pain (the startup) has no standard to carry.

## 5. Market & alternatives

Bottom-up reachability, not top-down market share. Reachable this week in at least two places: the Manila startup founder network (direct interviews) and BSP/Stellar-ecosystem channels around PDAX.

**Startup-side market is small (model estimate, not verified).** A bottom-up desk estimate puts the immediately reachable PH segment at roughly 2,500 businesses/year × ~$250/yr ≈ ~$625k/yr — but it rests on assumed capture rates (≈20% of ~1,200 active tech startups + ≈6% of new digital MSMEs), not hard counts, so treat it as order-of-magnitude only. The directional takeaway matters: the startup-pays-per-credential wedge is not, by itself, a venture-scale business. The institution side (BSFI onboarding spend) was never sized and is where the thesis says the real value sits.
  > [!evidence] Type: said | Source: gemini-deep-research desk estimate (assumptions, not counts) | Date: 2026-06-30

Top alternatives and where each fails:
- **Do nothing — the manual workaround** (a shared Drive folder, a spreadsheet tracking which institution got which document, or a part-time compliance person). This is the real competitor. It fails by not scaling: every new partner restarts the chase, and nothing is reusable or verifiable. [unverified]
- **Institution-side verification vendors** (AsiaVerify, HyperVerge, Sumsub, Persona). They sell verification *to institutions*; their "reusable KYC/KYB" features are gated inside each vendor's own client network, and their per-verification revenue model makes a portable, business-owned credential self-cannibalizing.
  > [!evidence] Type: said | Source: https://sumsub.com/ph/kyc-compliance/ | Date: 2026-06-30
- **Individual reusable-identity players (adjacent, not direct).** eKYC.ph markets "onboard once, reuse forever, powered by blockchain" — but for *individuals* ("Create Your Shareable ID"), not business KYB. Adjacent; worth watching for a business-side move, but not a confirmed competitor today. (Source desk research wrongly merged this with VYB Solutions; the live site shows an individual-identity product.)
  > [!evidence] Type: said | Source: https://ekyc.ph/ | Date: 2026-06-30
- **Regulator-led portable identity** (Singapore Myinfo Business, India Account Aggregator; PH: Philippine Business Hub / eGov PH). These solve a similar "verify once" problem, but the PH systems are built for *inbound* government registration, not an *outbound* API private banks can query — so UnionBank/Xendit/GCash still collect documents from the startup directly. [unverified]

**Supporting build signal (verified).** SEP-9 (Stellar's standard KYC field list) already defines `organization.*` fields — name, registration_number, registration_date, director_name, shareholder_name, incorporation-doc image — but they are thin: no beneficial-ownership percentage, no GIS, no Mayor's Permit, no BIR. That gap is exactly what a PH KYB extension (F-001) fills, which supports the "extend a published standard" positioning rather than inventing one.
  > [!evidence] Type: said | Source: https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0009.md | Date: 2024-04-22

## 6. Value proposition

For early-stage Philippine startups who must re-prove their corporate identity to every new financial partner, this is a portable KYB credential that lets them get verified once by a regulated anchor and present a signed, independently verifiable record to each subsequent institution, unlike re-submitting the same document pack from scratch every time, because a regulated anchor (not SelyoPass) is the verifier of record.

**Positioning (load-bearing): a secure data courier, not a compliance stamp.** SelyoPass eliminates the document *collection and parsing* step; it does not replace the institution's compliance judgment. Under BSP Circular 1170 that judgment and its liability stay with the relying institution, so the credential must be framed as structured, signed, hash-verifiable document *transmission* — never as a "verified, trust-this-business" stamp. This is the version of the pitch that survives a compliance officer's first question. Caveat: a SEP-12-compatible institution still has to implement reading the credential and choose to trust the issuing anchor; "any institution can read it without custom integration" overstates the lift.

## 7. Feature set

<!-- Stable IDs. F-001+ = MVP / Level 3 submission scope; F-101+ = final vision.
     Never renumber; retire and add. -->

**MVP** (Stellar Level 3 + APAC submission scope; each feature names the problem it solves):
- **F-001** — SEP-12-extended KYB credential schema for Philippine business documents (SEC, BIR, Mayor's Permit, Articles of Incorporation, beneficial ownership, GIS) → solves the "no shared, institution-readable format" root cause (§4).
- **F-002** — Anchor-issued signed credential flow implemented as a Soroban smart contract on testnet (issuance, not just an XLM payment-with-memo) → solves the re-verification-from-scratch pain (§1).
- **F-003** — Document hash anchoring: documents stay off-chain with the startup, only the content hash is anchored on-chain → lets an institution confirm the document it reads matches what the anchor verified, without SelyoPass custodying anything (§3 trust gap).
- **F-004** — Relying-party reader: a view that reads a credential, verifies the issuer's signature against the anchor's public key, and validates document hashes → proves the consumption side of the network exists, not just issuance.
- **F-005** — Mobile-responsive frontend for both issuance and relying-party views → Level 3 requirement.
- **F-006** — Error handling and loading states across wallet connect, issuance, and verification flows → Level 3 requirement.

**Final**:
- **F-101** — Continuous credentials: re-verification events (new GIS, new beneficial owners, sanctions hits) streamed as updates, so the credential is living rather than a one-time snapshot.
- **F-102** — Cross-jurisdiction schema extension (Indonesia OJK-compatible UBO fields, Bahasa-language fields, jurisdiction-tagged hashes) for SEA expansion.
- **F-103** — Inter-contract communication: separate issuer, registry, and relying-party contracts coordinating on-chain (anchors the "advanced smart contract" Level 3 dimension).
- **F-104** — Anchor onboarding integration so a regulated anchor (PDAX as the bootstrap candidate) issues SelyoPass credentials by default and reads them as a relying party from day one.

## 8. Success metrics

Product (post-launch): **Activation** — a startup completes credential issuance and presents it to at least one institution. **Retention** — the same credential is reused across two or more institutions without re-collection. **Revenue** — startups paying per credential issued. No vanity metrics (signups, page views, GitHub stars).

Submission (June 30 Level 3, the near-term measurable): working credential issuance and verification on Stellar testnet with a published contract deployment address and interaction transaction hash; ≥3 passing tests across contract and frontend; green CI/CD pipeline; live demo URL; mobile-responsive UI; 1–2 minute demo video.

## 9. Constraints, risks & kill criteria

**Single riskiest assumption (revised after research):** that at least one regulated institution will accept the credential as *preferred intake* — reading the structured data plus document hashes instead of re-collecting PDFs — given that BSP Circular 1170 keeps customer-due-diligence liability non-transferable. This is a demand-side, institution-side question, and it is the thing most likely to kill the project. The chicken-and-egg (startups won't pay for a credential nobody reads; institutions won't read one nobody carries) is downstream of it; the only resolution on the table is a regulated anchor (PDAX, unconfirmed) acting as both first issuer and first relying party. Validation must therefore target compliance officers, not just founders.

**Verified regulatory constraints (desk-level, `said`):**
- BSP Circular 1170 (30 Mar 2023) permits reliance on third-party / digital-ID systems but states the relying covered person retains ultimate responsibility for identification and verification. The credential cannot claim to transfer liability.
  > [!evidence] Type: said | Source: BSP Circular No. 1170 (2023) via lexology.com | Date: 2023-03-30
- SEC Memorandum Circular No. 15, s.2025 tightened ultimate-beneficial-owner disclosure, effective January 2026 — the KYB schema (F-001) must carry current UBO fields to stay aligned.
  > [!evidence] Type: said | Source: SEC MC No. 15 s.2025 via verihubs.com/blog/kyb-know-your-business | Date: 2026-01-01
- RA 10173 (Data Privacy Act): collecting officer / beneficial-owner personal data makes SelyoPass a personal-information controller. NPC Circular No. 2022-04 mandates DPO + Data Processing System registration for entities processing personal data of 250+ employees, 1,000+ individuals, or in a way that poses a risk to data subjects — SelyoPass crosses the 1,000-individual threshold quickly. Administrative fines reach 3% of annual gross income (NPC Circular 2022-01).
  > [!evidence] Type: said | Source: privacy.gov.ph (NPC Circular 2022-04) via bakermckenzie.com | Date: 2022-12-05

**Kill criteria (explicit fail-states):**
- Institutional (new, highest priority): if no regulated institution will accept the credential as preferred intake — i.e., they ingest the data but still demand the original PDFs to satisfy auditors — the network thesis collapses; narrow to a document-portability tool or pivot.
- Regulatory: if BSP/DICT ships an outbound, bank-queryable portable business-identity API (a Myinfo Business equivalent), the home-market thesis collapses — stop, or pivot to interoperability.
- Unit economics: if founder interviews show zero willingness to pay to skip the document chase across multiple integrations, the model is dead at this segment — pivot to a higher-pain segment.
- Technical: if a SEP-12 KYB extension cannot be made interoperable, or Soroban-based issuance + verification cannot be demonstrated on testnet by the deadline, narrow the submission to the credential schema plus a reader demo rather than full inter-contract flows.

Additional binding constraint: see RA 10173 above — NPC registration and a privacy management program are required before federating any real corporate data.

## 10. Out of scope (for now)

- Replacing or performing the institution's compliance judgment (sanctions/PEP screening, beneficial-ownership decisioning, financial decisioning) — the anchor and institution own this.
- Custodying documents — the startup retains them; only hashes are anchored.
- Mainnet deployment — testnet only for the submission.
- Wallets other than Freighter.
- Jurisdictions beyond the Philippines for the MVP (Indonesia/Vietnam/Malaysia are final-vision, not now).
- Securing the actual PDAX partnership — that is a business-development track, not a build deliverable, and must not block the Level 3 submission.
- Customer interviews and willingness-to-pay validation — strategically deferred until after June 30; this is why the brief stays DRAFT.
