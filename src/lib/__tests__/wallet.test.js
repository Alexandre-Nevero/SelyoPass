import { describe, expect, it, vi } from 'vitest';
vi.mock('@creit.tech/stellar-wallets-kit/sdk', () => ({ StellarWalletsKit: { init: vi.fn() } }));
vi.mock('@creit.tech/stellar-wallets-kit/types', () => ({ Networks: { TESTNET: 'Test SDF Network ; September 2015' } }));
vi.mock('@creit.tech/stellar-wallets-kit/modules/freighter', () => ({ FreighterModule: class {}, FREIGHTER_ID: 'freighter' }));
vi.mock('@creit.tech/stellar-wallets-kit/modules/albedo', () => ({ AlbedoModule: class {}, ALBEDO_ID: 'albedo' }));
const { createWalletService } = await import('../wallet.js');

describe('wallet kit service', () => {
  it('uses the kit for both supported wallets and signs on testnet', async () => {
    const kit = { setWallet: vi.fn(), fetchAddress: vi.fn().mockResolvedValue({ address: 'GABC' }), getNetwork: vi.fn().mockResolvedValue({ networkPassphrase: 'Test SDF Network ; September 2015' }), signTransaction: vi.fn().mockResolvedValue({ signedTxXdr: 'signed' }) };
    const wallet = createWalletService({ kit, ids: { Freighter: 'freighter', Albedo: 'albedo' } });
    await expect(wallet.connect('Albedo')).resolves.toMatchObject({ address: 'GABC', wallet: 'Albedo' });
    await expect(wallet.sign('unsigned', 'GABC')).resolves.toBe('signed');
    expect(kit.setWallet).toHaveBeenCalledWith('albedo');
    expect(kit.signTransaction).toHaveBeenCalledWith('unsigned', expect.objectContaining({ address: 'GABC' }));
  });

  it('connects Albedo even though its getNetwork() always throws "not supported"', async () => {
    const kit = {
      setWallet: vi.fn(),
      fetchAddress: vi.fn().mockResolvedValue({ address: 'GABC' }),
      getNetwork: vi.fn().mockRejectedValue({ code: -3, message: 'Albedo does not support the "getNetwork" function' }),
      signTransaction: vi.fn().mockResolvedValue({ signedTxXdr: 'signed' }),
    };
    const wallet = createWalletService({ kit, ids: { Freighter: 'freighter', Albedo: 'albedo' } });
    await expect(wallet.connect('Albedo')).resolves.toMatchObject({ address: 'GABC', wallet: 'Albedo' });
  });

  it('still rejects a real wrong-network response from a wallet that supports getNetwork()', async () => {
    const kit = {
      setWallet: vi.fn(),
      fetchAddress: vi.fn().mockResolvedValue({ address: 'GABC' }),
      getNetwork: vi.fn().mockResolvedValue({ networkPassphrase: 'Public Global Stellar Network ; September 2015' }),
    };
    const isAvailable = vi.fn().mockResolvedValue(true);
    const wallet = createWalletService({ kit, ids: { Freighter: 'freighter', Albedo: 'albedo' }, isAvailable });
    await expect(wallet.connect('Freighter')).rejects.toThrow(/wrong network/i);
  });

  it('retries Freighter availability on a slow extension injection, then connects once available', async () => {
    // Simulates the real-world case: Freighter is installed but its API has
    // not injected into window yet on the first check(s) after page load.
    const kit = {
      setWallet: vi.fn(),
      fetchAddress: vi.fn().mockResolvedValue({ address: 'GFRE' }),
      getNetwork: vi.fn().mockResolvedValue({ networkPassphrase: 'Test SDF Network ; September 2015' }),
    };
    const isAvailable = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const wallet = createWalletService({ kit, ids: { Freighter: 'freighter', Albedo: 'albedo' }, isAvailable });
    await expect(wallet.connect('Freighter')).resolves.toMatchObject({ address: 'GFRE', wallet: 'Freighter' });
    expect(isAvailable).toHaveBeenCalledTimes(3);
    expect(kit.fetchAddress).toHaveBeenCalledTimes(1);
  });

  it('gives a clear message when Freighter never becomes available, without opening a dead-end install tab', async () => {
    const kit = { setWallet: vi.fn(), fetchAddress: vi.fn() };
    const isAvailable = vi.fn().mockResolvedValue(false);
    const wallet = createWalletService({ kit, ids: { Freighter: 'freighter', Albedo: 'albedo' }, isAvailable });
    await expect(wallet.connect('Freighter')).rejects.toThrow(/not detected/i);
    expect(kit.fetchAddress).not.toHaveBeenCalled();
  });
});
