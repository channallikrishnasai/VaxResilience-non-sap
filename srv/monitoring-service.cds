using { vaxresilience as db } from '../db/schema';

@path: '/api/v1/monitoring'
@requires: 'authenticated-user'
service MonitoringService {
  @readonly entity Messages as projection on db.IntegrationMessages;
  @readonly entity Attempts as projection on db.IntegrationAttempts;

  action createDemoFailure() returns Messages;
  action retryMessage(ID: UUID) returns Messages;
}
