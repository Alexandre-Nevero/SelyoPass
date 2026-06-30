import { describe, it, expect } from 'vitest';
import { validateCredential } from '../schema.js';
import { validCredentialPayload } from './fixtures.js';

describe('validateCredential (F-001)', () => {
  it('accepts a complete credential (TC-001)', async () => {
    const { valid, errors } = validateCredential(await validCredentialPayload());
    expect(errors).toEqual([]);
    expect(valid).toBe(true);
  });

  it('rejects a missing required organization field with a field-level error (TC-002)', async () => {
    const c = await validCredentialPayload();
    delete c.organization.director_name;
    const { valid, errors } = validateCredential(c);
    expect(valid).toBe(false);
    expect(errors.some((e) => e.field === 'organization.director_name')).toBe(true);
  });

  it('rejects a missing required document hash (TC-002)', async () => {
    const c = await validCredentialPayload();
    delete c.document_hashes.bir_certificate;
    const { valid, errors } = validateCredential(c);
    expect(valid).toBe(false);
    expect(errors.some((e) => e.field === 'document_hashes.bir_certificate')).toBe(true);
  });

  it('rejects a malformed document hash (not 64-char hex)', async () => {
    const c = await validCredentialPayload();
    c.document_hashes.sec_registration = 'not-a-hash';
    const { valid, errors } = validateCredential(c);
    expect(valid).toBe(false);
    expect(errors.some((e) => e.field === 'document_hashes.sec_registration')).toBe(true);
  });

  it('requires at least one beneficial owner (BR-005 / TC-003)', async () => {
    const c = await validCredentialPayload();
    c.beneficial_owners = [];
    const { valid, errors } = validateCredential(c);
    expect(valid).toBe(false);
    expect(errors.some((e) => e.field === 'beneficial_owners')).toBe(true);
  });

  it('rejects an invalid ownership percentage (BR-005)', async () => {
    const c = await validCredentialPayload();
    c.beneficial_owners = [{ name: 'Jane Synthetic', ownership_percentage: 0 }];
    const { valid, errors } = validateCredential(c);
    expect(valid).toBe(false);
    expect(errors.some((e) => e.field === 'beneficial_owners[0].ownership_percentage')).toBe(true);
  });
});
