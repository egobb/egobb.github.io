import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('artifacts/visual-review');
const manifestFile = path.join(root, 'manifest.json');
const resultsRoot = path.join(root, 'results');
const interactionsRoot = path.join(root, 'interactions');

const pageMatrix = [
  { name: 'home', url: '/' },
  { name: 'projects', url: '/projects/' },
  { name: 'writing', url: '/writing/' },
  { name: 'about', url: '/about/' },
  { name: 'posts', url: '/posts/' },
  {
    name: 'long-article',
    url: '/posts/when-postgres-is-enough-building-a-resilient-snapshot-ingestion-pipeline-without-kafka/',
  },
];
const viewports = ['desktop', 'tablet', 'mobile'];

function readJsonFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory)
    .filter(file => file.endsWith('.json'))
    .sort()
    .map(file => JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8')));
}

fs.mkdirSync(root, { recursive: true });
const existing = fs.existsSync(manifestFile)
  ? JSON.parse(fs.readFileSync(manifestFile, 'utf8'))
  : {};
const results = readJsonFiles(resultsRoot);
const interactions = readJsonFiles(interactionsRoot);
const expectedPageViewports = pageMatrix.length * viewports.length;

const manifest = {
  ...existing,
  revision: process.env.VISUAL_REVIEW_REVISION || process.env.GITHUB_SHA || existing.revision || 'local',
  browser: 'chromium',
  generatedAt: new Date().toISOString(),
  pages: pageMatrix.map(page => ({ ...page, viewports })),
  checks: {
    expectedPageViewports,
    recordedPageViewports: results.length,
    failedPageViewports: results.filter(result => result.status === 'failed').length,
    consoleErrors: results.reduce((sum, result) => sum + result.consoleErrors.length, 0),
    brokenImages: results.reduce((sum, result) => sum + result.brokenImages.length, 0),
    horizontalOverflow: results.some(result => result.horizontalOverflow),
    interactionChecks: interactions.length,
    failedInteractionChecks: interactions.filter(result => result.status === 'failed').length,
  },
  results,
  interactions,
};

fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
