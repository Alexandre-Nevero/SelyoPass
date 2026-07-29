import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateDeploymentManifest,
  validateSubmissionArtifacts,
  validateSubmissionManifest,
} from '../manifest-validation.mjs';

const sha = 'a'.repeat(40);
const tx = 'b'.repeat(64);
const wasm = 'c'.repeat(64);
const anchorId = 'CAAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQC526';
const credentialId = 'CABAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAFNSZ';

function deployedManifest() {
  return {
    schemaVersion: 1,
    network: 'testnet',
    status: 'deployed',
    sourceSha: sha,
    releasedAt: '2026-07-29T00:00:00.000Z',
    contracts: {
      anchorRegistry: { id: anchorId, wasmSha256: wasm, deployTxHash: tx },
      credentialRegistry: { id: credentialId, wasmSha256: wasm, deployTxHash: tx },
    },
    interactions: {
      anchorRegistrationTxHash: tx,
      requestTxHash: tx,
      issueTxHash: tx,
    },
  };
}

test('draft deployment is valid locally but fails the release gate', () => {
  const draft = {
    ...deployedManifest(),
    status: 'not_deployed',
    sourceSha: null,
    releasedAt: null,
    contracts: {
      anchorRegistry: { id: null, wasmSha256: null, deployTxHash: null },
      credentialRegistry: { id: null, wasmSha256: null, deployTxHash: null },
    },
    interactions: {
      anchorRegistrationTxHash: null,
      requestTxHash: null,
      issueTxHash: null,
    },
  };
  assert.deepEqual(validateDeploymentManifest(draft), []);
  assert.match(validateDeploymentManifest(draft, { requireDeployed: true }).join('\n'), /status/);
});

test('strict deployment accepts complete testnet evidence and rejects mainnet', () => {
  assert.deepEqual(validateDeploymentManifest(deployedManifest(), { requireDeployed: true }), []);
  const mainnet = { ...deployedManifest(), network: 'mainnet' };
  assert.match(validateDeploymentManifest(mainnet, { requireDeployed: true }).join('\n'), /testnet/);
});

test('strict submission rejects stale evidence and accepts one release-bound package', () => {
  const manifest = {
    schemaVersion: 1,
    status: 'ready',
    releaseSha: sha,
    commitEvidence: Array.from({ length: 10 }, (_, index) => ({
      sha: index === 0 ? sha : index.toString(16).padStart(40, '0'),
      requirement: `F-${String(index + 1).padStart(3, '0')}`,
    })),
    ci: { runUrl: 'https://github.com/example/repo/actions/runs/1', headSha: sha },
    pages: { runUrl: 'https://github.com/example/repo/actions/runs/2', headSha: sha },
    tests: {
      frontend: { passed: 20, releaseSha: sha },
      contracts: { passed: 10, releaseSha: sha },
      integration: { passed: 1, releaseSha: sha },
      browser: { passed: 3, releaseSha: sha },
      accessibility: { passed: 3, releaseSha: sha },
    },
    screenshots: {
      walletPicker: { path: 'evidence/wallet-picker.png', sha256: wasm, releaseSha: sha },
      mobile: { path: 'evidence/mobile.png', sha256: wasm, releaseSha: sha },
      ci: { path: 'evidence/ci.png', sha256: wasm, releaseSha: sha },
      tests: { path: 'evidence/tests.png', sha256: wasm, releaseSha: sha },
    },
    deployment: deployedManifest(),
    events: [{ id: 'event-1', txHash: tx, releaseSha: sha }],
    interContract: { txHash: tx, releaseSha: sha },
    liveDemoUrl: 'https://example.github.io/app/',
    demoVideoUrl: 'https://example.com/demo',
    level4: { developmentStarted: false, writtenApproval: null },
  };
  assert.deepEqual(validateSubmissionManifest(manifest, { requireReady: true }), []);
  manifest.ci.headSha = 'd'.repeat(40);
  assert.match(validateSubmissionManifest(manifest, { requireReady: true }).join('\n'), /ci\.headSha/);
});

test('strict submission rejects repeated commit evidence', () => {
  const manifest = {
    schemaVersion: 1,
    status: 'ready',
    releaseSha: sha,
    commitEvidence: Array.from({ length: 10 }, (_, index) => ({
      sha,
      requirement: `F-${String(index + 1).padStart(3, '0')}`,
    })),
  };
  assert.match(validateSubmissionManifest(manifest, { requireReady: true }).join('\n'), /unique commit SHAs/);
});

test('artifact validation rejects mismatched files and unreachable release URLs', async () => {
  const manifest = {
    status: 'ready',
    screenshots: {
      mobile: { path: 'evidence/mobile.png', sha256: 'c'.repeat(64) },
    },
    ci: { runUrl: 'https://example.com/ci' },
    pages: { runUrl: 'https://example.com/pages' },
    liveDemoUrl: 'https://example.com/demo',
    demoVideoUrl: 'https://example.com/video',
  };
  const errors = await validateSubmissionArtifacts(manifest, {
    readFile: async () => Buffer.from('different'),
    fetch: async (url) => ({ ok: !url.endsWith('/video'), status: 404 }),
  });
  assert.match(errors.join('\n'), /screenshots\.mobile\.sha256/);
  assert.match(errors.join('\n'), /demoVideoUrl is unreachable/);
});

test('Level 4 development fails closed without written approval', () => {
  const manifest = {
    schemaVersion: 1,
    status: 'draft',
    level4: { developmentStarted: true, writtenApproval: null },
  };
  assert.match(validateSubmissionManifest(manifest).join('\n'), /Level 4/i);
});
