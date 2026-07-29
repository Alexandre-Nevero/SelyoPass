# Synthetic Demo Materials

These files are synthetic test fixtures. They contain no real corporate data or real beneficial-owner PII. Use them only on Stellar Testnet.

## Current release demo

The release-bound demo must use the contract IDs and hashes in `deployments/testnet.json` and the evidence tied to the same release SHA in `submission/evidence.json`. If either manifest is still a draft, do not present the flow as deployed.

1. Open `#/prepare`.
2. Explain that selected files stay local and only hashes enter the public request.
3. Enter a synthetic organization label and a credential ID.
4. Enter a ledger later than the current Testnet ledger.
5. Upload one or more files from this directory.
6. Review the wallet subject, credential ID hash, document root, schema hash, and expiry.
7. Connect Freighter or Albedo and request the credential.
8. Show the confirmed transaction receipt and Explorer link.
9. Open the explicitly labelled `#/anchor` simulated-anchor console.
10. Connect the pre-authorized simulated-anchor wallet and issue the same credential ID.
11. Show the Anchor Registry authorization result, issuance transaction, and contract event.
12. Download or retain the local presentation package.
13. Open `#/verify` without a wallet, load the package, and re-upload the same local files.
14. Run integrity checks and explain each evidence row independently.
15. Point to: “Your institution still makes its own KYB decision.”

For a negative check, substitute `bir-certificate-TAMPERED.txt` for `bir-certificate.txt`; the local document-root check must fail without changing the independent chain checks.

Do not show the retired browser-side issuer, “VERIFIED TRANSMISSION,” Classic `manageData`, or self-signed credential flow. Do not claim a real anchor partnership, institutional acceptance, production data, or mainnet deployment.
