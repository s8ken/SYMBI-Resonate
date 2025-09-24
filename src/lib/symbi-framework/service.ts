/**
 * SYMBI Framework Service
 * 
 * This service provides a high-level API for interacting with the SYMBI framework detector.
 * It handles content processing, assessment storage, and result retrieval.
 */

import { SymbiFrameworkDetector } from './detector';
import { EnhancedSymbiFrameworkDetector } from './enhanced-detector';
import { BalancedSymbiFrameworkDetector } from './balanced-detector';
import { CalibratedSymbiFrameworkDetector } from './calibrated-detector';
import { FinalSymbiFrameworkDetector } from './final-detector';
import { MLEnhancedSymbiFrameworkDetector } from './ml-enhanced-detector';
import { 
  AssessmentInput, 
  AssessmentResult, 
  SymbiFrameworkAssessment 
} from './types';

/**
 * Detector type options for SYMBI framework
 */
export type DetectorType = 'standard' | 'enhanced' | 'balanced' | 'calibrated' | 'final' | 'ml-enhanced';

/**
 * Service for SYMBI framework detection and management
 */
export class SymbiFrameworkService {
  private standardDetector: SymbiFrameworkDetector;
  private enhancedDetector: EnhancedSymbiFrameworkDetector;
  private balancedDetector: BalancedSymbiFrameworkDetector;
  private calibratedDetector: CalibratedSymbiFrameworkDetector;
  private finalDetector: FinalSymbiFrameworkDetector;
  private mlEnhancedDetector: MLEnhancedSymbiFrameworkDetector;
  private assessments: Map<string, AssessmentResult>;
  
  constructor() {
    this.standardDetector = new SymbiFrameworkDetector();
    this.enhancedDetector = new EnhancedSymbiFrameworkDetector();
    this.balancedDetector = new BalancedSymbiFrameworkDetector();
    this.calibratedDetector = new CalibratedSymbiFrameworkDetector();
    this.finalDetector = new FinalSymbiFrameworkDetector();
    this.mlEnhancedDetector = new MLEnhancedSymbiFrameworkDetector();
    this.assessments = new Map<string, AssessmentResult>();
  }
  
  /**
   * Process content and generate a SYMBI framework assessment
   * @param input The content to assess
   * @param detectorType The type of detector to use (default: 'final')
   */
  public async processContent(
    input: AssessmentInput, 
    detectorType: DetectorType = 'final'
  ): Promise<AssessmentResult> {
    // Generate assessment using the specified detector
    let result: AssessmentResult;
    
    switch (detectorType) {
      case 'enhanced':
        result = await this.enhancedDetector.analyzeContent(input);
        break;
      case 'balanced':
        result = await this.balancedDetector.analyzeContent(input);
        break;
      case 'calibrated':
        result = await this.calibratedDetector.analyzeContent(input);
        break;
      case 'ml-enhanced':
        result = await this.mlEnhancedDetector.analyzeContent(input);
        break;
      case 'standard':
        result = await this.standardDetector.analyzeContent(input);
        break;
      case 'final':
      default:
        result = await this.finalDetector.analyzeContent(input);
        break;
    }
    
    // Store the assessment for future reference
    this.assessments.set(result.assessment.id, result);
    
    return result;
  }
  
  /**
   * Get an assessment by ID
   */
  public getAssessment(id: string): AssessmentResult | undefined {
    return this.assessments.get(id);
  }
  
  /**
   * Get all assessments
   */
  public getAllAssessments(): AssessmentResult[] {
    return Array.from(this.assessments.values());
  }
  
  /**
   * Validate an assessment
   */
  public validateAssessment(
    id: string, 
    validatedBy: string, 
    notes?: string
  ): AssessmentResult | undefined {
    const result = this.assessments.get(id);
    
    if (!result) {
      return undefined;
    }
    
    // Update the assessment with validation
    const validatedAssessment = this.standardDetector.validateAssessment(
      result.assessment,
      validatedBy,
      notes
    );
    
    // Update stored assessment
    const updatedResult: AssessmentResult = {
      ...result,
      assessment: validatedAssessment,
      validationDetails: {
        ...result.validationDetails,
        validatedBy,
        validationTimestamp: new Date().toISOString(),
        validationNotes: notes
      }
    };
    
    this.assessments.set(id, updatedResult);
    
    return updatedResult;
  }
  
  /**
   * Invalidate an assessment
   */
  public invalidateAssessment(
    id: string, 
    validatedBy: string, 
    reason: string
  ): AssessmentResult | undefined {
    const result = this.assessments.get(id);
    
    if (!result) {
      return undefined;
    }
    
    // Update the assessment with invalidation
    const invalidatedAssessment = this.standardDetector.invalidateAssessment(
      result.assessment,
      validatedBy,
      reason
    );
    
    // Update stored assessment
    const updatedResult: AssessmentResult = {
      ...result,
      assessment: invalidatedAssessment,
      validationDetails: {
        ...result.validationDetails,
        validatedBy,
        validationTimestamp: new Date().toISOString(),
        validationNotes: reason
      }
    };
    
    this.assessments.set(id, updatedResult);
    
    return updatedResult;
  }
  
  /**
   * Delete an assessment
   */
  public deleteAssessment(id: string): boolean {
    return this.assessments.delete(id);
  }
  
  /**
   * Get statistics about assessments
   */
  public getStatistics(): {
    totalAssessments: number;
    averageScore: number;
    dimensionAverages: {
      realityIndex: number;
      trustProtocol: {
        pass: number;
        partial: number;
        fail: number;
      };
      ethicalAlignment: number;
      resonanceQuality: {
        strong: number;
        advanced: number;
        breakthrough: number;
      };
      canvasParity: number;
    };
  } {
    const assessments = Array.from(this.assessments.values()).map(result => result.assessment);
    
    if (assessments.length === 0) {
      return {
        totalAssessments: 0,
        averageScore: 0,
        dimensionAverages: {
          realityIndex: 0,
          trustProtocol: {
            pass: 0,
            partial: 0,
            fail: 0
          },
          ethicalAlignment: 0,
          resonanceQuality: {
            strong: 0,
            advanced: 0,
            breakthrough: 0
          },
          canvasParity: 0
        }
      };
    }
    
    // Calculate average overall score
    const totalScore = assessments.reduce((sum, assessment) => sum + assessment.overallScore, 0);
    const averageScore = totalScore / assessments.length;
    
    // Calculate average reality index
    const totalRealityIndex = assessments.reduce((sum, assessment) => sum + assessment.realityIndex.score, 0);
    const averageRealityIndex = totalRealityIndex / assessments.length;
    
    // Calculate trust protocol distribution
    const trustCounts = {
      pass: assessments.filter(a => a.trustProtocol.status === 'PASS').length,
      partial: assessments.filter(a => a.trustProtocol.status === 'PARTIAL').length,
      fail: assessments.filter(a => a.trustProtocol.status === 'FAIL').length
    };
    
    // Calculate average ethical alignment
    const totalEthicalAlignment = assessments.reduce((sum, assessment) => sum + assessment.ethicalAlignment.score, 0);
    const averageEthicalAlignment = totalEthicalAlignment / assessments.length;
    
    // Calculate resonance quality distribution
    const resonanceCounts = {
      strong: assessments.filter(a => a.resonanceQuality.level === 'STRONG').length,
      advanced: assessments.filter(a => a.resonanceQuality.level === 'ADVANCED').length,
      breakthrough: assessments.filter(a => a.resonanceQuality.level === 'BREAKTHROUGH').length
    };
    
    // Calculate average canvas parity
    const totalCanvasParity = assessments.reduce((sum, assessment) => sum + assessment.canvasParity.score, 0);
    const averageCanvasParity = totalCanvasParity / assessments.length;
    
    return {
      totalAssessments: assessments.length,
      averageScore,
      dimensionAverages: {
        realityIndex: averageRealityIndex,
        trustProtocol: {
          pass: (trustCounts.pass / assessments.length) * 100,
          partial: (trustCounts.partial / assessments.length) * 100,
          fail: (trustCounts.fail / assessments.length) * 100
        },
        ethicalAlignment: averageEthicalAlignment,
        resonanceQuality: {
          strong: (resonanceCounts.strong / assessments.length) * 100,
          advanced: (resonanceCounts.advanced / assessments.length) * 100,
          breakthrough: (resonanceCounts.breakthrough / assessments.length) * 100
        },
        canvasParity: averageCanvasParity
      }
    };
  }
}

// Create a singleton instance for use throughout the application
export const symbiFrameworkService = new SymbiFrameworkService();