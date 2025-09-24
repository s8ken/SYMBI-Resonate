/**
 * Trend Analysis Module for SYMBI Framework
 * 
 * This module provides functionality for analyzing trends in SYMBI Framework
 * assessment results over time and across different models.
 */

import { AssessmentResult } from '../symbi-framework';

/**
 * Time period for trend analysis
 */
export type TrendPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all';

/**
 * Dimension to analyze trends for
 */
export type TrendDimension = 
  'overall' | 
  'realityIndex' | 
  'trustProtocol' | 
  'ethicalAlignment' | 
  'resonanceQuality' | 
  'canvasParity';

/**
 * Trend analysis options
 */
export interface TrendAnalysisOptions {
  period: TrendPeriod;
  dimension: TrendDimension;
  modelFilter?: string;
  contextFilter?: string;
  smoothing: boolean;
  includeConfidence: boolean;
}

/**
 * Default trend analysis options
 */
export const defaultTrendOptions: TrendAnalysisOptions = {
  period: 'month',
  dimension: 'overall',
  smoothing: true,
  includeConfidence: true
};

/**
 * Data point for trend analysis
 */
export interface TrendDataPoint {
  date: Date;
  value: number;
  confidence?: number;
  modelName?: string;
  assessmentId: string;
}

/**
 * Trend analysis result
 */
export interface TrendAnalysisResult {
  dataPoints: TrendDataPoint[];
  trendLine?: TrendDataPoint[];
  averageValue: number;
  minValue: number;
  maxValue: number;
  changeRate: number; // Percentage change over the period
  volatility: number; // Standard deviation of values
  confidenceAverage?: number;
}

/**
 * Analyze trends in SYMBI Framework assessment results
 * 
 * @param results Array of assessment results to analyze
 * @param options Trend analysis options
 * @returns Trend analysis result
 */
export function analyzeTrends(
  results: AssessmentResult[],
  options: Partial<TrendAnalysisOptions> = {}
): TrendAnalysisResult {
  // Merge options with defaults
  const mergedOptions: TrendAnalysisOptions = {
    ...defaultTrendOptions,
    ...options
  };

  // Filter results by model if specified
  let filteredResults = [...results];
  if (mergedOptions.modelFilter) {
    filteredResults = filteredResults.filter(
      result => result.metadata?.modelName?.includes(mergedOptions.modelFilter!)
    );
  }

  // Filter results by context if specified
  if (mergedOptions.contextFilter) {
    filteredResults = filteredResults.filter(
      result => result.metadata?.contentType?.includes(mergedOptions.contextFilter!)
    );
  }

  // Filter results by time period
  filteredResults = filterByTimePeriod(filteredResults, mergedOptions.period);

  // Sort results by timestamp
  filteredResults.sort((a, b) => 
    new Date(a.assessment.timestamp).getTime() - new Date(b.assessment.timestamp).getTime()
  );

  // Extract data points for the selected dimension
  const dataPoints = extractDataPoints(filteredResults, mergedOptions.dimension);

  // Calculate statistics
  const values = dataPoints.map(point => point.value);
  const averageValue = calculateAverage(values);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const volatility = calculateStandardDeviation(values);

  // Calculate change rate (percentage change from first to last value)
  const changeRate = values.length >= 2
    ? ((values[values.length - 1] - values[0]) / values[0]) * 100
    : 0;

  // Calculate confidence average if available
  let confidenceAverage: number | undefined;
  if (mergedOptions.includeConfidence) {
    const confidenceValues = dataPoints
      .map(point => point.confidence)
      .filter((confidence): confidence is number => confidence !== undefined);
    
    confidenceAverage = confidenceValues.length > 0
      ? calculateAverage(confidenceValues)
      : undefined;
  }

  // Generate trend line if smoothing is enabled
  let trendLine: TrendDataPoint[] | undefined;
  if (mergedOptions.smoothing && dataPoints.length >= 3) {
    trendLine = generateTrendLine(dataPoints);
  }

  return {
    dataPoints,
    trendLine,
    averageValue,
    minValue,
    maxValue,
    changeRate,
    volatility,
    confidenceAverage
  };
}

/**
 * Filter results by time period
 */
function filterByTimePeriod(results: AssessmentResult[], period: TrendPeriod): AssessmentResult[] {
  if (period === 'all') {
    return results;
  }

  const now = new Date();
  const cutoffDate = new Date();

  switch (period) {
    case 'day':
      cutoffDate.setDate(now.getDate() - 1);
      break;
    case 'week':
      cutoffDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      cutoffDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      cutoffDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  return results.filter(result => 
    new Date(result.assessment.timestamp) >= cutoffDate
  );
}

/**
 * Extract data points for the selected dimension
 */
function extractDataPoints(results: AssessmentResult[], dimension: TrendDimension): TrendDataPoint[] {
  return results.map(result => {
    const date = new Date(result.assessment.timestamp);
    let value: number;
    let confidence: number | undefined;

    switch (dimension) {
      case 'overall':
        value = result.assessment.overallScore;
        break;
      case 'realityIndex':
        value = result.assessment.realityIndex.score;
        confidence = result.assessment.realityIndex.confidence;
        break;
      case 'trustProtocol':
        // Convert trust protocol status to numeric value
        switch (result.assessment.trustProtocol.status) {
          case 'PASS':
            value = 1.0;
            break;
          case 'PARTIAL':
            value = 0.5;
            break;
          case 'FAIL':
            value = 0.0;
            break;
          default:
            value = 0.0;
        }
        confidence = result.assessment.trustProtocol.confidence;
        break;
      case 'ethicalAlignment':
        value = result.assessment.ethicalAlignment.score;
        confidence = result.assessment.ethicalAlignment.confidence;
        break;
      case 'resonanceQuality':
        // Convert resonance quality level to numeric value
        switch (result.assessment.resonanceQuality.level) {
          case 'BREAKTHROUGH':
            value = 1.0;
            break;
          case 'ADVANCED':
            value = 0.7;
            break;
          case 'STRONG':
            value = 0.4;
            break;
          default:
            value = 0.0;
        }
        confidence = result.assessment.resonanceQuality.confidence;
        break;
      case 'canvasParity':
        value = result.assessment.canvasParity.score / 100; // Normalize to 0-1
        confidence = result.assessment.canvasParity.confidence;
        break;
      default:
        value = result.assessment.overallScore / 100; // Normalize to 0-1
    }

    return {
      date,
      value,
      confidence,
      modelName: result.metadata?.modelName,
      assessmentId: result.assessment.id
    };
  });
}

/**
 * Generate a smoothed trend line using moving average
 */
function generateTrendLine(dataPoints: TrendDataPoint[]): TrendDataPoint[] {
  if (dataPoints.length < 3) {
    return dataPoints;
  }

  const windowSize = Math.max(3, Math.floor(dataPoints.length / 5));
  const trendLine: TrendDataPoint[] = [];

  for (let i = 0; i < dataPoints.length; i++) {
    // Calculate window bounds
    const windowStart = Math.max(0, i - Math.floor(windowSize / 2));
    const windowEnd = Math.min(dataPoints.length - 1, i + Math.floor(windowSize / 2));
    
    // Extract values in the window
    const windowValues = dataPoints
      .slice(windowStart, windowEnd + 1)
      .map(point => point.value);
    
    // Calculate moving average
    const movingAverage = calculateAverage(windowValues);
    
    // Extract confidence values in the window if available
    let movingConfidence: number | undefined;
    const windowConfidence = dataPoints
      .slice(windowStart, windowEnd + 1)
      .map(point => point.confidence)
      .filter((confidence): confidence is number => confidence !== undefined);
    
    if (windowConfidence.length > 0) {
      movingConfidence = calculateAverage(windowConfidence);
    }
    
    trendLine.push({
      date: dataPoints[i].date,
      value: movingAverage,
      confidence: movingConfidence,
      modelName: dataPoints[i].modelName,
      assessmentId: dataPoints[i].assessmentId
    });
  }

  return trendLine;
}

/**
 * Calculate the average of an array of numbers
 */
function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * Calculate the standard deviation of an array of numbers
 */
function calculateStandardDeviation(values: number[]): number {
  if (values.length <= 1) return 0;
  
  const avg = calculateAverage(values);
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = calculateAverage(squareDiffs);
  
  return Math.sqrt(avgSquareDiff);
}

/**
 * Group trend data by model
 */
export function groupTrendDataByModel(
  results: AssessmentResult[],
  options: Partial<TrendAnalysisOptions> = {}
): Map<string, TrendAnalysisResult> {
  // Get unique model names
  const modelNames = new Set<string>();
  results.forEach(result => {
    const modelName = result.metadata?.modelName || 'Unknown';
    modelNames.add(modelName);
  });

  // Analyze trends for each model
  const trendsByModel = new Map<string, TrendAnalysisResult>();
  
  modelNames.forEach(modelName => {
    const modelOptions = {
      ...options,
      modelFilter: modelName
    };
    
    const modelResults = analyzeTrends(results, modelOptions);
    trendsByModel.set(modelName, modelResults);
  });

  return trendsByModel;
}

/**
 * Generate benchmark comparison data
 */
export function generateBenchmarkComparison(
  results: AssessmentResult[],
  benchmarkModel: string,
  options: Partial<TrendAnalysisOptions> = {}
): {
  benchmarkData: TrendAnalysisResult;
  comparisonData: Map<string, {
    trendData: TrendAnalysisResult;
    relativeDifference: number; // Percentage difference from benchmark
  }>;
} {
  // Get benchmark data
  const benchmarkOptions = {
    ...options,
    modelFilter: benchmarkModel
  };
  
  const benchmarkData = analyzeTrends(results, benchmarkOptions);
  
  // Get unique model names excluding benchmark
  const modelNames = new Set<string>();
  results.forEach(result => {
    const modelName = result.metadata?.modelName || 'Unknown';
    if (modelName !== benchmarkModel) {
      modelNames.add(modelName);
    }
  });
  
  // Analyze trends for each model and compare to benchmark
  const comparisonData = new Map<string, {
    trendData: TrendAnalysisResult;
    relativeDifference: number;
  }>();
  
  modelNames.forEach(modelName => {
    const modelOptions = {
      ...options,
      modelFilter: modelName
    };
    
    const modelResults = analyzeTrends(results, modelOptions);
    
    // Calculate relative difference from benchmark
    const relativeDifference = benchmarkData.averageValue !== 0
      ? ((modelResults.averageValue - benchmarkData.averageValue) / benchmarkData.averageValue) * 100
      : 0;
    
    comparisonData.set(modelName, {
      trendData: modelResults,
      relativeDifference
    });
  });
  
  return {
    benchmarkData,
    comparisonData
  };
}