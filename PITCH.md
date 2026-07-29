# SelyoPass — Current Pitch Draft

This is a rehearsal draft, not submission evidence. The release-bound source is [docs/pitch-kit.md](./docs/pitch-kit.md); URLs, contract IDs, transaction hashes, screenshots, and test counts must come from [submission/evidence.json](./submission/evidence.json) after its status becomes `ready`.

## Three-minute narrative

Early-stage Philippine startups can submit the same corporate document pack repeatedly when integrating with banks and payment providers. One founder interview exposed this delay, but the pain has not yet been shown to generalize beyond that interview.

SelyoPass tests a narrower mechanism: a startup keeps its documents, hashes them locally, and asks a simulated testnet anchor to issue a portable credential. The startup can later present its local package to another institution. That institution checks separate pieces of evidence—the on-chain record, issuer authorization, document fingerprints, lifecycle status, and issuance event—without treating any of them as a compliance approval.

The prototype uses two Soroban contracts:

1. Anchor Registry records which testnet issuer addresses the administrator has authorized.
2. Credential Registry accepts startup-authorized hash-only requests and calls Anchor Registry before an issuer can issue a credential.

The browser never contains an anchor secret. Freighter and Albedo authorize contract actions through Stellar Wallets Kit. Public verification needs no wallet. Documents and beneficial-owner data stay off-chain.

The demo should show one end-to-end path:

1. On `#/prepare`, hash a synthetic document locally, review the exact public payload, connect a supported testnet wallet, and request the credential.
2. On `#/anchor`, connect the pre-authorized simulated-anchor wallet and issue the pending request through the cross-contract authorization check.
3. On `#/verify`, load the local package and show each integrity result independently, beside the statement: **Your institution still makes its own KYB decision.**
4. Show the confirmed transactions, contract IDs, Explorer links, and observed contract events from the release-bound evidence manifest.

Today this demonstrates a real protocol path, not institutional acceptance. The anchor is simulated, data is synthetic, the network is testnet, and no relying institution has agreed to accept the credential. The next falsifiable step is to test whether one regulated institution will accept the package as an intake input while retaining its own screening and decision process.

## Claims that must not enter the submission

- “Verified business,” “approved,” or “compliant.”
- A real anchor partnership or issuer commitment.
- A production, mainnet, or real-data deployment.
- Reduced onboarding time, cost savings, willingness to pay, or market-wide demand without evidence.
- A live URL, contract ID, transaction hash, event, screenshot, or test count not tied to the release SHA.
