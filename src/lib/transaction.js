export const initialTransaction = Object.freeze({ phase: 'idle', receipt: null, error: '' });

const transitions = {
  idle: new Set(['simulating', 'failed']),
  simulating: new Set(['awaiting_signature', 'failed']),
  awaiting_signature: new Set(['submitting', 'failed']),
  submitting: new Set(['pending', 'failed']),
  pending: new Set(['success', 'failed']),
  success: new Set(['simulating']),
  failed: new Set(['simulating']),
};

export function transactionReducer(state, action) {
  const phase = { simulate: 'simulating', await_signature: 'awaiting_signature', submit: 'submitting' }[action.type] || action.type;
  if (!transitions[state.phase]?.has(phase)) return state;
  if (phase === 'success') return { phase, receipt: action.receipt, error: '' };
  if (phase === 'failed') return { phase, receipt: state.receipt, error: userFacingError(action.error) };
  if (phase === 'pending') return { phase, receipt: { hash: action.hash }, error: '' };
  return { phase, receipt: null, error: '' };
}

export async function runContractTransaction({ invoke, sign, submit, confirm, dispatch }) {
  let submittedHash = null;
  try {
    dispatch({ type: 'simulate' });
    const simulation = await invoke();
    if (!simulation?.unsignedXdr) throw new Error('Contract simulation did not return an unsigned transaction.');
    dispatch({ type: 'await_signature' });
    const signedXdr = await sign(simulation.unsignedXdr);
    if (!signedXdr) throw new Error('Wallet signature declined.');
    dispatch({ type: 'submit' });
    const submission = await submit(signedXdr, simulation);
    if (!submission?.hash) throw new Error('RPC submission did not return a transaction hash.');
    submittedHash = submission.hash;
    dispatch({ type: 'pending', hash: submittedHash });
    const receipt = await confirm(submission.hash);
    if (receipt?.status !== 'SUCCESS') throw new Error(`Transaction confirmation failed: ${receipt?.status || 'unknown status'}`);
    const honestReceipt = {
      hash: submission.hash,
      ledger: receipt.ledger,
      eventId: receipt.eventId || null,
      status: receipt.status,
    };
    dispatch({ type: 'success', receipt: honestReceipt });
    return honestReceipt;
  } catch (error) {
    dispatch({ type: 'failed', error, hash: submittedHash });
    throw error;
  }
}

export function userFacingError(error) {
  const message = error?.message || String(error || '');
  if (/reject|declin|denied/i.test(message)) return 'Wallet signature declined. Review the request and try again.';
  if (/network/i.test(message)) return 'Wallet is on the wrong network. Switch it to Stellar Testnet and try again.';
  if (/unfunded|not found.*account/i.test(message)) return 'This Testnet account is unfunded. Fund it with Friendbot, then try again.';
  if (/balance|insufficient|fee/i.test(message)) return 'This account needs enough Testnet XLM for the transaction fee.';
  if (/timeout|rpc|network request/i.test(message)) return 'The Stellar RPC request timed out. Check your connection and try again.';
  if (/contract|authorization|unauthorized/i.test(message)) return 'The contract rejected this action. Confirm the simulated anchor is authorized.';
  if (/unavailable|not installed|extension/i.test(message)) return 'That wallet is unavailable. Install or unlock it, then try again.';
  return 'The transaction could not be completed. Check the details and try again.';
}

export function createEventPoller({ getEvents, onEvent, onError = () => {}, saveCursor = () => {}, loadCursor = () => 0, intervalMs = 5000, maxBackoffMs = 40000 }) {
  let timer = null;
  let stopped = true;
  let nextDelay = intervalMs;
  let cursor = Number(loadCursor()) || 0;
  const seen = new Set();

  async function poll() {
    try {
      const result = await getEvents(cursor);
      for (const event of result?.events || []) {
        if (seen.has(event.id)) continue;
        seen.add(event.id);
        cursor = Math.max(cursor, Number(event.ledger) || cursor);
        onEvent(event);
      }
      saveCursor(cursor);
      nextDelay = intervalMs;
      onError(null);
    } catch (error) {
      nextDelay = Math.min(maxBackoffMs, nextDelay * 2);
      onError(error);
    }
  }
  function schedule() {
    if (stopped) return;
    timer = setTimeout(async () => { await poll(); schedule(); }, nextDelay);
  }
  return {
    poll,
    start() { if (!stopped) return; stopped = false; schedule(); },
    stop() { stopped = true; if (timer) clearTimeout(timer); timer = null; },
    delay: () => nextDelay,
    cursor: () => cursor,
  };
}
