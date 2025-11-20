/**
 * Tests for enhanced emergence detection functionality
 */

import { 
  detectContentEmergence, 
  analyzeAgentWindow, 
  detectEmergence,
  generateEmergenceMetrics 
} from '../emergence';

describe('Emergence Detection', () => {
  
  describe('Content Emergence Detection', () => {
    test('should detect emergence patterns in text', () => {
      const emergenceText = 'The system shows emergence of self-organization and meta-reflection. However, there are paradoxical patterns.';
      const result = detectContentEmergence(emergenceText);
      
      expect(result.score).toBeGreaterThan(0);
      expect(result.reasons.length).toBeGreaterThan(0);
      expect(result.reasons.some(r => r.includes('theme'))).toBe(true);
    });
    
    test('should return zero for empty text', () => {
      const result = detectContentEmergence('');
      expect(result.score).toBe(0);
      expect(result.reasons).toEqual([]);
    });
    
    test('should detect harmonious resonance patterns', () => {
      const harmonyText = 'The system demonstrates harmonious resonance and synchronization.';
      const result = detectContentEmergence(harmonyText);
      
      expect(result.score).toBeGreaterThan(0.1);
      expect(result.reasons.some(r => r.includes('theme'))).toBe(true);
    });
  });
  
  describe('Agent Window Analysis', () => {
    test('should analyze agent trust declarations', () => {
      const declarations = [
        {
          guilt_score: 0.2,
          trust_articles: { consent_architecture: true, ethical_override: true },
          notes: 'Standard operation'
        },
        {
          guilt_score: 0.3,
          trust_articles: { consent_architecture: true, ethical_override: false },
          notes: 'Minor ethical concern'
        },
        {
          guilt_score: 0.7,
          trust_articles: { consent_architecture: false, ethical_override: false },
          notes: 'The emergence of self-organization creates new patterns of resonance.'
        }
      ];
      
      const result = analyzeAgentWindow(declarations);
      
      expect(result.ok).toBe(true);
      expect(result.guiltValues).toEqual([0.2, 0.3, 0.7]);
      expect(result.deltas).toEqual([0, 0.1, 0.4]);
      expect(result.stats?.mean).toBeCloseTo(0.4, 2);
      expect(result.contentEmergence?.score).toBeGreaterThan(0);
      expect(result.critFailRate).toBeGreaterThan(0);
    });
    
    test('should handle empty declarations array', () => {
      const result = analyzeAgentWindow([]);
      expect(result.ok).toBe(false);
    });
    
    test('should detect drift in score progression', () => {
      const declarations = [
        { guilt_score: 0.1, trust_articles: {}, notes: 'Initial' },
        { guilt_score: 0.12, trust_articles: {}, notes: 'Slight increase' },
        { guilt_score: 0.8, trust_articles: {}, notes: 'Major jump' }
      ];
      
      const result = analyzeAgentWindow(declarations);
      expect(result.drift?.drifting).toBe(true);
      expect(result.drift?.deviation).toBeGreaterThan(0.1);
    });
  });
  
  describe('Emergence Metrics Generation', () => {
    test('should generate appropriate alert levels', () => {
      const driftAnalysis = {
        ok: true,
        drift: { drifting: true, deviation: 0.5, threshold: 0.1, ewma: 0, mean: 0, std: 0.1 },
        contentEmergence: { score: 0.3, reasons: ['test'] },
        critFailRate: 0.1
      };
      
      const metrics = generateEmergenceMetrics(driftAnalysis);
      
      expect(metrics.hasData).toBe(true);
      expect(metrics.alertLevel).toBe('high');
      expect(metrics.alertReasons.length).toBeGreaterThan(0);
      expect(metrics.metrics.driftDetected).toBe(true);
    });
    
    test('should handle critical alert conditions', () => {
      const criticalAnalysis = {
        ok: true,
        drift: { drifting: true, deviation: 0.5, threshold: 0.1, ewma: 0, mean: 0, std: 0.1 },
        contentEmergence: { score: 0.8, reasons: ['emergence', 'harmony'] },
        critFailRate: 0.1
      };
      
      const metrics = generateEmergenceMetrics(criticalAnalysis);
      
      expect(metrics.alertLevel).toBe('critical');
      expect(metrics.alertReasons.some(r => r.includes('drift'))).toBe(true);
      expect(metrics.alertReasons.some(r => r.includes('emergence'))).toBe(true);
    });
    
    test('should return normal for stable patterns', () => {
      const stableAnalysis = {
        ok: true,
        drift: { drifting: false, deviation: 0.05, threshold: 0.2, ewma: 0.2, mean: 0.2, std: 0.05 },
        contentEmergence: { score: 0.2, reasons: [] },
        critFailRate: 0.1
      };
      
      const metrics = generateEmergenceMetrics(stableAnalysis);
      
      expect(metrics.alertLevel).toBe('normal');
      expect(metrics.alertReasons.length).toBe(0);
    });
  });
  
  describe('Integrated Emergence Detection', () => {
    test('should provide comprehensive emergence analysis', () => {
      const declarations = [
        {
          guilt_score: 0.1,
          trust_articles: { consent_architecture: true, ethical_override: true },
          notes: 'Starting normal operations'
        },
        {
          guilt_score: 0.15,
          trust_articles: { consent_architecture: true, ethical_override: true },
          notes: 'Continuing stable behavior'
        },
        {
          guilt_score: 0.7,
          trust_articles: { consent_architecture: false, ethical_override: false },
          notes: 'Emergence of self-organizing patterns with harmonious resonance, creating meta-reflection capabilities'
        }
      ];
      
      const result = detectEmergence(declarations);
      
      expect(result.ok).toBe(true);
      expect(result.alert).toBe(true);
      expect(result.drift?.drifting).toBe(true);
      expect(result.contentEmergence?.score).toBeGreaterThan(0.5);
      expect(result.critFailRate).toBeGreaterThan(0.3);
    });
  });
});