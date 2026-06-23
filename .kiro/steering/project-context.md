# SelyoPass – Project Context

> **Status:** Hypothesis-stage. Stellar Level 1 White Belt mechanics shipped. Customer validation in progress (n=1 confirmed, additional founder interviews scheduled). Building toward Stellar Level 3 submission and APAC Hackathon idea submission (June 30).

---

## Identity

- **Project Name:** SelyoPass
- **Tagline:** One verified mark. Open doors everywhere.
- **What it is:** A portable Know Your Business (KYB) credential platform built on Stellar. Startups verify their corporate identity once with a regulated anchor and present a structured, signed credential to any future bank, payment partner, or marketplace. Institutions skip the document collection step and keep full compliance authority.
- **Submission targets:** Stellar Level 3 + APAC Hackathon idea submission (June 30)

---

## Validated vs Hypothesis

This document mixes confirmed facts with working assumptions. Be explicit about which is which in any future conversation, pitch, or design decision.

### Validated

- **Dserve's pain is real (n=1).** A founder unprompted described submitting nearly identical compliance documents to UnionBank, Xendit, GCash for Business, and Google programs, with weeks of compounded delay before launch.
- **Technical stack works on testnet.** Wallet connect, balance fetch, transaction build, sign, and submit are all working through Freighter and Horizon.
- **SEP-12 exists as a Stellar standard** for exchanging KYC and KYB data between anchors and clients.
- **PDAX is a Stellar anchor** with BSP VASP licensing operating on SEP-24 rails.
- **Compliance authority cannot be outsourced.** BSP Circular 1170 and AMLA implementing rules place the customer due diligence obligation on the regulated entity. No architecture changes this.

### Hypothesis (to be tested)

- That Dserve's pain generalizes to other Philippine startups doing financial integrations.
- That startups will pay for a portable credential that saves them onboarding cycles across multiple partners.
- That at least one regulated institution will accept SEP-12-formatted KYB credentials as preferred intake within six months of launch.
- That PDAX (or an equivalent anchor) will agree to be the bootstrap issuer and first relying party.
- That the credential remains valuable as it expands across SEA jurisdictions.
- That the founder-market fit gap (Alex did not personally suffer this pain) closes through customer development rather than blocking the project.

The decision to continue past end-of-week depends on Thursday's founder interviews. The decision criteria are in the "Decision Gate" section at the end of this doc.

---

## The Problem

Early-stage Philippine startups face fragmented and repetitive Know Your Business (KYB) onboarding when integrating with banks, payment gateways, and other regulated financial institutions. Every institution requires nearly identical business documents — SEC registration, BIR certificate, Mayor's Permit, Articles of Incorporation, beneficial ownership disclosure — and each runs an independent intake cycle even though they are verifying the same legal entity. There is no standardized, reusable KYB credential that a startup can carry across institutions, so document collection happens from scratch every time. The result is weeks of compounded delay before a single integration goes live, multiplied by every new partner the startup onboards.

**A critical clarification.** Institutions cannot legally outsource the compliance decision. The gap is not in their judgment work. It is in the document collection and parsing step that sits in front of the judgment work. SelyoPass targets that gap, not the compliance decision itself. Pitching this product as "replace KYB" is the fastest way to lose institutional credibility.

### Source: Dserve (the only validated data point)

Dserve is a Philippine marketplace platform whose founder described the pain unprompted while explaining why his product launch was delayed. They had to submit nearly identical compliance documents separately to UnionBank, Xendit, GCash for Business, and Google programs, each with different forms, timelines, and follow-up processes, despite all verifying the same legal entity.

This is one founder's experience. It is the most concrete data point we have. It is not yet evidence the pain generalizes to other Philippine startups. Thursday's interviews are designed to find out.

### Affected Customer Hypothesis

To be confirmed:
- Early-stage Philippine startups doing two or more financial integrations in their first 18 months
- SMEs onboarding with multiple payment providers
- Fintech startups subject to BSP licensing
- Marketplace platforms requiring multiple banking partners
- B2B SaaS companies with embedded payments

---

## The Solution

SelyoPass is a portable KYB credential platform.

### How it works

1. A startup submits its KYB documents once to SelyoPass.
2. A regulated anchor (initially PDAX) reviews the documents and issues a signed, structured credential conforming to an extended SEP-12 schema.
3. The credential is anchored on Stellar. The startup retains the documents.
4. When the startup approaches a new institution, the institution reads the credential through SEP-12, verifies the signature against the issuing anchor, validates that the document hashes match what the startup holds, and skips the document collection step.
5. The institution still runs sanctions and PEP screening, beneficial ownership analysis, financial decisioning, and audit trail maintenance. SelyoPass eliminates document collection and parsing, not compliance judgment.

### What SelyoPass explicitly does NOT do

- Does not replace KYB.
- Does not let institutions outsource the compliance decision.
- Does not act as a verifier of record (the anchor does).
- Does not custody documents (the startup retains them).
- Does not guarantee a business is clean (the credential documents what was verified and by whom).

### Bootstrap mechanic (load-bearing)

The chicken-and-egg problem (why would a startup pay for a credential nobody yet reads, why would an institution accept a credential nobody yet carries) is resolved by PDAX serving as both the first issuer and the first relying party. PDAX already onboards business clients. If their existing onboarding flow produces a SelyoPass credential by default, every PDAX-onboarded business is automatically credentialed and PDAX is automatically reading credentials from day one. Other institutions join because the startups they onboard already carry credentials.

Without this bootstrap mechanic, the network does not start. Securing PDAX participation (or an equivalent anchor) is the highest-leverage business development task and is itself a hypothesis to validate.

### Two-sided value, one-sided payment

The startup pays SelyoPass for the credential. The bank receives value (faster intake, risk signal) without paying initially. This is a standard early-stage marketplace pattern. LinkedIn and early-stage Plaid both used variants of it. Banks may pay later for API access, continuous monitoring, or formalized intake integration.

The 10 to 20 percent of bank-side time savings on a full KYB workflow is the wedge. The portable, reusable credential is the product. Do not pitch the wedge as the product.

---

## Why Stellar

Three structural reasons, not generic blockchain reasons.

1. **SEP-12 already exists.** Stellar has a published, open standard for exchanging KYC and KYB data between financial institutions and their clients. SelyoPass extends that standard for Philippine business documents. Any SEP-12-compatible institution can read the credential without custom integration.
2. **PDAX is already in the ecosystem.** PDAX operates as a Stellar anchor with BSP VASP licensing on SEP-24 rails. The verifier of record this product needs already exists. This is also why SelyoPass fits the Stellar APAC ecosystem rather than being a generic blockchain choice retrofitted onto a problem.
3. **Cost economics.** Stellar transaction fees are low enough that per-verification fees are economically viable at Philippine startup deal sizes. Ethereum gas costs would make the same model impractical.

### What integrates on top of Stellar

- PDAX as the primary anchor and verifier
- IPFS or equivalent for actual document storage (content hash on-chain, document off-chain with the startup)
- Any future SEP-12-compliant institution as a relying party without custom integration

---

## Competitive Landscape

| Competitor | What they do | Customer | Relationship to SelyoPass |
|------------|--------------|----------|---------------------------|
| **VYB Solutions** (PH, founded 2024, pilot stage) | KYB documentation and lifecycle management for BSP-regulated institutions managing distribution networks. Four pillars: structured onboarding, documentation verification (analyst-validated), lifecycle tracking (renewals, ownership thresholds), and centralized dashboards. Primarily serves RTC license holders managing sub-representative networks. | BSP-regulated institutions (Remittance and Transfer Companies, Money Service Businesses, EMIs, fintechs, payment service providers) | **Orthogonal, not competitive.** VYB helps one institution manage KYB across many entities inside its own network. SelyoPass helps one entity carry verification across many institutions. Dserve is the kind of customer VYB does not serve. Potentially complementary: VYB-verified records could be issued as SelyoPass credentials downstream. |
| **AsiaVerify** | Real-time KYB and UBO across 13 APAC jurisdictions, sourced from government registries | Institutions | Direct competitor on the institution-side surface. Pulls registry data into the institution's workflow. Does not produce a portable, business-owned credential. |
| **HyperVerge** | APAC's largest KYB by volume (700M identities) | Institutions | Same structural side as AsiaVerify. Larger and more direct competitive concern than VYB. |
| **Sumsub, Verihubs, Shufti, Persona, ComplyAdvantage, Tookitaki** | Global KYB and KYC platforms with localized support | Institutions | All institution-side. Selling verification to institutions, not credentials to businesses. These are the more relevant competitive set than VYB. |
| **eKYC.ph** | Self-sovereign individual identity (KYC) | Individuals + institutions | Solves personal identity, not business entity verification. Different document set entirely. |
| **DTI Central Business Portal** | Government-to-government data sharing for business registration | Government agencies | Does not extend to private institutions. UnionBank, Xendit, GCash do not read from DTI. |
| **Zyphe, KYC-Chain** | Global reusable KYC and KYB platforms | Mixed | Not Philippines-specific. No PDAX-equivalent anchor. No SEP-12 standardization. |

### Why incumbents cannot trivially copy

The institution-side incumbents (AsiaVerify, HyperVerge, Sumsub, Persona) cannot bolt on a portable, business-owned credential without rebuilding their revenue model. Their revenue depends on institutions paying per-verification. A reusable credential that a startup carries from one institution to the next cannibalizes that revenue. SelyoPass succeeds by being structurally on the opposite side of the market from these companies.

VYB is in a different category. They sit between an institution and that institution's downstream network (RTC and its sub-agents). SelyoPass sits between a business and the institutions it is integrating with. These are orthogonal axes, so VYB is more credible as a future partner than a future competitor.

A new entrant could copy the SelyoPass architecture, but the moat compounds: anchors that issue credentials, institutions that read them, and SEP-12 standardization across them. Network effects are slow to build and hard to dislodge once built.

### Regulatory positioning template

VYB has already shipped, in pilot, the exact regulatory framing SelyoPass needs to adopt. Their site says it explicitly: they do not conduct transaction monitoring, do not file regulatory reports, do not replace the institution's compliance officer, and final review authority stays with the regulated entity. Their role is to structure, standardize, and maintain KYB records.

SelyoPass should mirror this language nearly word for word. It is the version of the pitch that survives a compliance officer's first question, and a Philippine company has already validated that the BSP-supervised institutional buyer accepts it.

---

## Growth Vectors (conditional on the credential layer holding)

In rough order of plausibility:

1. **Continuous credentials.** KYB is not a one-time event. BSP requires periodic re-verification. A credential that updates over time (new GIS, new beneficial owners, new sanctions hits) is more valuable than a snapshot.
2. **Adjacent KYB asset types.** Officer KYC, audited financials, tax compliance proofs, permits, professional licenses, supply chain certifications, ESG records.
3. **Cross-border SEA expansion.** A Philippine startup expanding to Singapore, Indonesia, Vietnam carries the credential. ASEAN KYB harmonization has been promised for years and not delivered. Fragmentation is the moat.
4. **Marketplaces beyond banking.** Lazada and Shopee seller onboarding, procurement platforms, logistics, embedded finance providers. Lower regulatory bar, higher willingness to accept third-party verification as substantive input.
5. **Audit trail as a product.** Compliance teams must produce verification history during BSP examinations. The credential's continuity record is exactly that artifact.

---

## Open Hypotheses to Test

### Thursday founder interviews (highest priority)

Structure questions around past behavior, not future hypotheticals.

Acceptable: "Walk me through the last time you onboarded with a new payment partner."
Unacceptable: "Would you use SelyoPass."

The questions to drive the conversation toward:

1. **Does Dserve's pain generalize?** If two of three founders describe the same fragmented submission pattern unprompted, yes. If they describe a different pain or no pain, the problem statement is wrong.
2. **What does the startup currently do instead?** Manual Drive folder, compliance person, spreadsheet of which bank received which document. Whatever it is, that workaround is the actual competition.
3. **How much would a startup pay to skip the document chase across multiple integrations?** Zero willingness to pay kills the model. Pay once for one integration is a feature. Pay once for many integrations is a business.

### Separate validation tracks

4. **Would PDAX agree to be the bootstrap issuer?** Without this, the network does not start. Charles Racelis (VYB founder) declined to talk. PDAX requires direct outreach as a separate track.
5. **Would at least one bank or large payment provider commit to accepting credentials as preferred intake within six months?** Not commit to paying. Commit to reading and accepting structured data plus document hashes instead of raw PDF requests. One credible institutional logo separates "pilot project" from "real network."

---

## Decision Gate (end of this week)

By Friday end of day, evaluate Thursday's interviews against these criteria.

**Continue if:**
- Two or more of three founders describe Dserve's specific pain pattern unprompted
- They describe an existing workaround that is genuinely painful (multi-day document hunts, dedicated compliance person, repeated re-submissions)
- They volunteer some willingness to pay or invest time, even hypothetically

**Pivot if:**
- Founders describe a different but related pain (build for that pain, same architecture)
- They describe the same pain but say it is not painful enough to pay for (find a higher-pain customer segment)

**Stop if:**
- Founders do not recognize the pain at all
- They describe the pain but have a workaround that is actually fine
- They have all moved past the integration stage and the problem is concentrated in a narrower window than expected

The Stellar Level 3 submission still ships either way (the architectural work is valuable independent of go-to-market validation). The decision the gate gates is whether to keep building this as a startup company past the APAC submission on June 30.

---

## Stellar Level 1 – White Belt Status

### Mandatory Mechanics (testnet)

| # | Requirement | Status |
|---|-------------|--------|
| 1 | Connect Freighter wallet | ✅ |
| 2 | Disconnect Freighter wallet | ✅ |
| 3 | Fetch and display XLM balance | ✅ |
| 4 | Build and send XLM transaction on testnet | ✅ |
| 5 | Display success/failure with tx hash | ✅ |

### Submission Requirements

- [x] Public GitHub repository
- [x] README with setup instructions
- [x] README with screenshots
- [ ] Deployed application (public URL)

---

## Path to Stellar Level 3 + APAC Hackathon (June 30)

What to build, in order:

1. **SEP-12 KYB schema definition.** Extend SEP-12 fields for Philippine business documents (SEC, BIR, Mayor's Permit, Articles of Incorporation, beneficial ownership, GIS). This is the protocol contribution that makes Stellar essential to the architecture rather than decorative.
2. **Anchor-issued credential flow.** Replace the current XLM-payment-with-memo demo with an actual signed credential issued by a simulated anchor. The transaction now represents the credential issuance, not just a fee.
3. **Document hash verification.** Off-chain document storage (the startup keeps them locally, or via IPFS) with on-chain hash anchoring. Demonstrates that the document the institution reads matches what the anchor verified.
4. **Relying party reader.** A second view (or second app) that reads a credential, verifies its signature against the issuing anchor's public key, and surfaces the structured fields. This proves the consumption side of the network exists, not just the issuance side.
5. **Real PDAX or Stellar Development Foundation conversation.** The architectural credibility multiplies if there is a named ecosystem partner, even informally.

---

## Technical Stack & Implementation (reference)

### Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 18.3.1 |
| Build tool | Vite | 5.4.2 |
| Blockchain | Stellar Testnet | — |
| Wallet | Freighter Browser Extension | — |
| Stellar SDK | `@stellar/stellar-sdk` | ^12.3.0 |
| Wallet API | `@stellar/freighter-api` | ^2.0.0 |
| Horizon endpoint | `https://horizon-testnet.stellar.org` | — |

### Key Configuration

- `vite.config.js` defines `global: 'globalThis'` for browser polyfill (required by stellar-sdk)
- Network passphrase: `StellarSdk.Networks.TESTNET`
- Default target address: `GA5ZSEJYB37JTY5VT36F7VJECQDZ4XGFX7X76EAG677G6LTY6A6S7452`

### Application States

**Disconnected.** SelyoPass branding, single Freighter connect button, error messaging if extension is missing or connection rejected.

**Connected.** Header with logo and truncated wallet address, balance card, corporate identity form (company name, SEC number, target institution, fee), submit button, status card with transaction progress and Stellar Expert link.

### Transaction Flow (current Level 1)

1. User submits form
2. Load source account from Horizon
3. Build TransactionBuilder with payment operation, memo `SelyoPass:{SEC#}`, 60s timeout
4. Sign via Freighter `signTransaction()`
5. Reconstruct from XDR, submit to Horizon
6. Display hash + Stellar Expert link, or operation result error code

### Design Language

- Primary: Ocean Blue `#1b3a5c` (trust, depth)
- Accent: Mango Yellow `#f5a623` (warmth, energy)
- Background: `#f9fafb`
- Cards: white with subtle shadows
- Border radius: 12px (cards), 8px (inputs/buttons)
- Typography: Inter / system sans-serif
- Mobile breakpoint: 600px

### File Structure

```
SelyoPass/
├── .kiro/steering/project-context.md   ← this file
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx        # All app logic (single component)
│   └── App.css        # Complete styling
├── README.md
└── LICENSE
```

### Development Commands

```bash
npm run dev      # localhost:5173
npm run build    # dist/
npm run preview  # preview build
```

### Prerequisites

1. Node.js v18+
2. Freighter extension installed and on Testnet
3. Testnet account funded via Friendbot
4. Target address must be funded on testnet

---

## Pitch Positioning (revised)

### One-liner

"SelyoPass is a portable KYB credential platform on Stellar. Startups verify their corporate identity once with a regulated anchor and present a structured, signed credential to every future bank, payment partner, and marketplace. Institutions skip the document chase. Compliance authority stays theirs."

### What changed from earlier framing

- "verify once, share with every bank" → "verify once, present a credential institutions can read directly"
- "institutions read the credential instead of re-collecting documents" → "institutions skip the document collection step and complete their compliance work faster"
- KYC corrected to KYB throughout

### Differentiators to state proactively

1. **Structurally different from VYB, AsiaVerify, HyperVerge, Sumsub.** They sell verification to institutions. SelyoPass sells a portable credential to businesses. Different side of the market.
2. **Not eKYC.ph.** They solve personal identity. We solve business entity.
3. **Not solved by DTI.** Government interoperability does not extend to private institutions.
4. **Stellar SEP-12 plus PDAX.** SEP-12 is a published standard. PDAX is an existing BSP-licensed anchor. We extend a standard, we do not invent one.
5. **Non-custodial.** PDAX or any anchor is the verifier of record. SelyoPass is infrastructure.
6. **Compliance authority stays with institutions.** SelyoPass eliminates document collection, not compliance judgment.

### Why me framing (current state)

"This isn't a hypothetical. A founder running Dserve described it unprompted while explaining why his product launch was delayed. I am embedded in the Manila startup ecosystem. The pattern came to me directly."

Note: founder-market fit is currently weak (Alex did not personally suffer this pain). Strengthens with each additional founder interview that confirms the pattern. Thursday's conversations are the next data point.

---

## Anticipated Hard Questions

**"AsiaVerify (or HyperVerge or Sumsub) already does this."**
They sell verification to institutions. SelyoPass gives businesses a credential they own and present. The direction of control is opposite. They cannot bolt on a portable, business-owned credential without rebuilding their revenue model.

**"What about VYB Solutions?"**
VYB is orthogonal, not competitive. VYB helps a single institution manage KYB across many entities inside its own network (e.g., an RTC tracking 500 sub-agents). SelyoPass helps a single business carry verification across many institutions. Dserve is exactly the kind of customer VYB does not serve. Potentially complementary: VYB's verified records could be issued as SelyoPass credentials to make them portable downstream.

**"Has any institution agreed to accept this credential?"**
Not yet. The proposal is a standard, not a marketplace. The next step is a pilot with one anchor. PDAX is the natural first partner because they are already in the Stellar ecosystem and have BSP-licensed compliance infrastructure to be the issuer of record.

**"Are you legally allowed to do this?"**
SelyoPass collects business documents which contain personal data of officers and beneficial owners, which makes it a personal information controller under RA 10173. NPC registration and a privacy management program are required. SelyoPass does not assert AML compliance on behalf of relying institutions. The credential documents what was verified and by whom. Each relying institution makes its own compliance determination.

**"Why blockchain at all?"**
Three structural reasons. SEP-12 is a published Stellar standard for exchanging KYB data. Stellar's anchor model gives institutional credibility through licensed entities like PDAX. Per-verification fees are economically viable at Philippine startup deal sizes due to low transaction costs.

**"What is the business model?"**
Startups pay for credentials. Banks consume them at no cost initially. As the network grows, banks pay for API access, continuous monitoring, and formalized intake integration. Two-sided value, one-sided payment, standard early-stage marketplace pattern. Pricing not validated yet. Thursday interviews include willingness-to-pay questioning.

---

## Known Limitations & Caveats

1. **Customer validation incomplete.** Problem confirmed n=1 (Dserve). Generalization being tested Thursday.
2. **Founder-market fit gap.** Alex did not personally suffer this pain. Currently relying on access to the Manila startup ecosystem to compensate.
3. **Bootstrap unconfirmed.** PDAX participation is hypothetical. Charles Racelis (VYB) declined to talk. Direct PDAX outreach is the next track.
4. **Level 1 is mechanic demonstration.** Current on-chain transaction is XLM payment with memo. No actual credential issuance, no document storage, no verifier logic. That work is Level 3.
5. **Single-component architecture.** All logic in App.jsx. Acceptable for current scope.
6. **No persistent state.** Wallet disconnects on refresh. No backend.
7. **Freighter-only.** Standard for Stellar certification submissions.
8. **No input sanitization beyond basic checks.** SEC number truncated to 20 chars for memo.
9. **SEP-12 KYB extension is conceptual.** Specification work pending Level 3.

---

## Document Status

This is a steering document. It is updated as validation comes in. After Thursday interviews, the "Validated vs Hypothesis" section moves items from one column to the other. After PDAX outreach, the bootstrap section either firms up or pivots. Treat this document as a living hypothesis, not a finished plan.
