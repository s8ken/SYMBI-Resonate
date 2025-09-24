/**
 * Confidence Calculator Module for ML-Enhanced SYMBI Framework Detection
 * 
 * This module calculates confidence scores for predictions made by the ML models,
 * providing a measure of reliability for each dimension assessment.
 */

import { FeatureSet } from './feature-extraction';

/**
 * Calculate confidence score for a specific dimension
 * 
 * @param dimension The SYMBI dimension to calculate confidence for
 * @param features The extracted features from the content
 * @returns A confidence score between 0.0 and 1.0
 */
export function calculateConfidence(dimension: string, features: FeatureSet): number {
  // In a real implementation, this would use model-specific confidence metrics
  // For this prototype, we'll use a simplified approach based on feature quality
  
  // Base confidence starts at 0.7 (moderately confident)
  let baseConfidence = 0.7;
  
  // Adjust confidence based on content length
  // Very short or very long content may be less reliable to assess
  if (features.wordCount < 50) {
    baseConfidence -= 0.2; // Very short content reduces confidence
  } else if (features.wordCount > 100 && features.wordCount < 1000) {
    baseConfidence += 0.1; // Ideal length increases confidence
  } else if (features.wordCount > 3000) {
    baseConfidence -= 0.05; // Very long content slightly reduces confidence
  }
  
  // Adjust confidence based on content structure
  // Well-structured content is easier to assess reliably
  if (features.paragraphCount > 3 && features.headingCount > 0) {
    baseConfidence += 0.05; // Well-structured content increases confidence
  }
  
  // Dimension-specific confidence adjustments
  if (dimension === 'realityIndex') {
    // Reality Index confidence is affected by citations, coherence
    if (features.citationCount > 0) {
      baseConfidence += 0.1; // Citations increase confidence in reality assessment
    }
    
    if (features.topicCoherence > 0.7) {
      baseConfidence += 0.1; // High coherence increases confidence
    } else if (features.topicCoherence < 0.3) {
      baseConfidence -= 0.1; // Low coherence decreases confidence
    }
    
    // Technical content confidence adjustment
    if (features.contextType.toLowerCase().includes('technical')) {
      if (features.technicalTermDensity > 0.05) {
        baseConfidence += 0.05; // Technical terms in technical context increase confidence
      } else {
        baseConfidence -= 0.1; // Lack of technical terms in technical context decreases confidence
      }
    }
  }
  
  else if (dimension === 'trustProtocol') {
    // Trust Protocol confidence is affected by citations, references, limitations
    if (features.citationCount + features.referenceCount > 2) {
      baseConfidence += 0.15; // Multiple citations/references increase confidence
    } else if (features.citationCount + features.referenceCount === 0) {
      baseConfidence -= 0.1; // No citations/references decrease confidence
    }
    
    if (features.limitationAcknowledgments > 0) {
      baseConfidence += 0.1; // Explicit limitations increase confidence
    }
  }
  
  else if (dimension === 'ethicalAlignment') {
    // Ethical Alignment confidence is affected by ethical terms, stakeholder mentions
    if (features.ethicalTermCount > 2) {
      baseConfidence += 0.1; // Multiple ethical terms increase confidence
    }
    
    if (features.stakeholderMentions > 2) {
      baseConfidence += 0.1; // Multiple stakeholder mentions increase confidence
    }
    
    // Ethical content confidence adjustment
    if (features.contextType.toLowerCase().includes('ethical')) {
      if (features.ethicalTermCount > 0) {
        baseConfidence += 0.1; // Ethical terms in ethical context increase confidence
      } else {
        baseConfidence -= 0.15; // Lack of ethical terms in ethical context decreases confidence
      }
    }
  }
  
  else if (dimension === 'resonanceQuality') {
    // Resonance Quality confidence is affected by creativity, engagement
    if (features.analogyCount + features.metaphorCount > 1) {
      baseConfidence += 0.1; // Creative elements increase confidence
    }
    
    if (features.interactiveElementCount > 2) {
      baseConfidence += 0.1; // Interactive elements increase confidence
    }
    
    if (features.uniqueVocabRatio > 0.6) {
      baseConfidence += 0.05; // Diverse vocabulary increases confidence
    } else if (features.uniqueVocabRatio < 0.3) {
      baseConfidence -= 0.1; // Limited vocabulary decreases confidence
    }
  }
  
  else if (dimension === 'canvasParity') {
    // Canvas Parity confidence is affected by engagement, questions, pronouns
    if (features.questionDensity > 0.05) {
      baseConfidence += 0.1; // Questions increase confidence
    }
    
    if (features.secondPersonDensity > 0.03) {
      baseConfidence += 0.1; // Second person pronouns increase confidence
    }
    
    if (features.interactiveElementCount > 2) {
      baseConfidence += 0.05; // Interactive elements increase confidence
    }
  }
  
  // Model-specific confidence adjustment
  // Some models may be more reliable for certain types of content
  if (features.modelName.toLowerCase().includes('claude')) {
    if (dimension === 'ethicalAlignment' || dimension === 'trustProtocol') {
      baseConfidence += 0.05; // Claude may be more reliable for ethical and trust dimensions
    }
  } else if (features.modelName.toLowerCase().includes('gpt')) {
    if (dimension === 'resonanceQuality') {
      baseConfidence += 0.05; // GPT may be more reliable for resonance quality
    }
  }
  
  // Ensure confidence is within valid range
  return Math.min(1.0, Math.max(0.0, baseConfidence));
}

/**
 * Calculate aggregate confidence across all dimensions
 * 
 * @param confidenceScores Object containing confidence scores for each dimension
 * @returns Aggregate confidence score between 0.0 and 1.0
 */
export function calculateAggregateConfidence(confidenceScores: {
  realityIndex?: number;
  trustProtocol?: number;
  ethicalAlignment?: number;
  resonanceQuality?: number;
  canvasParity?: number;
}): number {
  // Get available confidence scores
  const scores = Object.values(confidenceScores).filter(score => typeof score === 'number') as number[];
  
  if (scores.length === 0) {
    return 0.7; // Default confidence if no scores available
  }
  
  // Calculate weighted average
  // Lower scores have more weight to be conservative
  const sortedScores = [...scores].sort((a, b) => a - b);
  let weightedSum = 0;
  let weightSum = 0;
  
  for (let i = 0; i < sortedScores.length; i++) {
    const weight = sortedScores.length - i;
    weightedSum += sortedScores[i] * weight;
    weightSum += weight;
  }
  
  return weightedSum / weightSum;
}

/**
 * Determine if a prediction should be trusted based on confidence
 * 
 * @param confidence Confidence score between 0.0 and 1.0
 * @param threshold Minimum confidence threshold (default: 0.5)
 * @returns Boolean indicating if prediction should be trusted
 */
export function isTrustworthy(confidence: number, threshold: number = 0.5): boolean {
  return confidence >= threshold;
}

/**
 * Get a qualitative description of confidence level
 * 
 * @param confidence Confidence score between 0.0 and 1.0
 * @returns String description of confidence level
 */
export function getConfidenceDescription(confidence: number): string {
  if (confidence >= 0.9) {
    return "Very High";
  } else if (confidence >= 0.75) {
    return "High";
  } else if (confidence >= 0.6) {
    return "Moderate";
  } else if (confidence >= 0.4) {
    return "Low";
  } else {
    return "Very Low";
  }
}