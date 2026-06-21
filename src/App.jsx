import { useState, useEffect } from 'react';
import {
  isConnected,
  requestAccess,
  getPublicKey,
  signTransaction,
} from '@stellar/freighter-api';
import * as StellarSdk from '@stellar/stellar-sdk';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
const DEFAULT_TARGET = 'GB74JSPCCLGCGEOW4PP5UGOOF3IRBAJM5ELYNB4UW7KLUSN6DHKK5QJ3';

function App() {
  const [publicKey, setPublicKey] = useState('');
  const [balance, setBalance] = useState(null);
  const [status, setStatus] = useState('');
  const [txHash, setTxHash] = useState('');
  const [txSuccess, setTxSuccess] = useState(false);

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [secNumber, setSecNumber] = useState('');
  const [targetAddress, setTargetAddress] = useState(DEFAULT_TARGET);
  const [amount, setAmount] = useState('10');

  // Fetch balance when wallet connects
  useEffect(() => {
    if (publicKey) {
      fetchBalance(publicKey);
    }
  }, [publicKey]);

  async function fetchBalance(address) {
    try {
      const server = new StellarSdk.Horizon.Server(HORIZON_URL);
      const account = await server.loadAccount(address);
      const native = account.balances.find((b) => b.asset_type === 'native');
      setBalance(native ? native.balance : '0');
    } catch (error) {
      console.error('Balance fetch error:', error);
      setBalance('0');
    }
  }

  async function connectWallet() {
    try {
      const connected = await isConnected();

      if (!connected) {
        setStatus(
          'Freighter not detected. Make sure the extension is installed and enabled, then refresh the page.'
        );
        return;
      }

      // Request access — this prompts the user to approve the connection
      const accessGranted = await requestAccess();

      if (!accessGranted || accessGranted === 'denied') {
        setStatus('Connection rejected. Please approve the connection in Freighter.');
        return;
      }

      // Get the public key after access is granted
      const address = await getPublicKey();

      if (!address) {
        setStatus('Could not retrieve wallet address.');
        return;
      }

      setPublicKey(address);
      setStatus('');
      setTxHash('');
      setTxSuccess(false);
    } catch (error) {
      console.error('Connect error:', error);
      setStatus(
        'Failed to connect wallet. Make sure Freighter is installed, unlocked, and try refreshing the page.'
      );
    }
  }

  function disconnectWallet() {
    setPublicKey('');
    setBalance(null);
    setStatus('');
    setTxHash('');
    setTxSuccess(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('');
    setTxHash('');
    setTxSuccess(false);

    if (!companyName.trim() || !secNumber.trim()) {
      setStatus('Please fill in all corporate identity fields.');
      return;
    }

    if (!targetAddress.trim()) {
      setStatus('Target institution address is required.');
      return;
    }

    const xlmAmount = parseFloat(amount);
    if (isNaN(xlmAmount) || xlmAmount <= 0) {
      setStatus('Enter a valid XLM amount.');
      return;
    }

    try {
      setStatus('Building transaction...');

      const server = new StellarSdk.Horizon.Server(HORIZON_URL);
      const sourceAccount = await server.loadAccount(publicKey);

      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: targetAddress,
            asset: StellarSdk.Asset.native(),
            amount: xlmAmount.toFixed(7),
          })
        )
        .addMemo(
          StellarSdk.Memo.text(
            `SelyoPass:${secNumber.slice(0, 20)}`
          )
        )
        .setTimeout(60)
        .build();

      setStatus('Awaiting signature from Freighter...');

      const signedXdr = await signTransaction(transaction.toXDR(), {
        networkPassphrase: NETWORK_PASSPHRASE,
        network: 'TESTNET',
      });

      if (!signedXdr) {
        setStatus('Transaction signing was rejected.');
        return;
      }

      setStatus('Registering profile on Stellar testnet...');

      const signedTx = StellarSdk.TransactionBuilder.fromXDR(
        signedXdr,
        NETWORK_PASSPHRASE
      );

      const result = await server.submitTransaction(signedTx);
      setTxHash(result.hash);
      setTxSuccess(true);
      setStatus('Corporate identity registration submitted successfully!');

      // Refresh balance
      fetchBalance(publicKey);
    } catch (error) {
      console.error('Transaction error:', error);
      const message =
        error?.response?.data?.extras?.result_codes?.operations?.[0] ||
        error?.message ||
        'Transaction failed. Please try again.';
      setStatus(`Transaction failed: ${message}`);
      setTxSuccess(false);
    }
  }

  function truncateAddress(addr) {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  }

  // ─── Disconnected State ────────────────────────────────────────────
  if (!publicKey) {
    return (
      <div className="app">
        <div className="container landing">
          <div className="brand">
            <div className="logo-mark">S</div>
            <h1>SelyoPass</h1>
            <p className="tagline">One verified mark. Open doors everywhere.</p>
            <p className="description">
              A reusable Know-Your-Business (KYB) credential on Stellar.
              Register your corporate identity once — share it with any
              institution that needs to verify your business.
            </p>
          </div>
          <button className="btn btn-primary" onClick={connectWallet}>
            Connect Freighter Wallet
          </button>
          {status && <p className="status status-error">{status}</p>}
        </div>
      </div>
    );
  }

  // ─── Connected State ───────────────────────────────────────────────
  return (
    <div className="app">
      <div className="container dashboard">
        {/* Header */}
        <header className="header">
          <div className="header-brand">
            <span className="logo-mark small">S</span>
            <span className="header-title">SelyoPass</span>
          </div>
          <div className="header-wallet">
            <span className="wallet-address">{truncateAddress(publicKey)}</span>
            <button className="btn btn-outline btn-sm" onClick={disconnectWallet}>
              Disconnect
            </button>
          </div>
        </header>

        {/* Balance Card */}
        <div className="balance-card">
          <p className="balance-label">Testnet XLM Balance</p>
          <p className="balance-value">
            {balance !== null ? `${parseFloat(balance).toLocaleString()} XLM` : 'Loading...'}
          </p>
        </div>

        {/* Registration Form */}
        <form className="form-card" onSubmit={handleSubmit}>
          <h2 className="form-title">Register Corporate Identity</h2>

          <div className="form-group">
            <label htmlFor="companyName">Company Registered Name</label>
            <input
              id="companyName"
              type="text"
              placeholder="e.g. Dserve Technologies Inc."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="secNumber">SEC Registration Number</label>
            <input
              id="secNumber"
              type="text"
              placeholder="e.g. CS202312345"
              value={secNumber}
              onChange={(e) => setSecNumber(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="targetAddress">Target Institution Address</label>
            <input
              id="targetAddress"
              type="text"
              value={targetAddress}
              onChange={(e) => setTargetAddress(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Verification Fee (XLM)</label>
            <input
              id="amount"
              type="number"
              min="0.0000001"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <button className="btn btn-primary btn-full" type="submit">
            Submit Profile &amp; Send XLM
          </button>
        </form>

        {/* Status & Result */}
        {status && (
          <div className={`status-card ${txSuccess ? 'success' : 'info'}`}>
            <p className="status-message">{status}</p>
            {txHash && (
              <a
                className="tx-link"
                href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Transaction on Stellar Expert →
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
