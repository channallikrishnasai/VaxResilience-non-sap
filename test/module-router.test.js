const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../app/ui5/webapp/module-router.js'), 'utf8');
const context = {};
vm.runInNewContext(source, context);
const router = context.VaxResilienceRouter;

test('all eight module hashes resolve to their official module ids and reverse cleanly', () => {
  for (const moduleId of Object.keys(router.moduleNames)) {
    const hash = router.toHash(moduleId);
    assert.equal(router.fromHash(hash), moduleId);
  }
  assert.equal(Object.keys(router.moduleNames).length, 8);
});

test('unknown, empty, and malformed hashes safely return to the dashboard', () => {
  for (const hash of ['', '#', '#/unknown', '#//risk-compliance-audit', '#/risk-compliance-audit/extra']) {
    assert.equal(router.fromHash(hash), router.defaultModule);
  }
  assert.equal(router.toHash('unrecognized'), '#/executive-dashboard');
});

test('router API is immutable and does not accept prototype properties as modules', () => {
  assert.equal(Object.isFrozen(router), true);
  assert.equal(router.fromHash('#/toString'), router.defaultModule);
  assert.equal(router.toHash('constructor'), '#/executive-dashboard');
});
