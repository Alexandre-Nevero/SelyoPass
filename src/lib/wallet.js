// Freighter wallet wrapper. Freighter is the only supported wallet (idea.md
// §10). All wallet failures surface as friendly messages (F-006). The user's
// private key is never handled here — signing happens inside Freighter (BR-002).
import {
  isConnected,
  requestAccess,
  getPublicKey,
  signTransaction,
} from '@stellar/freighter-api';
import { NETWORK_PASSPHRASE, NETWORK } from './stellar.js';

export class WalletError extends Error {}

export async function connectWallet() {
  let detected;
  try {
    detected = await isConnected();
  } catch (_) {
    detected = false;
  }
  if (!detected) {
    throw new WalletError(
      'Freighter not detected. Install/enable the Freighter extension (set to Testnet), then refresh.'
    );
  }

  let access;
  try {
    access = await requestAccess();
  } catch (_) {
    throw new WalletError('Connection rejected. Approve the connection request in Freighter.');
  }
  if (!access || access === 'denied') {
    throw new WalletError('Connection rejected. Approve the connection request in Freighter.');
  }

  const publicKey = await getPublicKey();
  if (!publicKey) {
    throw new WalletError('Could not read your wallet address from Freighter.');
  }
  return { publicKey };
}

// Signs a transaction XDR with Freighter and returns the signed XDR string.
// (freighter-api 2.0.0 returns the signed XDR as a string.)
export async function signXDR(xdr) {
  const signed = await signTransaction(xdr, {
    networkPassphrase: NETWORK_PASSPHRASE,
    network: NETWORK,
  });
  if (!signed) {
    throw new WalletError('Transaction signing was declined in Freighter.');
  }
  return signed;
}
