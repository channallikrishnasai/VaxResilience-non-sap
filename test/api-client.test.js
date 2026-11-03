const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../app/ui5/webapp/api-client.js'), 'utf8');

function loadApi(fetch) {
  const context = { fetch };
  vm.runInNewContext(source, context);
  return context.VaxResilienceApi;
}

function response(body, { ok = true, status = 200, correlationId = 'req-test-001' } = {}) {
  return {
    ok,
    status,
    json: async () => body,
    headers: { get: (name) => name.toLowerCase() === 'x-correlation-id' ? correlationId : null }
  };
}

test('listMessages uses same-origin CAP and rejects malformed collection responses', async () => {
  let request;
  const api = loadApi(async (url, options) => {
    request = { url, options };
    return response({ value: [{ ID: 'MSG-1', status: 'FAILED' }] });
  });
  const messages = await api.listMessages();
  assert.equal(messages.length, 1);
  assert.match(request.url, /^\/api\/v1\/monitoring\/Messages/);
  assert.equal(request.options.credentials, 'same-origin');
  assert.equal(request.options.method, 'GET');

  const malformed = loadApi(async () => response({ value: {} }));
  await assert.rejects(malformed.listMessages(), /invalid Messages collection/);
});

test('create and retry send validated bodies and accept only the documented simulation responses', async () => {
  const calls = [];
  const api = loadApi(async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith('createDemoFailure')) return response({ ID: 'MSG-2', status: 'FAILED', source: 'SIMULATION' });
    return response({ ID: 'MSG-2', status: 'SIMULATED', retryCount: 1 });
  });
  assert.equal((await api.createDemoFailure()).ID, 'MSG-2');
  assert.equal((await api.retryMessage('MSG-2')).retryCount, 1);
  assert.equal(calls[0].options.method, 'POST');
  assert.deepEqual(JSON.parse(calls[0].options.body), {});
  assert.deepEqual(JSON.parse(calls[1].options.body), { ID: 'MSG-2' });
  await assert.rejects(api.retryMessage(''), /message ID is required/);
});

test('CAP errors preserve only HTTP status and correlation reference for safe UI display', async () => {
  const api = loadApi(async () => response({ error: { message: 'internal detail' } }, {
    ok: false, status: 409, correlationId: 'req-safe-409'
  }));
  await assert.rejects(api.retryMessage('MSG-1'), (error) => {
    assert.equal(error.name, 'ApiError');
    assert.equal(error.status, 409);
    assert.equal(error.correlationId, 'req-safe-409');
    assert.match(error.message, /HTTP 409 \(request req-safe-409\)/);
    assert.doesNotMatch(error.message, /internal detail/);
    return true;
  });
});

test('authentication and permission failures have distinct safe UI messages', async () => {
  for (const [status, expected] of [[401, /Authentication required \(HTTP 401\)/], [403, /Access denied \(HTTP 403\)/]]) {
    const api = loadApi(async () => response({ error: { message: 'sensitive server detail' } }, {
      ok: false, status, correlationId: `req-safe-${status}`
    }));
    await assert.rejects(api.listMessages(), (error) => {
      assert.equal(error.status, status);
      assert.equal(error.correlationId, `req-safe-${status}`);
      assert.match(error.message, expected);
      assert.match(error.message, new RegExp(`request req-safe-${status}`));
      assert.doesNotMatch(error.message, /sensitive server detail/);
      return true;
    });
  }
});
