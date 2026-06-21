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

"SelyoPass lets a business register its corporate identity once on-chain — and share verifiable proof with any institution that needs it.

Here's how it works at the protocol level: we're built on Stellar, specifically because Stellar already has SEP-12 — a standard API for exchanging identity information between anchors and clients. That standard was designed for individual KYC. We're extending it for Philippine business KYB documents.

The architecture is non-custodial. A trusted anchor — say PDAX or a partner institution — verifies the business documents. The verified credential lives on Stellar. Every future relying party reads that credential instead of re-collecting documents from scratch.

The business pays once. Verifies once. Opens doors everywhere."

---

## [1:45–2:30] The Demo — What You're Seeing Today

"What I'm showing you today is the Level 1 foundation — the core Stellar mechanics that this system runs on.

*(Show the app)*

Connect a Freighter wallet on testnet. Balance displays immediately from Horizon. Fill in the corporate identity form — company name, SEC number, target institution. Submit — and the app builds a payment transaction with the business identity embedded in the memo, prompts Freighter for signature, submits to testnet, and returns the transaction hash with a link to Stellar Expert.

That's wallet connection, balance fetch, transaction build, sign, submit, and clear success/failure feedback — all working on testnet right now."

---

## [2:30–3:00] Why This Matters — The Bigger Picture

"Every startup in the Philippines that wants to accept payments goes through this exact pain. It's not a hypothetical — it landed in my hands directly from a founder in my network, unprompted, while explaining why his product launch got delayed.

SelyoPass doesn't replace regulators or bypass compliance. It makes compliance *portable*. One verified mark — open doors everywhere.

Thank you."

---

## Anticipated Questions & Answers

**"Isn't this just eKYC.ph?"**
No — eKYC.ph solves personal identity (KYC). We solve business entity verification (KYB). Different documents, different relying parties, different product entirely.

**"Doesn't the government already share this data?"**
Only between government agencies for registration. Private institutions like UnionBank, Xendit, and GCash are not party to that data-sharing. They each run independent checks.

**"Why Stellar specifically?"**
SEP-12 already standardizes KYC data exchange. We're extending an existing standard for KYB rather than inventing a new protocol. Plus Stellar's low fees and fast finality make per-verification transactions economically viable.

**"Why are you building your friend's problem?"**
I'm embedded in the Manila startup community. This pattern — weeks lost to redundant compliance — came to me directly from a founder I know. I'm not claiming I suffered it personally; I'm claiming I have the access and context to solve it.

**"What's the business model?"**
Verification fee per institution onboarded (the XLM payment you see in the demo). Institutions save weeks of manual document review; startups save weeks of redundant submissions. Both sides have clear willingness to pay.
