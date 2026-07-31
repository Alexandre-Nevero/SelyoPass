import { Buffer } from 'buffer';
import {
  Networks,
  TransactionBuilder,
  hash,
  rpc,
  scValToNative as sdkScValToNative,
} from '@stellar/stellar-sdk';
import deploymentManifest from '../../deployments/testnet.json';
import { Client as AnchorRegistryClient } from '../contracts/anchor-registry/src/index.ts';
import { Client as CredentialRegistryClient } from '../contracts/credential-registry/src/index.ts';

export const CONTRACT_METHODS = Object.freeze([
  'request', 'request_refresh', 'issue', 'reject', 'revoke', 'get', 'status', 'exists', 'is_authorized',
]);

const REQUIRED_ADAPTER_METHODS = [...CONTRACT_METHODS, 'getEvents', 'submit', 'confirm'];
const CONTRACT_ID = /^C[A-Z2-7]{55}$/;
const HEX_32 = /^[0-9a-f]{64}$/i;
const REASON_CODES = Object.freeze({ demo_review: 1, demo_revocation: 2 });
const EVENT_RECOVERY_LEDGERS = 120;

export function credentialIdBytes(value) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('Credential ID is required.');
  if (HEX_32.test(value.trim())) return Buffer.from(value.trim(), 'hex');
  return hash(Buffer.from(value.trim(), 'utf8'));
}

export function hexBytes(value, label = 'hash') {
  if (typeof value !== 'string' || !HEX_32.test(value)) {
    throw new Error(`${label} must be a 64-character SHA-256 hex value.`);
  }
  return Buffer.from(value, 'hex');
}

function unwrap(result) {
  return typeof result?.unwrap === 'function' ? result.unwrap() : result;
}

function statusName(value) {
  return ({ 1: 'requested', 2: 'issued', 3: 'rejected', 4: 'revoked', 5: 'expired', 6: 'superseded' })[value] || value;
}

function normalizeRecord(value) {
  if (!value || typeof value !== 'object') return value;
  return {
    ...value,
    credential_id: bytesHex(value.credential_id),
    document_root: bytesHex(value.document_root),
    schema_hash: bytesHex(value.schema_hash),
    previous_credential_id: value.previous_credential_id == null ? null : bytesHex(value.previous_credential_id),
    successor_credential_id: value.successor_credential_id == null ? null : bytesHex(value.successor_credential_id),
    status: statusName(value.status),
  };
}

function isCompleteAdapter(value) {
  return Boolean(value && REQUIRED_ADAPTER_METHODS.every((name) => typeof value[name] === 'function'));
}

function unavailableClient(injected) {
  const unavailable = async () => {
    throw new Error('The SelyoPass contract client is not configured. Publish a reviewed testnet deployment before using chain actions.');
  };
  const client = {
    configured: false,
    contractId: injected?.contractId || 'Not published',
    anchorContractId: injected?.anchorContractId || 'Not published',
    sourceSha: injected?.sourceSha || deploymentManifest.sourceSha || 'Not published',
    rpcUrl: injected?.rpcUrl || deploymentManifest.rpcUrl,
  };
  for (const method of REQUIRED_ADAPTER_METHODS) client[method] = unavailable;
  return client;
}

function injectedClient(injected) {
  const client = {
    configured: true,
    contractId: injected.contractId || 'Not published',
    anchorContractId: injected.anchorContractId || 'Not published',
    sourceSha: injected.sourceSha || deploymentManifest.sourceSha || 'Not published',
    rpcUrl: injected.rpcUrl || deploymentManifest.rpcUrl,
  };
  for (const method of REQUIRED_ADAPTER_METHODS) client[method] = injected[method].bind(injected);
  return client;
}

function reasonCode(value) {
  if (Number.isInteger(value) && value >= 0) return value;
  if (REASON_CODES[value]) return REASON_CODES[value];
  throw new Error('Reason code must be a documented non-negative integer.');
}

function eventType(value) {
  return String(value || 'contract_event').replace(/^credential_/, '').toLowerCase();
}

function bytesHex(value) {
  if (Buffer.isBuffer(value) || value instanceof Uint8Array) return Buffer.from(value).toString('hex');
  return String(value || '');
}

export function createConfiguredContractClient(options = globalThis.__SELYOPASS_CONTRACT_CLIENT__) {
  if (isCompleteAdapter(options)) return injectedClient(options);

  const config = options?.deployment ? options : {};
  const deployment = config.deployment || deploymentManifest;
  const anchorId = deployment.contracts?.anchorRegistry?.id;
  const credentialId = deployment.contracts?.credentialRegistry?.id;
  const configured = deployment.status === 'deployed'
    && CONTRACT_ID.test(anchorId || '')
    && CONTRACT_ID.test(credentialId || '');
  if (!configured) return unavailableClient(options);

  const rpcUrl = deployment.rpcUrl || 'https://soroban-testnet.stellar.org';
  const networkPassphrase = config.networkPassphrase || Networks.TESTNET;
  const credentialFactory = config.credentialFactory
    || ((clientOptions) => new CredentialRegistryClient(clientOptions));
  const anchorFactory = config.anchorFactory
    || ((clientOptions) => new AnchorRegistryClient(clientOptions));
  const server = config.server || new rpc.Server(rpcUrl);
  const transactionFromXdr = config.transactionFromXdr
    || ((xdr) => TransactionBuilder.fromXDR(xdr, networkPassphrase));
  const toNative = config.scValToNative || sdkScValToNative;
  const sleep = config.sleep || ((milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)));

  const base = (contractId, publicKey) => ({
    contractId,
    rpcUrl,
    networkPassphrase,
    ...(publicKey ? { publicKey } : {}),
  });
  const credentials = (publicKey) => credentialFactory(base(credentialId, publicKey));
  const anchors = () => anchorFactory(base(anchorId));
  const assemble = async (method, publicKey, args) => {
    const transaction = await credentials(publicKey)[method](args);
    // A contract method returning Result<T, E> can simulate successfully at
    // the RPC level while the contract's own logic already decided to
    // reject the call (e.g. a duplicate credential ID). Left unchecked, that
    // rejection was previously discarded here and the caller went on to ask
    // the wallet to sign and submit a transaction that was always going to
    // fail, burning the full confirm() budget before any error surfaced.
    if (typeof transaction.result?.isErr === 'function' && transaction.result.isErr()) {
      throw new Error(`SimulationRejected: the contract rejected this ${method} before signing.`);
    }
    return { unsignedXdr: transaction.toXDR() };
  };
  const read = async (method, args) => unwrap((await credentials()[method](args)).result);
  const existsById = async (id) => read('exists', { credential_id: credentialIdBytes(id) });
  const assertNotExists = async (id) => {
    // Checked here, client-side, because the contract's own AlreadyExists
    // rejection decodes to an empty message (see assemble()'s comment) and
    // would otherwise still cost the user a real wallet signature and a
    // full RPC submission before failing. Both request() and
    // request_refresh() apply this identical check to their new
    // credential_id in the contract, so both precheck it the same way here.
    if (await existsById(id)) {
      throw new Error('AlreadyExists: a credential with this ID already exists on-chain.');
    }
  };

  return {
    configured: true,
    contractId: credentialId,
    anchorContractId: anchorId,
    sourceSha: deployment.sourceSha || 'Not published',
    rpcUrl,
    request: async (subject, id, documentRoot, schemaHash, expiresLedger) => {
      await assertNotExists(id);
      return assemble(
        'request',
        subject,
        {
          subject,
          credential_id: credentialIdBytes(id),
          document_root: hexBytes(documentRoot, 'document root'),
          schema_hash: hexBytes(schemaHash, 'schema hash'),
          expires_ledger: expiresLedger,
        },
      );
    },
    request_refresh: async (subject, id, previousId, documentRoot, schemaHash, expiresLedger) => {
      await assertNotExists(id);
      return assemble(
        'request_refresh',
        subject,
        {
          subject,
          credential_id: credentialIdBytes(id),
          previous_credential_id: credentialIdBytes(previousId),
          document_root: hexBytes(documentRoot, 'document root'),
          schema_hash: hexBytes(schemaHash, 'schema hash'),
          expires_ledger: expiresLedger,
        },
      );
    },
    issue: async (issuer, id) => assemble('issue', issuer, {
      issuer,
      credential_id: credentialIdBytes(id),
    }),
    reject: async (issuer, id, code) => assemble('reject', issuer, {
      issuer,
      credential_id: credentialIdBytes(id),
      reason_code: reasonCode(code),
    }),
    revoke: async (issuer, id, code) => assemble('revoke', issuer, {
      issuer,
      credential_id: credentialIdBytes(id),
      reason_code: reasonCode(code),
    }),
    get: async (id) => normalizeRecord(await read('get', { credential_id: credentialIdBytes(id) })),
    status: async (id) => statusName(await read('status', { credential_id: credentialIdBytes(id) })),
    exists: async (id) => existsById(id),
    is_authorized: async (anchor) => unwrap((await anchors().is_authorized({ anchor })).result),
    submit: async (signedXdr) => {
      const response = await server.sendTransaction(transactionFromXdr(signedXdr));
      if (!['PENDING', 'DUPLICATE'].includes(response.status) || !response.hash) {
        throw new Error(`RPC submission failed: ${response.status || 'unknown status'}`);
      }
      return { hash: response.hash };
    },
    confirm: async (transactionHash) => {
      // 30 attempts at 1s gives ~30s of budget. Soroban testnet ledgers close
      // roughly every 5-6s, and confirmation typically needs 2-3 closes to be
      // safely observed via RPC; 20 attempts (~20s) was too tight under any
      // ingestion lag and produced a false "RPC request timed out" even when
      // the underlying transaction had actually succeeded.
      for (let attempt = 0; attempt < 30; attempt += 1) {
        const response = await server.getTransaction(transactionHash);
        if (response.status === 'SUCCESS') return response;
        if (response.status === 'FAILED') return response;
        if (attempt < 29) await sleep(1000);
      }
      throw new Error('RPC confirmation timeout.');
    },
    getEvents: async (startLedger) => {
      let ledger = Number(startLedger);
      if (!Number.isInteger(ledger) || ledger < 1) {
        ledger = Math.max(1, (await server.getLatestLedger()).sequence - EVENT_RECOVERY_LEDGERS);
      }
      const response = await server.getEvents({
        startLedger: ledger,
        filters: [{ type: 'contract', contractIds: [credentialId] }],
        limit: 100,
      });
      return {
        events: response.events.map((event) => {
          const topics = event.topic.map(toNative);
          const value = toNative(event.value);
          const type = eventType(topics[0]);
          const normalizedValue = value && typeof value === 'object'
            ? {
              ...value,
              document_root: bytesHex(value.document_root),
              schema_hash: bytesHex(value.schema_hash),
            }
            : value;
          return {
            id: event.id,
            ledger: event.ledger,
            txHash: event.txHash,
            type,
            credentialId: bytesHex(topics[1] || value?.credential_id),
            subject: bytesHex(type === 'requested' ? topics[2] : value?.subject),
            previousCredentialId: bytesHex(type === 'refresh_requested' ? topics[2] || value?.previous_credential_id : value?.previous_credential_id),
            successorCredentialId: bytesHex(type === 'superseded' ? topics[2] || value?.successor_credential_id : value?.successor_credential_id),
            documentRoot: bytesHex(value?.document_root),
            schemaHash: bytesHex(value?.schema_hash),
            expiresLedger: value?.expires_ledger,
            value: normalizedValue,
          };
        }),
      };
    },
  };
}

export function isTransactionHash(transactionHash) {
  return typeof transactionHash === 'string' && /^[a-f0-9]{64}$/i.test(transactionHash);
}

export const explorerTxUrl = (transactionHash) =>
  isTransactionHash(transactionHash)
    ? `https://stellar.expert/explorer/testnet/tx/${transactionHash}`
    : null;
