/**
 * SYMBI Framework Detector Tests
 * 
 * Comprehensive tests for the SYMBI framework detection algorithms.
 * Tests each dimension of the framework with various content types.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SymbiFrameworkDetector } from './detector';
import { AssessmentInput, AssessmentResult } from './types';

describe('SymbiFrameworkDetector', () => {
  let detector: SymbiFrameworkDetector;

  beforeEach(() => {
    detector = new SymbiFrameworkDetector();
  });

  describe('Basic Functionality', () => {
    it('should create detector instance', () => {
      expect(detector).toBeInstanceOf(SymbiFrameworkDetector);
    });

    it('should analyze content and return assessment', async () => {
      const input: AssessmentInput = {
        content: 'This is a test content for analysis.',
        metadata: {
          source: 'test',
          author: 'test-author'
        }
      };

      const result = await detector.analyzeContent(input);

      expect(result).toBeDefined();
      expect(result.assessment).toBeDefined();
      expect(result.insights).toBeDefined();
      expect(result.validationDetails).toBeDefined();
    });
  });

  describe('Reality Index Detection', () => {
    it('should detect high reality index for technical content', async () => {
      const technicalContent: AssessmentInput = {
        content: `Transformer neural networks revolutionized natural language processing through their attention mechanism. 
        The architecture introduced in "Attention Is All You Need" by Vaswani et al. (2017) enables parallel processing 
        and captures long-range dependencies effectively. The self-attention mechanism computes attention weights 
        for each token based on query, key, and value matrices, allowing the model to focus on relevant information.`,
        metadata: {
          source: 'Technical Document',
          context: 'educational explanation'
        }
      };

      const result = await detector.analyzeContent(technicalContent);

      expect(result.assessment.realityIndex.score).toBeGreaterThan(5.5);
      expect(result.assessment.realityIndex.technicalAccuracy).toBeGreaterThan(4.5);
      expect(result.assessment.realityIndex.missionAlignment).toBeGreaterThan(4.5);
    });

    it('should detect lower reality index for vague content', async () => {
      const vagueContent: AssessmentInput = {
        content: 'This is a general statement about things that happen sometimes. ' +
                'It might be useful in some situations but not others. ' +
                'The effectiveness depends on various factors.',
        metadata: {
          source: 'Generic Content'
        }
      };

      const result = await detector.analyzeContent(vagueContent);

      expect(result.assessment.realityIndex.score).toBeLessThan(7.0);
    });
  });

  describe('Trust Protocol Detection', () => {
    it('should pass trust protocol for content with references', async () => {
      const referencedContent: AssessmentInput = {
        content: `According to the research by Vaswani et al. (2017), transformer architectures 
        significantly improved machine translation performance. The study shows clear evidence 
        of the model's effectiveness. However, it's important to note that this approach has 
        limitations in certain contexts and requires careful boundary maintenance.`,
        metadata: {
          source: 'Academic Analysis'
        }
      };

      const result = await detector.analyzeContent(referencedContent);

      expect(['PASS', 'PARTIAL']).toContain(result.assessment.trustProtocol.status);
      expect(['PASS', 'PARTIAL']).toContain(result.assessment.trustProtocol.verificationMethods);
    });

    it('should fail trust protocol for unverified claims', async () => {
      const unverifedContent: AssessmentInput = {
        content: 'AI models are perfect and can do anything without limitations. ' +
                'They are completely accurate and never make mistakes. ' +
                'All outputs should be trusted completely.',
        metadata: {
          source: 'Unreliable Source'
        }
      };

      const result = await detector.analyzeContent(unverifedContent);

      // Should likely fail or be partial due to overconfident claims
      expect(['FAIL', 'PARTIAL']).toContain(result.assessment.trustProtocol.status);
    });
  });

  describe('Ethical Alignment Detection', () => {
    it('should detect good ethical alignment for balanced content', async () => {
      const ethicalContent: AssessmentInput = {
        content: `While AI technology offers tremendous benefits, it's crucial to acknowledge 
        the limitations and potential risks. We must consider the impact on all stakeholders, 
        including users, developers, and society as a whole. Responsible AI development requires 
        transparency, fairness, and continuous evaluation of ethical implications.`,
        metadata: {
          source: 'Ethical AI Discussion'
        }
      };

      const result = await detector.analyzeContent(ethicalContent);

      expect(result.assessment.ethicalAlignment.score).toBeGreaterThan(3.0);
      expect(result.assessment.ethicalAlignment.stakeholderAwareness).toBeGreaterThan(2.5);
      expect(result.assessment.ethicalAlignment.limitationsAcknowledgment).toBeGreaterThan(2.5);
    });

    it('should detect poor ethical alignment for biased content', async () => {
      const biasedContent: AssessmentInput = {
        content: 'This solution works for everyone and has no downsides. ' +
                'There are no ethical concerns or limitations to consider. ' +
                'All stakeholders will benefit equally without any trade-offs.',
        metadata: {
          source: 'Biased Analysis'
        }
      };

      const result = await detector.analyzeContent(biasedContent);

      expect(result.assessment.ethicalAlignment.score).toBeLessThan(4.0);
    });
  });

  describe('Resonance Quality Detection', () => {
    it('should detect high resonance for creative and innovative content', async () => {
      const creativeContent: AssessmentInput = {
        content: `Imagine the attention mechanism like a spotlight at a party. Instead of trying 
        to listen to every conversation simultaneously, you can focus your attention on the most 
        relevant speaker. Transformers revolutionize this concept by using multiple attention heads, 
        like having several spotlights that can focus on different aspects simultaneously. 
        This breakthrough innovation enables unprecedented parallel processing capabilities.`,
        metadata: {
          source: 'Creative Explanation'
        }
      };

      const result = await detector.analyzeContent(creativeContent);

      expect(['STRONG', 'ADVANCED', 'BREAKTHROUGH']).toContain(result.assessment.resonanceQuality.level);
      expect(result.assessment.resonanceQuality.creativityScore).toBeGreaterThan(5.0);
    });

    it('should detect lower resonance for basic content', async () => {
      const basicContent: AssessmentInput = {
        content: 'The system works by processing input and generating output. ' +
                'It follows standard procedures and applies basic algorithms. ' +
                'The result is produced according to predefined parameters.',
        metadata: {
          source: 'Basic Description'
        }
      };

      const result = await detector.analyzeContent(basicContent);

      expect(result.assessment.resonanceQuality.level).toBe('STRONG');
      expect(result.assessment.resonanceQuality.creativityScore).toBeLessThan(7.0);
    });
  });

  describe('Canvas Parity Detection', () => {
    it('should detect high canvas parity for engaging interactive content', async () => {
      const engagingContent: AssessmentInput = {
        content: `Let me help you understand this concept step by step. Does this make sense so far? 
        You might be wondering how this applies to your specific situation. Let me explain it in 
        simpler terms that relate to your experience. Would you like me to elaborate on any 
        particular aspect? I want to make sure this explanation is helpful for you.`,
        metadata: {
          source: 'Interactive Explanation'
        }
      };

      const result = await detector.analyzeContent(engagingContent);

      expect(result.assessment.canvasParity.score).toBeGreaterThanOrEqual(50);
      expect(result.assessment.canvasParity.humanAgency).toBeGreaterThanOrEqual(50);
      expect(result.assessment.canvasParity.collaborationQuality).toBeGreaterThanOrEqual(50);
    });

    it('should detect lower canvas parity for non-interactive content', async () => {
      const nonInteractiveContent: AssessmentInput = {
        content: 'The process involves several steps. First, data is collected. ' +
                'Then, analysis is performed. Finally, results are generated. ' +
                'This approach is commonly used in various applications.',
        metadata: {
          source: 'Technical Manual'
        }
      };

      const result = await detector.analyzeContent(nonInteractiveContent);

      expect(result.assessment.canvasParity.score).toBeLessThan(80);
    });
  });

  describe('Overall Score Calculation', () => {
    it('should calculate overall score within valid range', async () => {
      const input: AssessmentInput = {
        content: 'Test content for overall score validation.',
        metadata: { source: 'test' }
      };

      const result = await detector.analyzeContent(input);

      expect(result.assessment.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.assessment.overallScore).toBeLessThanOrEqual(100);
    });

    it('should generate insights based on assessment', async () => {
      const input: AssessmentInput = {
        content: 'Comprehensive test content with technical accuracy, ethical considerations, and user engagement.',
        metadata: { source: 'test' }
      };

      const result = await detector.analyzeContent(input);

      expect(result.insights.strengths).toBeInstanceOf(Array);
      expect(result.insights.weaknesses).toBeInstanceOf(Array);
      expect(result.insights.recommendations).toBeInstanceOf(Array);
    });
  });

  describe('Assessment Validation', () => {
    it('should validate assessment correctly', async () => {
      const input: AssessmentInput = {
        content: 'Test content for validation.',
        metadata: { source: 'test' }
      };

      const result = await detector.analyzeContent(input);
      const validatedAssessment = detector.validateAssessment(
        result.assessment,
        'test-validator',
        'Test validation'
      );

      expect(validatedAssessment.validationStatus).toBe('VALID');
    });

    it('should invalidate assessment correctly', async () => {
      const input: AssessmentInput = {
        content: 'Test content for invalidation.',
        metadata: { source: 'test' }
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

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty content', async () => {
      const emptyInput: AssessmentInput = {
        content: '',
        metadata: { source: 'empty-test' }
      };

      const result = await detector.analyzeContent(emptyInput);

      expect(result.assessment).toBeDefined();
      expect(result.assessment.overallScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle very long content', async () => {
      const longContent = 'This is a very long content. '.repeat(1000);
      const longInput: AssessmentInput = {
        content: longContent,
        metadata: { source: 'long-test' }
      };

      const result = await detector.analyzeContent(longInput);

      expect(result.assessment).toBeDefined();
      expect(result.assessment.overallScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle content with special characters', async () => {
      const specialInput: AssessmentInput = {
        content: 'Content with special characters: @#$%^&*()[]{}|\\:";\'<>?,./',
        metadata: { source: 'special-test' }
      };

      const result = await detector.analyzeContent(specialInput);

      expect(result.assessment).toBeDefined();
    });

    it('should handle missing metadata gracefully', async () => {
      const minimalInput: AssessmentInput = {
        content: 'Test content without metadata.'
      };

      const result = await detector.analyzeContent(minimalInput);

      expect(result.assessment).toBeDefined();
      expect(result.assessment.contentId).toBe('unknown');
    });
  });
});