const TrustDeclaration = require('../models/trust.model');

// Simple EWMA/CUSUM-based drift detection on guilt scores
function computeStats(values) {
  if (!values || values.length === 0) return { mean: 0, std: 0, slope: 0 };
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((a, b) => a + (b - mean) * (b - mean), 0) / Math.max(1, n - 1);
  const std = Math.sqrt(variance);
  // simple slope via last-first over n
  const slope = (values[n - 1] - values[0]) / Math.max(1, n - 1);
  return { mean, std, slope };
}

function ewma(values, alpha = 0.3) {
  if (!values || values.length === 0) return 0;
  let s = values[0];
  for (let i = 1; i < values.length; i += 1) s = alpha * values[i] + (1 - alpha) * s;
  return s;
}

function detectDrift(values, opts = {}) {
  if (!values || values.length < 3) {
    return { drifting: false, deviation: 0, threshold: 0, ewma: 0, mean: 0, std: 0 };
  }
  const last = values[values.length - 1];
  const hist = values.slice(0, -1);
  const { mean, std } = computeStats(hist);
  const sPrev = ewma(hist, opts.alpha || 0.3);
  const L = opts.L || 3; // control limit multiplier
  const sigma = std || 0.05; // floor sigma to avoid zero
  const threshold = sigma * L;
  const deviation = Math.abs(last - sPrev);
  const drifting = deviation > threshold;
  return { drifting, deviation, threshold, ewma: sPrev, mean, std };
}

async function analyzeAgentWindow(agentId, windowSize = 10) {
  const docs = await TrustDeclaration.find({ agent_id: agentId })
    .sort({ declaration_date: -1 })
    .limit(windowSize)
    .lean();
  if (!docs || docs.length === 0) return { ok: false };
  const guiltValues = docs.map((d) => d.guilt_score).reverse();
  const deltas = guiltValues.map((v, i, arr) => (i === 0 ? 0 : v - arr[i - 1])).slice(1);
  const stats = computeStats(guiltValues);
  const drift = detectDrift(guiltValues);
  // critical-article rate over window
  const criticalMissing = ['consent_architecture', 'ethical_override'];
  const critFailRate =
    docs.filter((d) => criticalMissing.some((k) => !d.trust_articles?.[k]))
      .length / docs.length;
  return {
    ok: true,
    guiltValues,
    deltas,
    stats,
    drift,
    critFailRate,
  };
}

// Optional: simple content emergence detection based on notes text
function detectContentEmergence(text) {
  if (!text) return { score: 0, reasons: [] };
  let score = 0;
  const reasons = [];
  const themePatterns = [
    /emergence|emergent|self-organization/i,
    /meta[- ]?reflection|self[- ]?referential/i,
    /harmon(y|ic)|resonance|synchron(ize|ization)/i,
  ];
  themePatterns.forEach((re) => { if (re.test(text)) { score += 0.2; reasons.push(`theme:${re.source}`); } });

  const layeredPatterns = [/(on\s+one\s+hand).*?(on\s+the\s+other\s+hand)/is, /meanwhile|paradox|dialectic/i];
  layeredPatterns.forEach((re) => { if (re.test(text)) { score += 0.15; reasons.push(`layered:${re.source}`); } });

  const coherencePatterns = [/therefore|however|nevertheless|although|despite/i];
  coherencePatterns.forEach((re) => { if (re.test(text)) { score += 0.15; reasons.push(`coherence:${re.source}`); } });

  score = Math.min(1.0, score);
  return { score, reasons };
}

module.exports = {
  analyzeAgentWindow,
  detectDrift,
  detectContentEmergence,
  // expose for unit tests
  _internal: { computeStats, ewma },
};
