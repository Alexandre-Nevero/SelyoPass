// ─────────────────────────────────────────────────────────────────────────────
// SIMULATED ANCHOR IDENTITY  —  TESTNET / DEMO ONLY
// ─────────────────────────────────────────────────────────────────────────────
// BR-001: a regulated anchor is the verifier of record, not SelyoPass. For the
// Level 3 MVP the anchor is SIMULATED (idea.md §9/§10) — a throwaway Stellar
// testnet keypair used ONLY to demonstrate the ed25519 issue/verify mechanism.
//
// ⚠️  This secret is intentionally a worthless, throwaway TESTNET key. It holds
//     no funds, signs only demo credentials, and MUST NEVER be:
//       - used on mainnet,
//       - used to sign any real corporate credential, or
//       - treated as a real anchor's key.
//     Real issuer-key custody is an explicit OPEN QUESTION in
//     docs/12-security-compliance.md (a leaked real issuer key forges
//     credentials). For the demo, a labelled testnet key keeps setup at zero.
//
// The secret can be overridden at build time via VITE_SIMULATED_ANCHOR_SECRET
// without changing code. The public key below is the "trusted anchor" the
// relying-party reader checks against.
// ─────────────────────────────────────────────────────────────────────────────

const FALLBACK_SIMULATED_ANCHOR_SECRET =
  'SBYQBWOBUBQTNYZ2NMPTYAWHV2URXBFH7DAMMVXZKPNSRQW6LXJXSAMB';

export const SIMULATED_ANCHOR_PUBLIC_KEY =
  'GBOR4FSN2AUMTPSNSUQFI5ZME3H2WAVIS6YUSPYXORLXYDDR6OWS4HQL';

// The public key a relying party trusts as "the SelyoPass simulated anchor".
export const TRUSTED_ANCHOR_PUBLIC_KEY = SIMULATED_ANCHOR_PUBLIC_KEY;

export const SIMULATED_ANCHOR_NAME = 'SelyoPass Simulated Anchor (testnet)';

// Read the active simulated-anchor secret. Vite exposes import.meta.env in the
// browser; tests/Node fall back to the bundled testnet key.
export function getSimulatedAnchorSecret() {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const fromEnv = import.meta.env.VITE_SIMULATED_ANCHOR_SECRET;
      if (fromEnv) return fromEnv;
    }
  } catch (_) {
    // import.meta not available (e.g. some Node contexts) — use fallback.
  }
  return FALLBACK_SIMULATED_ANCHOR_SECRET;
}
