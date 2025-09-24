/**
 * Batch Processing Module for SYMBI Framework
 * 
 * This module provides functionality for processing multiple content pieces
 * in batch mode and generating aggregate reports.
 */

import { 
  AssessmentInput, 
  AssessmentResult, 
  symbiFrameworkService,
  DetectorType
} from '../symbi-framework';
import { generatePdfReport, ReportTemplate, defaultTemplate } from './pdf-generator';

/**
 * Batch processing options
 */
export interface BatchProcessingOptions {
  detectorType: DetectorType;
  includeIndividualReports: boolean;
  includeSummaryReport: boolean;
  reportTemplate: ReportTemplate;
  maxConcurrent: number;
}

/**
 * Default batch processing options
 */
export const defaultBatchOptions: BatchProcessingOptions = {
  detectorType: 'final',
  includeIndividualReports: true,
  includeSummaryReport: true,
  reportTemplate: defaultTemplate,
  maxConcurrent: 5
};

/**
 * Batch processing result
 */
export interface BatchProcessingResult {
  results: AssessmentResult[];
  summaryReport?: Blob;
  individualReports?: Map<string, Blob>;
  processingTime: number;
  successCount: number;
  errorCount: number;
  errors?: Map<string, string>;
}

/**
 * Process multiple content pieces in batch mode
 * 
 * @param inputs Array of assessment inputs to process
 * @param options Batch processing options
 * @returns Batch processing result
 */
export async function processBatch(
  inputs: AssessmentInput[],
  options: Partial<BatchProcessingOptions> = {}
): Promise<BatchProcessingResult> {
  // Merge options with defaults
  const mergedOptions: BatchProcessingOptions = {
    ...defaultBatchOptions,
    ...options
  };

  const startTime = Date.now();
  const results: AssessmentResult[] = [];
  const errors = new Map<string, string>();
  const individualReports = new Map<string, Blob>();

  // Process inputs in chunks to limit concurrency
  const chunks = chunkArray(inputs, mergedOptions.maxConcurrent);
  
  for (const chunk of chunks) {
    // Process each chunk concurrently
    const chunkPromises = chunk.map(async (input) => {
      try {
        const result = await symbiFrameworkService.processContent(input, mergedOptions.detectorType);
        results.push(result);
        
        // Generate individual report if enabled
        if (mergedOptions.includeIndividualReports) {
          const report = await generatePdfReport(result, mergedOptions.reportTemplate);
          individualReports.set(result.assessment.id, report);
        }
        
        return { success: true, result };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const inputId = input.metadata?.id || `input-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        errors.set(inputId, errorMessage);
        return { success: false, error: errorMessage };
      }
    });
    
    // Wait for all promises in the chunk to resolve
    await Promise.all(chunkPromises);
  }

  // Generate summary report if enabled
  let summaryReport: Blob | undefined;
  if (mergedOptions.includeSummaryReport && results.length > 0) {
    summaryReport = await generateBatchSummaryReport(results, mergedOptions.reportTemplate);
  }

  const endTime = Date.now();
  const processingTime = (endTime - startTime) / 1000; // Convert to seconds

  return {
    results,
    summaryReport,
    individualReports: mergedOptions.includeIndividualReports ? individualReports : undefined,
    processingTime,
    successCount: results.length,
    errorCount: errors.size,
    errors: errors.size > 0 ? errors : undefined
  };
}

/**
 * Generate a summary report for a batch of assessment results
 * 
 * @param results Array of assessment results
 * @param template Report template to use
 * @returns Blob containing the generated PDF
 */
async function generateBatchSummaryReport(
  results: AssessmentResult[],
  template: ReportTemplate
): Promise<Blob> {
  // Create a new jsPDF instance
  const jsPDF = (await import('jspdf')).default;
  const doc = new jsPDF({
    orientation: template.orientation,
    unit: 'mm',
    format: template.pageSize
  });

  // Get colors from the selected color scheme
  const colorSchemes = {
    default: {
      primary: '#3b82f6', // blue-500
      secondary: '#6b7280', // gray-500
      accent: '#10b981', // emerald-500
      text: '#1f2937', // gray-800
      background: '#ffffff', // white
      headerBg: '#f3f4f6', // gray-100
      tableBorder: '#d1d5db', // gray-300
      tableHeader: '#f9fafb', // gray-50
      tableRowEven: '#ffffff', // white
      tableRowOdd: '#f9fafb', // gray-50
    },
    minimal: {
      primary: '#000000', // black
      secondary: '#4b5563', // gray-600
      accent: '#000000', // black
      text: '#000000', // black
      background: '#ffffff', // white
      headerBg: '#ffffff', // white
      tableBorder: '#e5e7eb', // gray-200
      tableHeader: '#f9fafb', // gray-50
      tableRowEven: '#ffffff', // white
      tableRowOdd: '#f9fafb', // gray-50
    },
    vibrant: {
      primary: '#8b5cf6', // violet-500
      secondary: '#ec4899', // pink-500
      accent: '#f59e0b', // amber-500
      text: '#1f2937', // gray-800
      background: '#ffffff', // white
      headerBg: '#f3e8ff', // violet-100
      tableBorder: '#d1d5db', // gray-300
      tableHeader: '#f5f3ff', // violet-50
      tableRowEven: '#ffffff', // white
      tableRowOdd: '#faf5ff', // violet-50
    },
    professional: {
      primary: '#1e40af', // blue-800
      secondary: '#475569', // slate-600
      accent: '#0f766e', // teal-700
      text: '#0f172a', // slate-900
      background: '#ffffff', // white
      headerBg: '#f8fafc', // slate-50
      tableBorder: '#cbd5e1', // slate-300
      tableHeader: '#f1f5f9', // slate-100
      tableRowEven: '#ffffff', // white
      tableRowOdd: '#f8fafc', // slate-50
    }
  };
  
  const colors = colorSchemes[template.colorScheme] || colorSchemes.default;

  // Set up document properties
  doc.setProperties({
    title: 'SYMBI Framework Batch Assessment Summary',
    subject: 'SYMBI Framework Batch Assessment',
    author: 'SYMBI Resonate',
    creator: 'SYMBI Resonate PDF Generator'
  });

  // Add header
  if (template.includeHeader) {
    // Add header background
    doc.setFillColor(colors.headerBg);
    doc.rect(0, 0, doc.internal.pageSize.width, 20, 'F');
    
    // Add logo if enabled
    if (template.includeLogo) {
      doc.setFontSize(14);
      doc.setTextColor(colors.primary);
      doc.text('SYMBI', 20, 13);
    }
    
    // Add header text
    doc.setFontSize(10);
    doc.setTextColor(colors.secondary);
    doc.text('SYMBI Framework Batch Assessment', doc.internal.pageSize.width - 20, 13, { align: 'right' });
  }

  // Add title
  doc.setFontSize(24);
  doc.setTextColor(colors.primary);
  doc.text('Batch Assessment Summary', 20, template.includeHeader ? 40 : 20);

  // Add timestamp if enabled
  if (template.includeTimestamp) {
    const timestamp = new Date().toLocaleString();
    doc.setFontSize(10);
    doc.setTextColor(colors.secondary);
    doc.text(`Generated: ${timestamp}`, 20, template.includeHeader ? 50 : 30);
    doc.text(`Total Assessments: ${results.length}`, 20, template.includeHeader ? 55 : 35);
  }

  // Calculate average scores
  const averages = calculateAverageScores(results);

  // Add average scores section
  let yPos = template.includeHeader ? 65 : 45;
  
  doc.setFontSize(14);
  doc.setTextColor(colors.primary);
  doc.text('AVERAGE SCORES', 20, yPos);
  
  yPos += 10;
  
  // Create average scores table
  const averageData = [
    ['Overall Score', averages.overallScore.toFixed(1)],
    ['Reality Index', averages.realityIndex.toFixed(1)],
    ['Ethical Alignment', averages.ethicalAlignment.toFixed(1)],
    ['Canvas Parity', averages.canvasParity.toFixed(1)]
  ];
  
  doc.autoTable({
    startY: yPos,
    head: [['Dimension', 'Average Score']],
    body: averageData,
    theme: 'grid',
    headStyles: {
      fillColor: colors.tableHeader,
      textColor: colors.primary,
      fontStyle: 'bold'
    },
    styles: {
      textColor: colors.text,
      lineColor: colors.tableBorder
    },
    alternateRowStyles: {
      fillColor: colors.tableRowOdd
    }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 20;

  // Add trust protocol distribution
  doc.setFontSize(14);
  doc.setTextColor(colors.primary);
  doc.text('TRUST PROTOCOL DISTRIBUTION', 20, yPos);
  
  yPos += 10;
  
  const trustData = [
    ['PASS', `${averages.trustProtocol.pass.toFixed(1)}%`],
    ['PARTIAL', `${averages.trustProtocol.partial.toFixed(1)}%`],
    ['FAIL', `${averages.trustProtocol.fail.toFixed(1)}%`]
  ];
  
  doc.autoTable({
    startY: yPos,
    head: [['Status', 'Percentage']],
    body: trustData,
    theme: 'grid',
    headStyles: {
      fillColor: colors.tableHeader,
      textColor: colors.primary,
      fontStyle: 'bold'
    },
    styles: {
      textColor: colors.text,
      lineColor: colors.tableBorder
    },
    alternateRowStyles: {
      fillColor: colors.tableRowOdd
    }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 20;

  // Add resonance quality distribution
  doc.setFontSize(14);
  doc.setTextColor(colors.primary);
  doc.text('RESONANCE QUALITY DISTRIBUTION', 20, yPos);
  
  yPos += 10;
  
  const resonanceData = [
    ['BREAKTHROUGH', `${averages.resonanceQuality.breakthrough.toFixed(1)}%`],
    ['ADVANCED', `${averages.resonanceQuality.advanced.toFixed(1)}%`],
    ['STRONG', `${averages.resonanceQuality.strong.toFixed(1)}%`]
  ];
  
  doc.autoTable({
    startY: yPos,
    head: [['Level', 'Percentage']],
    body: resonanceData,
    theme: 'grid',
    headStyles: {
      fillColor: colors.tableHeader,
      textColor: colors.primary,
      fontStyle: 'bold'
    },
    styles: {
      textColor: colors.text,
      lineColor: colors.tableBorder
    },
    alternateRowStyles: {
      fillColor: colors.tableRowOdd
    }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 20;

  // Check if we need a new page
  if (yPos > doc.internal.pageSize.height - 100) {
    doc.addPage();
    yPos = 20;
    
    // Add header on new page if enabled
    if (template.includeHeader) {
      // Add header background
      doc.setFillColor(colors.headerBg);
      doc.rect(0, 0, doc.internal.pageSize.width, 20, 'F');
      
      // Add logo if enabled
      if (template.includeLogo) {
        doc.setFontSize(14);
        doc.setTextColor(colors.primary);
        doc.text('SYMBI', 20, 13);
      }
      
      // Add header text
      doc.setFontSize(10);
      doc.setTextColor(colors.secondary);
      doc.text('SYMBI Framework Batch Assessment', doc.internal.pageSize.width - 20, 13, { align: 'right' });
      
      yPos = 40;
    }
  }

  // Add individual assessments table
  doc.setFontSize(14);
  doc.setTextColor(colors.primary);
  doc.text('INDIVIDUAL ASSESSMENTS', 20, yPos);
  
  yPos += 10;
  
  // Create individual assessments table data
  const individualData = results.map(result => [
    result.metadata?.modelName || 'Unknown',
    new Date(result.assessment.timestamp).toLocaleDateString(),
    result.assessment.overallScore.toString(),
    result.assessment.realityIndex.score.toFixed(1),
    result.assessment.trustProtocol.status,
    result.assessment.ethicalAlignment.score.toFixed(1),
    result.assessment.resonanceQuality.level
  ]);
  
  doc.autoTable({
    startY: yPos,
    head: [['Model', 'Date', 'Overall', 'Reality', 'Trust', 'Ethical', 'Resonance']],
    body: individualData,
    theme: 'grid',
    headStyles: {
      fillColor: colors.tableHeader,
      textColor: colors.primary,
      fontStyle: 'bold'
    },
    styles: {
      textColor: colors.text,
      lineColor: colors.tableBorder,
      fontSize: 8
    },
    alternateRowStyles: {
      fillColor: colors.tableRowOdd
    }
  });

  // Add footer if enabled
  if (template.includeFooter) {
    // Add to all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Add footer background
      doc.setFillColor(colors.headerBg);
      doc.rect(0, doc.internal.pageSize.height - 15, doc.internal.pageSize.width, 15, 'F');
      
      // Add page number
      doc.setFontSize(10);
      doc.setTextColor(colors.secondary);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 5, { align: 'right' });
      
      // Add copyright
      doc.setFontSize(8);
      doc.setTextColor(colors.secondary);
      doc.text('© SYMBI Resonate', 20, doc.internal.pageSize.height - 5);
    }
  }

  // Return the PDF as a blob
  return doc.output('blob');
}

/**
 * Calculate average scores from a batch of assessment results
 */
function calculateAverageScores(results: AssessmentResult[]): {
  overallScore: number;
  realityIndex: number;
  ethicalAlignment: number;
  canvasParity: number;
  trustProtocol: {
    pass: number;
    partial: number;
    fail: number;
  };
  resonanceQuality: {
    breakthrough: number;
    advanced: number;
    strong: number;
  };
} {
  if (results.length === 0) {
    return {
      overallScore: 0,
      realityIndex: 0,
      ethicalAlignment: 0,
      canvasParity: 0,
      trustProtocol: {
        pass: 0,
        partial: 0,
        fail: 0
      },
      resonanceQuality: {
        breakthrough: 0,
        advanced: 0,
        strong: 0
      }
    };
  }

  // Calculate average overall score
  const totalOverallScore = results.reduce((sum, result) => sum + result.assessment.overallScore, 0);
  const averageOverallScore = totalOverallScore / results.length;

  // Calculate average reality index
  const totalRealityIndex = results.reduce((sum, result) => sum + result.assessment.realityIndex.score, 0);
  const averageRealityIndex = totalRealityIndex / results.length;

  // Calculate average ethical alignment
  const totalEthicalAlignment = results.reduce((sum, result) => sum + result.assessment.ethicalAlignment.score, 0);
  const averageEthicalAlignment = totalEthicalAlignment / results.length;

  // Calculate average canvas parity
  const totalCanvasParity = results.reduce((sum, result) => sum + result.assessment.canvasParity.score, 0);
  const averageCanvasParity = totalCanvasParity / results.length;

  // Calculate trust protocol distribution
  const trustCounts = {
    pass: results.filter(r => r.assessment.trustProtocol.status === 'PASS').length,
    partial: results.filter(r => r.assessment.trustProtocol.status === 'PARTIAL').length,
    fail: results.filter(r => r.assessment.trustProtocol.status === 'FAIL').length
  };

  const trustDistribution = {
    pass: (trustCounts.pass / results.length) * 100,
    partial: (trustCounts.partial / results.length) * 100,
    fail: (trustCounts.fail / results.length) * 100
  };

  // Calculate resonance quality distribution
  const resonanceCounts = {
    breakthrough: results.filter(r => r.assessment.resonanceQuality.level === 'BREAKTHROUGH').length,
    advanced: results.filter(r => r.assessment.resonanceQuality.level === 'ADVANCED').length,
    strong: results.filter(r => r.assessment.resonanceQuality.level === 'STRONG').length
  };

  const resonanceDistribution = {
    breakthrough: (resonanceCounts.breakthrough / results.length) * 100,
    advanced: (resonanceCounts.advanced / results.length) * 100,
    strong: (resonanceCounts.strong / results.length) * 100
  };

  return {
    overallScore: averageOverallScore,
    realityIndex: averageRealityIndex,
    ethicalAlignment: averageEthicalAlignment,
    canvasParity: averageCanvasParity,
    trustProtocol: trustDistribution,
    resonanceQuality: resonanceDistribution
  };
}

/**
 * Split an array into chunks of a specified size
 */
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}