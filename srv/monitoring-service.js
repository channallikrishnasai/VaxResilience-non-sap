const cds = require('@sap/cds');
const { nextSimulatedAttempt } = require('./domain/retry-policy');

module.exports = class MonitoringService extends cds.ApplicationService {
  async init() {
    const { Messages, Attempts } = this.entities;

    this.on('createDemoFailure', async (req) => {
      if (cds.env.profiles.includes('production')) return req.reject(404, 'Demo events are disabled in production');
      const ID = cds.utils.uuid();
      const correlationId = req.http?.req?.correlationId || `demo-${ID}`;
      await INSERT.into(Messages).entries({
        ID,
        correlationId,
        direction: 'INBOUND',
        businessObject: 'ShipmentStatus',
        source: 'SIMULATION',
        status: 'FAILED',
        errorCode: 'DEMO_CONNECTOR_UNAVAILABLE',
        errorSummary: 'Synthetic demonstration event; no carrier was contacted.',
        payloadPreview: '{"mode":"SIMULATION","shipmentStatus":"delayed"}'
      });
      return SELECT.one.from(Messages).where({ ID });
    });

    this.on('retryMessage', async (req) => {
      const { ID } = req.data;
      if (!ID) return req.reject(400, 'ID is required');

      const message = await SELECT.one.from(Messages).where({ ID }).forUpdate();
      let attemptNumber;
      try { attemptNumber = nextSimulatedAttempt(message); }
      catch (error) { return req.reject(error.status, error.message); }

      const now = new Date().toISOString();
      const correlationId = req.http?.req?.correlationId || message.correlationId;
      await INSERT.into(Attempts).entries({
        ID: cds.utils.uuid(),
        message_ID: ID,
        attemptNumber,
        outcome: 'SIMULATED',
        detail: 'No external provider was called; retry recorded for demonstration.'
      });
      await UPDATE(Messages).set({
        retryCount: attemptNumber,
        lastAttemptAt: now,
        status: 'SIMULATED'
      }).where({ ID });
      cds.log('integration').info('simulated retry recorded', { messageId: ID, attemptNumber, correlationId });
      return SELECT.one.from(Messages).where({ ID });
    });

    return super.init();
  }
};
