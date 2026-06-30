import { useState } from 'react';
import IssuerView from './components/IssuerView.jsx';
import ReaderView from './components/ReaderView.jsx';
import { connectWallet, WalletError } from './lib/wallet.js';

function truncate(addr) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-6)}` : '';
}

export default function App() {
  const [publicKey, setPublicKey] = useState('');
  const [walletError, setWalletError] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [tab, setTab] = useState('issue');

  async function connect() {
    setWalletError('');
    setConnecting(true);
    try {
      const { publicKey: pk } = await connectWallet();
      setPublicKey(pk);
    } catch (e) {
      setWalletError(e instanceof WalletError ? e.message : 'Failed to connect Freighter.');
    } finally {
      setConnecting(false);
    }
  }

  function disconnect() {
    setPublicKey('');
    setWalletError('');
  }

  return (
    <div className="app">
      <div className="container app-shell">
        <header className="header">
          <div className="header-brand">
            <span className="logo-mark small">S</span>
            <div>
              <span className="header-title">SelyoPass</span>
              <span className="header-sub">Portable KYB credential · Stellar testnet</span>
            </div>
          </div>
          <div className="header-wallet">
            {publicKey ? (
              <>
                <span className="wallet-address">{truncate(publicKey)}</span>
                <button className="btn btn-outline btn-sm" onClick={disconnect}>
                  Disconnect
                </button>
              </>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={connect} disabled={connecting}>
                {connecting ? 'Connecting…' : 'Connect Freighter'}
              </button>
            )}
          </div>
        </header>

        {walletError && <p className="status status-error">{walletError}</p>}

        <nav className="tabs">
          <button className={`tab ${tab === 'issue' ? 'active' : ''}`} onClick={() => setTab('issue')}>
            Issue (startup)
          </button>
          <button className={`tab ${tab === 'verify' ? 'active' : ''}`} onClick={() => setTab('verify')}>
            Verify (relying party)
          </button>
        </nav>

        {tab === 'issue' ? <IssuerView publicKey={publicKey} /> : <ReaderView />}

        <footer className="footer">
          <p>
            Testnet demo. Anchor is <strong>simulated</strong> (BR-001). No real corporate data —
            synthetic only (BR-006). SelyoPass removes the document chase; it does not replace
            compliance judgment.
          </p>
        </footer>
      </div>
    </div>
  );
}
