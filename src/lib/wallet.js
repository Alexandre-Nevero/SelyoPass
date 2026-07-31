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
  isAvailable = () => kit.selectedModule.isAvailable(),
} = {}) {
  let connected = null;

  // Freighter injects its extension API asynchronously. On a fresh page load
  // (especially with many other extensions competing for injection time),
  // the very first isAvailable() check the wallets kit runs can genuinely
  // still be false even though Freighter is installed and will work a
  // moment later. The kit's own built-in modal only checks this once and,
  // if false, just opens the install page on click instead of retrying or
  // attempting a connection — so we never route through that modal here.
  // Instead we poll isAvailable() ourselves with a short bounded retry
  // before treating the wallet as genuinely unavailable.
  async function waitForAvailability({ attempts = 5, delayMs = 300 } = {}) {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        if (await isAvailable()) return true;
      } catch { /* treated the same as "not yet available" below */ }
      if (attempt < attempts - 1) await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    return false;
  }

  return {
    async connect(kind) {
      if (!ids[kind]) throw new WalletError('Only Freighter and Albedo are supported in this build.');
      try {
        kit.setWallet(ids[kind]);
        if (kind === 'Freighter' && !(await waitForAvailability())) {
          throw new WalletError('Freighter was not detected. Confirm the extension is enabled for this site, then try again.');
        }
        // fetchAddress() (not authModal()) calls the selected module's
        // getAddress() directly. Freighter's getAddress() internally calls
        // requestAccess(), which is what actually opens Freighter's real
        // interactive popup — authModal() is not required to trigger it, and
        // routing through authModal() risks hitting the same isAvailable()
        // race described above inside the kit's own modal code.
        const { address } = await kit.fetchAddress();
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
