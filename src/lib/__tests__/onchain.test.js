import { describe, it, expect } from 'vitest';
import { buildAnchorValue, anchorDataName } from '../onchain.js';
import { signCredential, credentialFingerprintHex } from '../credential.js';
import { getSimulatedAnchorSecret } from '../anchorIdentity.js';
import { validCredentialPayload } from './fixtures.js';

describe('on-chain anchor value (BR-002 — hash only, never documents/PII)', () => {
  it('encodes exactly the 32-byte SHA-256 fingerprint', async () => {
    const signed = signCredential(await validCredentialPayload(), getSimulatedAnchorSecret());
    const fp = await credentialFingerprintHex(signed);
    const value = buildAnchorValue(fp);
    expect(value.length).toBe(32);
  });

  it('refuses anything that is not a clean 64-char hex hash (cannot leak data)', () => {
    expect(() => buildAnchorValue('Acme Synthetic Test Corp')).toThrow();
    expect(() => buildAnchorValue('')).toThrow();
    expect(() => buildAnchorValue('xyz')).toThrow();
  });

  it('the anchored value contains none of the credential PII fields', async () => {
    const signed = signCredential(await validCredentialPayload(), getSimulatedAnchorSecret());
    const fp = await credentialFingerprintHex(signed);
    const valueStr = buildAnchorValue(fp).toString('latin1');
    for (const pii of [
      signed.organization.name,
      signed.organization.director_name,
      signed.organization.shareholder_name,
    ]) {
      expect(valueStr.includes(pii)).toBe(false);
    }
  });

  it('builds a manageData name within the 64-byte limit', async () => {
    const signed = signCredential(await validCredentialPayload(), getSimulatedAnchorSecret());
    const name = anchorDataName(signed.credential_id);
    expect(Buffer.byteLength(name, 'utf8')).toBeLessThanOrEqual(64);
    expect(name.startsWith('selyopass:')).toBe(true);
  });
});
