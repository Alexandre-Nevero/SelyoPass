import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit/sdk';
import { Networks } from '@creit.tech/stellar-wallets-kit/types';
import { FreighterModule, FREIGHTER_ID } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { AlbedoModule, ALBEDO_ID } from '@creit.tech/stellar-wallets-kit/modules/albedo';

export class WalletError extends Error {}
export const TESTNET_PASSPHRASE = Networks.TESTNET;

StellarWalletsKit.init({
  network: Networks.TESTNET,
  modules: [new FreighterModule(), new AlbedoModule()],
});

export function createWalletService({
  kit = StellarWalletsKit,
  ids = { Freighter: FREIGHTER_ID, Albedo: ALBEDO_ID },
} = {}) {
  let connected = null;
  return {
    async connect(kind) {
      if (!ids[kind]) throw new WalletError('Only Freighter and Albedo are supported in this build.');
      try {
        kit.setWallet(ids[kind]);
        // authModal() (not fetchAddress()) drives the wallet's real interactive
        // connect flow. fetchAddress() assumes a wallet is already connected and
        // skips that flow, which is why Freighter fell back to opening a full
        // browser tab instead of its normal small popup window.
        const { address } = await kit.authModal();
        // Albedo's module does not implement getNetwork() — it always throws.
        // Treat that as "network could not be verified" rather than "wrong
        // network"; Albedo's own UI already lets the user pick testnet per
        // session, and Albedo enforces the network at sign time regardless.
        let network = null;
        try {
          network = await kit.getNetwork();
        } catch (networkError) {
          if (!/does not support/i.test(networkError?.message || '')) throw networkError;
        }
        if (network?.networkPassphrase && network.networkPassphrase !== Networks.TESTNET) {
          throw new WalletError('Wallet is on the wrong network. Switch it to Stellar Testnet.');
        }
        connected = { address, wallet: kind };
        return connected;
      } catch (error) {
        if (error instanceof WalletError) throw error;
        throw new WalletError(error?.message || `${kind} connection was declined or unavailable.`);
      }
    },
    async sign(unsignedXdr, address = connected?.address) {
      if (!address) throw new WalletError('Connect a wallet before signing.');
      const { signedTxXdr } = await kit.signTransaction(unsignedXdr, {
        networkPassphrase: Networks.TESTNET,
        address,
      });
      if (!signedTxXdr) throw new WalletError('Wallet signature was declined.');
      return signedTxXdr;
    },
  };
}

export const walletService = createWalletService();
