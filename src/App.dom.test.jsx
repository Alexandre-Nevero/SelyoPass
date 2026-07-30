// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./lib/wallet.js', () => ({ walletService: { connect: vi.fn(), sign: vi.fn() } }));
vi.mock('./lib/hash.js', async (importOriginal) => ({
  ...(await importOriginal()),
  hashFile: vi.fn().mockResolvedValue('ab'.repeat(32)),
}));
const { default: App, requiresCurrentAnchorAuthorization } = await import('./App.jsx');

const blockedClient = {
  configured: false,
  contractId: 'Not published',
  rpcUrl: 'https://soroban-testnet.stellar.org',
};

describe('SelyoPass screens', () => {
  beforeEach(() => { location.hash = ''; });
  afterEach(cleanup);
  it('makes Prepare and Verify primary while keeping the demo anchor secondary', () => {
    render(<App client={blockedClient} />);
    expect(screen.getByRole('heading', { name: /pass evidence/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /prepare evidence/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /check integrity/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /simulated anchor console/i })).toBeInTheDocument();
  });
  it('shows an explicit blocked state and route focus when contract bindings are absent', async () => {
    const user = userEvent.setup();
    render(<App client={blockedClient} />);
    await user.click(screen.getByRole('button', { name: /prepare evidence/i }));
    expect(await screen.findByRole('heading', { name: /prepare a presentation request/i })).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent(/not configured/i);
    expect(screen.getByRole('link', { name: 'Prepare' })).toHaveAttribute('aria-current', 'page');
  });
  it('keeps public verification wallet-free and repeats the institution decision boundary', async () => {
    location.hash = '#/verify';
    render(<App client={blockedClient} />);
    expect(screen.queryByText(/connect freighter/i)).not.toBeInTheDocument();
    expect(screen.getAllByText('Your institution still makes its own KYB decision.')).toHaveLength(2);
  });
  it('keeps revocation available to the original issuer after anchor removal', () => {
    expect(requiresCurrentAnchorAuthorization('issue')).toBe(true);
    expect(requiresCurrentAnchorAuthorization('reject')).toBe(true);
    expect(requiresCurrentAnchorAuthorization('revoke')).toBe(false);
  });
  it('authorizes a request with the connected wallet address, not organization text', async () => {
    location.hash = '#/prepare';
    const request = vi.fn().mockResolvedValue({ unsignedXdr: 'AAAA' });
    const client = {
      configured: true,
      contractId: 'CREDENTIAL',
      request,
      getEvents: vi.fn().mockResolvedValue({ events: [] }),
      submit: vi.fn().mockResolvedValue({ hash: 'a'.repeat(64) }),
      confirm: vi.fn().mockResolvedValue({ status: 'SUCCESS', ledger: 42 }),
    };
    const wallets = {
      connect: vi.fn().mockResolvedValue({
        address: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
        wallet: 'Freighter',
      }),
      sign: vi.fn().mockResolvedValue('BBBB'),
    };
    const user = userEvent.setup();
    render(<App client={client} wallets={wallets} />);
    await user.click(screen.getByRole('button', { name: /connect freighter/i }));
    await user.type(screen.getByLabelText(/expiry ledger/i), '900000');
    const file = new File(['synthetic'], 'synthetic.pdf', { type: 'application/pdf' });
    await user.upload(screen.getByLabelText(/synthetic documents/i), file);
    expect(screen.getByRole('button', { name: /download local package/i })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /request credential/i }));
    await waitFor(() => {
      expect(request).toHaveBeenCalledWith(
        'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
        'sp-demo-001',
        expect.stringMatching(/^[0-9a-f]{64}$/),
        expect.stringMatching(/^[0-9a-f]{64}$/),
        900000,
      );
    });
    await waitFor(() => expect(screen.getByRole('button', { name: /download local package/i })).toBeEnabled());
  });
  it('previews an eligible predecessor and submits a linked refresh with the subject wallet', async () => {
    location.hash = '#/prepare';
    const request_refresh = vi.fn().mockResolvedValue({ unsignedXdr: 'AAAA' });
    const subject = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF';
    const client = {
      configured: true,
      contractId: 'CREDENTIAL',
      sourceSha: 'a'.repeat(40),
      request_refresh,
      get: vi.fn().mockResolvedValue({ subject, issuer: 'GANCHOR', credential_id: 'a'.repeat(64) }),
      status: vi.fn().mockResolvedValue('issued'),
      is_authorized: vi.fn().mockResolvedValue(true),
      getEvents: vi.fn().mockResolvedValue({ events: [] }),
      submit: vi.fn().mockResolvedValue({ hash: 'a'.repeat(64) }),
      confirm: vi.fn().mockResolvedValue({ status: 'SUCCESS', ledger: 42 }),
    };
    const wallets = {
      connect: vi.fn().mockResolvedValue({ address: subject, wallet: 'Freighter' }),
      sign: vi.fn().mockResolvedValue('BBBB'),
    };
    const user = userEvent.setup();
    render(<App client={client} wallets={wallets} />);
    await user.click(screen.getByRole('button', { name: /refresh existing credential/i }));
    await user.click(screen.getByRole('button', { name: /connect freighter/i }));
    await user.type(screen.getByLabelText(/previous credential id/i), 'base-credential');
    await user.click(screen.getByRole('button', { name: /check existing credential/i }));
    expect(await screen.findByText(/eligible predecessor/i)).toBeInTheDocument();
    await user.type(screen.getByLabelText(/expiry ledger/i), '900000');
    await user.upload(screen.getByLabelText(/synthetic documents/i), new File(['synthetic'], 'synthetic.pdf', { type: 'application/pdf' }));
    await user.click(screen.getByRole('button', { name: /request refresh/i }));
    await waitFor(() => expect(request_refresh).toHaveBeenCalledWith(
      subject,
      'sp-demo-001',
      'base-credential',
      expect.stringMatching(/^[0-9a-f]{64}$/),
      expect.stringMatching(/^[0-9a-f]{64}$/),
      900000,
    ));
    expect(screen.getByText(/app release/i)).toHaveTextContent(/local-development/i);
    expect(screen.getByText(/contract source/i)).toHaveTextContent('a'.repeat(40));
  });
});
