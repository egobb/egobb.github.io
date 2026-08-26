import fs from 'node:fs';
import path from 'node:path';

const build = process.argv[2];
if (!['pending', 'passed', 'failed'].includes(build)) {
  throw new Error(`Unsupported build status: ${build}`);
}

const root = path.resolve('artifacts/visual-review');
const file = path.join(root, 'manifest.json');
fs.mkdirSync(root, { recursive: true });

let manifest = {};
if (fs.existsSync(file)) {
  manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
}

manifest = {
  ...manifest,
  revision: process.env.VISUAL_REVIEW_REVISION || process.env.GITHUB_SHA || 'local',
  build,
  browser: 'chromium',
};

fs.writeFileSync(file, JSON.stringify(manifest, null, 2));
