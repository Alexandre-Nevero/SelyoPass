# SelyoPass

> **One verified mark. Open doors everywhere.**

## Overview

SelyoPass is a portable Know Your Business (KYB) credential platform built on the Stellar blockchain.

Early-stage Philippine startups face fragmented and repetitive KYB onboarding when integrating with banks, payment gateways, and other regulated financial institutions. Every institution requires nearly identical business documents — SEC registration, BIR certificate, Mayor's Permit, Articles of Incorporation, beneficial ownership disclosure — and each runs an independent intake cycle even though they are verifying the same legal entity. The result is weeks of compounded delay before each integration goes live.

SelyoPass lets a startup get verified once by a regulated Stellar anchor and present a signed, structured, independently verifiable credential to every future bank, payment partner, or marketplace. Institutions skip the document collection step and complete their compliance work faster while keeping full decision authority. **SelyoPass is a secure data courier, not a compliance stamp** — it removes the document collection step, never the institution's compliance judgment.

This branch is the **Stellar Level 3 + APAC submission MVP**: the full issue → anchor → verify credential loop on Stellar testnet.

### MVP capabilities

| ID | Capability |
|----|-----------|
| **F-001** | SEP-12-extended KYB credential schema for PH business documents (SEC, BIR, Mayor's Permit, Articles of Incorporation, GIS) + beneficial-ownership (UBO) fields |
| **F-002** | Anchor-issued, **ed25519-signed** credential; the credential **hash is anchored on Stellar testnet** |
| **F-003** | Documents are **hashed locally** (SHA-256) — only the hash is recorded; SelyoPass never stores documents |
| **F-004** | Relying-party reader: verifies the anchor signature and re-checks document hashes |
| **F-005** | Mobile-responsive issuance + verification views |
| **F-006** | Error and loading states across wallet connect, issuance, and verification |

### How it works

1. **Issue (startup).** Fill the KYB form and attach documents. Each document is hashed in your
   browser. The simulated anchor signs the credential (ed25519). You can download the credential
   JSON and anchor its hash on Stellar testnet via Freighter.
2. **Anchor (on-chain).** A single `manageData` transaction records **only** the 32-byte credential
   fingerprint on testnet — never documents or personal data. You get a transaction hash.
3. **Verify (relying party).** Paste the credential, present the documents again, and the reader
   verifies the anchor's signature and that every presented document still matches its anchored
   hash. The result states what was cryptographically verified — not a "trust-this-business" stamp.

---

## Everything here is free

No paid APIs, no freemium, no hosted services:

- **Stellar testnet** + **Friendbot** — free
- **Freighter** wallet — free
- **SHA-256** via the browser's built-in Web Crypto API — no library, no service
- **ed25519** signing/verification via `@stellar/stellar-sdk` — free
- **Vitest** (tests) and **GitHub Actions** (CI) — free / open source

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| Blockchain | Stellar Testnet (`@stellar/stellar-sdk`) |
| Wallet | Freighter (`@stellar/freighter-api`) |
| Hashing | Web Crypto API (SHA-256) |
| Signing | ed25519 (Stellar keypair) |
| Tests / CI | Vitest / GitHub Actions |

---

## Setup

### Prerequisites

- **Node.js** v18+ and **npm**
- **Freighter** browser extension ([install](https://www.freighter.app/)), set to **Testnet**
- A funded testnet account ([Friendbot](https://friendbot.stellar.org/)) — needed only to anchor on-chain

### Install & run

```bash
git clone https://github.com/Alexandre-Nevero/SelyoPass.git
cd SelyoPass
npm install
npm run dev        # http://localhost:5173
```

### Test & build

```bash
npm run test:run   # run the unit test suite once
npm test           # watch mode
npm run build      # production build → dist/
```

---

## Usage

**Issue a credential (startup):** open the **Issue** tab, fill the company + UBO fields, attach the
five documents (hashed locally), and click **Issue Credential**. Download the JSON, then optionally
**Connect Freighter** and **Anchor hash on Stellar testnet** for an on-chain record + tx hash.

**Verify a credential (relying party):** open the **Verify** tab, load/paste the credential JSON,
present the documents, and click **Verify Credential**. The reader checks the anchor signature and
the document hashes and shows a per-check result.

---

## Important notes (scope & honesty)

- **The anchor is simulated.** For the MVP the regulated anchor (e.g. PDAX) is simulated by a
  throwaway **testnet** keypair (see `src/lib/anchorIdentity.js`). Signature/issuance tests prove the
  mechanism against a synthetic issuer — not that a real regulated anchor participates. Real
  issuer-key custody is an open question (see `docs/12-security-compliance.md`).
- **On-chain anchoring uses a classic `manageData` transaction, not a Soroban contract (yet).** The
  docs target a Soroban smart contract for F-002; the on-chain layer is isolated in
  `src/lib/onchain.js` so a Soroban contract can replace it without touching the rest. The
  credential's trust (the ed25519 anchor signature) is unchanged either way.
- **Testnet only. Synthetic data only.** No mainnet, no real corporate data or beneficial-owner PII
  (BR-006).

### On-chain artifact (testnet)

A real testnet transaction anchoring a demo credential hash:

- **Interaction tx hash:** [`3ec971accbb9b788fee6d4c2ac142b022c6abd6ea21667777fdd12a54e58c350`](https://stellar.expert/explorer/testnet/tx/3ec971accbb9b788fee6d4c2ac142b022c6abd6ea21667777fdd12a54e58c350)
- **Anchoring account:** [`GBGGWBUTTJCQAQRF6DI3T4WKPSVWHZMWGAAKBWHNOG6BEKJMQD3PQXLT`](https://stellar.expert/explorer/testnet/account/GBGGWBUTTJCQAQRF6DI3T4WKPSVWHZMWGAAKBWHNOG6BEKJMQD3PQXLT)
- **Data entry:** `selyopass:selyo-demo-level3` → 32-byte SHA-256 credential fingerprint

See [`docs/`](./docs) for the full PRD, system design, data model, QA plan, and security/compliance
analysis.

---

## Project Structure

```
SelyoPass/
├── .github/workflows/ci.yml      # free CI: test + build
├── docs/                         # PRD, system design, data model, QA, security
├── index.html
├── package.json
├── vite.config.js
├── vitest.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx                   # shell: connect + Issue/Verify tabs
│   ├── App.css
│   ├── components/
│   │   ├── IssuerView.jsx        # F-001/F-002/F-003 issuance
│   │   └── ReaderView.jsx        # F-004 verification
│   └── lib/
│       ├── schema.js             # F-001 KYB schema + validation
│       ├── hash.js               # F-003 SHA-256 (Web Crypto)
│       ├── canonical.js          # deterministic serialization
│       ├── credential.js         # F-002/F-004 sign + verify (ed25519)
│       ├── onchain.js            # F-002 on-chain hash anchoring (BR-002)
│       ├── anchorIdentity.js     # simulated testnet anchor
│       ├── wallet.js             # Freighter wrapper
│       ├── stellar.js            # testnet config
│       └── __tests__/            # Vitest unit tests
└── README.md
```

---

## License

Open source under the [LICENSE](./LICENSE) file.
