# SYMBI Framework Detection Module

## Overview

The SYMBI Framework Detection Module is a comprehensive system for analyzing and validating content across the 5 dimensions of the SYMBI framework. This module provides detailed assessment, scoring, and insights generation for content evaluation.

## Core Components

### 1. Types (`types.ts`)

Defines the core data structures for the SYMBI framework:

- **RealityIndex**: Measures mission alignment, contextual coherence, technical accuracy, and authenticity (0.0-10.0)
- **TrustProtocol**: Evaluates verification methods, boundary maintenance, and security awareness (PASS/PARTIAL/FAIL)
- **EthicalAlignment**: Assesses limitations acknowledgment, stakeholder awareness, ethical reasoning, and boundary maintenance (1.0-5.0)
- **ResonanceQuality**: Measures creativity, synthesis quality, and innovation (STRONG/ADVANCED/BREAKTHROUGH)
- **CanvasParity**: Evaluates human agency, AI contribution, transparency, and collaboration quality (0-100)
- **SymbiFrameworkAssessment**: Combines all dimensions into a complete assessment with overall score
- **AssessmentInput**: Defines the input structure for content submission
- **AssessmentResult**: Provides the complete assessment result with insights and validation details

### 2. Detector (`detector.ts`)

Implements the core detection algorithms for each dimension of the SYMBI framework:

- **analyzeContent**: Main method for processing content and generating assessments
- **detectRealityIndex**: Analyzes content for reality grounding and contextual coherence
- **detectTrustProtocol**: Evaluates trust-related aspects of the content
- **detectEthicalAlignment**: Assesses ethical considerations and stakeholder awareness
- **detectResonanceQuality**: Measures creativity, synthesis, and innovation
- **detectCanvasParity**: Evaluates the balance between human and AI contributions
- **calculateOverallScore**: Computes a weighted average across all dimensions
- **generateInsights**: Creates strengths, weaknesses, and recommendations based on assessment
- **validateAssessment**: Marks an assessment as validated
- **invalidateAssessment**: Marks an assessment as invalid

### 3. Service (`service.ts`)

Provides a high-level API for interacting with the detector:

- **processContent**: Processes content and generates an assessment
- **getAssessment**: Retrieves an assessment by ID
- **getAllAssessments**: Gets all stored assessments
- **validateAssessment**: Validates an existing assessment
- **invalidateAssessment**: Invalidates an existing assessment
- **deleteAssessment**: Removes an assessment from storage
- **getStatistics**: Generates statistics about stored assessments

## Detection Methodology

### Reality Index

The Reality Index evaluates how well the content is grounded in reality, with scores from 0.0 to 10.0:

1. **Mission Alignment**: Checks for goal-oriented language and alignment with stated objectives
2. **Contextual Coherence**: Analyzes sentence transitions and contextual flow
3. **Technical Accuracy**: Evaluates the presence of technical terms, numerical data, and citations
4. **Authenticity**: Checks for specific details, first-person perspective, and avoids generic phrases

### Trust Protocol

The Trust Protocol assesses verification methods, boundary maintenance, and security awareness:

1. **Verification Methods**: Checks for terms related to verification, validation, and evidence
2. **Boundary Maintenance**: Evaluates awareness of limitations and constraints
3. **Security Awareness**: Assesses security and privacy considerations

Each component is rated as PASS, PARTIAL, or FAIL, with the overall status determined by the lowest component rating.

### Ethical Alignment

Ethical Alignment measures ethical considerations on a scale from 1.0 to 5.0:

1. **Limitations Acknowledgment**: Checks for awareness of constraints and limitations
2. **Stakeholder Awareness**: Evaluates consideration of users, clients, and communities
3. **Ethical Reasoning**: Assesses moral and ethical language
4. **Boundary Maintenance**: Checks for awareness of appropriate boundaries

### Resonance Quality

Resonance Quality evaluates creativity and innovation:

1. **Creativity Score**: Checks for creative language, metaphors, and diverse vocabulary
2. **Synthesis Quality**: Evaluates the integration of ideas and structured reasoning
3. **Innovation Markers**: Assesses innovative concepts and future-oriented language

The overall level is determined as STRONG, ADVANCED, or BREAKTHROUGH based on the average scores.

### Canvas Parity

Canvas Parity measures the balance between human and AI contributions on a scale from 0 to 100:

1. **Human Agency**: Evaluates indicators of human control and decision-making
2. **AI Contribution**: Assesses the AI's role and technical contributions
3. **Transparency**: Checks for clarity and openness about the collaboration
4. **Collaboration Quality**: Evaluates the quality of human-AI interaction

## Usage

### Basic Usage

```typescript
import { symbiFrameworkService, AssessmentInput } from './lib/symbi-framework';

// Create assessment input
const input: AssessmentInput = {
  content: "Your content to analyze...",
  metadata: {
    source: "Source of the content",
    author: "Content author",
    context: "Context information"
  }
};

// Process content
const result = await symbiFrameworkService.processContent(input);

// Access assessment results
console.log(`Overall Score: ${result.assessment.overallScore}`);
console.log(`Reality Index: ${result.assessment.realityIndex.score}`);
console.log(`Trust Protocol: ${result.assessment.trustProtocol.status}`);
console.log(`Ethical Alignment: ${result.assessment.ethicalAlignment.score}`);
console.log(`Resonance Quality: ${result.assessment.resonanceQuality.level}`);
console.log(`Canvas Parity: ${result.assessment.canvasParity.score}`);

// Access insights
console.log("Strengths:", result.insights.strengths);
console.log("Weaknesses:", result.insights.weaknesses);
console.log("Recommendations:", result.insights.recommendations);
```

### Validation

```typescript
// Validate an assessment
const validatedResult = symbiFrameworkService.validateAssessment(
  assessmentId,
  "Validator Name",
  "Optional validation notes"
);

// Invalidate an assessment
const invalidatedResult = symbiFrameworkService.invalidateAssessment(
  assessmentId,
  "Validator Name",
  "Reason for invalidation"
);
```

### Statistics

```typescript
// Get statistics about all assessments
const stats = symbiFrameworkService.getStatistics();
console.log(`Total Assessments: ${stats.totalAssessments}`);
console.log(`Average Score: ${stats.averageScore}`);
```

## Integration with UI

The module is integrated with the UI through the `SymbiFrameworkAssessment` component, which provides:

1. Content submission form with metadata fields
2. Comprehensive results display for all dimensions
3. Visualization of scores and statuses
4. Display of insights and recommendations
5. Validation status tracking

## Future Enhancements

1. **Persistent Storage**: Add database integration for long-term storage of assessments
2. **Advanced Analytics**: Implement trend analysis and comparative assessment
3. **Customizable Weights**: Allow customization of dimension weights for overall scoring
4. **Batch Processing**: Support for processing multiple content items simultaneously
5. **Export Functionality**: Add options to export assessments in various formats