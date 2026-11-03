(function attachVaxResilienceApi(global) {
  'use strict';

  const monitoringPath = '/api/v1/monitoring';

  class ApiError extends Error {
    constructor(status, correlationId) {
      const requestRef = correlationId ? ` (request ${correlationId})` : '';
      const statusMessage = status === 401 ? 'Authentication required (HTTP 401)'
        : status === 403 ? 'Access denied (HTTP 403)'
          : `CAP returned HTTP ${status}`;
      super(`${statusMessage}${requestRef}`);
      this.name = 'ApiError';
      this.status = status;
      this.correlationId = correlationId || null;
    }
  }

  async function request(path, options) {
    const settings = options || {};
    const headers = { Accept: 'application/json', ...(settings.body === undefined ? {} : { 'Content-Type': 'application/json' }) };
    const response = await global.fetch(`${monitoringPath}/${path}`, {
      method: settings.method || 'GET',
      credentials: 'same-origin',
      headers,
      ...(settings.body === undefined ? {} : { body: JSON.stringify(settings.body) })
    });
    let payload;
    try {
      payload = await response.json();
    } catch (_error) {
      payload = null;
    }
    const correlationId = response.headers && response.headers.get('X-Correlation-ID');
    if (!response.ok) throw new ApiError(response.status, correlationId);
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new Error('CAP returned an invalid JSON response');
    }
    return payload;
  }

  async function listMessages() {
    const payload = await request('Messages?$orderby=modifiedAt%20desc');
    if (!Array.isArray(payload.value)) throw new Error('CAP returned an invalid Messages collection');
    return payload.value;
  }

  async function createDemoFailure() {
    const payload = await request('createDemoFailure', { method: 'POST', body: {} });
    if (typeof payload.ID !== 'string' || payload.status !== 'FAILED' || payload.source !== 'SIMULATION') {
      throw new Error('CAP returned an invalid synthetic-message response');
    }
    return payload;
  }

  async function retryMessage(id) {
    if (typeof id !== 'string' || !id) throw new TypeError('A message ID is required');
    const payload = await request('retryMessage', { method: 'POST', body: { ID: id } });
    if (payload.ID !== id || payload.status !== 'SIMULATED' || !Number.isInteger(payload.retryCount)) {
      throw new Error('CAP returned an invalid simulated-retry response');
    }
    return payload;
  }

  global.VaxResilienceApi = Object.freeze({ ApiError, listMessages, createDemoFailure, retryMessage });
})(globalThis);
