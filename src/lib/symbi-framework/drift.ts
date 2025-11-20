/**
 * Emergence/Drift detection utilities for SYMBI Resonate
 *
 * Provides lightweight time-series detectors for score dynamics:
 * - EWMA control-limit drift detection
 * - Basic window stats and critical-rate helper
 */

export interface DriftOptions {
  alpha?: number; // EWMA smoothing factor
  L?: number;     // control limit multiplier
}

export interface DriftResult {
  drifting: boolean;
  deviation: number;
  threshold: number;
  ewma: number;
  mean: number;
  std: number;
}

export interface WindowStats {
  mean: number;
  std: number;
  slope: number;
}

export function computeStats(values: number[]): WindowStats {
  if (!values || values.length === 0) return { mean: 0, std: 0, slope: 0 };
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((a, b) => a + (b - mean) * (b - mean), 0) / Math.max(1, n - 1);
  const std = Math.sqrt(variance);
  const slope = (values[n - 1] - values[0]) / Math.max(1, n - 1);
  return { mean, std, slope };
}

export function ewma(values: number[], alpha = 0.3): number {
  if (!values || values.length === 0) return 0;
  let s = values[0];
  for (let i = 1; i < values.length; i += 1) s = alpha * values[i] + (1 - alpha) * s;
  return s;
}

/**
 * Detect drift on the newest sample against EWMA of prior window.
 * Avoids contaminating sigma and EWMA with the newest point.
 */
export function detectDrift(values: number[], opts: DriftOptions = {}): DriftResult {
  if (!values || values.length < 3) {
    return { drifting: false, deviation: 0, threshold: 0, ewma: 0, mean: 0, std: 0 };
  }
  const last = values[values.length - 1];
  const hist = values.slice(0, -1);
  const { mean, std } = computeStats(hist);
  const sPrev = ewma(hist, opts.alpha ?? 0.3);
  const L = opts.L ?? 3;
  const sigma = std || 0.05; // small floor to avoid zero-threshold
  const threshold = sigma * L;
  const deviation = Math.abs(last - sPrev);
  const drifting = deviation > threshold;
  return { drifting, deviation, threshold, ewma: sPrev, mean, std };
}

/**
 * Compute critical-failure rate in a boolean array over a window.
 */
export function criticalRate(flags: boolean[]): number {
  if (!flags || flags.length === 0) return 0;
  const c = flags.reduce((acc, f) => acc + (f ? 1 : 0), 0);
  return c / flags.length;
}

/**
 * Example usage:
 * const scores = [0.1, 0.12, 0.11, 0.55];
 * const res = detectDrift(scores, { alpha: 0.3, L: 3 });
 * if (res.drifting) console.warn('Drift detected!', res);
 */

