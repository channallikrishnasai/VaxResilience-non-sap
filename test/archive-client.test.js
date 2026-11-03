const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const sourceRoot = path.join(__dirname, '../docs/official-specification/data/synthetic');
const webRoot = path.join(__dirname, '../app/ui5/webapp/demo-archive');
const clientSource = fs.readFileSync(path.join(__dirname, '../app/ui5/webapp/archive-client.js'), 'utf8');
const archiveBuilder = require('../scripts/prepare-ui-archive');

function createArchiveClient(fetchImpl) {
  const context = { fetch: fetchImpl };
  vm.runInNewContext(clientSource, context);
  return context.VaxResilienceArchive;
}

test('UI archive preserves source fixtures while omitting unresolved and dependent collections', () => {
  const fixtureFiles = fs.readdirSync(sourceRoot).filter((file) => file.endsWith('.json')).sort();
  const bundledFiles = fs.readdirSync(webRoot).filter((file) => file.endsWith('.json')).sort();
  assert.deepEqual(bundledFiles, [...new Set([...fixtureFiles, 'manifest.json'])].sort());
  const generated = archiveBuilder.buildArchiveFiles();
  assert.deepEqual([...generated.keys()].sort(), bundledFiles);
  for (const [file, contents] of generated) {
    assert.deepEqual(
      JSON.parse(fs.readFileSync(path.join(webRoot, file), 'utf8')),
      JSON.parse(contents),
      `${file} must match the deterministic archive export`
    );
    if (file !== 'manifest.json') {
      const source = JSON.parse(fs.readFileSync(path.join(sourceRoot, file), 'utf8'));
      const output = JSON.parse(contents);
      const omitted = archiveBuilder.omittedCollections[file] || [];
      for (const [collection, records] of Object.entries(source)) {
        if (omitted.includes(collection)) assert.equal(output[collection], undefined, `${collection} is omitted from browser archive`);
        else assert.deepEqual(output[collection], records, `${collection} must match the source fixture exactly`);
      }
    }
  }
});

test('archive loads only same-origin selected collections and requires explicit fictional provenance', async () => {
  const requests = [];
  const archiveClient = createArchiveClient(async (url, options) => {
    requests.push([url, options]);
    const file = path.basename(url);
    const body = JSON.parse(fs.readFileSync(path.join(webRoot, file), 'utf8'));
    return { ok: true, status: 200, json: async () => body };
  });

  const archive = await archiveClient.load('supply-chain-digital-twin');
  assert.equal(archive.manifest.dataMode, 'synthetic');
  assert.match(archive.manifest.fictionalDisclaimer, /fictional synthetic demonstration records/);
  assert.ok(archive.collections.some((collection) => collection.name === 'routes'));
  assert.ok(archive.collections.some((collection) => collection.name === 'shipments'));
  assert.deepEqual(JSON.parse(JSON.stringify(archive.omittedCollections)), [
    'calculationAssumptions', 'productionPlans', 'productionBatches', 'productionConsumptions', 'impactEstimates'
  ]);
  assert.ok(requests.every(([url, options]) => url.startsWith('/ui/demo-archive/') && options.credentials === 'same-origin'));
  assert.ok(requests.every(([url]) => !url.includes('..')));
});

test('all eight module archives resolve only schema-covered, non-omitted collections', async () => {
  const archiveClient = createArchiveClient(async (url) => ({
    ok: true,
    status: 200,
    json: async () => JSON.parse(fs.readFileSync(path.join(webRoot, path.basename(url)), 'utf8'))
  }));
  const omitted = new Set([
    'calculationAssumptions', 'productionPlans', 'productionBatches',
    'productionConsumptions', 'impactEstimates'
  ]);
  for (const moduleId of Object.keys(archiveClient.collectionsByModule)) {
    const archive = await archiveClient.load(moduleId);
    assert.ok(archive.collections.length > 0, `${moduleId} has archive collections`);
    for (const collection of archive.collections) {
      assert.equal(omitted.has(collection.name), false, `${moduleId} does not expose ${collection.name}`);
      assert.ok(collection.records.every((record) => record && typeof record === 'object' && !Array.isArray(record)));
    }
  }
});

test('archive rejects unknown modules, failed fetches, non-synthetic manifests, and malformed collections', async () => {
  const neverFetch = async () => { throw new Error('fetch should not be called'); };
  const client = createArchiveClient(neverFetch);
  await assert.rejects(client.load('../operations'), /Unknown archive module/);

  const failed = createArchiveClient(async () => ({ ok: false, status: 503, json: async () => ({}) }));
  await assert.rejects(failed.load('executive-dashboard'), /Archive unavailable \(HTTP 503\)/);

  const malformedDashboardManifest = createArchiveClient(async (url) => {
    const file = path.basename(url);
    const body = JSON.parse(fs.readFileSync(path.join(webRoot, file), 'utf8'));
    if (file === 'manifest.json') body.scenarioFacts = [];
    return { ok: true, status: 200, json: async () => body };
  });
  await assert.rejects(malformedDashboardManifest.load('executive-dashboard'), /scenario facts are missing or malformed/);

  const invalidManifest = createArchiveClient(async () => ({
    ok: true, status: 200, json: async () => ({ dataMode: 'live', fictionalDisclaimer: '' })
  }));
  await assert.rejects(invalidManifest.load('executive-dashboard'), /not explicitly synthetic and fictional/);

  const malformedCollection = createArchiveClient(async (url) => ({
    ok: true, status: 200,
    json: async () => path.basename(url) === 'manifest.json'
      ? JSON.parse(fs.readFileSync(path.join(webRoot, 'manifest.json'), 'utf8'))
      : { disruptions: 'not-an-array' }
  }));
  await assert.rejects(malformedCollection.load('executive-dashboard'), /collection disruptions has an invalid shape/);
});
