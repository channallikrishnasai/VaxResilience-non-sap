'use strict';

const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const sourceRoot = path.join(projectRoot, 'docs/official-specification/data/synthetic');
const targetRoot = path.join(projectRoot, 'app/ui5/webapp/demo-archive');

// Keep collections without approved schemas, and records whose parent/schema
// is unresolved, out of the browser-delivered read-only archive.
const omittedCollections = Object.freeze({
  'products.json': Object.freeze(['calculationAssumptions']),
  'operations.json': Object.freeze(['productionPlans', 'productionBatches', 'productionConsumptions']),
  'incidents-recovery.json': Object.freeze(['impactEstimates'])
});

function buildArchiveFiles(sourceDirectory = sourceRoot) {
  const manifest = JSON.parse(fs.readFileSync(path.join(sourceDirectory, 'manifest.json'), 'utf8'));
  if (!Array.isArray(manifest.fixtureFiles) || manifest.dataMode !== 'synthetic') {
    throw new Error('Source manifest must list fixtures and identify synthetic data');
  }

  const output = new Map([['manifest.json', `${JSON.stringify(manifest, null, 2)}\n`]]);
  for (const filename of manifest.fixtureFiles) {
    if (path.basename(filename) !== filename || !filename.endsWith('.json')) {
      throw new Error(`Unsafe fixture filename in source manifest: ${filename}`);
    }
    const data = JSON.parse(fs.readFileSync(path.join(sourceDirectory, filename), 'utf8'));
    for (const collection of omittedCollections[filename] || []) delete data[collection];
    output.set(filename, `${JSON.stringify(data, null, 2)}\n`);
  }
  return output;
}

function writeArchive() {
  fs.mkdirSync(targetRoot, { recursive: true });
  for (const [filename, contents] of buildArchiveFiles()) {
    fs.writeFileSync(path.join(targetRoot, filename), contents, 'utf8');
  }
}

if (require.main === module) writeArchive();

module.exports = { buildArchiveFiles, omittedCollections, writeArchive };
