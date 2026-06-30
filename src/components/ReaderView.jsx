import { useState } from 'react';
import { PH_DOCUMENT_TYPES } from '../lib/schema.js';
import { verifyCredentialSignature, verifyDocumentHashes } from '../lib/credential.js';
import { hashFile } from '../lib/hash.js';
import { readOnChainAnchor } from '../lib/onchain.js';
import { TRUSTED_ANCHOR_PUBLIC_KEY, SIMULATED_ANCHOR_NAME } from '../lib/anchorIdentity.js';
import { explorerAccountUrl } from '../lib/stellar.js';

export default function ReaderView() {
  const [jsonText, setJsonText] = useState('');
  const [presented, setPresented] = useState({});
  const [presentedNames, setPresentedNames] = useState({});
  const [hashing, setHashing] = useState('');
  const [anchoringAccount, setAnchoringAccount] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  async function loadFile(file) {
    if (!file) return;
    try {
      setJsonText(await file.text());
      setError('');
    } catch (e) {
      setError(`Could not read file: ${e.message}`);
    }
  }

  async function onPresentDoc(key, file) {
    if (!file) return;
    setHashing(key);
    try {
      const hash = await hashFile(file);
      setPresented((h) => ({ ...h, [key]: hash }));
      setPresentedNames((n) => ({ ...n, [key]: file.name }));
    } catch (e) {
      setError(`Could not hash presented document: ${e.message}`);
    } finally {
      setHashing('');
    }
  }

  async function verify() {
    setError('');
    setResult(null);
    setVerifying(true);
    try {
      let credential;
      try {
        credential = JSON.parse(jsonText);
      } catch (_) {
        setError('Credential is not valid JSON. Paste the credential or load the .json file.');
        return;
      }

      const sig = verifyCredentialSignature(credential, TRUSTED_ANCHOR_PUBLIC_KEY);
      const docs = verifyDocumentHashes(credential, presented);

      let onChain = null;
      if (anchoringAccount.trim()) {
        try {
          onChain = await readOnChainAnchor(anchoringAccount.trim(), credential);
        } catch (e) {
          onChain = { found: false, error: e.message };
        }
      }

      const accepted = sig.valid && sig.trustedAnchor && docs.valid;
      setResult({ credential, sig, docs, onChain, accepted });
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="view">
      <div className="form-card">
        <h2 className="form-title">Verify a KYB Credential</h2>
        <p className="form-hint">
          Relying party view. Paste a credential, present the documents, and verify the anchor
          signature and document hashes.
        </p>

        <div className="form-group">
          <label htmlFor="credfile">Load credential JSON</label>
          <input id="credfile" type="file" accept="application/json,.json" onChange={(e) => loadFile(e.target.files?.[0])} />
        </div>
        <div className="form-group">
          <label htmlFor="credjson">…or paste credential JSON</label>
          <textarea
            id="credjson"
            rows={6}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder='{ "schema": "selyopass.kyb.ph.v1", ... }'
          />
        </div>

        <h3 className="section-title">Present documents (re-hashed to compare)</h3>
        {PH_DOCUMENT_TYPES.map((d) => (
          <div className="form-group" key={d.key}>
            <label htmlFor={`r-${d.key}`}>{d.label}</label>
            <input id={`r-${d.key}`} type="file" onChange={(e) => onPresentDoc(d.key, e.target.files?.[0])} />
            {hashing === d.key && <span className="field-note">hashing…</span>}
            {presented[d.key] && <span className="field-ok">✓ {presentedNames[d.key]}</span>}
          </div>
        ))}

        <div className="form-group">
          <label htmlFor="anchoracct">Anchoring account (optional — on-chain cross-check)</label>
          <input
            id="anchoracct"
            type="text"
            placeholder="G… (account that anchored the hash)"
            value={anchoringAccount}
            onChange={(e) => setAnchoringAccount(e.target.value)}
          />
        </div>

        <button className="btn btn-primary btn-full" onClick={verify} disabled={verifying}>
          {verifying ? 'Verifying…' : 'Verify Credential'}
        </button>
        {error && <p className="field-error">{error}</p>}
      </div>

      {result && <VerificationResult result={result} />}
    </div>
  );
}

function VerificationResult({ result }) {
  const { sig, docs, onChain, accepted } = result;
  return (
    <div className={`status-card ${accepted ? 'success' : 'reject'}`}>
      <p className="verdict">{accepted ? 'VERIFIED TRANSMISSION' : 'NOT VERIFIED'}</p>

      <ul className="checklist">
        <li className={sig.valid ? 'ok' : 'bad'}>
          Anchor signature: {sig.valid ? 'valid' : `invalid — ${sig.reason}`}
        </li>
        <li className={sig.trustedAnchor ? 'ok' : 'bad'}>
          Issuing anchor:{' '}
          {sig.valid
            ? sig.trustedAnchor
              ? `trusted (${SIMULATED_ANCHOR_NAME})`
              : `UNKNOWN anchor (${shorten(sig.anchorPublicKey)}) — not the trusted anchor`
            : '—'}
        </li>
        <li className={docs.valid ? 'ok' : 'bad'}>
          Documents:{' '}
          {docs.valid
            ? 'all presented documents match the anchored hashes'
            : `${docs.mismatches.length} mismatch, ${docs.missing.length} not presented`}
        </li>
        {docs.mismatches.length > 0 && (
          <li className="bad">Hash mismatch: {docs.mismatches.join(', ')}</li>
        )}
        {docs.missing.length > 0 && (
          <li className="warn">Not presented: {docs.missing.join(', ')}</li>
        )}
        {onChain && (
          <li className={onChain.found && onChain.matches ? 'ok' : 'warn'}>
            On-chain cross-check:{' '}
            {onChain.error
              ? `could not read (${onChain.error})`
              : !onChain.found
              ? 'no anchor entry on that account'
              : onChain.matches
              ? 'on-chain hash matches'
              : 'on-chain hash does NOT match'}
          </li>
        )}
      </ul>

      {result.credential?.anchor?.public_key && (
        <a
          className="tx-link"
          href={explorerAccountUrl(result.credential.anchor.public_key)}
          target="_blank"
          rel="noopener noreferrer"
        >
          View anchor account on Stellar Expert →
        </a>
      )}

      <p className="disclaimer">
        This shows only what was cryptographically verified and by which anchor. It is structured,
        signed, hash-verified document transmission — <strong>not</strong> a compliance approval or a
        “trust-this-business” stamp. The relying institution makes its own compliance decision
        (BR-003; BSP Circular 1170).
      </p>
    </div>
  );
}

function shorten(k) {
  return k ? `${k.slice(0, 6)}…${k.slice(-4)}` : '';
}
