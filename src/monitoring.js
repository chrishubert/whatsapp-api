'use strict';

const process = require('process');
const opentelemetry = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { Resource } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = require('@opentelemetry/semantic-conventions');
const { OTEL_EXPORTER_OTLP_ENDPOINT, SERVICE_NAME, SERVICE_VERSION } = require('./config');
const { ApplicationLogger } = require('./logger');

const exporterOptions = {
  url: `${OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`
}

const traceExporter = new OTLPTraceExporter(exporterOptions);
const sdk = new opentelemetry.NodeSDK({
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
  resource: new Resource({
    [ATTR_SERVICE_NAME]: SERVICE_NAME,
    [ATTR_SERVICE_VERSION]: SERVICE_VERSION
  })
});
  
// initialize the SDK and register with the OpenTelemetry API
// this enables the API to record telemetry
sdk.start()
  
// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  sdk.shutdown()
  .then(() => ApplicationLogger.log('Tracing terminated'))
  .catch((error) => ApplicationLogger.error('Error terminating tracing', error))
  .finally(() => process.exit(0));
});