# SelyoPass — Centralized Evidence Ledger

> **Purpose.** Single source of truth for every piece of evidence behind SelyoPass: what we know, how we know it, how strong it is, and what's still missing. Every claim in `idea.md` should trace to an entry here. This doc is honest by design — it separates *behavioral* evidence (what people did/paid) from *opinion* (`said`) and *desk facts* (regulatory/technical), and it quarantines fabricated or debunked claims so they never leak back in.
>
> **Maintained:** living document. Last updated 2026-06-30.
> **Owner:** Alex (solo).

---

## 0. Evidence floor scorecard (the teeth)

The IdeaForge linter will not let `idea.md` freeze until the Evidence section has **≥3 behavioral (`did`/`paid`) callouts, across ≥3 distinct sources, including ≥1 `paid`.**

| Requirement | Target | Current | Met? |
|---|---|---|---|
| Behavioral (`did`/`paid`) callouts | ≥ 3 | **0** | ❌ |
| Distinct behavioral sources | ≥ 3 | **0** | ❌ |
| `paid` signals (deposit / pre-order / paid pilot / signed LOI) | ≥ 1 | **0** | ❌ |
| First-person interviews logged with date | saturation ≈ 10 | **0 logged** (1 informal: Dserve) | ❌ |

**Bottom line: behavioral evidence = zero.** Everything below is `said`/secondary or desk-verified fact. `idea.md` correctly stays `draft`. The floor is cleared only by conducting and logging interviews — desk research cannot do it.

---

## 1. Legend

**Evidence type**
- `paid` — money or binding commitment (deposit, pre-order, paid pilot, signed LOI). Strongest.
- `did` — observed/reported past behavior (built a workaround, hired someone, switched tools). Strong.
- `said` — opinion, complaint, prediction, or interest (upvotes, signups, "I would use this"). Weak.

**Verification status**
- ✅ VERIFIED — confirmed against a primary or authoritative source (link checked this session).
- 🟡 SECONDARY — real source, but second-hand / industry summary, not primary.
- ⚠️ UNVERIFIED — claimed but not independently confirmed; treat as a lead.
- ⛔ EXCLUDED — fabricated, debunked, or mislabeled; kept here so it can't sneak back.

---

## 2. Behavioral evidence (`did` / `paid`) — the only kind that clears the floor

| ID | Claim / signal | Type | Source | Date | Status |
|----|----------------|------|--------|------|--------|
| — | *None yet.* No conducted interview, no built-workaround observed firsthand for SelyoPass, no payment or binding commitment from any startup or institution. | — | — | — | — |

**This is the gap that matters.** Until this table has rows, SelyoPass is a hypothesis.

---

## 3. First-person leads (founder-sourced, not yet logged)

| ID | Claim | Type | Source | Date | Status | Notes |
|----|-------|------|--------|------|--------|-------|
| E-001 | Dserve founder, unprompted, described submitting near-identical compliance documents separately to UnionBank, Xendit, GCash for Business, and Google programs — different forms/timelines each — and tied it to a delayed launch. | `did` (reported past behavior) | interview-dserve (informal) | unknown | ⚠️ UNVERIFIED | The conversation is real but **not logged** with a date or artifact. To count toward the floor it must be re-contacted, dated, and recorded. This is the single most upgradeable piece of evidence we have. |

---

## 4. Secondary / desk evidence — market & problem (industry `said`)

| ID | Claim | Type | Source | Date | Status |
|----|-------|------|--------|------|--------|
| E-010 | Commercial client onboarding takes 16+ weeks; banks invest $20k–$30k per client. | `said` | Deloitte (via Backbase) | cited, undated | 🟡 SECONDARY |
| E-011 | Corporate onboarding at traditional FIs takes 43–64 days. | `said` | McKinsey (via Dakota) | cited, undated | 🟡 SECONDARY |
| E-012 | "Same client onboarded multiple times by different parties; no single source of truth." | `said` | fintech.global | 2025-06 | 🟡 SECONDARY |
| E-013 | Anonymous PH founders describe storing compliance PDFs in Google Drive/email and it breaking at scale; some hire accountants. | `said` (NOT `did`/`paid` — anonymous, not our customer, adjacent pain) | r/PhStartups (Gemini-supplied URLs) | dates suspect | ⚠️ UNVERIFIED |

> **Caution on E-013:** the source research labeled these `did`/`paid`. That is wrong — anonymous Reddit commenters are not interviewees, the pain described (general tax/BIR compliance, document management) is *adjacent* to the SelyoPass thesis (repeated identical KYB submission across institutions), and the URLs were not confirmed. Do not let these touch the floor.

---

## 5. Desk-verified facts — regulatory (strong, `said`/secondary but confirmed)

| ID | Fact | Source | Date | Status |
|----|------|--------|------|--------|
| E-020 | **BSP Circular 1170** (signed 30 Mar 2023, Dep. Gov. Bobier) amends MORB/MORNBFI §921/921Q on CDD + e-KYC; permits reliance on third-party/digital-ID systems **but the relying covered person retains ultimate responsibility** for identification/verification. → Liability is non-transferable; the credential is a data courier, not a compliance stamp. | BSP via Lexology, BusinessWorld/Metrobank, thepaypers | 2023-03-30 | ✅ VERIFIED |
| E-021 | **AMLA** requires covered persons to identify the customer and beneficial owners (≥25% control) before a business relationship begins. | AMLA implementing rules (per project-context + industry sources) | — | 🟡 SECONDARY |
| E-022 | **SEC Memorandum Circular No. 15, s.2025** tightened ultimate-beneficial-owner disclosure, effective January 2026. → KYB schema (F-001) must carry current UBO fields. | SEC MC 15 s.2025 via verihubs | 2026-01 (effective) | 🟡 SECONDARY |
| E-023 | **RA 10173 (Data Privacy Act)** makes any collector of officer/UBO personal data a Personal Information Controller. **NPC Circular No. 2022-04** (issued 5 Dec 2022) mandates DPO + Data Processing System registration for entities processing personal data of **250+ employees, OR 1,000+ individuals, OR processing that poses a risk to data subjects** (incl. automated decision-making/profiling). SelyoPass would cross the 1,000-individual threshold quickly. **Correction:** the "up to 3% of annual gross income" fine is from **NPC Circular 2022-01** (administrative fines), not 22-04. | privacy.gov.ph (NPCRS FAQ + show-cause notice); Baker McKenzie; Lexology | 2022-12-05 | ✅ VERIFIED (with correction) |

---

## 6. Desk-verified facts — technical / ecosystem (strong, confirmed)

| ID | Fact | Source | Date | Status |
|----|------|--------|------|--------|
| E-030 | **SEP-9** (Stellar Standard KYC Fields) defines `organization.*` fields: name, registration_number, registration_date, registered_address, number_of_shareholders, shareholder_name, photo_incorporation_doc, director_name, etc. → Stellar already supports business/KYB data exchange. | stellar-protocol/ecosystem/sep-0009.md (spec v1.17/1.18) | 2024-04-22 | ✅ VERIFIED |
| E-031 | SEP-9's org fields are **thin** — no beneficial-ownership %, no GIS, no Mayor's Permit, no BIR. → Genuine room for a PH KYB extension; supports "extend a published standard" positioning. | same spec (gap analysis) | 2024-04-22 | ✅ VERIFIED |
| E-032 | **eKYC.ph** markets "Onboard once. Reuse forever. Powered by blockchain" — but for **individuals** ("Create Your Shareable ID"), not business KYB. Adjacent, not a confirmed business-KYB competitor. | ekyc.ph (live site) | 2026-06-30 | ✅ VERIFIED |
| E-033 | **PDAX** is the leading PH digital-asset exchange, **BSP-licensed since 2018** (launched 2019). Confirmed integrated with the **Stellar Network** via the Velo Labs + PDAX remittance corridor (2022). Formal SEP-24 anchor *directory* listing not independently confirmed. | pdax.ph/about-us; PR Newswire (Velo+PDAX, 2022); u.today | 2022-03 | 🟡 SECONDARY (BSP license + Stellar integration verified; "SEP-24 anchor" designation unconfirmed) |
| E-034 | Soroban (Rust/WASM) supports on-chain credential issuance + hash anchoring; generic reference patterns exist (hash on-chain, metadata on IPFS, DB for query). | Stellar dev docs, soroban-examples, generic credential repos | 2026-06 | 🟡 SECONDARY |

---

## 7. Competitive landscape evidence

| ID | Player | What they do (evidenced) | Relationship | Status |
|----|--------|--------------------------|--------------|--------|
| E-040 | Institution-side vendors (AsiaVerify, HyperVerge, Sumsub, Persona) | Sell verification *to institutions*; "reusable KYC/KYB" gated within each vendor's own client network; per-verification revenue model. | Opposite side of market; structurally disincentivized to build a portable business-owned credential. | 🟡 SECONDARY (sumsub.com/ph confirmed live) |
| E-041 | VYB Solutions (PH) | Per project-context: KYB lifecycle management for BSP-regulated institutions managing distribution networks (RTC sub-agents). | Orthogonal per prior research. **Gemini claimed VYB = eKYC.ph = a direct reusable-KYB competitor — UNCONFIRMED and contradicts prior research.** | ⚠️ UNVERIFIED — check directly |
| E-042 | Regulator-led (Singapore Myinfo Business, India Account Aggregator; PH Business Hub, eGov PH) | "Verify once" infra; PH systems are inbound-registration portals, no outbound bank-queryable API. | PH lane unoccupied for portable business credential. | 🟡 SECONDARY |

---

## 8. Market sizing evidence (model, not measured)

| ID | Estimate | Basis | Status |
|----|----------|-------|--------|
| E-050 | Reachable PH startup-side market ≈ 2,500 businesses/yr × ~$250/yr ≈ **~$625k/yr**. | Bottom-up desk model: ≈20% of ~1,200 active tech startups + ≈6% of ~38k new digital MSMEs; price benchmarked vs ₱40k–150k compliance-runner fees. | ⚠️ UNVERIFIED — **assumed capture rates, not counts.** Order-of-magnitude only. |

> **Takeaway:** the startup-pays wedge is small and not venture-scale by itself. The **institution side was never sized** — that's the next research priority and where the thesis says the real value lives.

---

## 9. Evidence from LTM (project memory)

The LTM store was reviewed end-to-end. It contains **no behavioral evidence** — only project-state.

| ID | Item | Source | Date | Status |
|----|------|--------|------|--------|
| E-060 | Bootstrap checkpoint: "SelyoPass is a portable KYB credential platform on Stellar; Level 1 White Belt mechanics shipped, building toward Level 3 + APAC submission June 30." | ltm/store/checkpoints.jsonl `chk_000001` | 2026-06-28 | ✅ VERIFIED (internal state) |
| E-061 | Level 1 testnet mechanics shipped: Freighter connect/disconnect, XLM balance fetch, build/sign/submit testnet tx, success/failure with tx hash. | project-context.md (Level 1 status table) | — | ✅ VERIFIED (internal state) |
| — | Events log = structural file-write records only; sessions = no substantive summaries; open_threads = empty. No customer or market evidence in memory. | ltm/store/* | 2026-06-24→30 | ✅ VERIFIED (absence noted) |

---

## 10. ⛔ EXCLUDED / debunked — do not cite

| Item | Why excluded |
|------|--------------|
| "Acredia-Stellar protocol" as a reference implementation | Does not surface anywhere in search; appears **fabricated** by the source research. The generic pattern is fine; this specific citation is not. |
| eKYC.ph = VYB Solutions = Charles Racelis building reusable business-KYB DID | **Conflation.** Live eKYC.ph is an individual-identity product. The merged-entity "direct competitor" narrative is unsupported. |
| Reddit comments classified as `did`/`paid` | **Mislabeled.** Anonymous, not our customers, adjacent pain; downgraded to `said`/unverified (E-013). |
| TAM framed from "$2.4B VC funding" / "43,185 registrations" | **Vanity.** Macro numbers ≠ addressable demand; excluded from sizing. |
| Sumsub "millions of profiles" as proof of demand | **Vanity / mismatched.** Mostly individual retail KYC, not PH corporate KYB. |
| Any far-future or "approximate, based on metadata" date | Suspect; not citeable until a working source + real date is confirmed. |

---

## 11. What it takes to clear the floor (action ledger)

Priority order to convert this ledger from `said` to behavioral:

1. **Re-contact Dserve, log E-001 properly** (dated, recorded) → upgrades the one real `did` we have.
2. **Run ≥3 founder interviews** anchored in past behavior (Mom Test) → target `did` (built a workaround, hired help, re-submitted docs).
3. **Interview ≥1 compliance officer** at a bank/payment provider → tests the *real* riskiest assumption (will an institution accept the credential as preferred intake under BSP 1170?).
4. **Get 1 `paid` signal** — a paid pilot, deposit, or signed LOI from a startup or institution → the hardest and most decisive row.
5. **Size the institution side** → reframes the whole market away from the small startup wedge.

Channels to source 1–4 (from desk research, to verify): QBO Innovation Hub, r/PhStartups, FinTech Alliance.ph, IdeaSpace, Startup PH (FB).

---

## 12. Change log

- **2026-06-30** — Doc created. Consolidated: idea.md claims, Gemini deep-research output (verified + quarantined), this session's primary verification (BSP 1170, SEP-9, eKYC.ph), and LTM review. Behavioral floor confirmed at zero.
- **2026-06-30** — Verified the two open items: E-023 (NPC Circular 2022-04 thresholds confirmed; corrected the 3% fine to Circular 2022-01) → upgraded to VERIFIED; E-033 (PDAX BSP license since 2018 + Stellar/Velo integration confirmed; "SEP-24 anchor" designation still unconfirmed) → upgraded to SECONDARY.
