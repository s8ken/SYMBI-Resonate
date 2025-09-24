let promClient;
try {
  // Lazy require so app still runs if dep not installed in some envs
  // eslint-disable-next-line global-require
  promClient = require('prom-client');
} catch (e) {
  promClient = null;
}

const registry = promClient ? new promClient.Registry() : null;

let metrics = {
  complianceGauge: null,
  guiltGauge: null,
  scoreDeltaGauge: null,
  scoreDriftCounter: null,
};

function initMetrics() {
  if (!promClient || !registry) return;

  metrics.complianceGauge = new promClient.Gauge({
    name: 'symbi_compliance_current',
    help: 'Current compliance score per agent',
    labelNames: ['agent_id'],
  });
  metrics.guiltGauge = new promClient.Gauge({
    name: 'symbi_guilt_current',
    help: 'Current guilt score per agent',
    labelNames: ['agent_id'],
  });
  metrics.scoreDeltaGauge = new promClient.Gauge({
    name: 'symbi_guilt_delta',
    help: 'Delta of guilt score vs previous declaration',
    labelNames: ['agent_id'],
  });
  metrics.scoreDriftCounter = new promClient.Counter({
    name: 'score_drift_total',
    help: 'Count of detected score drift events',
    labelNames: ['agent_id', 'detector'],
  });

  registry.registerMetric(metrics.complianceGauge);
  registry.registerMetric(metrics.guiltGauge);
  registry.registerMetric(metrics.scoreDeltaGauge);
  registry.registerMetric(metrics.scoreDriftCounter);

  promClient.collectDefaultMetrics({ register: registry });
}

function setScores(agentId, compliance, guilt) {
  if (!metrics.complianceGauge || !metrics.guiltGauge) return;
  metrics.complianceGauge.labels(agentId).set(compliance);
  metrics.guiltGauge.labels(agentId).set(guilt);
}

function setDelta(agentId, delta) {
  if (!metrics.scoreDeltaGauge) return;
  metrics.scoreDeltaGauge.labels(agentId).set(delta);
}

function incDrift(agentId, detectorName) {
  if (!metrics.scoreDriftCounter) return;
  metrics.scoreDriftCounter.labels(agentId, detectorName).inc();
}

function metricsMiddleware() {
  if (!registry) {
    return (req, res) => res.status(501).send('metrics unavailable');
  }
  return async (req, res) => {
    res.set('Content-Type', registry.contentType);
    res.end(await registry.metrics());
  };
}

module.exports = {
  initMetrics,
  metricsMiddleware,
  setScores,
  setDelta,
  incDrift,
};

