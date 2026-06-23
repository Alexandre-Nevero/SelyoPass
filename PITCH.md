# SelyoPass – 3-Minute Pitch Script

**Target audience:** Stellar certification judges / hackathon panel
**Time:** 3 minutes (approx. 450 words spoken)

---

## [0:00–0:30] The Problem — Lead with the Real Story

"A friend of mine runs a startup called Dserve — a marketplace platform here in the Philippines. When they were ready to launch, they hit a wall that had nothing to do with product or engineering.

They needed to onboard with UnionBank, Xendit, GCash for Business, and Google — and every single one of them asked for the same documents. SEC registration. BIR. Mayor's Permit. Articles of Incorporation. Beneficial Ownership.

Same company. Same documents. Four separate submissions. Four different forms. Four follow-up timelines. Weeks of delays — not because of product, but because of compliance paperwork."

---

## [0:30–1:00] The Insight — Why This Isn't Solved Yet

"You might think this is already solved. It's not — and here's why.

eKYC.ph does reusable identity for *individuals* — personal biometrics, government IDs. That's KYC. What Dserve needed is KY*B* — Know Your Business. Corporate entity verification. Completely different document set, completely different relying parties.

The government's DTI portal shares data between agencies like SEC and BIR — but only for the *registration* process itself. It does nothing for proving your compliance to *private* institutions afterward. UnionBank doesn't read from DTI's database. Xendit runs its own check.

That gap — between 'registered with the government' and 'proven compliant to private partners' — is exactly where SelyoPass lives."

---

## [1:00–1:45] The Solution — What SelyoPass Does

"SelyoPass lets a business verify its corporate identity once with a regulated Stellar anchor — and present a structured, signed credential to every future bank, payment partner, or marketplace.

Here's how it works at the protocol level: we're built on Stellar, specifically because Stellar already has SEP-12 — a published standard for exchanging KYC and KYB data between anchors and clients. That standard was designed for individual KYC. We're extending it for Philippine business KYB.

The architecture is non-custodial. A regulated anchor — initially PDAX, which already operates as a Stellar anchor with BSP VASP licensing — verifies the business documents and signs the credential. The startup retains the documents. The credential lives on Stellar.

When the startup approaches their next institution, that institution reads the credential through SEP-12, verifies the anchor's signature, validates the document hashes, and skips the document collection step. The institution still runs its own screening, decisioning, and audit trail. SelyoPass eliminates the document chase, not the compliance decision.

The business verifies once. Compliance authority stays with the institutions. Doors open faster everywhere."

---

## [1:45–2:30] The Demo — What You're Seeing Today

"What I'm showing you today is the Level 1 foundation — the core Stellar mechanics that this system runs on.

*(Show the app)*

Connect a Freighter wallet on testnet. Balance displays immediately from Horizon. Fill in the corporate identity form — company name, SEC number, target institution. Submit — and the app builds a payment transaction with the business identity embedded in the memo, prompts Freighter for signature, submits to testnet, and returns the transaction hash with a link to Stellar Expert.

That's wallet connection, balance fetch, transaction build, sign, submit, and clear success/failure feedback — all working on testnet right now."

---

## [2:30–3:00] Why This Matters — The Bigger Picture

"Every Philippine startup that wants to integrate with banks and payment partners goes through this exact pain. It's not a hypothetical — it landed in my hands directly from a founder in my network, unprompted, while explaining why his product launch got delayed.

SelyoPass doesn't replace regulators or bypass compliance. It eliminates the document collection step that sits in front of compliance work, while leaving the compliance decision exactly where the law puts it: with the regulated entity. One verified mark — open doors everywhere.

Thank you."

---

## Anticipated Questions & Answers

**"Isn't this just eKYC.ph?"**
No. eKYC.ph solves personal identity (KYC). SelyoPass solves business entity verification (KYB). Different documents, different relying parties, different product.

**"Doesn't the government already share this data?"**
Only between government agencies for the registration process itself. Private institutions like UnionBank, Xendit, and GCash are not party to that data-sharing. They each run independent KYB intake.

**"What about AsiaVerify, HyperVerge, Sumsub, Persona?"**
They sell verification capacity to institutions. SelyoPass gives the business a credential they own and present. The direction of control is opposite. They cannot bolt on a portable, business-owned credential without rebuilding their revenue model.

**"What about VYB Solutions?"**
Orthogonal, not competitive. VYB helps a single institution manage KYB across the entities inside its own distribution network — for example, a remittance company tracking 500 sub-agents. SelyoPass helps a single business carry verification across many institutions. Different problem entirely. Potentially complementary, not competitive.

**"Why Stellar specifically?"**
Three reasons. SEP-12 already standardizes KYC and KYB data exchange across the Stellar ecosystem. PDAX is already a BSP-licensed Stellar anchor — the verifier of record this product needs already exists. Stellar's transaction costs are low enough that per-verification fees are economically viable at Philippine startup deal sizes.

**"Are you legally allowed to do this?"**
SelyoPass collects business documents that contain personal data of officers and beneficial owners, so it operates as a personal information controller under RA 10173 (NPC registration and a privacy management program required). SelyoPass does not assert AML compliance on behalf of the relying institution. The credential documents what was verified and by whom. Each relying institution makes its own compliance determination. This is the same regulatory posture VYB Solutions has already shipped past Philippine compliance scrutiny in pilot.

**"Why are you building your friend's problem?"**
I'm embedded in the Manila startup community. This pattern — weeks lost to redundant compliance — came to me directly from a founder I know. I'm not claiming I suffered it personally. I'm claiming I have the access and context to solve it, and I'm validating the pattern with additional founder interviews this week.

**"What's the business model?"**
Startups pay for the credential. Banks and payment partners consume it at no cost initially — they get a faster intake plus a useful risk signal from a regulated anchor's signature. As the network grows, institutions pay later for API access, continuous monitoring, and formalized intake integration. Two-sided value, one-sided payment, standard early-stage marketplace pattern (LinkedIn and early Plaid both used variants of it). Pricing and willingness to pay are still being validated.

**"Has any institution agreed to accept this credential?"**
Not yet. We're proposing a standard, not claiming a marketplace. The next step is a pilot with one anchor. PDAX is the natural first partner because they're already in the Stellar ecosystem and already have the BSP-licensed compliance infrastructure to be the issuer of record.
