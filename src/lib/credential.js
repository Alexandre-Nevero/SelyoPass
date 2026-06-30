// F-002 / F-004 — anchor-issued, ed25519-signed KYB credential.
//
// The credential's trust comes from the anchor's ed25519 signature over the
// canonical payload, verifiable offline against the anchor's public key
// (BR-001: the anchor is the verifier of record). SelyoPass never custodies
// documents — the payload carries only their SHA-256 hashes (BR-002, BR-004).
import { Buffer } from 'buffer';
import { Keypair } from '@stellar/stellar-sdk';
import { canonicalize } from './canonical.js';
import { sha256Hex } from './hash.js';
import {
  SCHEMA_ID,
  SCHEMA_EXTENDS,
  JURISDICTION,
  ORGANIZATION_FIELDS,
  PH_DOCUMENT_TYPES,
} from './schema.js';

// Fields that are stripped before computing the signed payload.
const SIGNATURE_FIELDS = ['signature', 'signed_payload_sha256'];

// Builds an unsigned credential payload from form input + locally computed
// document hashes. `anchorPublicKey` is embedded so it is part of the signed
// data and the reader knows which key to verify against.
export function buildCredential({ organization, beneficialOwners, documentHashes, anchorPublicKey, credentialId, issuedAt }) {
  const org = {};
  for (const f of ORGANIZATION_FIELDS) {
    org[f.key] = (organization?.[f.key] ?? '').toString().trim();
  }

  const document_hashes = {};
  for (const d of PH_DOCUMENT_TYPES) {
    if (documentHashes?.[d.key]) document_hashes[d.key] = documentHashes[d.key];
  }

  const beneficial_owners = (beneficialOwners || []).map((o) => ({
    name: (o.name ?? '').toString().trim(),
    ownership_percentage: Number(o.ownership_percentage),
  }));

  return {
    schema: SCHEMA_ID,
    schema_extends: SCHEMA_EXTENDS,
    jurisdiction: JURISDICTION,
    credential_id: credentialId || generateCredentialId(),
    issued_at: issuedAt || new Date().toISOString(),
    organization: org,
    beneficial_owners,
    document_hashes,
    anchor: {
      public_key: anchorPublicKey,
      role: 'verifier-of-record (BR-001) — SIMULATED testnet anchor',
    },
  };
}

// F-002 — the (simulated) anchor signs the canonical payload with ed25519.
export function signCredential(payload, anchorSecret) {
  const kp = Keypair.fromSecret(anchorSecret);
  if (payload.anchor?.public_key && payload.anchor.public_key !== kp.publicKey()) {
    throw new Error('anchor.public_key in the payload does not match the signing key');
  }
  const message = canonicalMessage(payload);
  const signature = kp.sign(message); // Buffer (ed25519 detached signature)
  return {
    ...payload,
    signature: signature.toString('base64'),
  };
}

// Adds the credential fingerprint (hash of the signed credential) — this is the
// value anchored on-chain (it is a hash, never document bytes; BR-002).
export async function withFingerprint(signedCredential) {
  const fp = await credentialFingerprintHex(signedCredential);
  return { ...signedCredential, signed_payload_sha256: fp };
}

// F-004 — verify the anchor's signature. If `trustedAnchorPublicKey` is given,
// also confirms the credential was issued by that known/trusted anchor.
export function verifyCredentialSignature(credential, trustedAnchorPublicKey) {
  if (!credential || typeof credential !== 'object') {
    return { valid: false, reason: 'credential is not an object' };
  }
  const anchorKey = credential.anchor?.public_key;
  if (!anchorKey) return { valid: false, reason: 'credential has no anchor public key' };
  if (!credential.signature) return { valid: false, reason: 'credential is not signed' };

  let signatureOk = false;
  try {
    const kp = Keypair.fromPublicKey(anchorKey);
    const message = canonicalMessage(credential);
    signatureOk = kp.verify(message, Buffer.from(credential.signature, 'base64'));
  } catch (e) {
    return { valid: false, reason: `signature check failed: ${e.message}` };
  }
  if (!signatureOk) {
    return { valid: false, reason: 'issuer signature does not verify against the anchor public key' };
  }

  const trustedAnchor = !trustedAnchorPublicKey || anchorKey === trustedAnchorPublicKey;
  return {
    valid: true,
    reason: 'signature verified',
    anchorPublicKey: anchorKey,
    trustedAnchor,
  };
}

// F-003 / F-004 — compare freshly computed document hashes (from the documents
// the holder presents) against the hashes anchored in the credential.
export function verifyDocumentHashes(credential, presentedHashes) {
  const anchored = credential?.document_hashes || {};
  const mismatches = [];
  const missing = [];
  for (const key of Object.keys(anchored)) {
    const presented = presentedHashes?.[key];
    if (!presented) {
      missing.push(key);
    } else if (presented !== anchored[key]) {
      mismatches.push(key);
    }
  }
  return { valid: mismatches.length === 0 && missing.length === 0, mismatches, missing };
}

// SHA-256 over the canonical signed credential — its public fingerprint.
export async function credentialFingerprintHex(signedCredential) {
  return sha256Hex(canonicalize(stripSignedExtras(signedCredential)));
}

// ── internal ────────────────────────────────────────────────────────────────

function canonicalMessage(credential) {
  const payload = stripFields(credential, SIGNATURE_FIELDS);
  return Buffer.from(new TextEncoder().encode(canonicalize(payload)));
}

function stripSignedExtras(credential) {
  // Fingerprint covers everything except the derived fingerprint itself.
  return stripFields(credential, ['signed_payload_sha256']);
}

function stripFields(obj, fields) {
  const copy = { ...obj };
  for (const f of fields) delete copy[f];
  return copy;
}

function generateCredentialId() {
  const rnd =
    globalThis.crypto?.randomUUID?.() ||
    Math.random().toString(16).slice(2) + Date.now().toString(16);
  return `selyo-${rnd}`;
}
