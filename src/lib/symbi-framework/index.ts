/**
 * SYMBI Framework Module
 * 
 * This module provides tools for detecting and validating the SYMBI framework
 * across the 5 dimensions: Reality Index, Trust Protocol, Ethical Alignment,
 * Resonance Quality, and Canvas Parity.
 */

// Export types
export * from './types';

// Export detectors
export { SymbiFrameworkDetector } from './detector';
export { EnhancedSymbiFrameworkDetector } from './enhanced-detector';
export { BalancedSymbiFrameworkDetector } from './balanced-detector';
export { CalibratedSymbiFrameworkDetector } from './calibrated-detector';
export { FinalSymbiFrameworkDetector } from './final-detector';
export { MLEnhancedSymbiFrameworkDetector } from './ml-enhanced-detector';

// Export service
export { SymbiFrameworkService, symbiFrameworkService } from './service';

// Export ML utilities
export * from './ml';

// Export drift/emergence utilities
export * from './drift';

// Export enhanced emergence detection and metrics
export * from './emergence';
export * from './metrics';
export { 
  EnhancedSymbiFrameworkService, 
  enhancedSymbiFrameworkService,
  type TrustDeclaration,
  type EnhancedAnalysisResult,
  type EmergenceAnalysisResult,
  type EmergenceOptions
} from './enhanced-service';
