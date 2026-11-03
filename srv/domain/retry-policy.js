function nextSimulatedAttempt(message) {
  if (!message) throw Object.assign(new Error('Integration message not found'), { status: 404 });
  if (message.source !== 'SIMULATION') throw Object.assign(new Error('Only simulated messages can be retried locally'), { status: 409 });
  if (message.status !== 'FAILED') throw Object.assign(new Error('Only failed messages can be retried'), { status: 409 });
  return (message.retryCount || 0) + 1;
}

module.exports = { nextSimulatedAttempt };
