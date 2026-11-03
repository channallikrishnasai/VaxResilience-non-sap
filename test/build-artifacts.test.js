const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { copyUiToProduction } = require('../scripts/copy-ui-to-production');

const sourceRoot = path.join(__dirname, '../app/ui5/webapp');

function listFiles(root, prefix = '') {
  return fs.readdirSync(path.join(root, prefix), { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(prefix, entry.name);
    return entry.isDirectory() ? listFiles(root, relative) : [relative];
  }).sort();
}

test('production artifact receives the complete SAPUI5 application and demo archive assets', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'vaxresilience-production-build-'));
  try {
    const destination = copyUiToProduction(tempRoot);
    assert.deepEqual(listFiles(destination), listFiles(sourceRoot));
    assert.ok(fs.existsSync(path.join(destination, 'index.html')));
    assert.ok(fs.existsSync(path.join(destination, 'controller/Module.controller.js')));
    assert.ok(fs.existsSync(path.join(destination, 'demo-archive/manifest.json')));
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
