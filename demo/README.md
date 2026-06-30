# Demo Materials

These are **synthetic** files for demonstrating SelyoPass. They contain no real
corporate data, no real beneficial-owner PII, and no real document content
(BR-006 / TC-017). Use them when recording the demo video or presenting live.

## Form data to enter

| Field | Value to type |
|-------|---------------|
| Registered company name | Dserve Technologies Inc. |
| SEC registration number | CS202412345 |
| Date of registration | 2024-03-15 |
| Director name | Juan Dela Cruz |
| Shareholder name | Maria Santos |

## Beneficial owners (UBO)

| Name | Ownership % |
|------|-------------|
| Juan Dela Cruz | 60 |
| Maria Santos | 40 |

## Documents to upload

Upload each file from this `demo/` folder:

| Document type | File to upload |
|---------------|----------------|
| SEC Registration | `sec-registration.txt` |
| BIR Certificate | `bir-certificate.txt` |
| Mayor's Permit | `mayors-permit.txt` |
| Articles of Incorporation | `articles-of-incorporation.txt` |
| General Information Sheet (GIS) | `gis.txt` |

## Demo flow (for the video)

1. Open the app → show the landing page (SelyoPass branding)
2. Click **Connect Freighter** → approve in the popup
3. Fill the form with the data above
4. Upload the 5 files from this folder
5. Click **Issue Credential** → show it signs instantly
6. Click **Download credential JSON** → save the file
7. Click **Anchor hash on Stellar testnet** → approve in Freighter → show tx link
8. Switch to the **Verify** tab
9. Load the downloaded credential JSON
10. Re-upload the same 5 files as "presented documents"
11. Click **Verify Credential** → show the green "VERIFIED TRANSMISSION" result
12. Point out the disclaimer: "not a compliance stamp"
13. (Optional) Tamper demo: change one file, re-verify → show the hash mismatch rejection

Total time: ~90 seconds if you move quickly.
