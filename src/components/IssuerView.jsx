import { useState } from 'react';
import { ORGANIZATION_FIELDS, PH_DOCUMENT_TYPES, validateCredential } from '../lib/schema.js';
import { buildCredential, signCredential, withFingerprint } from '../lib/credential.js';
import { hashFile } from '../lib/hash.js';
import { anchorCredentialOnChain } from '../lib/onchain.js';
import { signXDR } from '../lib/wallet.js';
import { getSimulatedAnchorSecret, SIMULATED_ANCHOR_PUBLIC_KEY } from '../lib/anchorIdentity.js';
import { explorerTxUrl } from '../lib/stellar.js';

const emptyOrg = Object.fromEntries(ORGANIZATION_FIELDS.map((f) => [f.key, '']));

export default function IssuerView({ publicKey }) {
  const [org, setOrg] = useState(emptyOrg);
  const [owners, setOwners] = useState([{ name: '', ownership_percentage: '' }]);
  const [docHashes, setDocHashes] = useState({});
  const [docNames, setDocNames] = useState({});
  const [errors, setErrors] = useState([]);
  const [hashing, setHashing] = useState('');
  const [credential, setCredential] = useState(null);
  const [issuing, setIssuing] = useState(false);

  const [anchoring, setAnchoring] = useState(false);
  const [anchorResult, setAnchorResult] = useState(null);
  const [anchorError, setAnchorError] = useState('');

  function updateOrg(key, value) {
    setOrg((o) => ({ ...o, [key]: value }));
  }
  function updateOwner(i, key, value) {
    setOwners((list) => list.map((o, idx) => (idx === i ? { ...o, [key]: value } : o)));
  }
  function addOwner() {
    setOwners((list) => [...list, { name: '', ownership_percentage: '' }]);
  }
  function removeOwner(i) {
    setOwners((list) => (list.length > 1 ? list.filter((_, idx) => idx !== i) : list));
  }

  async function onFile(key, file) {
    if (!file) return;
    setHashing(key);
    try {
      const hash = await hashFile(file); // F-003: hashed locally, file never uploaded
      setDocHashes((h) => ({ ...h, [key]: hash }));
      setDocNames((n) => ({ ...n, [key]: file.name }));
    } catch (e) {
      setErrors([{ field: `document_hashes.${key}`, message: `Could not read/hash file: ${e.message}` }]);
    } finally {
      setHashing('');
    }
  }

  async function issue() {
    setErrors([]);
    setCredential(null);
    setAnchorResult(null);
    setAnchorError('');
    setIssuing(true);
    try {
      const payload = buildCredential({
        organization: org,
        beneficialOwners: owners,
        documentHashes: docHashes,
        anchorPublicKey: SIMULATED_ANCHOR_PUBLIC_KEY,
      });
      const { valid, errors: errs } = validateCredential(payload);
      if (!valid) {
        setErrors(errs);
        return;
      }
      const signed = signCredential(payload, getSimulatedAnchorSecret());
      const finalCredential = await withFingerprint(signed);
      setCredential(finalCredential);
    } catch (e) {
      setErrors([{ field: 'issuance', message: e.message }]);
    } finally {
      setIssuing(false);
    }
  }

  async function anchorOnChain() {
    setAnchorError('');
    setAnchorResult(null);
    if (!publicKey) {
      setAnchorError('Connect your Freighter wallet to anchor on testnet.');
      return;
    }
    setAnchoring(true);
    try {
      const result = await anchorCredentialOnChain({
        sourcePublicKey: publicKey,
        signXDR,
        credential,
      });
      setAnchorResult(result);
    } catch (e) {
      const message =
        e?.response?.data?.extras?.result_codes?.operations?.[0] || e?.message || 'Anchoring failed.';
      setAnchorError(`Anchoring failed: ${message}`);
    } finally {
      setAnchoring(false);
    }
  }

  function downloadCredential() {
    const blob = new Blob([JSON.stringify(credential, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${credential.credential_id}.selyopass.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const errorFor = (field) => errors.find((e) => e.field === field)?.message;

  return (
    <div className="view">
      <div className="form-card">
        <h2 className="form-title">Issue a KYB Credential</h2>
        <p className="form-hint">
          Documents are hashed in your browser — only the SHA-256 hash is recorded. SelyoPass never
          uploads or stores your documents (BR-002).
        </p>

        <h3 className="section-title">Company (SEP-9 organization fields)</h3>
        {ORGANIZATION_FIELDS.map((f) => (
          <div className="form-group" key={f.key}>
            <label htmlFor={f.key}>{f.label}</label>
            <input
              id={f.key}
              type="text"
              value={org[f.key]}
              onChange={(e) => updateOrg(f.key, e.target.value)}
            />
            {errorFor(`organization.${f.key}`) && (
              <span className="field-error">{errorFor(`organization.${f.key}`)}</span>
            )}
          </div>
        ))}

        <h3 className="section-title">Beneficial owners (UBO — SEC MC No. 15 s.2025)</h3>
        {owners.map((o, i) => (
          <div className="owner-row" key={i}>
            <input
              type="text"
              placeholder="Owner name"
              value={o.name}
              onChange={(e) => updateOwner(i, 'name', e.target.value)}
            />
            <input
              type="number"
              placeholder="%"
              min="0"
              max="100"
              value={o.ownership_percentage}
              onChange={(e) => updateOwner(i, 'ownership_percentage', e.target.value)}
            />
            <button type="button" className="btn btn-outline btn-sm" onClick={() => removeOwner(i)}>
              –
            </button>
          </div>
        ))}
        {errorFor('beneficial_owners') && (
          <span className="field-error">{errorFor('beneficial_owners')}</span>
        )}
        <button type="button" className="btn btn-outline btn-sm" onClick={addOwner}>
          + Add owner
        </button>

        <h3 className="section-title">Documents (hashed locally — F-003)</h3>
        {PH_DOCUMENT_TYPES.map((d) => (
          <div className="form-group" key={d.key}>
            <label htmlFor={d.key}>{d.label}</label>
            <input id={d.key} type="file" onChange={(e) => onFile(d.key, e.target.files?.[0])} />
            {hashing === d.key && <span className="field-note">hashing…</span>}
            {docHashes[d.key] && (
              <span className="field-ok" title={docHashes[d.key]}>
                ✓ {docNames[d.key]} — sha256:{docHashes[d.key].slice(0, 12)}…
              </span>
            )}
            {errorFor(`document_hashes.${d.key}`) && (
              <span className="field-error">{errorFor(`document_hashes.${d.key}`)}</span>
            )}
          </div>
        ))}

        <button className="btn btn-primary btn-full" onClick={issue} disabled={issuing}>
          {issuing ? 'Issuing…' : 'Issue Credential (sign with anchor)'}
        </button>
        {errorFor('issuance') && <span className="field-error">{errorFor('issuance')}</span>}
        {errors.length > 0 && !credential && (
          <p className="field-error">Fix the {errors.length} field error(s) above and try again.</p>
        )}
      </div>

      {credential && (
        <div className="status-card success">
          <p className="status-message">Credential issued and signed by the simulated anchor.</p>
          <p className="mono-small">id: {credential.credential_id}</p>
          <p className="mono-small">fingerprint: {credential.signed_payload_sha256.slice(0, 24)}…</p>

          <div className="btn-row">
            <button className="btn btn-outline btn-sm" onClick={downloadCredential}>
              Download credential JSON
            </button>
            <button className="btn btn-primary btn-sm" onClick={anchorOnChain} disabled={anchoring}>
              {anchoring ? 'Anchoring…' : 'Anchor hash on Stellar testnet'}
            </button>
          </div>

          {anchorError && <p className="field-error">{anchorError}</p>}
          {anchorResult && (
            <div className="anchor-result">
              <p className="status-message">Hash anchored on testnet ✓</p>
              <a className="tx-link" href={explorerTxUrl(anchorResult.hash)} target="_blank" rel="noopener noreferrer">
                View transaction on Stellar Expert →
              </a>
            </div>
          )}

          <details className="cred-json">
            <summary>View credential JSON</summary>
            <pre>{JSON.stringify(credential, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}
