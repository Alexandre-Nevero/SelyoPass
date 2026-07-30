import { canonicalize } from './canonical.js';
import { sha256Hex } from './hash.js';

const HEX_32 = /^[0-9a-f]{64}$/i;
const CONTRACT_ID = /^C[A-Z2-7]{55}$/;
const ACCOUNT_ID = /^G[A-Z2-7]{55}$/;
const PROHIBITED_KEYS = /(?:document|file)[_-]?(?:bytes|content|base64)|secret|seed|private[_-]?key/i;
const PACKAGE_V1_0_KEYS = new Set([
  'package_version', 'network', 'credential_registry_id', 'anchor_registry_id',
  'credential_id', 'credential_label', 'subject', 'organization', 'schema_id',
  'schema_hash', 'expires_ledger', 'document_manifest', 'document_root',
  'request_tx_hash', 'request_ledger', 'issue_tx_hash', 'created_at',
]);
const PACKAGE_V1_1_KEYS = new Set([
  ...PACKAGE_V1_0_KEYS,
  'previous_credential_id', 'app_release_sha',
]);
const DESCRIPTOR_KEYS = new Set(['document_type', 'sha256', 'byte_length', 'display_name']);

function canonicalDescriptors(descriptors) {
  if (!Array.isArray(descriptors) || descriptors.length === 0) return [];
  return descriptors.map(({ document_type, sha256, byte_length }) => ({
    document_type,
    sha256: String(sha256 || '').toLowerCase(),
    byte_length,
  })).sort((a, b) =>
    a.document_type.localeCompare(b.document_type)
      || a.sha256.localeCompare(b.sha256));
}

export async function buildDocumentRoot(descriptors) {
  return sha256Hex(canonicalize(canonicalDescriptors(descriptors)));
}

export const LOCAL_FILE_LIMITS = Object.freeze({ count: 10, bytesPerFile: 10 * 1024 * 1024 });

export function validateLocalFiles(files, existingCount = 0) {
  if (!Array.isArray(files) || files.length === 0) throw new Error('Select at least one local file.');
  if (existingCount + files.length > LOCAL_FILE_LIMITS.count) {
    throw new Error(`Select no more than ${LOCAL_FILE_LIMITS.count} local files.`);
  }
  const oversized = files.find((file) => !Number.isInteger(file?.size) || file.size > LOCAL_FILE_LIMITS.bytesPerFile);
  if (oversized) throw new Error(`${oversized.name || 'A local file'} exceeds the 10 MiB local hashing limit.`);
  return files;
}

export async function createPresentationPackage({
  client, record, subject, documentManifest, documentRoot, receipt,
  appReleaseSha = import.meta.env.VITE_RELEASE_SHA || 'local-development',
}) {
  const credentialLabel = String(record.credential_id).trim();
  return structuredClone({
    package_version: '1.1',
    network: 'testnet',
    credential_registry_id: client.contractId,
    anchor_registry_id: client.anchorContractId,
    credential_id: await sha256Hex(credentialLabel),
    credential_label: credentialLabel,
    subject,
    organization: record.organization,
    schema_id: 'selyopass.ph.kyb.synthetic.v1',
    schema_hash: record.schema_hash,
    expires_ledger: Number(record.expires_ledger),
    document_manifest: documentManifest,
    document_root: documentRoot,
    request_tx_hash: receipt.hash,
    request_ledger: receipt.ledger ?? null,
    previous_credential_id: record.previous_credential_id ?? null,
    app_release_sha: appReleaseSha,
    created_at: new Date().toISOString(),
  });
}

function assertPackageShape(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Presentation package must be a JSON object.');
  const scanKeys = (input) => {
    if (!input || typeof input !== 'object') return null;
    for (const [key, nested] of Object.entries(input)) {
      if (PROHIBITED_KEYS.test(key)) return key;
      const found = scanKeys(nested);
      if (found) return found;
    }
    return null;
  };
  const unsafeKey = scanKeys(value);
  if (unsafeKey) throw new Error(`Presentation package contains prohibited field: ${unsafeKey}.`);
  const packageKeys = value.package_version === '1.1' ? PACKAGE_V1_1_KEYS : PACKAGE_V1_0_KEYS;
  const unknownKey = Object.keys(value).find((key) => !packageKeys.has(key));
  if (unknownKey) throw new Error(`Presentation package contains unsupported field: ${unknownKey}.`);
  if (!['1.0', '1.1'].includes(value.package_version)) throw new Error('Unsupported presentation package version.');
  if (value.network !== 'testnet') throw new Error('Unsupported presentation package network.');
  if (!CONTRACT_ID.test(value.credential_registry_id || '') || !CONTRACT_ID.test(value.anchor_registry_id || '')) {
    throw new Error('Presentation package contains an invalid contract ID.');
  }
  if (!HEX_32.test(value.credential_id || '')
    || !HEX_32.test(value.schema_hash || '')
    || !HEX_32.test(value.document_root || '')
    || !HEX_32.test(value.request_tx_hash || '')) {
    throw new Error('Presentation package contains an invalid hash.');
  }
  if (!ACCOUNT_ID.test(value.subject || '')) throw new Error('Presentation package contains an invalid subject.');
  if (typeof value.credential_label !== 'string'
    || typeof value.organization !== 'string'
    || value.schema_id !== 'selyopass.ph.kyb.synthetic.v1') {
    throw new Error('Presentation package contains invalid local metadata.');
  }
  if (!Number.isInteger(value.expires_ledger) || value.expires_ledger < 1) throw new Error('Presentation package contains an invalid expiry ledger.');
  if (!Array.isArray(value.document_manifest) || value.document_manifest.length === 0) {
    throw new Error('Presentation package document manifest must contain at least one descriptor.');
  }
  for (const entry of value.document_manifest) {
    if (!entry || typeof entry !== 'object'
      || typeof entry.document_type !== 'string'
      || !HEX_32.test(entry.sha256 || '')
      || !Number.isInteger(entry.byte_length)
      || entry.byte_length < 0
      || (entry.display_name != null && typeof entry.display_name !== 'string')) {
      throw new Error('Presentation package contains an invalid document manifest entry.');
    }
    if (Object.keys(entry).some((key) => PROHIBITED_KEYS.test(key))) {
      throw new Error('Presentation package document manifest contains prohibited content.');
    }
    if (Object.keys(entry).some((key) => !DESCRIPTOR_KEYS.has(key))) {
      throw new Error('Presentation package document manifest contains an unsupported field.');
    }
  }
  if (Number.isNaN(Date.parse(value.created_at))) throw new Error('Presentation package contains an invalid creation time.');
  if (value.package_version === '1.1') {
    if (value.previous_credential_id != null && !HEX_32.test(value.previous_credential_id)) {
      throw new Error('Presentation package contains an invalid previous credential ID.');
    }
    if (!/^[0-9a-f]{40}$/i.test(value.app_release_sha || '') && value.app_release_sha !== 'local-development') {
      throw new Error('Presentation package contains an invalid app release SHA.');
    }
  }
  return value;
}

export function parsePresentationPackage(text) {
  let parsed;
  try {
    parsed = typeof text === 'string' ? JSON.parse(text) : text;
  } catch {
    throw new Error('Presentation package is not valid JSON.');
  }
  return assertPackageShape(parsed?.manifest || parsed);
}

export async function findIssuanceEvent(events, credentialId) {
  const key = HEX_32.test(credentialId || '')
    ? credentialId.toLowerCase()
    : await sha256Hex(String(credentialId || '').trim());
  return events.find((event) =>
    event.type === 'issued' && String(event.credentialId).toLowerCase() === key) || null;
}

export async function resolveCredentialFreshness({
  credentialId, getRecord, getStatus, maxRecords = 10,
}) {
  const seen = new Set();
  let nextId = credentialId;
  let presentedRecord = null;
  let presentedStatus = null;
  for (let index = 0; index < maxRecords; index += 1) {
    const identity = String(nextId).toLowerCase();
    if (seen.has(identity)) throw new Error('Credential successor chain contains a cycle.');
    seen.add(identity);
    const [record, status] = await Promise.all([getRecord(nextId), getStatus(nextId)]);
    if (index === 0) {
      presentedRecord = record;
      presentedStatus = status;
    }
    if (status !== 'superseded' || !record?.successor_credential_id) {
      return {
        presentedRecord,
        presentedStatus,
        currentRecord: record,
        currentStatus: status,
        successorId: presentedRecord?.successor_credential_id || null,
      };
    }
    nextId = record.successor_credential_id;
  }
  throw new Error('Credential successor chain exceeds the 10 records limit.');
}

function documentRows(manifest, localDocuments) {
  return (manifest?.document_manifest || []).map((entry, index) => {
    const name = entry.display_name || `Document ${index + 1}`;
    const local = localDocuments?.[entry.display_name];
    const match = Boolean(local)
      && local.sha256.toLowerCase() === entry.sha256.toLowerCase()
      && local.byte_length === entry.byte_length;
    return {
      key: `document:${name}`,
      label: `Document fingerprint — ${name}`,
      state: match ? 'confirmed' : 'failed',
      detail: !local ? 'Matching local file was not presented' : match ? 'Hash and byte length match' : 'Hash or byte length differs',
    };
  });
}

export async function verifyEvidence({
  manifest, credentialId, registryIds, localDocuments = {}, record, status, authorized, issuanceEvent,
  freshness,
}) {
  const presentedDescriptors = (manifest?.document_manifest || []).map((entry) => {
    const local = localDocuments[entry.display_name] || {};
    return { ...entry, sha256: local.sha256, byte_length: local.byte_length };
  });
  const computedRoot = presentedDescriptors.length
    ? await buildDocumentRoot(presentedDescriptors)
    : null;
  const claimedCredentialId = manifest?.credential_id || credentialId;
  const manifestCredentialKey = claimedCredentialId
    ? (HEX_32.test(claimedCredentialId)
      ? claimedCredentialId.toLowerCase()
      : await sha256Hex(claimedCredentialId.trim()))
    : null;
  const localMatch = Boolean(manifest?.document_root) && computedRoot === manifest.document_root;
  const idMatches = Boolean(manifestCredentialKey)
    && [record?.credential_id?.toLowerCase()].includes(manifestCredentialKey);
  const chainFieldsMatch = Boolean(manifest && record) && idMatches
    && record.document_root?.toLowerCase() === manifest.document_root?.toLowerCase()
    && record.schema_hash?.toLowerCase() === manifest.schema_hash?.toLowerCase()
    && record.subject === manifest.subject
    && Number(record.expires_ledger) === Number(manifest.expires_ledger);
  const registryIdsMatch = Boolean(manifest && registryIds)
    && manifest.credential_registry_id === registryIds.credential
    && manifest.anchor_registry_id === registryIds.anchor;
  return [
    { key: 'manifest', label: 'Presentation manifest', state: manifest?.credential_id ? 'available' : 'unavailable', detail: manifest?.credential_id || 'Credential-ID-only check; no local package loaded' },
    { key: 'contract_binding', label: 'Package registry IDs', state: !manifest || !registryIds ? 'unavailable' : registryIdsMatch ? 'confirmed' : 'failed', detail: !manifest ? 'No presentation package loaded' : !registryIds ? 'No configured registry IDs to compare' : registryIdsMatch ? 'Package targets the configured release contracts' : 'Package contract IDs differ from the configured release' },
    ...documentRows(manifest, localDocuments),
    { key: 'local_rehash', label: 'Local document rehash', state: !manifest ? 'unavailable' : localMatch ? 'confirmed' : 'failed', detail: !manifest ? 'Load a presentation package and local files to check fingerprints' : localMatch ? 'Computed root matches manifest' : 'Computed root does not match manifest' },
    { key: 'registry_record', label: 'Registry record', state: idMatches ? 'confirmed' : record ? 'failed' : 'unavailable', detail: record ? `Record ${record.credential_id}` : 'No registry record returned' },
    { key: 'on_chain_binding', label: 'Manifest bound to on-chain record', state: !manifest ? 'unavailable' : chainFieldsMatch ? 'confirmed' : record ? 'failed' : 'unavailable', detail: !manifest ? 'No presentation package loaded' : chainFieldsMatch ? 'Root, schema, subject, and expiry match' : record ? 'One or more anchored fields differ' : 'No registry record returned' },
    { key: 'registry_status', label: 'Registry status', state: status === 'issued' ? 'confirmed' : status ? 'available' : 'unavailable', detail: status || 'No status returned' },
    { key: 'credential_freshness', label: 'Credential freshness', state: !freshness ? 'unavailable' : freshness.presentedStatus === 'superseded' ? freshness.currentStatus === 'issued' ? 'confirmed' : 'available' : freshness.currentStatus === 'issued' ? 'confirmed' : 'available', detail: !freshness ? 'No successor traversal completed' : freshness.presentedStatus === 'superseded' ? `Superseded by ${freshness.successorId || 'an unavailable successor link'}. Current successor status: ${freshness.currentStatus}` : `Current status: ${freshness.currentStatus}` },
    { key: 'anchor_authorization', label: 'Current anchor authorization', state: authorized === true ? 'confirmed' : authorized === false ? 'failed' : 'unavailable', detail: authorized == null ? 'Not checked' : authorized ? 'Currently authorized by registry' : 'Not currently authorized by registry' },
    { key: 'issuance_event', label: 'Issuance event', state: issuanceEvent ? 'confirmed' : 'unavailable', detail: issuanceEvent?.id || 'No matching event observed in the RPC window' },
  ];
}
