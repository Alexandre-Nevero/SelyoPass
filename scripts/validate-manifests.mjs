import { readFile } from 'node:fs/promises';
import {
  validateDeploymentManifest,
  validateSubmissionArtifacts,
  validateSubmissionManifest,
} from './manifest-validation.mjs';

const requireRelease = process.argv.includes('--release');
const deploymentFileIndex = process.argv.indexOf('--deployment-file');
const deploymentFile = deploymentFileIndex >= 0 ? process.argv[deploymentFileIndex + 1] : null;
if (deploymentFileIndex >= 0 && !deploymentFile) throw new Error('--deployment-file requires a path.');
const requireDeployment = requireRelease || process.argv.includes('--deployment') || Boolean(deploymentFile);
const deployment = JSON.parse(await readFile(
  deploymentFile || new URL('../deployments/testnet.json', import.meta.url),
));
const submission = JSON.parse(await readFile(new URL('../submission/evidence.json', import.meta.url)));
const errors = [
  ...validateDeploymentManifest(deployment, { requireDeployed: requireDeployment })
    .map((error) => `deployment: ${error}`),
  ...(deploymentFile ? [] : validateSubmissionManifest(submission, { requireReady: requireRelease })
    .map((error) => `submission: ${error}`)),
];
if (requireRelease) {
  errors.push(...await validateSubmissionArtifacts(submission, {
    readFile: (path) => readFile(new URL(`../${path}`, import.meta.url)),
  }).then((artifactErrors) => artifactErrors.map((error) => `submission: ${error}`)));
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(deploymentFile
    ? 'Deployment review candidate is structurally complete.'
    : requireRelease
    ? 'Release deployment and submission manifests are complete.'
    : 'Draft manifests are structurally valid; release evidence is not asserted.');
}
