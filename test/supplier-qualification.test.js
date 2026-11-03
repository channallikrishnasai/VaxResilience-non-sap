const test = require('node:test');
const assert = require('node:assert/strict');
const { REQUIRED_CHECK_TYPES, evaluateSupplierChecklist } = require('../srv/domain/supplier-qualification');

const makeChecks = () => REQUIRED_CHECK_TYPES.map((checkType) => ({
  supplierId: 'SUP-1',
  productId: 'PRD-1',
  checkType,
  checkState: 'verified',
  evidenceRef: `EVD-${checkType}`,
  reviewedBy: 'USER-AUDIT-1',
  reviewedAt: '2026-11-02T12:00:00Z',
  validUntil: null,
  dataMode: 'synthetic'
}));

test('all six independent evidence checks can be complete without asserting supplier eligibility', () => {
  const result = evaluateSupplierChecklist({
    supplierId: 'SUP-1', productId: 'PRD-1', qualifications: makeChecks(), asOf: '2026-11-03'
  });
  assert.equal(result.checklistStatus, 'checks_complete');
  assert.deepEqual(result.checks.map((check) => check.checkType), REQUIRED_CHECK_TYPES);
  assert.equal(result.checks[0].reviewedBy, 'USER-AUDIT-1');
  assert.equal(result.checks[0].reviewedAt, '2026-11-02T12:00:00Z');
  assert.equal(result.checks[0].evidenceRef, 'EVD-quality');
  assert.equal(Object.hasOwn(result, 'supplierEligible'), false);
});

test('missing, failed, unverified, and expired checks remain individually unconfirmed', () => {
  const checks = makeChecks().filter((check) => check.checkType !== 'delivery');
  checks.find((check) => check.checkType === 'quality').checkState = 'failed';
  checks.find((check) => check.checkType === 'regulatory').checkState = 'expired';
  checks.find((check) => check.checkType === 'quantity').checkState = 'unverified';
  const result = evaluateSupplierChecklist({
    supplierId: 'SUP-1', productId: 'PRD-1', qualifications: checks, asOf: '2026-11-03'
  });
  assert.equal(result.checklistStatus, 'checks_incomplete');
  assert.deepEqual(result.checks.slice(0, 3).map((check) => check.reason), [
    'failed', 'expired', 'unverified'
  ]);
  assert.equal(result.checks[5].reason, 'missing_check');
});

test('expired evidence and conflicting current records remain unconfirmed', () => {
  const checks = makeChecks();
  checks.find((check) => check.checkType === 'quality').validUntil = '2026-11-02';
  checks.push({ ...checks[1], qualificationId: 'duplicate' });
  const result = evaluateSupplierChecklist({
    supplierId: 'SUP-1', productId: 'PRD-1', qualifications: checks, asOf: '2026-11-03'
  });
  assert.equal(result.checks[0].reason, 'expired');
  assert.equal(result.checks[1].reason, 'conflicting_records');
  assert.equal(result.checklistStatus, 'checks_incomplete');
});

test('verified state without evidence and malformed expiry dates are unconfirmed', () => {
  const checks = makeChecks();
  checks[0].evidenceRef = '';
  checks[1].validUntil = '2026-02-30';
  const result = evaluateSupplierChecklist({
    supplierId: 'SUP-1', productId: 'PRD-1', qualifications: checks, asOf: '2026-11-03'
  });
  assert.equal(result.checks[0].reason, 'missing_evidence');
  assert.equal(result.checks[1].reason, 'invalid_valid_until');
});

test('the evaluator requires a valid explicit as-of date', () => {
  assert.throws(() => evaluateSupplierChecklist({
    supplierId: 'SUP-1', productId: 'PRD-1', qualifications: makeChecks(), asOf: 'not-a-date'
  }), /valid YYYY-MM-DD date/);
});
