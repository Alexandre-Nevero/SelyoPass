import { describe, expect, it, vi } from 'vitest';
vi.mock('@creit.tech/stellar-wallets-kit/sdk', () => ({ StellarWalletsKit: { init: vi.fn() } }));
vi.mock('@creit.tech/stellar-wallets-kit/types', () => ({ Networks: { TESTNET: 'Test SDF Network ; September 2015' } }));
vi.mock('@creit.tech/stellar-wallets-kit/modules/freighter', () => ({ FreighterModule: class {}, FREIGHTER_ID: 'freighter' }));
vi.mock('@creit.tech/stellar-wallets-kit/modules/albedo', () => ({ AlbedoModule: class {}, ALBEDO_ID: 'albedo' }));
const { createWalletService } = await import('../wallet.js');

describe('wallet kit service', () => {
  it('uses the kit for both supported wallets and signs on testnet', async () => {
    const kit = { setWallet: vi.fn(), authModal: vi.fn().mockResolvedValue({ address: 'GABC' }), getNetwork: vi.fn().mockResolvedValue({ networkPassphrase: 'Test SDF Network ; September 2015' }), signTransaction: vi.fn().mockResolvedValue({ signedTxXdr: 'signed' }) };
    const wallet = createWalletService({ kit, ids: { Freighter: 'freighter', Albedo: 'albedo' } });
    await expect(wallet.connect('Albedo')).resolves.toMatchObject({ address: 'GABC', wallet: 'Albedo' });
    await expect(wallet.sign('unsigned', 'GABC')).resolves.toBe('signed');
    expect(kit.setWallet).toHaveBeenCalledWith('albedo');
    expect(kit.signTransaction).toHaveBeenCalledWith('unsigned', expect.objectContaining({ address: 'GABC' }));
  });

  it('connects Albedo even though its getNetwork() always throws "not supported"', async () => {
    const kit = {
      setWallet: vi.fn(),
      authModal: vi.fn().mockResolvedValue({ address: 'GABC' }),
      getNetwork: vi.fn().mockRejectedValue({ code: -3, message: 'Albedo does not support the "getNetwork" function' }),
      signTransaction: vi.fn().mockResolvedValue({ signedTxXdr: 'signed' }),
    };
    const wallet = createWalletService({ kit, ids: { Freighter: 'freighter', Albedo: 'albedo' } });
    await expect(wallet.connect('Albedo')).resolves.toMatchObject({ address: 'GABC', wallet: 'Albedo' });
  });

  it('still rejects a real wrong-network response from a wallet that supports getNetwork()', async () => {
    const kit = {
      setWallet: vi.fn(),
      authModal: vi.fn().mockResolvedValue({ address: 'GABC' }),
      getNetwork: vi.fn().mockResolvedValue({ networkPassphrase: 'Public Global Stellar Network ; September 2015' }),
    };
    const wallet = createWalletService({ kit, ids: { Freighter: 'freighter', Albedo: 'albedo' } });
    await expect(wallet.connect('Freighter')).rejects.toThrow(/wrong network/i);
  });
});
