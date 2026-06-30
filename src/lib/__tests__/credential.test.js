import { describe, it, expect } from 'vitest';
import {
  signCredential,
  verifyCredentialSignature,
  verifyDocumentHashes,
} from '../credential.js';
import {
  getSimulatedAnchorSecret,
  SIMULATED_ANCHOR_PUBLIC_KEY,
  TRUSTED_ANCHOR_PUBLIC_KEY,
} from '../anchorIdentity.js';
import { validCredentialPayload, syntheticDocumentHashes } from './fixtures.js';
import { Keypair } from '@stellar/stellar-sdk';

const ANCHOR_SECRET = getSimulatedAnchorSecret();

describe('issue + verify credential (F-002 / F-004)', () => {
  it('verifies a credential signed by the simulated anchor (TC-009)', async () => {
    const signed = signCredential(await validCredentialPayload(), ANCHOR_SECRET);
    const result = verifyCredentialSignature(signed, TRUSTED_ANCHOR_PUBLIC_KEY);
    expect(result.valid).toBe(true);
    expect(result.trustedAnchor).toBe(true);
    expect(result.anchorPublicKey).toBe(SIMULATED_ANCHOR_PUBLIC_KEY);
  });

  it('rejects a credential whose body was tampered after signing (TC-010)', async () => {
    const signed = signCredential(await validCredentialPayload(), ANCHOR_SECRET);
    signed.organization.name = 'Evil Corp'; // tamper after signing
    const result = verifyCredentialSignature(signed, TRUSTED_ANCHOR_PUBLIC_KEY);
    expect(result.valid).toBe(false);
  });

  it('rejects a credential with a corrupted signature (TC-010)', async () => {
    const signed = signCredential(await validCredentialPayload(), ANCHOR_SECRET);
    signed.signature = signed.signature.replace(/^.{4}/, 'AAAA');
    const result = verifyCredentialSignature(signed, TRUSTED_ANCHOR_PUBLIC_KEY);
    expect(result.valid).toBe(false);
  });

  it('flags an untrusted anchor even when the signature is valid', async () => {
    const rogue = Keypair.random();
    const payload = await validCredentialPayload({ anchorPublicKey: rogue.publicKey() });
    const signed = signCredential(payload, rogue.secret());
    const result = verifyCredentialSignature(signed, TRUSTED_ANCHOR_PUBLIC_KEY);
    expect(result.valid).toBe(true); // signature itself is valid
    expect(result.trustedAnchor).toBe(false); // but not the trusted anchor
  });

  it('throws if the signing key does not match the embedded anchor key', async () => {
    const payload = await validCredentialPayload(); // anchor = simulated anchor
    const wrong = Keypair.random();
    expect(() => signCredential(payload, wrong.secret())).toThrow();
  });
});

describe('verifyDocumentHashes (F-003 / F-004)', () => {
  it('accepts when presented documents match the anchored hashes (TC-007)', async () => {
    const signed = signCredential(await validCredentialPayload(), ANCHOR_SECRET);
    const presented = await syntheticDocumentHashes();
    const result = verifyDocumentHashes(signed, presented);
    expect(result.valid).toBe(true);
  });

  it('rejects when a presented document does not match (TC-011)', async () => {
    const signed = signCredential(await validCredentialPayload(), ANCHOR_SECRET);
    const presented = await syntheticDocumentHashes();
    presented.bir_certificate = 'f'.repeat(64); // wrong hash
    const result = verifyDocumentHashes(signed, presented);
    expect(result.valid).toBe(false);
    expect(result.mismatches).toContain('bir_certificate');
  });

  it('reports a missing presented document', async () => {
    const signed = signCredential(await validCredentialPayload(), ANCHOR_SECRET);
    const presented = await syntheticDocumentHashes();
    delete presented.mayors_permit;
    const result = verifyDocumentHashes(signed, presented);
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('mayors_permit');
  });
});
