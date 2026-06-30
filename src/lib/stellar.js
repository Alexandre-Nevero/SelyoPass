// Shared Stellar testnet configuration.
// Testnet only (idea.md §10) — never mainnet for the MVP.
import * as StellarSdk from '@stellar/stellar-sdk';

export const HORIZON_URL = 'https://horizon-testnet.stellar.org';
export const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
export const NETWORK = 'TESTNET';

// Friendbot funds a testnet account for free. Used only on testnet.
export const FRIENDBOT_URL = 'https://friendbot.stellar.org';

export function horizonServer() {
  return new StellarSdk.Horizon.Server(HORIZON_URL);
}

export function explorerTxUrl(hash) {
  return `https://stellar.expert/explorer/testnet/tx/${hash}`;
}

export function explorerAccountUrl(account) {
  return `https://stellar.expert/explorer/testnet/account/${account}`;
}
