import { describe, expect, it, vi } from 'vitest';
import { createEventPoller, initialTransaction, runContractTransaction, transactionReducer, userFacingError } from '../transaction.js';

describe('transaction state machine', () => {
  it('moves through signing and pending to a receipt', () => {
    let state = initialTransaction;
    for (const type of ['simulate', 'await_signature', 'submit', 'pending']) state = transactionReducer(state, { type });
    state = transactionReducer(state, { type: 'success', receipt: { hash: 'abc', ledger: 22 } });
    expect(state).toMatchObject({ phase: 'success', receipt: { hash: 'abc', ledger: 22 } });
  });

  it('rejects illegal transitions and cannot jump from simulation to success', () => {
    expect(transactionReducer(initialTransaction, { type: 'success', receipt: {} })).toEqual(initialTransaction);
    const simulating = transactionReducer(initialTransaction, { type: 'simulate' });
    expect(transactionReducer(simulating, { type: 'pending' })).toEqual(simulating);
  });

  it('retains the submitted hash through pending and failure states', () => {
    let state = initialTransaction;
    for (const type of ['simulate', 'await_signature', 'submit']) {
      state = transactionReducer(state, { type });
    }
    state = transactionReducer(state, { type: 'pending', hash: 'a'.repeat(64) });
    expect(state).toMatchObject({ phase: 'pending', receipt: { hash: 'a'.repeat(64) } });
    state = transactionReducer(state, { type: 'failed', error: new Error('RPC timeout') });
    expect(state).toMatchObject({ phase: 'failed', receipt: { hash: 'a'.repeat(64) } });
  });

  it('simulates, signs, submits, and waits for a confirmed transaction', async () => {
    const phases = [];
    const receipt = await runContractTransaction({
      invoke: async () => ({ unsignedXdr: 'AAAA' }),
      sign: async (xdr) => { expect(xdr).toBe('AAAA'); return 'BBBB'; },
      submit: async (signed, simulation) => {
        expect(signed).toBe('BBBB');
        expect(simulation).toEqual({ unsignedXdr: 'AAAA' });
        return { hash: 'a'.repeat(64) };
      },
      confirm: async (hash) => ({ status: 'SUCCESS', hash, ledger: 42, eventId: '42-1' }),
      dispatch: (action) => phases.push(action.type),
    });
    expect(phases).toEqual(['simulate', 'await_signature', 'submit', 'pending', 'success']);
    expect(receipt).toMatchObject({ hash: 'a'.repeat(64), ledger: 42, eventId: '42-1' });
  });

  it('maps wallet and network failures to an action a person can take', () => {
    expect(userFacingError(new Error('User rejected the request'))).toMatch(/declined/i);
    expect(userFacingError(new Error('wrong network'))).toMatch(/Testnet/i);
    expect(userFacingError(new Error('unfunded account'))).toMatch(/fund/i);
    expect(userFacingError(new Error('insufficient balance'))).toMatch(/XLM/i);
    expect(userFacingError(new Error('RPC timeout'))).toMatch(/RPC/i);
  });

  it('maps contract rejections to their real cause, not a false RPC timeout', () => {
    // A duplicate credential request fails at simulation with the contract's
    // AlreadyExists error. The SDK's wrapped error text can otherwise contain
    // words like "rpc" or "simulation", which must not be misread as a
    // network timeout.
    expect(userFacingError(new Error('HostError: Error(Contract, #1) AlreadyExists during rpc simulation')))
      .toMatch(/already has a pending or issued record/i);
    expect(userFacingError(new Error('Error(Contract, #2) NotFound'))).toMatch(/no credential record/i);
    expect(userFacingError(new Error('Error(Contract, #4) InvalidTransition'))).toMatch(/not in a state/i);
    expect(userFacingError(new Error('Error(Contract, #7) InvalidExpiry'))).toMatch(/future testnet expiry/i);
  });

  it('maps a pre-signature simulation rejection to a clear message instead of a generic contract-authorization guess', () => {
    // The generated contract bindings decode CredentialError variants to an
    // *empty* message (the Rust enum has no doc comments, which is what the
    // SDK uses to build error text), so onchain.js's assemble() cannot name
    // the real variant here. It still must not silently proceed to signature
    // and RPC submission for a call the contract already rejected at
    // simulation, nor should the resulting message fall through to the
    // authorization-guess text meant for actual contract/auth failures.
    expect(userFacingError(new Error('SimulationRejected: the contract rejected this request before signing.')))
      .toMatch(/rejected this request during simulation/i);
  });
});

describe('event polling', () => {
  it('deduplicates event IDs, persists the cursor, backs off, and cleans up', async () => {
    vi.useFakeTimers();
    const onEvent = vi.fn();
    const onError = vi.fn();
    const saveCursor = vi.fn();
    const getEvents = vi.fn()
      .mockResolvedValueOnce({ events: [{ id: 'a', ledger: 8 }, { id: 'a', ledger: 8 }] })
      .mockRejectedValueOnce(new Error('timeout'));
    const poller = createEventPoller({ getEvents, onEvent, onError, saveCursor, intervalMs: 5000, maxBackoffMs: 10000 });
    await poller.poll();
    expect(onEvent).toHaveBeenCalledTimes(1);
    expect(saveCursor).toHaveBeenCalledWith(8);
    await poller.poll();
    expect(poller.delay()).toBe(10000);
    expect(onError).toHaveBeenLastCalledWith(expect.any(Error));
    poller.start();
    poller.stop();
    await vi.runOnlyPendingTimersAsync();
    expect(getEvents).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
