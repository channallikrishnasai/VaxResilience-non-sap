const REQUIRED_CHECK_TYPES = Object.freeze([
  'quality',
  'regulatory',
  'quantity',
  'capacity',
  'supplier_confirmation',
  'delivery'
]);

function isDateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

/**
 * Evaluate evidence coverage for the documented six supplier checks.
 * A complete checklist is not a supplier qualification or purchase approval.
 */
function evaluateSupplierChecklist({ supplierId, productId, qualifications, asOf }) {
  if (typeof supplierId !== 'string' || !supplierId || typeof productId !== 'string' || !productId) {
    throw new TypeError('supplierId and productId are required strings');
  }
  if (!Array.isArray(qualifications)) throw new TypeError('qualifications must be an array');
  if (!isDateOnly(asOf)) throw new TypeError('asOf must be a valid YYYY-MM-DD date');

  const relevant = qualifications.filter((row) =>
    row && row.supplierId === supplierId && row.productId === productId
  );
  const provenanceFor = (record) => ({
    evidenceRef: record.evidenceRef ?? null,
    reviewedBy: record.reviewedBy ?? null,
    reviewedAt: record.reviewedAt ?? null,
    validUntil: record.validUntil ?? null,
    dataMode: record.dataMode ?? null
  });

  const checks = REQUIRED_CHECK_TYPES.map((checkType) => {
    const records = relevant.filter((row) => row.checkType === checkType);
    if (records.length === 0) return { checkType, state: 'unconfirmed', reason: 'missing_check' };
    if (records.length > 1) return { checkType, state: 'unconfirmed', reason: 'conflicting_records' };

    const record = records[0];
    if (record.checkState !== 'verified') {
      const reason = ['unverified', 'failed', 'expired'].includes(record.checkState)
        ? record.checkState
        : 'invalid_check_state';
      return { checkType, state: 'unconfirmed', reason, ...provenanceFor(record) };
    }
    if (typeof record.evidenceRef !== 'string' || !record.evidenceRef.trim()) {
      return { checkType, state: 'unconfirmed', reason: 'missing_evidence', ...provenanceFor(record) };
    }
    if (record.validUntil !== null && record.validUntil !== undefined) {
      if (!isDateOnly(record.validUntil)) {
        return { checkType, state: 'unconfirmed', reason: 'invalid_valid_until', ...provenanceFor(record) };
      }
      if (record.validUntil < asOf) {
        return { checkType, state: 'unconfirmed', reason: 'expired', ...provenanceFor(record) };
      }
    }

    return {
      checkType,
      state: 'verified',
      ...provenanceFor(record)
    };
  });

  return {
    supplierId,
    productId,
    asOf,
    checklistStatus: checks.every((check) => check.state === 'verified') ? 'checks_complete' : 'checks_incomplete',
    checks
  };
}

module.exports = { REQUIRED_CHECK_TYPES, evaluateSupplierChecklist };
