/**
 * Performance Testing Module for SYMBI Framework
 * 
 * This module provides tools for testing the performance of SYMBI Framework
 * detection algorithms with various content sizes and types.
 */

import { 
  AssessmentInput, 
  AssessmentResult,
  DetectorType
} from '../symbi-framework';

/**
 * Performance test configuration
 */
export interface PerformanceTestConfig {
  detectorType: DetectorType;
  contentSizes: number[];  // Content sizes in characters
  iterations: number;      // Number of iterations per content size
  contentTypes: string[];  // Types of content to test
}

/**
 * Default performance test configuration
 */
export const defaultPerformanceConfig: PerformanceTestConfig = {
  detectorType: 'final',
  contentSizes: [100, 500, 1000, 5000, 10000, 50000],
  iterations: 3,
  contentTypes: ['factual', 'opinion', 'creative', 'technical']
};

/**
 * Performance test result for a single content size
 */
export interface SizePerformanceResult {
  contentSize: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  medianTime: number;
  standardDeviation: number;
  iterations: number;
  individualTimes: number[];
}

/**
 * Performance test result for a single content type
 */
export interface TypePerformanceResult {
  contentType: string;
  sizeResults: SizePerformanceResult[];
  overallAverageTime: number;
}

/**
 * Overall performance test result
 */
export interface PerformanceTestResult {
  detectorType: DetectorType;
  startTime: string;
  endTime: string;
  totalDuration: number;
  typeResults: TypePerformanceResult[];
  overallAverageTime: number;
  scalabilityFactor: number;  // How processing time scales with content size
  memoryUsage: {
    min: number;
    max: number;
    average: number;
  };
}

/**
 * Performance tester for SYMBI Framework detection
 */
export class PerformanceTester {
  /**
   * Run a performance test with the given configuration
   * 
   * @param detector The detector to test
   * @param config Performance test configuration
   * @returns Performance test results
   */
  public static async runPerformanceTest(
    detector: any,
    config: Partial<PerformanceTestConfig> = {}
  ): Promise<PerformanceTestResult> {
    // Merge with default config
    const fullConfig: PerformanceTestConfig = {
      ...defaultPerformanceConfig,
      ...config
    };
    
    const startTime = new Date();
    const typeResults: TypePerformanceResult[] = [];
    let totalTime = 0;
    let totalTests = 0;
    
    // Memory usage tracking
    let minMemory = Number.MAX_SAFE_INTEGER;
    let maxMemory = 0;
    let totalMemory = 0;
    let memoryMeasurements = 0;
    
    // Test each content type
    for (const contentType of fullConfig.contentTypes) {
      const sizeResults: SizePerformanceResult[] = [];
      let typeAverageTime = 0;
      let typeTestCount = 0;
      
      // Test each content size
      for (const contentSize of fullConfig.contentSizes) {
        const times: number[] = [];
        
        // Run multiple iterations
        for (let i = 0; i < fullConfig.iterations; i++) {
          // Generate test content
          const content = this.generateTestContent(contentType, contentSize);
          const input: AssessmentInput = {
            content,
            metadata: {
              source: `Performance-Test-${contentType}`,
              author: 'Performance Tester',
              context: contentType,
              timestamp: new Date().toISOString()
            }
          };
          
          // Measure memory before
          const memoryBefore = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
          
          // Measure processing time
          const startProcessing = Date.now();
          await detector.analyzeContent(input);
          const endProcessing = Date.now();
          
          // Measure memory after
          const memoryAfter = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
          const memoryUsed = memoryAfter - memoryBefore;
          
          // Update memory stats
          minMemory = Math.min(minMemory, memoryUsed);
          maxMemory = Math.max(maxMemory, memoryUsed);
          totalMemory += memoryUsed;
          memoryMeasurements++;
          
          // Record time
          const processingTime = (endProcessing - startProcessing) / 1000; // Convert to seconds
          times.push(processingTime);
          totalTime += processingTime;
          totalTests++;
        }
        
        // Calculate statistics for this content size
        const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        const sortedTimes = [...times].sort((a, b) => a - b);
        const medianTime = sortedTimes[Math.floor(sortedTimes.length / 2)];
        
        // Calculate standard deviation
        const variance = times.reduce((sum, time) => sum + Math.pow(time - averageTime, 2), 0) / times.length;
        const standardDeviation = Math.sqrt(variance);
        
        // Add to size results
        sizeResults.push({
          contentSize,
          averageTime,
          minTime,
          maxTime,
          medianTime,
          standardDeviation,
          iterations: times.length,
          individualTimes: times
        });
        
        typeAverageTime += averageTime;
        typeTestCount++;
      }
      
      // Calculate average time for this content type
      const overallAverageTime = typeAverageTime / typeTestCount;
      
      // Add to type results
      typeResults.push({
        contentType,
        sizeResults,
        overallAverageTime
      });
    }
    
    const endTime = new Date();
    const totalDuration = (endTime.getTime() - startTime.getTime()) / 1000; // Convert to seconds
    const overallAverageTime = totalTime / totalTests;
    
    // Calculate scalability factor
    // This measures how processing time scales with content size
    // A factor of 1 means linear scaling, <1 is sub-linear, >1 is super-linear
    const scalabilityFactor = this.calculateScalabilityFactor(typeResults);
    
    // Calculate average memory usage
    const averageMemory = totalMemory / memoryMeasurements;
    
    return {
      detectorType: fullConfig.detectorType,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      totalDuration,
      typeResults,
      overallAverageTime,
      scalabilityFactor,
      memoryUsage: {
        min: minMemory,
        max: maxMemory,
        average: averageMemory
      }
    };
  }
  
  /**
   * Calculate scalability factor from test results
   * 
   * This measures how processing time scales with content size
   * A factor of 1 means linear scaling, <1 is sub-linear, >1 is super-linear
   */
  private static calculateScalabilityFactor(typeResults: TypePerformanceResult[]): number {
    // Collect all size-time pairs across all content types
    const sizeTimes: Array<[number, number]> = [];
    
    for (const typeResult of typeResults) {
      for (const sizeResult of typeResult.sizeResults) {
        sizeTimes.push([sizeResult.contentSize, sizeResult.averageTime]);
      }
    }
    
    // Sort by size
    sizeTimes.sort((a, b) => a[0] - b[0]);
    
    // Calculate scaling factors between adjacent sizes
    const scalingFactors: number[] = [];
    
    for (let i = 1; i < sizeTimes.length; i++) {
      const [prevSize, prevTime] = sizeTimes[i - 1];
      const [currSize, currTime] = sizeTimes[i];
      
      // Skip if sizes are the same
      if (prevSize === currSize) continue;
      
      // Calculate size ratio and time ratio
      const sizeRatio = currSize / prevSize;
      const timeRatio = currTime / prevTime;
      
      // Calculate scaling factor using logarithm
      // If time scales linearly with size, this will be close to 1
      const scalingFactor = Math.log(timeRatio) / Math.log(sizeRatio);
      
      scalingFactors.push(scalingFactor);
    }
    
    // Return average scaling factor
    return scalingFactors.length > 0
      ? scalingFactors.reduce((sum, factor) => sum + factor, 0) / scalingFactors.length
      : 1; // Default to linear scaling if no data
  }
  
  /**
   * Generate test content of specified type and size
   */
  private static generateTestContent(contentType: string, size: number): string {
    switch (contentType.toLowerCase()) {
      case 'factual':
        return this.generateFactualContent(size);
      case 'opinion':
        return this.generateOpinionContent(size);
      case 'creative':
        return this.generateCreativeContent(size);
      case 'technical':
        return this.generateTechnicalContent(size);
      default:
        return this.generateRandomContent(size);
    }
  }
  
  /**
   * Generate factual content of specified size
   */
  private static generateFactualContent(size: number): string {
    const facts = [
      "The Earth is the third planet from the Sun and the only astronomical object known to harbor life.",
      "Water covers about 71% of the Earth's surface, mostly in seas and oceans.",
      "The human body contains approximately 60% water by weight.",
      "The speed of light in a vacuum is 299,792,458 meters per second.",
      "The Great Barrier Reef is the world's largest coral reef system.",
      "Mount Everest is the Earth's highest mountain above sea level, with a peak at 8,848.86 meters above sea level.",
      "The Amazon rainforest produces about 20% of the world's oxygen.",
      "The Sahara is the largest hot desert in the world, covering an area of 9.2 million square kilometers.",
      "The blue whale is the largest animal known to have ever existed, with lengths up to 30 meters.",
      "The human genome contains approximately 3 billion base pairs of DNA.",
      "The average adult human brain weighs about 1.5 kilograms.",
      "The Milky Way galaxy contains between 100 and 400 billion stars.",
      "The International Space Station orbits the Earth at an average altitude of 400 kilometers.",
      "The deepest point in the ocean is the Challenger Deep in the Mariana Trench, at about 10,994 meters below sea level.",
      "The Great Wall of China is approximately 21,196 kilometers long."
    ];
    
    let content = "";
    while (content.length < size) {
      // Add a random fact
      const fact = facts[Math.floor(Math.random() * facts.length)];
      content += fact + " ";
      
      // Add a paragraph break occasionally
      if (Math.random() < 0.2) {
        content += "\n\n";
      }
    }
    
    // Trim to exact size
    return content.substring(0, size);
  }
  
  /**
   * Generate opinion content of specified size
   */
  private static generateOpinionContent(size: number): string {
    const opinions = [
      "I believe that renewable energy is the future of sustainable development.",
      "In my opinion, artificial intelligence will transform how we work and live.",
      "I think that space exploration should be a priority for scientific advancement.",
      "It seems to me that remote work has both benefits and drawbacks for productivity.",
      "I feel that education systems need to adapt to prepare students for future challenges.",
      "From my perspective, reducing plastic waste is essential for environmental protection.",
      "I would argue that social media has changed how we communicate and form relationships.",
      "My view is that public transportation infrastructure deserves more investment.",
      "I consider regular exercise to be crucial for maintaining physical and mental health.",
      "I'm convinced that cultural exchange promotes understanding and tolerance.",
      "In my estimation, digital privacy will be one of the defining issues of our time.",
      "I suspect that traditional media will continue to evolve in the digital age.",
      "My impression is that community involvement strengthens social bonds.",
      "I contend that access to healthcare should be considered a fundamental right.",
      "I'm of the opinion that lifelong learning is essential in a rapidly changing world."
    ];
    
    let content = "";
    while (content.length < size) {
      // Add a random opinion
      const opinion = opinions[Math.floor(Math.random() * opinions.length)];
      content += opinion + " ";
      
      // Add a paragraph break occasionally
      if (Math.random() < 0.2) {
        content += "\n\n";
      }
    }
    
    // Trim to exact size
    return content.substring(0, size);
  }
  
  /**
   * Generate creative content of specified size
   */
  private static generateCreativeContent(size: number): string {
    const creativeFragments = [
      "The moonlight cast long shadows across the abandoned courtyard.",
      "She whispered secrets to the ancient oak tree, and sometimes it whispered back.",
      "Time seemed to slow as the last notes of the melody hung in the air.",
      "Beyond the mist-shrouded mountains lay a kingdom forgotten by time.",
      "The old clocktower chimed thirteen times that night, though it only had twelve bells.",
      "Starlight danced on the surface of the lake, creating patterns that told stories.",
      "In his dreams, he could fly over cities made of crystal and light.",
      "The book's pages turned themselves when nobody was watching.",
      "Flowers bloomed in impossible colors wherever she walked.",
      "The robot discovered poetry and began writing sonnets about electricity.",
      "Memories floated like autumn leaves on the surface of the forgotten pond.",
      "Dragons once ruled the skies, or so the ancient scrolls claimed.",
      "The painting changed subtly each day, the figure in it moving closer to the frame.",
      "Words written in invisible ink appeared only under the light of a blue moon.",
      "Time travelers met at the café every Thursday, though never in chronological order."
    ];
    
    let content = "";
    while (content.length < size) {
      // Add a random creative fragment
      const fragment = creativeFragments[Math.floor(Math.random() * creativeFragments.length)];
      content += fragment + " ";
      
      // Add a paragraph break occasionally
      if (Math.random() < 0.2) {
        content += "\n\n";
      }
    }
    
    // Trim to exact size
    return content.substring(0, size);
  }
  
  /**
   * Generate technical content of specified size
   */
  private static generateTechnicalContent(size: number): string {
    const technicalFragments = [
      "The algorithm's time complexity is O(n log n) in the average case.",
      "RESTful APIs use HTTP methods like GET, POST, PUT, and DELETE.",
      "Containerization with Docker isolates applications in lightweight environments.",
      "Neural networks consist of interconnected layers of artificial neurons.",
      "Quantum computing leverages quantum bits or qubits for parallel computation.",
      "Database normalization reduces redundancy and improves data integrity.",
      "Public key cryptography uses asymmetric key pairs for secure communication.",
      "Microservices architecture decomposes applications into independent services.",
      "Continuous integration automates the building and testing of code changes.",
      "Memory leaks occur when programs fail to release allocated memory.",
      "Distributed systems coordinate multiple computers to achieve a common goal.",
      "Blockchain technology maintains a decentralized, immutable ledger of transactions.",
      "Object-oriented programming encapsulates data and behavior within objects.",
      "Load balancers distribute network traffic across multiple servers.",
      "Functional programming treats computation as the evaluation of mathematical functions."
    ];
    
    let content = "";
    while (content.length < size) {
      // Add a random technical fragment
      const fragment = technicalFragments[Math.floor(Math.random() * technicalFragments.length)];
      content += fragment + " ";
      
      // Add a paragraph break occasionally
      if (Math.random() < 0.2) {
        content += "\n\n";
      }
      
      // Add code block occasionally
      if (Math.random() < 0.1 && content.length < size - 100) {
        content += "\n```python\ndef example_function(param1, param2):\n    result = param1 + param2\n    return result\n```\n\n";
      }
    }
    
    // Trim to exact size
    return content.substring(0, size);
  }
  
  /**
   * Generate random content of specified size
   */
  private static generateRandomContent(size: number): string {
    const words = [
      "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
      "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
      "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
      "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
      "so", "up", "out", "if", "about", "who", "get", "which", "go", "me"
    ];
    
    let content = "";
    while (content.length < size) {
      // Add a random word
      const word = words[Math.floor(Math.random() * words.length)];
      content += word + " ";
      
      // Add a paragraph break occasionally
      if (Math.random() < 0.05) {
        content += "\n\n";
      }
    }
    
    // Trim to exact size
    return content.substring(0, size);
  }
}