import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { createConfiguredContractClient, explorerTxUrl } from './lib/onchain.js';
import { walletService as defaultWalletService } from './lib/wallet.js';
import { createEventPoller, initialTransaction, runContractTransaction, transactionReducer } from './lib/transaction.js';
import {
  buildDocumentRoot,
  createPresentationPackage,
  findIssuanceEvent,
  parsePresentationPackage,
  resolveCredentialFreshness,
  validateLocalFiles,
  verifyEvidence,
} from './lib/evidence.js';
import { hashFile } from './lib/hash.js';

const routes = ['/', '/prepare', '/anchor', '/verify'];
const labels = { '/prepare': 'Prepare', '/verify': 'Verify', '/anchor': 'Anchor console' };
const sample = { organization: 'Synthetic PH startup — Demo only', credential_id: 'sp-demo-001', schema_hash: '7bf2ee89'.padEnd(64, '0'), expires_ledger: '' };
const appReleaseSha = import.meta.env.VITE_RELEASE_SHA || 'local-development';
const route = () => { const value = location.hash.replace('#', '') || '/'; return routes.includes(value) ? value : '/'; };
const go = (value) => { location.hash = value; };
const short = (value = '') => value.length > 18 ? `${value.slice(0, 10)}…${value.slice(-6)}` : value;
export const requiresCurrentAnchorAuthorization = (action) => action !== 'revoke';

export default function App({ client = createConfiguredContractClient(), wallets = defaultWalletService }) {
  const [current, setCurrent] = useState(route());
  useEffect(() => { const change = () => setCurrent(route()); addEventListener('hashchange', change); return () => removeEventListener('hashchange', change); }, []);
  return <main className="shell"><Header current={current} />{current === '/' && <Chooser />}{current === '/prepare' && <Prepare client={client} wallets={wallets} />}{current === '/anchor' && <Anchor client={client} wallets={wallets} />}{current === '/verify' && <Verify client={client} />}</main>;
}

function Header({ current }) {
  return <header className="site-header"><button className="brand" onClick={() => go('/')} aria-label="SelyoPass home">SelyoPass <span>Testnet</span></button><nav aria-label="Primary navigation">{Object.entries(labels).map(([href, label]) => <a key={href} aria-current={current === href ? 'page' : undefined} href={`#${href}`}>{label}</a>)}</nav></header>;
}
function Chooser() {
  return <section className="role-chooser"><p className="eyebrow">Portable KYB evidence · Philippines · Testnet</p><h1>Pass evidence between parties without moving the documents.</h1><p className="lede">Prepare local hashes or independently check a presented credential. SelyoPass is a secure data courier, not a compliance stamp.</p><div className="primary-choices"><button className="choice" onClick={() => go('/prepare')}><b>Prepare evidence</b><span>Hash synthetic files locally and request a credential.</span></button><button className="choice" onClick={() => go('/verify')}><b>Check integrity</b><span>Inspect a package without connecting a wallet.</span></button></div><a className="anchor-entry" href="#/anchor">Open the simulated anchor console <span>Demo operator route</span></a></section>;
}

function Prepare({ client, wallets }) {
  const [record, setRecord] = useState(sample); const [hashes, setHashes] = useState({}); const [documents, setDocuments] = useState({}); const [wallet, setWallet] = useState(null); const [state, dispatch] = useReducer(transactionReducer, initialTransaction); const [fieldError, setFieldError] = useState('');
  const [mode, setMode] = useState('new'); const [previousId, setPreviousId] = useState(''); const [predecessor, setPredecessor] = useState(null);
  const [root, setRoot] = useState('Add at least one local file'); const [presentation, setPresentation] = useState(null); const { events, eventError } = useEvents(client);
  const documentManifest = useMemo(() => Object.entries(hashes).map(([name, sha256]) => ({ ...documents[name], sha256 })), [documents, hashes]);
  useEffect(() => {
    if (documentManifest.length) buildDocumentRoot(documentManifest).then(setRoot);
    else setRoot('Add at least one local file');
  }, [documentManifest]);
  async function addFiles(files) { try { validateLocalFiles(files, Object.keys(hashes).length); const next = {}; const descriptors = {}; for (const file of files) { next[file.name] = await hashFile(file); descriptors[file.name] = { document_type: 'synthetic_attachment', display_name: file.name, byte_length: file.size }; } setHashes((old) => ({ ...old, ...next })); setDocuments((old) => ({ ...old, ...descriptors })); setFieldError(''); } catch (error) { setFieldError(error.message); } }
  async function connect(kind) { try { setWallet(await wallets.connect(kind)); } catch (error) { dispatch({ type: 'failed', error }); } }
  async function checkPredecessor() {
    if (!client.configured) return setFieldError('Contract client is not configured. Refresh checks are unavailable.');
    if (!wallet) return setFieldError('Connect Freighter or Albedo before checking the prior credential.');
    if (!previousId.trim()) return setFieldError('Enter the previous credential ID.');
    try {
      const [previous, status] = await Promise.all([client.get(previousId), client.status(previousId)]);
      const authorized = previous?.issuer ? await client.is_authorized(previous.issuer) : false;
      if (previous?.subject !== wallet.address) throw new Error('The prior credential belongs to a different subject wallet.');
      if (!['issued', 'expired'].includes(status) || !previous.issuer || !authorized) throw new Error('The prior credential is not eligible for refresh.');
      setPredecessor({ ...previous, status }); setFieldError('');
    } catch (error) { setPredecessor(null); setFieldError(error.message); }
  }
  async function request() {
    if (!client.configured) return setFieldError('Contract client is not configured. Add the generated testnet client before requesting.');
    if (!wallet) return setFieldError('Connect Freighter or Albedo to authorize the request.');
    if (!Object.keys(hashes).length) return setFieldError('Add at least one synthetic document to compute a local root.');
    if (!Number.isInteger(Number(record.expires_ledger)) || Number(record.expires_ledger) < 1) return setFieldError('Enter a future Testnet expiry ledger.');
    if (mode === 'refresh' && !predecessor) return setFieldError('Check an eligible predecessor before requesting a refresh.');
    setFieldError(''); setPresentation(null);
    try {
      const submittedRoot = await buildDocumentRoot(documentManifest);
      const receipt = await runContractTransaction({ invoke: () => mode === 'refresh'
        ? client.request_refresh(wallet.address, record.credential_id, previousId, submittedRoot, record.schema_hash, Number(record.expires_ledger))
        : client.request(wallet.address, record.credential_id, submittedRoot, record.schema_hash, Number(record.expires_ledger)), sign: (xdr) => wallets.sign(xdr, wallet.address), submit: client.submit, confirm: client.confirm, dispatch });
      setPresentation(await createPresentationPackage({
        client,
        record: mode === 'refresh' ? { ...record, previous_credential_id: predecessor.credential_id } : record,
        subject: wallet.address,
        documentManifest,
        documentRoot: submittedRoot,
        receipt,
      }));
    } catch (_error) { return; }
  }
  function download() { if (!presentation) return; const blob = new Blob([JSON.stringify(presentation, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = Object.assign(document.createElement('a'), { href: url, download: `${presentation.credential_label}-presentation.json` }); link.click(); URL.revokeObjectURL(url); }
  return <Workflow title="Prepare a presentation request" configured={client.configured} events={events} eventError={eventError} release={client} rail={{ ...record, request_mode: mode, previous_credential_id: predecessor?.credential_id || 'Not selected', subject: wallet?.address || 'Connect a wallet', document_root: root }}><p className="boundary">Files stay on this device. Use synthetic organization data only. The public request contains the wallet subject, credential ID hash, document root, schema hash, and expiry ledger.</p><div className="mode-selector" aria-label="Request mode"><button className={mode === 'new' ? 'primary' : 'secondary'} onClick={() => { setMode('new'); setPredecessor(null); }}>New credential</button><button className={mode === 'refresh' ? 'primary' : 'secondary'} onClick={() => setMode('refresh')}>Refresh existing credential</button></div>{mode === 'refresh' && <section className="payload"><h2>Refresh predecessor</h2><Field label="Previous credential ID" value={previousId} onChange={(value) => { setPreviousId(value); setPredecessor(null); }} /><button className="secondary" onClick={checkPredecessor}>Check existing credential</button>{predecessor && <p className="live">Eligible predecessor: {short(predecessor.credential_id)} · issuer {short(predecessor.issuer)} · stored status {predecessor.status}. The new credential will link to this record.</p>}</section>}<fieldset><legend>Synthetic organization data</legend><Field label="Organization" value={record.organization} onChange={(organization) => setRecord({ ...record, organization })} /><Field label="Credential ID" value={record.credential_id} onChange={(credential_id) => setRecord({ ...record, credential_id })} /><Field label="Expiry ledger" value={record.expires_ledger} onChange={(expires_ledger) => setRecord({ ...record, expires_ledger })} /><small>Use a ledger greater than the current Stellar Testnet ledger.</small><label className="field">Synthetic documents<input aria-describedby="document-help" type="file" multiple onChange={(e) => addFiles([...e.target.files])} /></label><small id="document-help">Hashed locally with SHA-256. Filenames remain in the downloaded local package and are not submitted.</small></fieldset><Payload record={record} subject={wallet?.address} root={root} hashes={hashes} /><WalletPicker wallet={wallet} connect={connect} /><div className="action-bar"><button className="primary" onClick={request}>{mode === 'refresh' ? 'Request refresh' : 'Request credential'}</button><button className="secondary" onClick={download} disabled={!presentation}>Download local package</button></div>{fieldError && <p className="error" role="alert">{fieldError}</p>}<TransactionNotice state={state} contractId={client.contractId} events={events} /></Workflow>;
}

function Anchor({ client, wallets }) {
  const [id, setId] = useState(sample.credential_id); const [wallet, setWallet] = useState(null); const [state, dispatch] = useReducer(transactionReducer, initialTransaction); const [error, setError] = useState(''); const { events, eventError } = useEvents(client);
  async function connect(kind) { try { setWallet(await wallets.connect(kind)); } catch (e) { dispatch({ type: 'failed', error: e }); } }
  async function act(action) {
    if (!client.configured) return setError('Contract client is not configured. Anchor actions are blocked.');
    if (!wallet) return setError('Connect the simulated anchor wallet before acting.');
    setError('');
    try {
      if (requiresCurrentAnchorAuthorization(action)) {
        const allowed = await client.is_authorized(wallet.address);
        if (!allowed) throw new Error('contract authorization failed');
      }
      await runContractTransaction({
        invoke: () => action === 'issue'
          ? client.issue(wallet.address, id)
          : action === 'reject'
            ? client.reject(wallet.address, id, 'demo_review')
            : client.revoke(wallet.address, id, 'demo_revocation'),
        sign: (xdr) => wallets.sign(xdr, wallet.address),
        submit: client.submit,
        confirm: client.confirm,
        dispatch,
      });
    } catch (e) { if (state.phase === 'idle') dispatch({ type: 'failed', error: e }); }
  }
  const completed = new Set(events.filter((event) => ['issued', 'rejected'].includes(event.type)).map((event) => event.credentialId));
  const pending = events.filter((event) => ['requested', 'refresh_requested'].includes(event.type) && !completed.has(event.credentialId));
  return <Workflow title="Simulated anchor console" configured={client.configured} events={events} eventError={eventError} release={client} rail={{ credential_id: id, contract_id: client.contractId }}><p className="demo-label">DEMO ONLY — simulated anchor on Stellar testnet</p><p className="boundary">This console sees hash-only request fields. Current registry membership gates issue and reject; only the original issuer can revoke an issued record. No issuer secret exists in the browser.</p><section className="payload"><h2>Pending request events</h2>{pending.length ? <ul className="request-list">{pending.map((event) => <li key={event.id}><button className="secondary" onClick={() => setId(event.credentialId)}><span>{event.type === 'refresh_requested' ? 'Refresh request' : 'New credential request'} · Credential key: {short(event.credentialId)}</span>{event.previousCredentialId && <span>Predecessor: {short(event.previousCredentialId)}</span>}<span>Subject: {short(event.subject)} · expires at ledger {event.expiresLedger ?? 'not returned'}</span><span>Root: {short(event.documentRoot)} · schema: {short(event.schemaHash)}</span><span>Request ledger {event.ledger} · {short(event.txHash)}</span></button></li>)}</ul> : <p>No unresolved request event is in the current RPC recovery window.</p>}</section><Field label="Credential ID or key" value={id} onChange={setId} /><WalletPicker wallet={wallet} connect={connect} /><div className="action-bar"><button className="primary" onClick={() => act('issue')}>Issue credential</button><button className="danger" onClick={() => act('reject')}>Reject request</button><button className="danger" onClick={() => act('revoke')}>Revoke credential</button></div>{error && <p className="error" role="alert">{error}</p>}<TransactionNotice state={state} contractId={client.contractId} events={events} /></Workflow>;
}

function Verify({ client }) {
  const [id, setId] = useState(''); const [manifest, setManifest] = useState(null); const [localDocuments, setLocalDocuments] = useState({}); const [rows, setRows] = useState(null); const [message, setMessage] = useState('Load the presentation manifest before running checks.'); const { events, eventError } = useEvents(client);
  function load(text) { try { const next = parsePresentationPackage(text); setManifest(next); setId(next.credential_id); setRows(null); setMessage('Manifest loaded. Add local files, then run the independent checks.'); } catch (error) { setManifest(null); setRows(null); setMessage(error.message); } }
  async function addFiles(files) { try { validateLocalFiles(files); const next = {}; for (const file of files) next[file.name] = { sha256: await hashFile(file), byte_length: file.size }; setLocalDocuments(next); setMessage('Local files hashed. Run the independent checks when ready.'); } catch (error) { setLocalDocuments({}); setMessage(error.message); } }
  async function verify() {
    if (!manifest && !id.trim()) return setMessage('Load a valid presentation package or enter a credential ID.');
    if (!client.configured && !manifest) return setMessage('Credential-ID lookup is unavailable until the Testnet deployment is published.');
    let record = null, status = null, authorized = null, freshness = null;
    if (client.configured) {
      try { freshness = await resolveCredentialFreshness({ credentialId: id, getRecord: client.get, getStatus: client.status }); record = freshness.presentedRecord; status = freshness.presentedStatus; authorized = record?.issuer ? await client.is_authorized(record.issuer) : null; } catch { setMessage('RPC checks were unavailable. Local evidence is still shown separately.'); }
    }
    const issuanceEvent = await findIssuanceEvent(events, manifest?.credential_label || id);
    setRows(await verifyEvidence({
      manifest,
      credentialId: id,
      registryIds: client.configured ? { credential: client.contractId, anchor: client.anchorContractId } : null,
      localDocuments,
      record,
      status,
      authorized,
      issuanceEvent,
      freshness,
    }));
    setMessage(manifest ? 'Package, local, and on-chain checks completed independently.' : 'On-chain credential lookup completed without a local presentation package.');
  }
  return <Workflow title="Credential integrity result" configured={client.configured} events={events} eventError={eventError} release={client} rail={manifest || { credential_id: id || '—', status: 'not checked' }}><p className="boundary">This public reader is wallet-free. It compares local files with the manifest, then reports registry, anchor, and event evidence independently.</p><p className="decision-note">Your institution still makes its own KYB decision.</p><Field label="Credential ID" value={id} onChange={setId} /><label className="field">Presentation package JSON<textarea aria-invalid={!manifest && message !== 'Load the presentation manifest before running checks.'} placeholder="Paste the local presentation package…" onChange={(e) => load(e.target.value)} /></label><label className="field">Locally presented documents<input type="file" multiple onChange={(e) => addFiles([...e.target.files])} /></label><button className="primary" onClick={verify}>Run integrity checks</button><p className="live" aria-live="polite">{message}</p>{rows && <ul className="evidence-list">{rows.map((row) => <li key={row.key}><span>{row.label}</span><b data-state={row.state}>{row.detail}</b></li>)}</ul>}<p className="decision">Your institution still makes its own KYB decision.</p></Workflow>;
}

function useEvents(client) {
  const [events, setEvents] = useState([]);
  const [eventError, setEventError] = useState('');
  useEffect(() => {
    if (!client.configured) return;
    const storage = globalThis.localStorage;
    const cursorKey = `selyopass:event-cursor:testnet:${client.contractId}`;
    const poller = createEventPoller({ getEvents: (startLedger) => client.getEvents(startLedger), onEvent: (event) => setEvents((old) => [...old.slice(-19), event]), onError: (error) => setEventError(error ? 'Event history is temporarily unavailable; retrying with the last saved cursor.' : ''), loadCursor: () => { try { return Number(storage?.getItem(cursorKey)); } catch { return 0; } }, saveCursor: (n) => { try { storage?.setItem(cursorKey, String(n)); } catch { /* storage can be disabled */ } }, intervalMs: 5000 });
    poller.poll(); poller.start(); return () => poller.stop();
  }, [client]);
  return { events, eventError };
}
function Workflow({ title, children, rail, configured, events, eventError, release }) {
  const heading = useRef(null); useEffect(() => { heading.current?.focus(); }, []);
  return <section className="workflow"><div className="main-panel"><p className="eyebrow">Near-real-time RPC polling · every 5 seconds · not streaming</p><h1 ref={heading} tabIndex="-1">{title}</h1><p className="configuration" role="status">{configured ? 'Testnet contract client configured.' : 'Contract client not configured — chain actions and registry checks are blocked.'}</p><p className="configuration release-identity">App release: <code>{appReleaseSha}</code> · Contract source: <code>{release?.sourceSha || 'Not published'}</code></p>{eventError && <p className="warning" role="status">{eventError}</p>}{children}</div><aside aria-label="Evidence rail"><EvidenceRail record={rail} events={events} /></aside></section>;
}
function Payload({ record, subject, root, hashes }) { return <section className="payload"><h2>Exact public payload review</h2><dl><dt>Subject</dt><dd>{subject || 'Connect a wallet'}</dd><dt>Credential ID</dt><dd>{record.credential_id} (submitted as SHA-256)</dd><dt>Document root</dt><dd className="mono">{root}</dd><dt>Document count</dt><dd>{Object.keys(hashes).length}</dd><dt>Schema hash</dt><dd className="mono">{record.schema_hash}</dd></dl></section>; }
function EvidenceRail({ record, events }) { return <div className="evidence-rail"><h2>Evidence ledger</h2>{Object.entries(record).map(([key, value]) => <div key={key}><span>{key.replaceAll('_', ' ')}</span><code>{typeof value === 'object' ? `${Object.keys(value).length} local hashes` : String(value)}</code></div>)}<div><span>Observed RPC events</span><code aria-live="polite">{events.length ? `${events.length} deduplicated` : 'None observed'}</code></div></div>; }
function Field({ label, value, onChange }) { const id = useMemo(() => `field-${label.toLowerCase().replaceAll(' ', '-')}`, [label]); return <label className="field" htmlFor={id}>{label}<input id={id} value={value} onChange={(e) => onChange(e.target.value)} /></label>; }
function WalletPicker({ wallet, connect }) { return <section className="wallet-picker"><h2>Authorize with a wallet</h2>{wallet ? <p className="wallet-connected">{wallet.wallet}: <code>{short(wallet.address)}</code></p> : <div><button className="secondary" onClick={() => connect('Freighter')}>Connect Freighter</button><button className="secondary" onClick={() => connect('Albedo')}>Connect Albedo</button></div>}</section>; }
function TransactionNotice({ state, contractId, events = [] }) {
  if (state.phase === 'idle') return null;
  if (state.phase === 'failed') { const url = explorerTxUrl(state.receipt?.hash); return <div className="error" role="alert"><span>{state.error}</span>{state.receipt?.hash && <span>Submitted hash: {state.receipt.hash}</span>}{url && <a href={url} target="_blank" rel="noreferrer">Inspect submitted transaction in Stellar Expert</a>}</div>; }
  if (state.phase === 'success') { const url = explorerTxUrl(state.receipt.hash); const event = events.find((item) => item.txHash === state.receipt.hash); return <div className="receipt" aria-live="polite"><b>Confirmed transaction</b><span>Status: {state.receipt.status}</span><span>Contract: {contractId}</span><span>Ledger cursor: {state.receipt.ledger ?? 'Not returned'}</span><span>Hash: {state.receipt.hash}</span><span>Event: {event?.id || state.receipt.eventId || 'Awaiting RPC observation'}</span>{url && <a href={url} target="_blank" rel="noreferrer">Open confirmed transaction in Stellar Expert</a>}</div>; }
  return <div className="live" aria-live="polite"><span>Transaction state: {state.phase.replace('_', ' ')}.</span>{state.receipt?.hash && <span>Submitted hash: {state.receipt.hash}</span>}</div>;
}

export { route };
