const SHA40 = /^[0-9a-f]{40}$/;
const HEX64 = /^[0-9a-f]{64}$/;
const CONTRACT_ID = /^C[A-Z2-7]{55}$/;
const HTTPS_URL = /^https:\/\//;

function requireMatch(errors, path, value, pattern) {
  if (typeof value !== 'string' || !pattern.test(value)) {
    errors.push(`${path} is missing or malformed`);
  }
}

function validateReleaseSha(errors, path, value, releaseSha) {
  requireMatch(errors, path, value, SHA40);
  if (SHA40.test(releaseSha || '') && value !== releaseSha) {
    errors.push(`${path} does not match releaseSha`);
  }
}

export function validateDeploymentManifest(manifest, { requireDeployed = false } = {}) {
  const errors = [];
  if (!manifest || typeof manifest !== 'object') return ['deployment manifest must be an object'];
  if (manifest.schemaVersion !== 1) errors.push('schemaVersion must be 1');
  if (manifest.network !== 'testnet') errors.push('network must be testnet');
  if (!['not_deployed', 'deployed'].includes(manifest.status)) errors.push('status is invalid');
  if (!requireDeployed && manifest.status === 'not_deployed') return errors;
  if (manifest.status !== 'deployed') errors.push('status must be deployed');

  requireMatch(errors, 'sourceSha', manifest.sourceSha, SHA40);
  if (Number.isNaN(Date.parse(manifest.releasedAt || ''))) errors.push('releasedAt is invalid');

  for (const name of ['anchorRegistry', 'credentialRegistry']) {
    const contract = manifest.contracts?.[name] || {};
    requireMatch(errors, `contracts.${name}.id`, contract.id, CONTRACT_ID);
    requireMatch(errors, `contracts.${name}.wasmSha256`, contract.wasmSha256, HEX64);
    requireMatch(errors, `contracts.${name}.deployTxHash`, contract.deployTxHash, HEX64);
  }
  if (
    CONTRACT_ID.test(manifest.contracts?.anchorRegistry?.id || '') &&
    manifest.contracts.anchorRegistry.id === manifest.contracts?.credentialRegistry?.id
  ) {
    errors.push('contract IDs must be distinct');
  }
  for (const name of ['anchorRegistrationTxHash', 'requestTxHash', 'issueTxHash']) {
    requireMatch(errors, `interactions.${name}`, manifest.interactions?.[name], HEX64);
  }
  return errors;
}

export function validateSubmissionManifest(manifest, { requireReady = false } = {}) {
  const errors = [];
  if (!manifest || typeof manifest !== 'object') return ['submission manifest must be an object'];
  if (manifest.schemaVersion !== 1) errors.push('schemaVersion must be 1');
  if (!['draft', 'ready'].includes(manifest.status)) errors.push('status is invalid');
  if (manifest.level4?.developmentStarted && !manifest.level4?.writtenApproval) {
    errors.push('Level 4 development requires recorded written approval');
  }
  if (!requireReady && manifest.status === 'draft') return errors;
  if (manifest.status !== 'ready') errors.push('status must be ready');
  requireMatch(errors, 'releaseSha', manifest.releaseSha, SHA40);

  if (!Array.isArray(manifest.commitEvidence) || manifest.commitEvidence.length < 10) {
    errors.push('commitEvidence must contain at least 10 requirement-mapped commits');
  } else {
    const commitShas = new Set();
    const requirements = new Set();
    manifest.commitEvidence.forEach((entry, index) => {
      requireMatch(errors, `commitEvidence[${index}].sha`, entry?.sha, SHA40);
      if (!entry?.requirement) errors.push(`commitEvidence[${index}].requirement is missing`);
      if (SHA40.test(entry?.sha || '')) commitShas.add(entry.sha);
      if (entry?.requirement) requirements.add(entry.requirement);
    });
    if (commitShas.size < 10) errors.push('commitEvidence must contain at least 10 unique commit SHAs');
    if (requirements.size < 10) errors.push('commitEvidence must contain at least 10 unique requirement mappings');
  }

  validateReleaseSha(errors, 'ci.headSha', manifest.ci?.headSha, manifest.releaseSha);
  validateReleaseSha(errors, 'pages.headSha', manifest.pages?.headSha, manifest.releaseSha);
  requireMatch(errors, 'ci.runUrl', manifest.ci?.runUrl, HTTPS_URL);
  requireMatch(errors, 'pages.runUrl', manifest.pages?.runUrl, HTTPS_URL);

  for (const name of ['frontend', 'contracts', 'integration', 'browser', 'accessibility']) {
    const result = manifest.tests?.[name] || {};
    if (!Number.isInteger(result.passed) || result.passed < 1) {
      errors.push(`tests.${name}.passed must be at least 1`);
    }
    validateReleaseSha(errors, `tests.${name}.releaseSha`, result.releaseSha, manifest.releaseSha);
  }

  for (const name of ['walletPicker', 'mobile', 'ci', 'tests']) {
    const screenshot = manifest.screenshots?.[name] || {};
    if (!screenshot.path) errors.push(`screenshots.${name}.path is missing`);
    requireMatch(errors, `screenshots.${name}.sha256`, screenshot.sha256, HEX64);
    validateReleaseSha(
      errors,
      `screenshots.${name}.releaseSha`,
      screenshot.releaseSha,
      manifest.releaseSha,
    );
  }

  errors.push(
    ...validateDeploymentManifest(manifest.deployment, { requireDeployed: true }).map(
      (error) => `deployment.${error}`,
    ),
  );
  if (!manifest.commitEvidence?.some((entry) => entry?.sha === manifest.deployment?.sourceSha)) {
    errors.push('deployment.sourceSha must be present in commitEvidence');
  }
  if (!Array.isArray(manifest.events) || manifest.events.length < 1) {
    errors.push('events evidence is missing');
  } else {
    manifest.events.forEach((event, index) => {
      if (!event?.id) errors.push(`events[${index}].id is missing`);
      requireMatch(errors, `events[${index}].txHash`, event?.txHash, HEX64);
      validateReleaseSha(errors, `events[${index}].releaseSha`, event?.releaseSha, manifest.releaseSha);
    });
  }
  requireMatch(errors, 'interContract.txHash', manifest.interContract?.txHash, HEX64);
  validateReleaseSha(
    errors,
    'interContract.releaseSha',
    manifest.interContract?.releaseSha,
    manifest.releaseSha,
  );
  requireMatch(errors, 'liveDemoUrl', manifest.liveDemoUrl, HTTPS_URL);
  requireMatch(errors, 'demoVideoUrl', manifest.demoVideoUrl, HTTPS_URL);
  return errors;
}

export async function validateSubmissionArtifacts(
  manifest,
  { readFile, fetch: fetchUrl = globalThis.fetch } = {},
) {
  const errors = [];
  if (manifest?.status !== 'ready') return errors;

  for (const [name, screenshot] of Object.entries(manifest.screenshots || {})) {
    if (!screenshot?.path || screenshot.path.startsWith('/') || screenshot.path.includes('..')) {
      errors.push(`screenshots.${name}.path must be a repository-relative path`);
      continue;
    }
    try {
      const bytes = await readFile(screenshot.path);
      const actual = createHash('sha256').update(bytes).digest('hex');
      if (actual !== screenshot.sha256) errors.push(`screenshots.${name}.sha256 does not match file`);
    } catch {
      errors.push(`screenshots.${name}.path cannot be read`);
    }
  }

  const urls = {
    'ci.runUrl': manifest.ci?.runUrl,
    'pages.runUrl': manifest.pages?.runUrl,
    liveDemoUrl: manifest.liveDemoUrl,
    demoVideoUrl: manifest.demoVideoUrl,
  };
  for (const [name, url] of Object.entries(urls)) {
    if (!HTTPS_URL.test(url || '')) continue;
    try {
      const response = await fetchUrl(url, { method: 'HEAD', redirect: 'follow' });
      if (!response.ok) errors.push(`${name} is unreachable (${response.status})`);
    } catch {
      errors.push(`${name} is unreachable`);
    }
  }
  return errors;
}
import { createHash } from 'node:crypto';
