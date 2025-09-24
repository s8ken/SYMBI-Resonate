/**
 * Feature Extraction Module for ML-Enhanced SYMBI Framework Detection
 * 
 * This module extracts features from input content for use in machine learning models
 * that enhance the accuracy of SYMBI Framework dimension assessments.
 */

import { AssessmentInput } from '../types';

/**
 * Feature set extracted from content for ML processing
 */
export interface FeatureSet {
  // Text statistics
  wordCount: number;
  sentenceCount: number;
  avgWordLength: number;
  avgSentenceLength: number;
  textComplexity: number;
  
  // Content structure
  paragraphCount: number;
  headingCount: number;
  listCount: number;
  codeBlockCount: number;
  
  // Linguistic features
  questionDensity: number;
  exclamationDensity: number;
  personalPronounDensity: number;
  technicalTermDensity: number;
  
  // Semantic features
  topicCoherence: number;
  emotionalTone: number;
  formalityLevel: number;
  
  // Source indicators
  citationCount: number;
  referenceCount: number;
  uncertaintyMarkers: number;
  
  // Engagement features
  secondPersonDensity: number;
  interactiveElementCount: number;
  
  // Ethical indicators
  ethicalTermCount: number;
  stakeholderMentions: number;
  limitationAcknowledgments: number;
  
  // Creativity indicators
  analogyCount: number;
  metaphorCount: number;
  uniqueVocabRatio: number;
  
  // Context features
  contextType: string;
  modelName: string;
  
  // Raw text for potential embedding generation
  contentSample: string;
}

/**
 * Extract features from input content for ML processing
 */
export function extractFeatures(input: AssessmentInput): FeatureSet {
  const content = input.content;
  const context = input.metadata?.context || '';
  const modelName = input.metadata?.source || '';
  
  // Text statistics
  const words = content.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;
  
  const totalCharacters = words.join('').length;
  const avgWordLength = wordCount > 0 ? totalCharacters / wordCount : 0;
  
  const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;
  
  // Content structure
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const paragraphCount = paragraphs.length;
  
  const headingMatches = content.match(/#{1,6}\s+.+/g);
  const headingCount = headingMatches ? headingMatches.length : 0;
  
  const listItemMatches = content.match(/^[-*+]\s+.+/gm);
  const listCount = listItemMatches ? listItemMatches.length : 0;
  
  const codeBlockMatches = content.match(/```[\s\S]*?```/g);
  const codeBlockCount = codeBlockMatches ? codeBlockMatches.length : 0;
  
  // Linguistic features
  const questions = content.match(/\?/g);
  const questionDensity = questions ? questions.length / sentenceCount : 0;
  
  const exclamations = content.match(/!/g);
  const exclamationDensity = exclamations ? exclamations.length / sentenceCount : 0;
  
  const personalPronouns = content.match(/\b(I|me|my|mine|myself)\b/gi);
  const personalPronounDensity = personalPronouns ? personalPronouns.length / wordCount : 0;
  
  // Technical term detection (simplified)
  const technicalTerms = [
    'algorithm', 'neural', 'network', 'model', 'parameter', 'function', 
    'transformer', 'attention', 'vector', 'matrix', 'gradient', 'tensor',
    'embedding', 'layer', 'architecture', 'optimization', 'training',
    'inference', 'classification', 'regression', 'precision', 'recall'
  ];
  
  let technicalTermCount = 0;
  const contentLower = content.toLowerCase();
  technicalTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'g');
    const matches = contentLower.match(regex);
    if (matches) {
      technicalTermCount += matches.length;
    }
  });
  
  const technicalTermDensity = technicalTermCount / wordCount;
  
  // Semantic features (simplified approximations)
  // In a real implementation, these would use more sophisticated NLP techniques
  const topicCoherence = calculateTopicCoherence(content);
  const emotionalTone = calculateEmotionalTone(content);
  const formalityLevel = calculateFormalityLevel(content);
  
  // Source indicators
  const citationPatterns = [
    /\(\d{4}\)/g, // (2023)
    /et al\./g,   // et al.
    /\[\d+\]/g,   // [1]
    /according to/gi, // According to
    /cited in/gi  // cited in
  ];
  
  let citationCount = 0;
  citationPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      citationCount += matches.length;
    }
  });
  
  const referencePatterns = [
    /reference/gi,
    /bibliography/gi,
    /source/gi,
    /paper/gi,
    /study/gi,
    /research/gi
  ];
  
  let referenceCount = 0;
  referencePatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      referenceCount += matches.length;
    }
  });
  
  const uncertaintyMarkerPatterns = [
    /may/g,
    /might/g,
    /could/g,
    /possibly/g,
    /perhaps/g,
    /likely/g,
    /unlikely/g,
    /uncertain/g,
    /unclear/g,
    /not sure/g
  ];
  
  let uncertaintyMarkers = 0;
  uncertaintyMarkerPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      uncertaintyMarkers += matches.length;
    }
  });
  
  // Engagement features
  const secondPersonPronouns = content.match(/\b(you|your|yours|yourself|yourselves)\b/gi);
  const secondPersonDensity = secondPersonPronouns ? secondPersonPronouns.length / wordCount : 0;
  
  const interactiveElementPatterns = [
    /\?/g, // questions
    /let me know/gi,
    /tell me/gi,
    /would you like/gi,
    /do you want/gi,
    /for example/gi
  ];
  
  let interactiveElementCount = 0;
  interactiveElementPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      interactiveElementCount += matches.length;
    }
  });
  
  // Ethical indicators
  const ethicalTermPatterns = [
    /ethic/gi,
    /moral/gi,
    /value/gi,
    /right/gi,
    /wrong/gi,
    /good/gi,
    /bad/gi,
    /fair/gi,
    /unfair/gi,
    /just/gi,
    /unjust/gi,
    /harm/gi,
    /benefit/gi
  ];
  
  let ethicalTermCount = 0;
  ethicalTermPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      ethicalTermCount += matches.length;
    }
  });
  
  const stakeholderPatterns = [
    /stakeholder/gi,
    /user/gi,
    /customer/gi,
    /client/gi,
    /patient/gi,
    /student/gi,
    /community/gi,
    /society/gi,
    /people/gi,
    /individual/gi,
    /group/gi
  ];
  
  let stakeholderMentions = 0;
  stakeholderPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      stakeholderMentions += matches.length;
    }
  });
  
  const limitationPatterns = [
    /limitation/gi,
    /constraint/gi,
    /restricted/gi,
    /cannot/gi,
    /unable/gi,
    /limit/gi,
    /boundary/gi,
    /scope/gi,
    /simplified/gi,
    /approximation/gi
  ];
  
  let limitationAcknowledgments = 0;
  limitationPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      limitationAcknowledgments += matches.length;
    }
  });
  
  // Creativity indicators
  const analogyPatterns = [
    /like a/gi,
    /similar to/gi,
    /analogous to/gi,
    /akin to/gi,
    /resembles/gi,
    /comparable to/gi
  ];
  
  let analogyCount = 0;
  analogyPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      analogyCount += matches.length;
    }
  });
  
  const metaphorPatterns = [
    /metaphor/gi,
    /as if/gi,
    /imagine/gi,
    /picture/gi,
    /think of/gi
  ];
  
  let metaphorCount = 0;
  metaphorPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      metaphorCount += matches.length;
    }
  });
  
  // Vocabulary diversity
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const uniqueVocabRatio = wordCount > 0 ? uniqueWords.size / wordCount : 0;
  
  // Text complexity (simplified approximation)
  // In a real implementation, this would use more sophisticated readability metrics
  const textComplexity = (avgWordLength * 0.3) + (avgSentenceLength * 0.4) + (uniqueVocabRatio * 0.3);
  
  // Content sample for potential embedding generation
  // In a real implementation, this might be processed through an embedding model
  const contentSample = content.length > 1000 ? content.substring(0, 1000) : content;
  
  return {
    // Text statistics
    wordCount,
    sentenceCount,
    avgWordLength,
    avgSentenceLength,
    textComplexity,
    
    // Content structure
    paragraphCount,
    headingCount,
    listCount,
    codeBlockCount,
    
    // Linguistic features
    questionDensity,
    exclamationDensity,
    personalPronounDensity,
    technicalTermDensity,
    
    // Semantic features
    topicCoherence,
    emotionalTone,
    formalityLevel,
    
    // Source indicators
    citationCount,
    referenceCount,
    uncertaintyMarkers,
    
    // Engagement features
    secondPersonDensity,
    interactiveElementCount,
    
    // Ethical indicators
    ethicalTermCount,
    stakeholderMentions,
    limitationAcknowledgments,
    
    // Creativity indicators
    analogyCount,
    metaphorCount,
    uniqueVocabRatio,
    
    // Context features
    contextType: context,
    modelName,
    
    // Raw text for potential embedding generation
    contentSample
  };
}

/**
 * Calculate topic coherence (simplified approximation)
 * In a real implementation, this would use more sophisticated NLP techniques
 */
function calculateTopicCoherence(content: string): number {
  // Simplified implementation - look for structural indicators of coherence
  let coherenceScore = 0.5; // Start with moderate coherence
  
  // Check for section headers
  const headingMatches = content.match(/#{1,6}\s+.+/g);
  if (headingMatches && headingMatches.length > 0) {
    coherenceScore += 0.1 * Math.min(headingMatches.length, 5) / 5;
  }
  
  // Check for transition words
  const transitionWords = [
    'first', 'second', 'third', 'finally', 'moreover', 'furthermore',
    'however', 'therefore', 'thus', 'consequently', 'in addition',
    'similarly', 'in contrast', 'for example', 'specifically'
  ];
  
  let transitionCount = 0;
  const contentLower = content.toLowerCase();
  transitionWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = contentLower.match(regex);
    if (matches) {
      transitionCount += matches.length;
    }
  });
  
  coherenceScore += 0.1 * Math.min(transitionCount, 10) / 10;
  
  // Check for paragraph structure
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  if (paragraphs.length >= 3) {
    coherenceScore += 0.1;
  }
  
  // Check for consistent tense
  const pastTenseCount = (content.match(/\b(was|were|had|did|said|went|came|took|made|knew|thought|got)\b/gi) || []).length;
  const presentTenseCount = (content.match(/\b(is|are|am|has|have|do|does|say|go|come|take|make|know|think|get)\b/gi) || []).length;
  
  const totalTenseCount = pastTenseCount + presentTenseCount;
  if (totalTenseCount > 0) {
    const tenseRatio = Math.max(pastTenseCount, presentTenseCount) / totalTenseCount;
    coherenceScore += 0.1 * (tenseRatio - 0.5) * 2; // Scale from 0.5-1.0 to 0.0-1.0
  }
  
  return Math.min(1.0, Math.max(0.0, coherenceScore));
}

/**
 * Calculate emotional tone (simplified approximation)
 * In a real implementation, this would use sentiment analysis
 * Returns a value from 0.0 (very negative) to 1.0 (very positive)
 */
function calculateEmotionalTone(content: string): number {
  // Simplified implementation - count positive and negative words
  const positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
    'positive', 'beneficial', 'helpful', 'effective', 'successful',
    'advantage', 'benefit', 'improve', 'enhance', 'optimize'
  ];
  
  const negativeWords = [
    'bad', 'poor', 'terrible', 'awful', 'horrible', 'negative',
    'harmful', 'detrimental', 'ineffective', 'unsuccessful',
    'disadvantage', 'problem', 'issue', 'concern', 'risk'
  ];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  const contentLower = content.toLowerCase();
  
  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = contentLower.match(regex);
    if (matches) {
      positiveCount += matches.length;
    }
  });
  
  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = contentLower.match(regex);
    if (matches) {
      negativeCount += matches.length;
    }
  });
  
  const totalEmotionalWords = positiveCount + negativeCount;
  if (totalEmotionalWords === 0) {
    return 0.5; // Neutral
  }
  
  return 0.5 + 0.5 * (positiveCount - negativeCount) / totalEmotionalWords;
}

/**
 * Calculate formality level (simplified approximation)
 * In a real implementation, this would use more sophisticated NLP techniques
 * Returns a value from 0.0 (very informal) to 1.0 (very formal)
 */
function calculateFormalityLevel(content: string): number {
  // Simplified implementation - look for indicators of formality
  let formalityScore = 0.5; // Start with moderate formality
  
  // Formal indicators
  const formalIndicators = [
    // Academic/technical vocabulary
    'therefore', 'thus', 'consequently', 'furthermore', 'moreover',
    'subsequently', 'accordingly', 'hence', 'wherein', 'whereby',
    
    // Passive voice indicators
    'is considered', 'are determined', 'was established', 'were found',
    'has been shown', 'have been demonstrated',
    
    // Complex sentence structures
    'although', 'despite', 'notwithstanding', 'nevertheless', 'however',
    'in contrast', 'conversely', 'alternatively', 'in addition',
    
    // Citations and references
    'according to', 'as stated by', 'as demonstrated by', 'et al.',
    'referenced in', 'cited by'
  ];
  
  // Informal indicators
  const informalIndicators = [
    // Contractions
    "don't", "can't", "won't", "shouldn't", "couldn't", "wouldn't",
    "isn't", "aren't", "wasn't", "weren't", "haven't", "hasn't",
    
    // Colloquial expressions
    'stuff', 'thing', 'kind of', 'sort of', 'a lot', 'lots of',
    'pretty much', 'you know', 'like', 'basically', 'actually',
    
    // First person singular
    'I think', 'I feel', 'I believe', 'in my opinion',
    
    // Slang and informal abbreviations
    'cool', 'awesome', 'great', 'okay', 'OK', 'btw', 'lol', 'omg'
  ];
  
  let formalCount = 0;
  let informalCount = 0;
  
  const contentLower = content.toLowerCase();
  
  formalIndicators.forEach(indicator => {
    const regex = new RegExp(`\\b${indicator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    const matches = contentLower.match(regex);
    if (matches) {
      formalCount += matches.length;
    }
  });
  
  informalIndicators.forEach(indicator => {
    const regex = new RegExp(`\\b${indicator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    const matches = contentLower.match(regex);
    if (matches) {
      informalCount += matches.length;
    }
  });
  
  // Check for sentence length (longer sentences tend to be more formal)
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
  
  if (avgSentenceLength > 20) {
    formalCount += 5;
  } else if (avgSentenceLength > 15) {
    formalCount += 3;
  } else if (avgSentenceLength < 10) {
    informalCount += 3;
  }
  
  // Calculate formality score
  const totalIndicators = formalCount + informalCount;
  if (totalIndicators === 0) {
    return 0.5; // Neutral
  }
  
  return Math.min(1.0, Math.max(0.0, 0.5 + 0.5 * (formalCount - informalCount) / totalIndicators));
}