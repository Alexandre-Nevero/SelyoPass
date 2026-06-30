// F-002 (on-chain anchoring) — records ONLY the credential fingerprint hash on
// Stellar testnet via a manageData entry. BR-002: documents and PII never go
// on-chain. This module is the swap point for a future Soroban contract: it is
// the only place that writes to the ledger.
//
// NOTE ON SCOPE: idea.md §7 F-002 targets a Soroban smart contract. This MVP
// anchors the hash with a classic manageData operation because the build
// environment has no Rust/soroban toolchain (documented deviation; idea.md §9
// technical kill-criterion permits narrowing). The trust model (the anchor's
// ed25519 signature) is unchanged.
import { Buffer } from 'buffer';
import * as StellarSdk from '@stellar/stellar-sdk';
import { NETWORK_PASSPHRASE, horizonServer } from './stellar.js';
import { hexToBytes } from './hash.js';
import { credentialFingerprintHex } from './credential.js';

const DATA_NAME_PREFIX = 'selyopass:';
const MANAGE_DATA_VALUE_MAX = 64; // Stellar protocol limit for a data value.

export function anchorDataName(credentialId) {
  // manageData names are limited to 64 bytes; credential ids fit comfortably.
  const name = `${DATA_NAME_PREFIX}${credentialId}`;
  if (Buffer.byteLength(name, 'utf8') > 64) {
    return name.slice(0, 64);
  }
  return name;
}

// BR-002 guard — the on-chain value is exactly the 32-byte SHA-256 fingerprint.
// Throws if anything other than a clean 64-char hex hash is passed in, which
// makes it impossible to accidentally write document bytes or PII on-chain.
export function buildAnchorValue(fingerprintHex) {
  if (typeof fingerprintHex !== 'string' || !/^[0-9a-f]{64}$/.test(fingerprintHex)) {
    throw new Error('on-chain anchor value must be a 64-char SHA-256 hex fingerprint');
  }
  const value = Buffer.from(hexToBytes(fingerprintHex)); // 32 bytes
  if (value.length > MANAGE_DATA_VALUE_MAX) {
    throw new Error('anchor value exceeds manageData size limit');
  }
  return value;
}

// Builds the unsigned anchoring transaction (XDR). Loads the source account
// from Horizon and attaches a single manageData op carrying the fingerprint.
export async function buildAnchorTransactionXDR(sourcePublicKey, credential) {
  const fingerprint = await credentialFingerprintHex(credential);
  const server = horizonServer();
  const account = await server.loadAccount(sourcePublicKey);

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      StellarSdk.Operation.manageData({
        name: anchorDataName(credential.credential_id),
        value: buildAnchorValue(fingerprint),
      })
    )
    .addMemo(StellarSdk.Memo.text('SelyoPass KYB anchor'))
    .setTimeout(120)
    .build();

  return { xdr: tx.toXDR(), fingerprint, dataName: anchorDataName(credential.credential_id) };
}

// Orchestrates build → sign → submit. `signXDR(xdr)` is injected (Freighter in
// the app, a stub in tests) so this is fully unit-testable without a wallet.
export async function anchorCredentialOnChain({ sourcePublicKey, signXDR, credential }) {
  const { xdr, fingerprint, dataName } = await buildAnchorTransactionXDR(sourcePublicKey, credential);

  const signedXdr = await signXDR(xdr);
  if (!signedXdr) throw new Error('transaction signing was rejected');

  const server = horizonServer();
  const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const result = await server.submitTransaction(signedTx);
  return { hash: result.hash, fingerprint, dataName };
}

// Best-effort read-back: fetch the anchored fingerprint from the account's data
// entries and confirm it matches the credential. Used as a defense-in-depth
// cross-check in the reader; failure here never invalidates the signature.
export async function readOnChainAnchor(accountId, credential) {
  const server = horizonServer();
  const account = await server.loadAccount(accountId);
  const name = anchorDataName(credential.credential_id);
  const raw = account.data_attr?.[name]; // base64-encoded value
  if (!raw) return { found: false };
  const onChainHex = Buffer.from(raw, 'base64').toString('hex');
  const expected = await credentialFingerprintHex(credential);
  return { found: true, matches: onChainHex === expected, onChainHex, expected };
}
