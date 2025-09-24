/**
 * SYMBI Framework Detector Tests
 * 
 * Comprehensive tests for the SYMBI framework detection algorithms,
 * validating scoring accuracy and assessment generation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SymbiFrameworkDetector } from '../detector';
import type { AssessmentInput, AssessmentResult } from '../types';

describe('SymbiFrameworkDetector', () => {
  let detector: SymbiFrameworkDetector;

  beforeEach(() => {
    detector = new SymbiFrameworkDetector();
  });

  describe('Basic Analysis', () => {
    it('should create a valid assessment result', async () => {
      const input: AssessmentInput = {
        content: 'This is a test content for analysis.',
        metadata: {
          source: 'test',
          author: 'test-author',
          context: 'test-context'
        }
      };

      const result = await detector.analyzeContent(input);

      expect(result).toBeDefined();
      expect(result.assessment).toBeDefined();
      expect(result.insights).toBeDefined();
      expect(result.validationDetails).toBeDefined();
    });

    it('should generate valid assessment structure', async () => {
      const input: AssessmentInput = {
        content: 'Technical analysis of transformer neural networks.',
      };

      const result = await detector.analyzeContent(input);
      const { assessment } = result;

      // Check assessment structure
      expect(assessment.id).toMatch(/^[a-f0-9-]+$/);
      expect(assessment.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(assessment.contentId).toBeDefined();

      // Check Reality Index
      expect(assessment.realityIndex.score).toBeGreaterThanOrEqual(0);
      expect(assessment.realityIndex.score).toBeLessThanOrEqual(10);
      expect(assessment.realityIndex.missionAlignment).toBeGreaterThanOrEqual(0);
      expect(assessment.realityIndex.contextualCoherence).toBeGreaterThanOrEqual(0);
      expect(assessment.realityIndex.technicalAccuracy).toBeGreaterThanOrEqual(0);
      expect(assessment.realityIndex.authenticity).toBeGreaterThanOrEqual(0);

      // Check Trust Protocol
      expect(['PASS', 'PARTIAL', 'FAIL']).toContain(assessment.trustProtocol.status);
      expect(['PASS', 'PARTIAL', 'FAIL']).toContain(assessment.trustProtocol.verificationMethods);
      expect(['PASS', 'PARTIAL', 'FAIL']).toContain(assessment.trustProtocol.boundaryMaintenance);
      expect(['PASS', 'PARTIAL', 'FAIL']).toContain(assessment.trustProtocol.securityAwareness);

      // Check Ethical Alignment
      expect(assessment.ethicalAlignment.score).toBeGreaterThanOrEqual(1);
      expect(assessment.ethicalAlignment.score).toBeLessThanOrEqual(5);

      // Check Resonance Quality
      expect(['STRONG', 'ADVANCED', 'BREAKTHROUGH']).toContain(assessment.resonanceQuality.level);
      expect(assessment.resonanceQuality.creativityScore).toBeGreaterThanOrEqual(0);
      expect(assessment.resonanceQuality.synthesisQuality).toBeGreaterThanOrEqual(0);
      expect(assessment.resonanceQuality.innovationMarkers).toBeGreaterThanOrEqual(0);

      // Check Canvas Parity
      expect(assessment.canvasParity.score).toBeGreaterThanOrEqual(0);
      expect(assessment.canvasParity.score).toBeLessThanOrEqual(100);

      // Check Overall Score
      expect(assessment.overallScore).toBeGreaterThanOrEqual(0);
      expect(assessment.overallScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Reality Index Detection', () => {
    it('should give higher scores for technical content', async () => {
      const technicalContent: AssessmentInput = {
        content: `Transformer neural networks utilize self-attention mechanisms to process sequential data. 
                 The architecture, introduced by Vaswani et al. in 2017, revolutionized natural language processing 
                 through parallel processing and attention-based learning. Key components include multi-head attention, 
                 positional encoding, and feed-forward networks.`
      };

      const simpleContent: AssessmentInput = {
        content: 'This is a simple sentence without technical details.'
      };

      const technicalResult = await detector.analyzeContent(technicalContent);
      const simpleResult = await detector.analyzeContent(simpleContent);

      expect(technicalResult.assessment.realityIndex.technicalAccuracy)
        .toBeGreaterThan(simpleResult.assessment.realityIndex.technicalAccuracy);
    });

    it('should detect mission alignment in goal-oriented content', async () => {
      const goalOrientedContent: AssessmentInput = {
        content: `The goal of this analysis is to explain the mission-critical aspects of AI development. 
                 Our objective is to align understanding with practical implementation goals.`
      };

      const neutralContent: AssessmentInput = {
        content: 'Some random thoughts about various topics without clear direction.'
      };

      const goalResult = await detector.analyzeContent(goalOrientedContent);
      const neutralResult = await detector.analyzeContent(neutralContent);

      expect(goalResult.assessment.realityIndex.missionAlignment)
        .toBeGreaterThan(neutralResult.assessment.realityIndex.missionAlignment);
    });
  });

  describe('Trust Protocol Detection', () => {
    it('should pass trust protocol for content with verification elements', async () => {
      const verifiableContent: AssessmentInput = {
        content: `Based on research by Vaswani et al. (2017), the transformer architecture demonstrates 
                 verifiable improvements in NLP tasks. The study validates these claims through comprehensive experiments.`
      };

      const result = await detector.analyzeContent(verifiableContent);
      
      // Content with citations and verification language should score better
      expect(result.assessment.trustProtocol.status).not.toBe('FAIL');
      expect(result.assessment.trustProtocol.verificationMethods).not.toBe('FAIL');
    });

    it('should detect boundary awareness', async () => {
      const boundaryAwareContent: AssessmentInput = {
        content: `I should note that this explanation is simplified and involves complex concepts 
                 that have limitations. The scope of this analysis is constrained by the available data.`
      };

      const result = await detector.analyzeContent(boundaryAwareContent);
      
      expect(result.assessment.trustProtocol.boundaryMaintenance).not.toBe('FAIL');
    });
  });

  describe('Ethical Alignment Detection', () => {
    it('should score higher for ethically conscious content', async () => {
      const ethicalContent: AssessmentInput = {
        content: `This AI system should acknowledge its limitations and consider the ethical implications 
                 for all stakeholders. It's important to maintain responsible boundaries and fair treatment.`
      };

      const neutralContent: AssessmentInput = {
        content: 'Technical implementation details without ethical considerations.'
      };

      const ethicalResult = await detector.analyzeContent(ethicalContent);
      const neutralResult = await detector.analyzeContent(neutralContent);

      expect(ethicalResult.assessment.ethicalAlignment.score)
        .toBeGreaterThan(neutralResult.assessment.ethicalAlignment.score);
    });
  });

  describe('Resonance Quality Detection', () => {
    it('should detect creative and innovative content', async () => {
      const creativeContent: AssessmentInput = {
        content: `Imagine the attention mechanism as a spotlight at a party, selectively illuminating 
                 conversations while the neural network acts like a creative conductor orchestrating 
                 a breakthrough symphony of understanding.`
      };

      const plainContent: AssessmentInput = {
        content: 'Attention mechanism processes input sequentially.'
      };

      const creativeResult = await detector.analyzeContent(creativeContent);
      const plainResult = await detector.analyzeContent(plainContent);

      expect(creativeResult.assessment.resonanceQuality.creativityScore)
        .toBeGreaterThan(plainResult.assessment.resonanceQuality.creativityScore);
    });
  });

  describe('Canvas Parity Detection', () => {
    it('should score higher for interactive and engaging content', async () => {
      const engagingContent: AssessmentInput = {
        content: `Let me explain this concept to you. Does this help you understand? 
                 Would you like me to elaborate on any particular aspect? 
                 Your understanding is important for our collaborative learning.`
      };

      const staticContent: AssessmentInput = {
        content: 'Technical documentation without user engagement elements.'
      };

      const engagingResult = await detector.analyzeContent(engagingContent);
      const staticResult = await detector.analyzeContent(staticContent);

      expect(engagingResult.assessment.canvasParity.humanAgency)
        .toBeGreaterThan(staticResult.assessment.canvasParity.humanAgency);
    });

    it('should detect AI contribution markers', async () => {
      const aiExplicitContent: AssessmentInput = {
        content: `As an AI model, I can help process this information using neural network architectures 
                 to generate automated analysis and recommendations.`
      };

      const result = await detector.analyzeContent(aiExplicitContent);
      
      expect(result.assessment.canvasParity.aiContribution).toBeGreaterThan(50);
    });
  });

  describe('Insights Generation', () => {
    it('should generate meaningful insights', async () => {
      const input: AssessmentInput = {
        content: 'High-quality technical content with good structure and clear explanations.'
      };

      const result = await detector.analyzeContent(input);
      const { insights } = result;

      expect(insights.strengths).toBeInstanceOf(Array);
      expect(insights.weaknesses).toBeInstanceOf(Array);
      expect(insights.recommendations).toBeInstanceOf(Array);
      
      // Should have at least some insights
      expect(insights.strengths.length + insights.weaknesses.length + insights.recommendations.length)
        .toBeGreaterThan(0);
    });

    it('should provide specific recommendations based on scores', async () => {
      const lowQualityContent: AssessmentInput = {
        content: 'Simple text.'
      };

      const result = await detector.analyzeContent(lowQualityContent);
      
      // Low quality content should generate recommendations
      expect(result.insights.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Validation System', () => {
    it('should validate assessments correctly', async () => {
      const input: AssessmentInput = {
        content: 'Test content for validation'
      };

      const result = await detector.analyzeContent(input);
      const validatedAssessment = detector.validateAssessment(
        result.assessment, 
        'test-validator'
      );

      expect(validatedAssessment.validationStatus).toBe('VALID');
    });

    it('should invalidate assessments with reason', async () => {
      const input: AssessmentInput = {
        content: 'Test content for invalidation'
      };

      const result = await detector.analyzeContent(input);
      const invalidatedAssessment = detector.invalidateAssessment(
        result.assessment, 
        'test-validator', 
        'Test invalidation reason'
      );

      expect(invalidatedAssessment.validationStatus).toBe('INVALID');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', async () => {
      const input: AssessmentInput = {
        content: ''
      };

      const result = await detector.analyzeContent(input);
      
      expect(result.assessment).toBeDefined();
      expect(result.assessment.overallScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle very long content', async () => {
      const longContent = 'A'.repeat(10000);
      const input: AssessmentInput = {
        content: longContent
      };

      const result = await detector.analyzeContent(input);
      
      expect(result.assessment).toBeDefined();
    });

    it('should handle special characters and unicode', async () => {
      const input: AssessmentInput = {
        content: 'Special chars: 你好 🌟 émojis and ñoñó characters!'
      };

      const result = await detector.analyzeContent(input);
      
      expect(result.assessment).toBeDefined();
      expect(result.assessment.overallScore).toBeGreaterThanOrEqual(0);
    });
  });
});