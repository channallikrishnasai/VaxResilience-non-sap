namespace vaxresilience;

using { cuid, managed } from '@sap/cds/common';

entity IntegrationMessages : cuid, managed {
  correlationId : String(80) not null;
  direction     : String(16) not null;
  businessObject: String(80) not null;
  externalId    : String(120);
  source        : String(40) not null default 'SIMULATION';
  status        : String(20) not null;
  payloadHash   : String(64);
  payloadPreview: String(1000);
  errorCode     : String(80);
  errorSummary  : String(500);
  retryCount    : Integer not null default 0;
  lastAttemptAt : Timestamp;
  attempts      : Composition of many IntegrationAttempts on attempts.message = $self;
}

entity IntegrationAttempts : cuid, managed {
  message       : Association to IntegrationMessages not null;
  attemptNumber : Integer not null;
  outcome       : String(20) not null;
  detail        : String(500);
}
