import { describe, expect, it } from 'vitest';
import { Keypair } from '@stellar/stellar-sdk';
import { canonicalize } from '../canonical.js';
import { verifyCredentialSignature } from '../credential.js';

describe('public credential signature verification', () => {
  it('checks a signature without requiring a browser-held issuer secret', () => {
    const issuer = Keypair.random();
    const unsigned = { credential_id: 'sp-1', anchor: { public_key: issuer.publicKey() }, document_hashes: { bir: 'a'.repeat(64) } };
    const signature = issuer.sign(Buffer.from(canonicalize(unsigned))).toString('base64');
    expect(verifyCredentialSignature({ ...unsigned, signature }, issuer.publicKey())).toMatchObject({ valid: true, trustedAnchor: true });
  });
  it('rejects a malformed signature', () => {
    expect(verifyCredentialSignature({ anchor: { public_key: 'invalid' }, signature: 'nope' })).toMatchObject({ valid: false });
  });
});
