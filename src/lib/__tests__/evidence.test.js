import { describe, expect, it } from 'vitest';
import {
  buildDocumentRoot,
  createPresentationPackage,
  findIssuanceEvent,
  parsePresentationPackage,
  resolveCredentialFreshness,
  validateLocalFiles,
  verifyEvidence,
} from '../evidence.js';

describe('local evidence', () => {
  const descriptor = (document_type, sha256, byte_length = 10, display_name = `${document_type}.txt`) => ({
    document_type, sha256, byte_length, display_name,
  });

  it('builds a stable root from sorted public document descriptors', async () => {
    const a = await buildDocumentRoot([
      descriptor('z', 'b'.repeat(64), 20),
      descriptor('a', 'a'.repeat(64), 10),
    ]);
    const b = await buildDocumentRoot([
      descriptor('a', 'a'.repeat(64), 10),
      descriptor('z', 'b'.repeat(64), 20),
    ]);
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });

  it('bounds local file count and size before hashing', () => {
    expect(validateLocalFiles([{ name: 'ok.txt', size: 10 }])).toHaveLength(1);
    expect(() => validateLocalFiles(Array.from({ length: 11 }, (_, index) => ({ name: `${index}.txt`, size: 1 })))).toThrow(/no more than 10/i);
    expect(() => validateLocalFiles([{ name: 'large.bin', size: 10 * 1024 * 1024 + 1 }])).toThrow(/10 MiB/i);
  });

  it('keeps registry, authorization, event, and local rehash as independent checks', async () => {
    const manifestEntries = [descriptor('bir', 'a'.repeat(64), 10, 'bir.txt')];
    const documentRoot = await buildDocumentRoot(manifestEntries);
    const credentialKey = await import('../hash.js').then(({ sha256Hex }) => sha256Hex('sp-1'));
    const rows = await verifyEvidence({
      manifest: {
        credential_id: credentialKey,
        subject: 'GA',
        schema_hash: 'c'.repeat(64),
        expires_ledger: 99,
        document_manifest: manifestEntries,
        document_root: documentRoot,
      },
      localDocuments: { 'bir.txt': { sha256: 'b'.repeat(64), byte_length: 10 } },
      record: {
        credential_id: credentialKey,
        subject: 'GA',
        document_root: documentRoot,
        schema_hash: 'c'.repeat(64),
        expires_ledger: 99,
      },
      status: 'issued', authorized: true, issuanceEvent: null,
    });
    expect(rows.find((r) => r.key === 'local_rehash').state).toBe('failed');
    expect(rows.find((r) => r.key === 'document:bir.txt').state).toBe('failed');
    expect(rows.find((r) => r.key === 'on_chain_binding').state).toBe('confirmed');
    expect(rows.find((r) => r.key === 'registry_status').state).toBe('confirmed');
    expect(rows.find((r) => r.key === 'issuance_event').state).toBe('unavailable');
  });

  it('fails the on-chain binding when a forged manifest root differs from the registry', async () => {
    const manifestEntries = [descriptor('bir', 'b'.repeat(64), 10, 'bir.txt')];
    const forgedRoot = await buildDocumentRoot(manifestEntries);
    const credentialKey = await import('../hash.js').then(({ sha256Hex }) => sha256Hex('sp-1'));
    const rows = await verifyEvidence({
      manifest: {
        credential_id: credentialKey,
        subject: 'GA',
        schema_hash: 'c'.repeat(64),
        expires_ledger: 99,
        document_manifest: manifestEntries,
        document_root: forgedRoot,
      },
      localDocuments: { 'bir.txt': { sha256: 'b'.repeat(64), byte_length: 10 } },
      record: {
        credential_id: credentialKey,
        subject: 'GA',
        document_root: 'a'.repeat(64),
        schema_hash: 'c'.repeat(64),
        expires_ledger: 99,
      },
      status: 'issued',
      authorized: true,
      issuanceEvent: { id: 'event-1' },
    });
    expect(rows.find((r) => r.key === 'local_rehash').state).toBe('confirmed');
    expect(rows.find((r) => r.key === 'on_chain_binding').state).toBe('failed');
  });

  it('supports a credential-ID-only registry check without claiming local verification', async () => {
    const credentialKey = await import('../hash.js').then(({ sha256Hex }) => sha256Hex('sp-1'));
    const rows = await verifyEvidence({
      credentialId: 'sp-1',
      record: { credential_id: credentialKey },
      status: 'issued',
      authorized: true,
      issuanceEvent: { id: 'event-1' },
    });
    expect(rows.find((row) => row.key === 'registry_record').state).toBe('confirmed');
    expect(rows.find((row) => row.key === 'local_rehash').state).toBe('unavailable');
    expect(rows.find((row) => row.key === 'on_chain_binding').state).toBe('unavailable');
  });

  it('fails when a package names different contracts than the configured release', async () => {
    const rows = await verifyEvidence({
      manifest: {
        credential_id: 'a'.repeat(64),
        credential_registry_id: 'CATTACKER',
        anchor_registry_id: 'CANCHOR',
        document_manifest: [],
      },
      registryIds: { credential: 'CRELEASE', anchor: 'CAUTHORITY' },
    });
    expect(rows.find((row) => row.key === 'contract_binding').state).toBe('failed');
  });

  it('rejects unsupported, unsafe, and incomplete presentation packages', () => {
    const base = {
      package_version: '1.0',
      network: 'testnet',
      credential_registry_id: 'C'.padEnd(56, 'A'),
      anchor_registry_id: 'C'.padEnd(56, 'A'),
      credential_id: 'a'.repeat(64),
      credential_label: 'sp-1',
      subject: 'G'.padEnd(56, 'A'),
      organization: 'Synthetic Org',
      schema_id: 'selyopass.ph.kyb.synthetic.v1',
      schema_hash: 'b'.repeat(64),
      expires_ledger: 99,
      document_manifest: [descriptor('bir', 'c'.repeat(64), 10, 'bir.txt')],
      document_root: 'd'.repeat(64),
      request_tx_hash: 'e'.repeat(64),
      created_at: '2026-07-29T00:00:00.000Z',
    };
    expect(parsePresentationPackage(JSON.stringify(base))).toMatchObject({ network: 'testnet' });
    expect(() => parsePresentationPackage(JSON.stringify({ ...base, network: 'mainnet' }))).toThrow(/network/i);
    expect(() => parsePresentationPackage(JSON.stringify({ ...base, document_bytes: 'secret' }))).toThrow(/prohibited/i);
    expect(() => parsePresentationPackage(JSON.stringify({ ...base, organization: { document_bytes: 'secret' } }))).toThrow(/prohibited/i);
    expect(() => parsePresentationPackage(JSON.stringify({ ...base, document_manifest: [] }))).toThrow(/manifest/i);
  });

  it('creates a detached package snapshot from the confirmed request', async () => {
    const input = {
      client: { contractId: 'C'.padEnd(56, 'A'), anchorContractId: 'C'.padEnd(56, 'B') },
      record: { credential_id: 'sp-1', organization: 'Synthetic Org', schema_hash: 'b'.repeat(64), expires_ledger: 99 },
      subject: 'G'.padEnd(56, 'A'),
      documentManifest: [descriptor('bir', 'c'.repeat(64), 10, 'bir.txt')],
      documentRoot: 'd'.repeat(64),
      receipt: { hash: 'e'.repeat(64), ledger: 10 },
    };
    const snapshot = await createPresentationPackage(input);
    input.record.credential_id = 'changed';
    expect(snapshot.credential_label).toBe('sp-1');
    expect(snapshot.request_tx_hash).toBe('e'.repeat(64));
  });

  it('creates package 1.1 with freshness provenance while retaining package 1.0 reads', async () => {
    const input = {
      client: { contractId: 'C'.padEnd(56, 'A'), anchorContractId: 'C'.padEnd(56, 'B') },
      record: {
        credential_id: 'sp-successor', organization: 'Synthetic Org', schema_hash: 'b'.repeat(64), expires_ledger: 99,
        previous_credential_id: 'a'.repeat(64),
      },
      subject: 'G'.padEnd(56, 'A'),
      documentManifest: [descriptor('bir', 'c'.repeat(64), 10, 'bir.txt')],
      documentRoot: 'd'.repeat(64),
      receipt: { hash: 'e'.repeat(64), ledger: 10 },
      appReleaseSha: 'f'.repeat(40),
    };
    const snapshot = await createPresentationPackage(input);
    expect(snapshot).toMatchObject({
      package_version: '1.1',
      previous_credential_id: 'a'.repeat(64),
      app_release_sha: 'f'.repeat(40),
    });
    const legacy = Object.fromEntries(Object.entries(snapshot)
      .filter(([key]) => !['previous_credential_id', 'app_release_sha'].includes(key)));
    expect(parsePresentationPackage({ ...legacy, package_version: '1.0' }))
      .toMatchObject({ package_version: '1.0' });
  });

  it('follows a superseded credential to its current successor and rejects cycles and overlong chains', async () => {
    const records = {
      old: { credential_id: 'old', successor_credential_id: 'new' },
      new: { credential_id: 'new', successor_credential_id: null },
      loop: { credential_id: 'loop', successor_credential_id: 'loop' },
    };
    const status = { old: 'superseded', new: 'issued', loop: 'superseded' };
    await expect(resolveCredentialFreshness({ credentialId: 'old', getRecord: async (id) => records[id], getStatus: async (id) => status[id] }))
      .resolves.toMatchObject({ presentedStatus: 'superseded', currentStatus: 'issued', successorId: 'new' });
    await expect(resolveCredentialFreshness({ credentialId: 'loop', getRecord: async (id) => records[id], getStatus: async (id) => status[id] }))
      .rejects.toThrow(/cycle/i);
    await expect(resolveCredentialFreshness({ credentialId: 'old', maxRecords: 1, getRecord: async (id) => records[id], getStatus: async (id) => status[id] }))
      .rejects.toThrow(/10 records|limit/i);
  });

  it('reports the latest successor status when a presented credential is superseded', async () => {
    const rows = await verifyEvidence({
      freshness: { presentedStatus: 'superseded', currentStatus: 'revoked', successorId: 'b'.repeat(64) },
    });
    expect(rows.find((row) => row.key === 'credential_freshness').detail).toMatch(/revoked/i);
  });

  it('matches plaintext labels to hash-keyed issuance events', async () => {
    const id = 'sp-demo-001';
    const key = await import('../hash.js').then(({ sha256Hex }) => sha256Hex(id));
    await expect(findIssuanceEvent([
      { id: 'event-1', type: 'issued', credentialId: key },
    ], id)).resolves.toMatchObject({ id: 'event-1' });
  });
});
