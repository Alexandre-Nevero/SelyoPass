// Shared synthetic test data. NO real corporate data or PII (TC-017 / BR-006).
import { sha256Hex } from '../hash.js';
import { buildCredential } from '../credential.js';
import { PH_DOCUMENT_TYPES } from '../schema.js';
import { SIMULATED_ANCHOR_PUBLIC_KEY } from '../anchorIdentity.js';

export async function syntheticDocumentHashes() {
  const hashes = {};
  for (const d of PH_DOCUMENT_TYPES) {
    hashes[d.key] = await sha256Hex(`SYNTHETIC-DOC:${d.key}`);
  }
  return hashes;
}

export async function validCredentialPayload(overrides = {}) {
  const documentHashes = await syntheticDocumentHashes();
  return buildCredential({
    organization: {
      name: 'Acme Synthetic Test Corp',
      registration_number: 'CS000000001',
      registration_date: '2024-01-15',
      director_name: 'Jane Synthetic',
      shareholder_name: 'John Synthetic',
    },
    beneficialOwners: [
      { name: 'Jane Synthetic', ownership_percentage: 60 },
      { name: 'John Synthetic', ownership_percentage: 40 },
    ],
    documentHashes,
    anchorPublicKey: SIMULATED_ANCHOR_PUBLIC_KEY,
    credentialId: 'selyo-test-0001',
    issuedAt: '2026-06-30T00:00:00.000Z',
    ...overrides,
  });
}
