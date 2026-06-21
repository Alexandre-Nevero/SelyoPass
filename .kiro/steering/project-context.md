# SelyoPass – Full Project Context

## Identity

- **Project Name:** SelyoPass
- **Tagline:** One verified mark. Open doors everywhere.
- **What it is:** A reusable Know-Your-Business (KYB) identity credential built on the Stellar blockchain testnet.
- **Submission target:** Stellar Level 1 – White Belt Certification

---

## Origin Story & Business Context

### The Problem (from Dserve, a real Philippine startup)

Early-stage startups face fragmented, repetitive KYC/KYB onboarding when integrating with banks, payment gateways, and regulated financial institutions. Every institution requires nearly identical business documents (SEC registration, BIR, Mayor's Permit, Articles of Incorporation, Beneficial Ownership), but each demands a separate submission, verification cycle, and follow-up. This causes weeks of delays and slows product launches.

**Real example:** Dserve had to submit nearly identical compliance documents separately to UnionBank, Xendit, GCash for Business, and Google programs — each with different forms, timelines, and follow-up processes — despite all verifying the same legal entity.

### The Narrow Problem

There is no standardized, reusable business KYB identity that startups can securely share across multiple financial institutions and service providers.

### Target Customers

- Early-stage startups
- SMEs
- Fintech startups
- Marketplace platforms
- SaaS companies
- Any business onboarding with banks, payment gateways, or financial service providers

### Competitive Differentiation

| Competitor/Alternative | What they do | Why SelyoPass is different |
|------------------------|--------------|---------------------------|
| **eKYC.ph** | Self-sovereign *individual* identity (personal biometrics, government ID) | SelyoPass solves *business entity* (KYB) verification — corporate documents, not personal identity |
| **DTI Central Business Portal** | Government-to-government data sharing for the registration process (SEC, BIR, SSS, PhilHealth) | Only covers government agencies; does NOT extend to private institutions (UnionBank, Xendit, GCash) |
| **Zyphe, KYC-Chain** | Global reusable KYC/KYB platforms | Not Philippines-specific; SelyoPass targets PH regulatory context and local document types |

**Key insight:** Even the most sophisticated Philippine government interoperability initiative (DTI/BNRS data-sharing) doesn't extend to private-sector relying parties. That gap between "registered with government" and "proven compliant to private partners" is exactly where SelyoPass lives.

---

## Technical Architecture

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

- `vite.config.js` defines `global: 'globalThis'` to polyfill Node.js global for browser environment (required by stellar-sdk)
- Network passphrase: `StellarSdk.Networks.TESTNET`
- Default target address: `GA5ZSEJYB37JTY5VT36F7VJECQDZ4XGFX7X76EAG677G6LTY6A6S7452`

### Application States

**State 1 – Disconnected:**
- SelyoPass branding (logo mark, title, tagline, description)
- Single "Connect Freighter Wallet" button
- Error messaging if Freighter not installed or connection rejected

**State 2 – Connected:**
- Header with logo, truncated wallet address, disconnect button
- Balance card showing XLM balance from testnet Horizon
- "Register Corporate Identity" form with:
  - Company Registered Name (text)
  - SEC Registration Number (text)
  - Target Institution Address (text, defaults to target address)
  - Verification Fee in XLM (number, defaults to 10)
- Submit button: "Submit Profile & Send XLM"
- Status/result card showing transaction progress, success/failure, and Stellar Expert link

### Transaction Flow

1. User fills form and clicks submit
2. App loads source account from Horizon
3. Builds `TransactionBuilder` with:
   - `payment` operation (XLM to target address)
   - `Memo.text` containing `SelyoPass:{SEC number truncated to 20 chars}`
   - 60-second timeout
4. Prompts Freighter for signature via `signTransaction()`
5. Reconstructs signed transaction from XDR
6. Submits to Horizon testnet
7. On success: displays hash + link to `stellar.expert/explorer/testnet/tx/{hash}`
8. On failure: extracts operation result codes and displays error

### Design Language

- **Primary:** Ocean Blue (`#1b3a5c`) — trust, depth
- **Accent:** Mango Yellow (`#f5a623`) — warmth, energy
- **Background:** Light gray (`#f9fafb`)
- **Cards:** White with subtle shadows
- **Border radius:** 12px (cards), 8px (inputs/buttons)
- **Typography:** Inter / system sans-serif
- **Mobile responsive** with column layout breakpoint at 600px

---

## Stellar Level 1 – White Belt Certification Requirements

### Mandatory Mechanics (all must work on testnet)

| # | Requirement | Implementation Status |
|---|-------------|----------------------|
| 1 | Connect Freighter wallet | ✅ `connectWallet()` using `isConnected()` + `getAddress()` |
| 2 | Disconnect Freighter wallet | ✅ `disconnectWallet()` clears all state |
| 3 | Fetch and display XLM balance | ✅ `fetchBalance()` via Horizon `loadAccount()` |
| 4 | Build and send XLM transaction on testnet | ✅ `handleSubmit()` builds, signs, submits |
| 5 | Display success/failure states with tx hash | ✅ Status card with conditional styling + Stellar Expert link |

### Additional Submission Requirements

- [x] Public GitHub repository
- [x] README with setup instructions
- [x] README with screenshot placeholders
- [ ] Screenshots of: wallet connected, balance displayed, successful transaction, transaction result
- [ ] Deployed application (public URL)

---

## Stellar Protocol Context (for future extension)

### Relevant SEPs

- **SEP-10:** Authentication — web apps prove wallet ownership
- **SEP-12:** KYC API — standardized identity field exchange between anchors and clients (currently individual-focused; extending to KYB is the innovation)
- **SEP-24:** Interactive deposit/withdraw — the onramp flow that PDAX uses

### How SelyoPass Extends to Full KYB (Future Vision)

The Level 1 submission demonstrates the foundational mechanics. The full vision:

1. Startup completes KYB once through SelyoPass
2. Documents verified by a trusted anchor (e.g., PDAX or partner)
3. Verified credential issued as a SEP-12-formatted record on Stellar
4. Any future institution reads that credential instead of re-collecting documents
5. Payment/fee sent via Stellar confirms the verification relationship on-chain

**Legal positioning:** The verifying institution (anchor) remains the verifier of record. SelyoPass never custodies assets — it's infrastructure, not a financial service.

---

## File Structure

```
SelyoPass/
├── .git/
├── .vscode/
├── .kiro/
│   └── steering/
│       └── project-context.md    ← this file
├── index.html                     ← Vite entry HTML
├── package.json                   ← dependencies & scripts
├── vite.config.js                 ← Vite + React + global polyfill
├── src/
│   ├── main.jsx                   ← React root render
│   ├── App.jsx                    ← All application logic (single component)
│   └── App.css                    ← Complete styling
├── README.md                      ← Submission README with setup & screenshots
└── LICENSE
```

---

## Development Commands

```bash
npm run dev      # Start dev server at localhost:5173
npm run build    # Production build to dist/
npm run preview  # Preview production build locally
```

---

## Prerequisites for Running

1. Node.js v18+
2. Freighter browser extension installed and set to **Testnet**
3. Testnet account funded via [Friendbot](https://friendbot.stellar.org/)
4. Target address (`GA5ZSEJYB37JTY5VT36F7VJECQDZ4XGFX7X76EAG677G6LTY6A6S7452`) must also exist on testnet (funded)

---

## Pitch Positioning (for reference)

### One-liner
"SelyoPass lets Philippine startups verify their business identity once on Stellar and share it with every bank and payment gateway that needs it — no more repeating compliance paperwork."

### Key differentiators to state proactively in any pitch:
1. **Not eKYC.ph** — they solve personal identity; we solve business entity (KYB)
2. **Not solved by DTI/BNRS** — government interoperability doesn't extend to private relying parties like UnionBank, Xendit, GCash
3. **Built on Stellar specifically** because SEP-12 already standardizes KYC/KYB data exchange — we're extending it for Philippine business documents, not reinventing the wheel
4. **Non-custodial** — PDAX or any anchor remains verifier of record; SelyoPass is infrastructure

### "Why you" framing (since problem is borrowed from Dserve):
"This isn't a hypothetical. A founder running Dserve told me this unprompted while describing why his product launch got delayed. I'm embedded in the Manila startup ecosystem and this pattern — weeks lost to redundant compliance — came to me directly."

---

## Known Limitations & Caveats

1. **Level 1 is a demo, not production:** The on-chain transaction is a plain XLM payment with a memo. There's no actual credential issuance, no document storage, no verifier logic. That's intentional for White Belt scope.
2. **Single-component architecture:** All logic lives in `App.jsx`. Acceptable for this scope; would refactor into hooks + components for production.
3. **No persistent state:** Wallet disconnects on page refresh. No backend, no database.
4. **Freighter-only:** No support for other Stellar wallets (Albedo, Rabet, xBull). Freighter is the standard for Stellar certification submissions.
5. **Target address must be funded:** If the target address doesn't exist on testnet, the payment operation will fail with `op_no_destination`.
6. **No input sanitization beyond basic checks:** The SEC number is truncated to 20 chars for memo, but there's no format validation.
7. **SEP-12 KYB extension is conceptual:** The pitch references extending SEP-12 for business entities, but the current implementation doesn't use SEP-12 — that's future work beyond Level 1.
