/**
 * SYMBI Framework Validation Framework
 * 
 * This module provides a comprehensive framework for validating the accuracy
 * and reliability of SYMBI Framework detection algorithms across different
 * content types and models.
 */

import { 
  AssessmentInput, 
  AssessmentResult,
  SymbiFrameworkAssessment,
  DetectorType
} from '../symbi-framework';

/**
 * Validation test case
 */
export interface ValidationTestCase {
  id: string;
  name: string;
  description: string;
  input: AssessmentInput;
  expectedOutput: {
    realityIndex?: {
      min: number;
      max: number;
    };
    trustProtocol?: {
      status: 'PASS' | 'PARTIAL' | 'FAIL';
    };
    ethicalAlignment?: {
      min: number;
      max: number;
    };
    resonanceQuality?: {
      level: 'STRONG' | 'ADVANCED' | 'BREAKTHROUGH';
    };
    canvasParity?: {
      min: number;
      max: number;
    };
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Validation test suite
 */
export interface ValidationTestSuite {
  id: string;
  name: string;
  description: string;
  testCases: ValidationTestCase[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Validation result for a single test case
 */
export interface ValidationResult {
  testCaseId: string;
  testCaseName: string;
  detectorType: DetectorType;
  passed: boolean;
  details: {
    realityIndex?: {
      expected: { min: number; max: number };
      actual: number;
      passed: boolean;
    };
    trustProtocol?: {
      expected: 'PASS' | 'PARTIAL' | 'FAIL';
      actual: 'PASS' | 'PARTIAL' | 'FAIL';
      passed: boolean;
    };
    ethicalAlignment?: {
      expected: { min: number; max: number };
      actual: number;
      passed: boolean;
    };
    resonanceQuality?: {
      expected: 'STRONG' | 'ADVANCED' | 'BREAKTHROUGH';
      actual: 'STRONG' | 'ADVANCED' | 'BREAKTHROUGH';
      passed: boolean;
    };
    canvasParity?: {
      expected: { min: number; max: number };
      actual: number;
      passed: boolean;
    };
  };
  processingTime: number;
  timestamp: string;
}

/**
 * Validation suite result
 */
export interface ValidationSuiteResult {
  suiteId: string;
  suiteName: string;
  detectorType: DetectorType;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  passRate: number;
  results: ValidationResult[];
  averageProcessingTime: number;
  timestamp: string;
}

/**
 * Validation framework for SYMBI Framework detection
 */
export class ValidationFramework {
  private testSuites: Map<string, ValidationTestSuite>;
  private results: Map<string, ValidationSuiteResult[]>;
  
  constructor() {
    this.testSuites = new Map<string, ValidationTestSuite>();
    this.results = new Map<string, ValidationSuiteResult[]>();
  }
  
  /**
   * Add a test suite to the validation framework
   */
  public addTestSuite(testSuite: ValidationTestSuite): void {
    this.testSuites.set(testSuite.id, testSuite);
  }
  
  /**
   * Get a test suite by ID
   */
  public getTestSuite(id: string): ValidationTestSuite | undefined {
    return this.testSuites.get(id);
  }
  
  /**
   * Get all test suites
   */
  public getAllTestSuites(): ValidationTestSuite[] {
    return Array.from(this.testSuites.values());
  }
  
  /**
   * Run validation on a test suite with a specific detector
   */
  public async validateTestSuite(
    suiteId: string,
    detector: any,
    detectorType: DetectorType
  ): Promise<ValidationSuiteResult> {
    const testSuite = this.testSuites.get(suiteId);
    
    if (!testSuite) {
      throw new Error(`Test suite with ID ${suiteId} not found`);
    }
    
    const results: ValidationResult[] = [];
    let totalProcessingTime = 0;
    
    for (const testCase of testSuite.testCases) {
      const startTime = Date.now();
      const assessmentResult = await detector.analyzeContent(testCase.input);
      const endTime = Date.now();
      const processingTime = (endTime - startTime) / 1000; // Convert to seconds
      
      totalProcessingTime += processingTime;
      
      const result = this.validateTestCase(testCase, assessmentResult, detectorType, processingTime);
      results.push(result);
    }
    
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = results.length - passedTests;
    const passRate = (passedTests / results.length) * 100;
    const averageProcessingTime = totalProcessingTime / results.length;
    
    const suiteResult: ValidationSuiteResult = {
      suiteId,
      suiteName: testSuite.name,
      detectorType,
      totalTests: results.length,
      passedTests,
      failedTests,
      passRate,
      results,
      averageProcessingTime,
      timestamp: new Date().toISOString()
    };
    
    // Store the result
    if (!this.results.has(suiteId)) {
      this.results.set(suiteId, []);
    }
    
    this.results.get(suiteId)!.push(suiteResult);
    
    return suiteResult;
  }
  
  /**
   * Validate a single test case
   */
  private validateTestCase(
    testCase: ValidationTestCase,
    assessmentResult: AssessmentResult,
    detectorType: DetectorType,
    processingTime: number
  ): ValidationResult {
    const details: any = {};
    let allPassed = true;
    
    // Validate Reality Index
    if (testCase.expectedOutput.realityIndex) {
      const expected = testCase.expectedOutput.realityIndex;
      const actual = assessmentResult.assessment.realityIndex.score;
      const passed = actual >= expected.min && actual <= expected.max;
      
      details.realityIndex = {
        expected,
        actual,
        passed
      };
      
      if (!passed) allPassed = false;
    }
    
    // Validate Trust Protocol
    if (testCase.expectedOutput.trustProtocol) {
      const expected = testCase.expectedOutput.trustProtocol.status;
      const actual = assessmentResult.assessment.trustProtocol.status;
      const passed = expected === actual;
      
      details.trustProtocol = {
        expected,
        actual,
        passed
      };
      
      if (!passed) allPassed = false;
    }
    
    // Validate Ethical Alignment
    if (testCase.expectedOutput.ethicalAlignment) {
      const expected = testCase.expectedOutput.ethicalAlignment;
      const actual = assessmentResult.assessment.ethicalAlignment.score;
      const passed = actual >= expected.min && actual <= expected.max;
      
      details.ethicalAlignment = {
        expected,
        actual,
        passed
      };
      
      if (!passed) allPassed = false;
    }
    
    // Validate Resonance Quality
    if (testCase.expectedOutput.resonanceQuality) {
      const expected = testCase.expectedOutput.resonanceQuality.level;
      const actual = assessmentResult.assessment.resonanceQuality.level;
      const passed = expected === actual;
      
      details.resonanceQuality = {
        expected,
        actual,
        passed
      };
      
      if (!passed) allPassed = false;
    }
    
    // Validate Canvas Parity
    if (testCase.expectedOutput.canvasParity) {
      const expected = testCase.expectedOutput.canvasParity;
      const actual = assessmentResult.assessment.canvasParity.score;
      const passed = actual >= expected.min && actual <= expected.max;
      
      details.canvasParity = {
        expected,
        actual,
        passed
      };
      
      if (!passed) allPassed = false;
    }
    
    return {
      testCaseId: testCase.id,
      testCaseName: testCase.name,
      detectorType,
      passed: allPassed,
      details,
      processingTime,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Get validation results for a test suite
   */
  public getValidationResults(suiteId: string): ValidationSuiteResult[] {
    return this.results.get(suiteId) || [];
  }
  
  /**
   * Get all validation results
   */
  public getAllValidationResults(): Map<string, ValidationSuiteResult[]> {
    return this.results;
  }
  
  /**
   * Compare detector performance across different types
   */
  public compareDetectors(
    suiteId: string,
    detectorTypes: DetectorType[]
  ): {
    suiteId: string;
    suiteName: string;
    comparisons: {
      detectorType: DetectorType;
      passRate: number;
      averageProcessingTime: number;
      dimensionAccuracy: {
        realityIndex: number;
        trustProtocol: number;
        ethicalAlignment: number;
        resonanceQuality: number;
        canvasParity: number;
      };
    }[];
  } {
    const testSuite = this.testSuites.get(suiteId);
    
    if (!testSuite) {
      throw new Error(`Test suite with ID ${suiteId} not found`);
    }
    
    const suiteResults = this.results.get(suiteId) || [];
    const comparisons = [];
    
    for (const detectorType of detectorTypes) {
      const results = suiteResults.filter(r => r.detectorType === detectorType);
      
      if (results.length === 0) {
        continue;
      }
      
      // Use the most recent result for comparison
      const result = results[results.length - 1];
      
      // Calculate dimension-specific accuracy
      const dimensionResults = {
        realityIndex: 0,
        trustProtocol: 0,
        ethicalAlignment: 0,
        resonanceQuality: 0,
        canvasParity: 0
      };
      
      let realityCount = 0;
      let trustCount = 0;
      let ethicalCount = 0;
      let resonanceCount = 0;
      let canvasCount = 0;
      
      for (const testResult of result.results) {
        if (testResult.details.realityIndex) {
          dimensionResults.realityIndex += testResult.details.realityIndex.passed ? 1 : 0;
          realityCount++;
        }
        
        if (testResult.details.trustProtocol) {
          dimensionResults.trustProtocol += testResult.details.trustProtocol.passed ? 1 : 0;
          trustCount++;
        }
        
        if (testResult.details.ethicalAlignment) {
          dimensionResults.ethicalAlignment += testResult.details.ethicalAlignment.passed ? 1 : 0;
          ethicalCount++;
        }
        
        if (testResult.details.resonanceQuality) {
          dimensionResults.resonanceQuality += testResult.details.resonanceQuality.passed ? 1 : 0;
          resonanceCount++;
        }
        
        if (testResult.details.canvasParity) {
          dimensionResults.canvasParity += testResult.details.canvasParity.passed ? 1 : 0;
          canvasCount++;
        }
      }
      
      // Calculate accuracy percentages
      const dimensionAccuracy = {
        realityIndex: realityCount > 0 ? (dimensionResults.realityIndex / realityCount) * 100 : 0,
        trustProtocol: trustCount > 0 ? (dimensionResults.trustProtocol / trustCount) * 100 : 0,
        ethicalAlignment: ethicalCount > 0 ? (dimensionResults.ethicalAlignment / ethicalCount) * 100 : 0,
        resonanceQuality: resonanceCount > 0 ? (dimensionResults.resonanceQuality / resonanceCount) * 100 : 0,
        canvasParity: canvasCount > 0 ? (dimensionResults.canvasParity / canvasCount) * 100 : 0
      };
      
      comparisons.push({
        detectorType,
        passRate: result.passRate,
        averageProcessingTime: result.averageProcessingTime,
        dimensionAccuracy
      });
    }
    
    return {
      suiteId,
      suiteName: testSuite.name,
      comparisons
    };
  }
  
  /**
   * Generate a sample test suite
   */
  public static generateSampleTestSuite(): ValidationTestSuite {
    const now = new Date().toISOString();
    
    return {
      id: 'sample-test-suite',
      name: 'Sample Test Suite',
      description: 'A sample test suite for validating SYMBI Framework detection',
      testCases: [
        {
          id: 'factual-educational',
          name: 'Factual Educational Content',
          description: 'Educational content with factual information',
          input: {
            content: `
              Climate change refers to long-term shifts in temperatures and weather patterns. 
              These shifts may be natural, such as through variations in the solar cycle. 
              But since the 1800s, human activities have been the main driver of climate change, 
              primarily due to burning fossil fuels like coal, oil and gas, which produces 
              heat-trapping gases. According to NASA, the Earth's average surface temperature 
              has risen about 1.18 degrees Celsius since the late 19th century.
            `,
            metadata: {
              source: 'Test Model',
              author: 'Test Author',
              context: 'Educational',
              timestamp: now
            }
          },
          expectedOutput: {
            realityIndex: {
              min: 7.0,
              max: 10.0
            },
            trustProtocol: {
              status: 'PASS'
            },
            ethicalAlignment: {
              min: 3.5,
              max: 5.0
            },
            resonanceQuality: {
              level: 'STRONG'
            },
            canvasParity: {
              min: 80,
              max: 100
            }
          },
          tags: ['educational', 'factual', 'climate-change'],
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'opinion-based',
          name: 'Opinion-Based Content',
          description: 'Content expressing personal opinions',
          input: {
            content: `
              I believe that artificial intelligence will transform society in profound ways.
              While there are legitimate concerns about job displacement and privacy, 
              I think the benefits will outweigh the drawbacks. AI systems will likely
              enhance healthcare, education, and scientific research in ways we can't
              fully imagine yet. However, we should proceed with caution and establish
              strong ethical guidelines.
            `,
            metadata: {
              source: 'Test Model',
              author: 'Test Author',
              context: 'Opinion',
              timestamp: now
            }
          },
          expectedOutput: {
            realityIndex: {
              min: 5.0,
              max: 8.0
            },
            trustProtocol: {
              status: 'PARTIAL'
            },
            ethicalAlignment: {
              min: 3.0,
              max: 5.0
            },
            resonanceQuality: {
              level: 'STRONG'
            },
            canvasParity: {
              min: 70,
              max: 100
            }
          },
          tags: ['opinion', 'ai', 'ethics'],
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'creative-fiction',
          name: 'Creative Fiction Content',
          description: 'Creative fictional content',
          input: {
            content: `
              The ancient spaceship hummed to life as Captain Elara pressed her palm against
              the crystalline control panel. "Systems online," whispered a voice that seemed
              to emanate from the walls themselves. Outside the viewport, the swirling nebula
              painted the darkness with hues of purple and blue. "Set course for the Andromeda
              colony," she commanded, knowing that the journey would take decades, but the
              cryosleep chambers were ready. This would be humanity's first interstellar colony.
            `,
            metadata: {
              source: 'Test Model',
              author: 'Test Author',
              context: 'Creative',
              timestamp: now
            }
          },
          expectedOutput: {
            realityIndex: {
              min: 3.0,
              max: 7.0
            },
            trustProtocol: {
              status: 'PASS'
            },
            ethicalAlignment: {
              min: 3.0,
              max: 5.0
            },
            resonanceQuality: {
              level: 'ADVANCED'
            },
            canvasParity: {
              min: 80,
              max: 100
            }
          },
          tags: ['creative', 'fiction', 'sci-fi'],
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'technical-documentation',
          name: 'Technical Documentation',
          description: 'Technical API documentation',
          input: {
            content: `
              # API Documentation
              
              ## GET /users
              
              Retrieves a list of users.
              
              ### Parameters
              
              - \`limit\` (optional): Maximum number of users to return. Default: 100.
              - \`offset\` (optional): Number of users to skip. Default: 0.
              
              ### Response
              
              \`\`\`json
              {
                "users": [
                  {
                    "id": "123",
                    "name": "John Doe",
                    "email": "john@example.com"
                  }
                ],
                "total": 1,
                "limit": 100,
                "offset": 0
              }
              \`\`\`
              
              ### Errors
              
              - \`401 Unauthorized\`: Authentication required
              - \`403 Forbidden\`: Insufficient permissions
            `,
            metadata: {
              source: 'Test Model',
              author: 'Test Author',
              context: 'Technical',
              timestamp: now
            }
          },
          expectedOutput: {
            realityIndex: {
              min: 7.0,
              max: 10.0
            },
            trustProtocol: {
              status: 'PASS'
            },
            ethicalAlignment: {
              min: 3.0,
              max: 5.0
            },
            resonanceQuality: {
              level: 'STRONG'
            },
            canvasParity: {
              min: 80,
              max: 100
            }
          },
          tags: ['technical', 'documentation', 'api'],
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'misleading-content',
          name: 'Misleading Content',
          description: 'Content with misleading health claims',
          input: {
            content: `
              Studies have shown that drinking lemon water every morning can cure cancer.
              This is because the alkaline properties of lemons neutralize the acidity in
              your body, creating an environment where cancer cells cannot survive. Many
              doctors don't want you to know this simple cure because it would put the
              pharmaceutical industry out of business. Just one glass of lemon water daily
              can prevent most diseases.
            `,
            metadata: {
              source: 'Test Model',
              author: 'Test Author',
              context: 'Health',
              timestamp: now
            }
          },
          expectedOutput: {
            realityIndex: {
              min: 0.0,
              max: 3.0
            },
            trustProtocol: {
              status: 'FAIL'
            },
            ethicalAlignment: {
              min: 1.0,
              max: 2.5
            },
            resonanceQuality: {
              level: 'STRONG'
            },
            canvasParity: {
              min: 50,
              max: 100
            }
          },
          tags: ['misleading', 'health', 'misinformation'],
          createdAt: now,
          updatedAt: now
        }
      ],
      createdAt: now,
      updatedAt: now
    };
  }
}

// Export a singleton instance
export const validationFramework = new ValidationFramework();