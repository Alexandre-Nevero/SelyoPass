import { Buffer } from 'buffer';
import { describe, expect, it } from 'vitest';
import {
  CONTRACT_METHODS,
  createConfiguredContractClient,
  credentialIdBytes,
  hexBytes,
} from '../onchain.js';

const anchorId = 'CAAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQC526';
const credentialId = 'CABAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAFNSZ';
const deployment = {
  schemaVersion: 1,
  network: 'testnet',
  status: 'deployed',
  rpcUrl: 'https://rpc.example',
  contracts: {
    anchorRegistry: { id: anchorId },
    credentialRegistry: { id: credentialId },
  },
};

describe('Soroban contract adapter', () => {
  it('exposes only the planned credential contract methods', () => {
    expect(CONTRACT_METHODS).toEqual(['request', 'request_refresh', 'issue', 'reject', 'revoke', 'get', 'status', 'exists', 'is_authorized']);
  });
  it('does not fabricate bindings when generated bindings are absent', async () => {
    const client = createConfiguredContractClient({
      deployment: { status: 'not_deployed', contracts: {} },
    });
    expect(client.configured).toBe(false);
    await expect(client.issue('G', 'id')).rejects.toThrow(/not configured/i);
  });
  it('accepts only a complete injected generated client', () => {
    const injected = Object.fromEntries(CONTRACT_METHODS.map((name) => [name, async () => name]));
    injected.getEvents = async () => [];
    injected.submit = async () => ({});
    injected.confirm = async () => ({});
    const client = createConfiguredContractClient(injected);
    expect(client.configured).toBe(true);
    expect(client.contractId).toBe('Not published');
  });
  it('derives stable BytesN values and rejects malformed public hashes', async () => {
    expect((await credentialIdBytes('SP-001')).length).toBe(32);
    expect(Buffer.from(await credentialIdBytes('SP-001')).toString('hex'))
      .toBe(Buffer.from(await credentialIdBytes('SP-001')).toString('hex'));
    expect(() => hexBytes('not-a-hash', 'document root')).toThrow(/document root/i);
  });
  it('uses generated clients to simulate writes and unwrap reads', async () => {
    const calls = [];
    const assembled = { toXDR: () => 'unsigned-xdr', result: { unwrap: () => ({ status: 1 }) } };
    const credentialFactory = (options) => ({
      request: async (args) => { calls.push({ options, args }); return assembled; },
      request_refresh: async (args) => { calls.push({ options, args }); return assembled; },
      get: async () => ({ result: { unwrap: () => ({ status: 6, credential_id: Buffer.alloc(32, 1), previous_credential_id: Buffer.alloc(32, 2), successor_credential_id: Buffer.alloc(32, 3) }) } }),
      status: async () => ({ result: { unwrap: () => 6 } }),
      exists: async () => ({ result: false }),
    });
    const anchorFactory = () => ({
      is_authorized: async () => ({ result: true }),
    });
    const client = createConfiguredContractClient({
      deployment,
      credentialFactory,
      anchorFactory,
      server: {},
    });
    const result = await client.request(
      'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
      'SP-001',
      '11'.repeat(32),
      '22'.repeat(32),
      123,
    );
    expect(result.unsignedXdr).toBe('unsigned-xdr');
    expect(calls[0].options.publicKey).toMatch(/^G/);
    expect(calls[0].args.credential_id).toHaveLength(32);
    await expect(client.request_refresh(
      'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
      'SP-002',
      'SP-001',
      '33'.repeat(32),
      '44'.repeat(32),
      456,
    )).resolves.toEqual({ unsignedXdr: 'unsigned-xdr' });
    expect(calls[1].args.previous_credential_id).toHaveLength(32);
    await expect(client.get('SP-001')).resolves.toMatchObject({
      status: 'superseded',
      previous_credential_id: '02'.repeat(32),
      successor_credential_id: '03'.repeat(32),
    });
    await expect(client.status('SP-001')).resolves.toBe('superseded');
    await expect(client.exists('SP-001')).resolves.toBe(false);
    await expect(client.is_authorized('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF')).resolves.toBe(true);
  });
  it('submits signed XDR, confirms it, and normalizes contract events', async () => {
    const server = {
      sendTransaction: async () => ({ status: 'PENDING', hash: 'a'.repeat(64) }),
      getTransaction: async () => ({ status: 'SUCCESS', ledger: 456 }),
      getEvents: async () => ({
        events: [{
          id: '0001-1',
          ledger: 455,
          txHash: 'b'.repeat(64),
          topic: ['issued', Buffer.alloc(32, 3)],
          value: { issuer: 'GISSUER' },
        }],
      }),
    };
    const client = createConfiguredContractClient({
      deployment,
      credentialFactory: () => ({}),
      anchorFactory: () => ({}),
      server,
      transactionFromXdr: (xdr) => ({ xdr }),
      scValToNative: (value) => value,
    });
    await expect(client.submit('signed-xdr')).resolves.toEqual({ hash: 'a'.repeat(64) });
    await expect(client.confirm('a'.repeat(64))).resolves.toMatchObject({ status: 'SUCCESS', ledger: 456 });
    await expect(client.getEvents(400)).resolves.toEqual({
      events: [expect.objectContaining({
        id: '0001-1',
        ledger: 455,
        type: 'issued',
        credentialId: '03'.repeat(32),
        txHash: 'b'.repeat(64),
      })],
    });
  });
  it('rejects request() before simulating when a credential with this ID already exists, instead of handing back a signable duplicate request', async () => {
    // Root cause of the false "RPC request timed out" bug: request() used to
    // hand back an unsignedXdr regardless of whether the ID already existed,
    // so the user signed and submitted a call the contract was always going
    // to refuse, burning the full confirm() budget before any error surfaced.
    const requestCalls = [];
    const credentialFactory = () => ({
      request: async (args) => { requestCalls.push(args); return { toXDR: () => 'unsigned-xdr', result: { unwrap: () => ({}) } }; },
      exists: async () => ({ result: true }),
    });
    const client = createConfiguredContractClient({
      deployment,
      credentialFactory,
      anchorFactory: () => ({}),
      server: {},
    });
    await expect(client.request(
      'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
      'sp-demo-001',
      '11'.repeat(32),
      '22'.repeat(32),
      123,
    )).rejects.toThrow(/AlreadyExists/);
    expect(requestCalls).toHaveLength(0);
  });
  it('rejects request_refresh() before simulating when the new credential ID already exists, matching request()', async () => {
    // The contract applies the identical AlreadyExists check to
    // request_refresh's new credential_id (not previous_credential_id), so
    // this gets the same cheap precheck as request() for the same reason.
    const refreshCalls = [];
    const credentialFactory = () => ({
      request_refresh: async (args) => { refreshCalls.push(args); return { toXDR: () => 'unsigned-xdr', result: { unwrap: () => ({}) } }; },
      exists: async () => ({ result: true }),
    });
    const client = createConfiguredContractClient({
      deployment,
      credentialFactory,
      anchorFactory: () => ({}),
      server: {},
    });
    await expect(client.request_refresh(
      'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
      'sp-demo-002',
      'sp-demo-001',
      '11'.repeat(32),
      '22'.repeat(32),
      123,
    )).rejects.toThrow(/AlreadyExists/);
    expect(refreshCalls).toHaveLength(0);
  });
  it('throws instead of returning a signable transaction when simulation itself reports a contract-level rejection', async () => {
    const rejected = { toXDR: () => 'unsigned-xdr', result: { isOk: () => false, isErr: () => true, unwrap: () => { throw new Error(''); } } };
    const credentialFactory = () => ({
      issue: async () => rejected,
      exists: async () => ({ result: false }),
    });
    const client = createConfiguredContractClient({
      deployment,
      credentialFactory,
      anchorFactory: () => ({}),
      server: {},
    });
    await expect(client.issue(
      'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
      'sp-demo-001',
    )).rejects.toThrow(/SimulationRejected/);
  });
});
