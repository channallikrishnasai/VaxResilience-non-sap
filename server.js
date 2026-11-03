const cds = require('@sap/cds');
const { randomUUID } = require('node:crypto');

const CORRELATION_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$/;

cds.on('bootstrap', (app) => {
  const log = cds.log('health');
  app.use((req, res, next) => {
    const requestedId = req.get('X-Correlation-ID');
    const correlationId = requestedId && CORRELATION_ID_PATTERN.test(requestedId)
      ? requestedId
      : randomUUID();
    req.correlationId = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);
    next();
  });
  app.get('/healthz', (_req, res) => res.status(200).json({ status: 'ok' }));
  app.get('/readyz', async (_req, res) => {
    try {
      if (!cds.db) throw new Error('Database service is not connected');
      await cds.db.run('SELECT 1 AS healthy');
      res.status(200).json({ status: 'ready', database: 'connected' });
    } catch (error) {
      log.error('readiness check failed', { error: error.message });
      res.status(503).json({ status: 'not_ready', database: 'unavailable' });
    }
  });
  app.use('/ui', require('express').static(`${__dirname}/app/ui5/webapp`));
});

module.exports = cds.server;
