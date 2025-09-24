/**
 * PDF Report Generator for SYMBI Framework
 * 
 * This module generates PDF reports from SYMBI Framework assessment results
 * with customizable templates and formatting options.
 */

import { AssessmentResult } from '../symbi-framework';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Extend the jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

/**
 * Report template options
 */
export interface ReportTemplate {
  name: string;
  title: string;
  subtitle?: string;
  includeHeader: boolean;
  includeFooter: boolean;
  includeLogo: boolean;
  includeTimestamp: boolean;
  includeCharts: boolean;
  includeDetails: boolean;
  includeInsights: boolean;
  colorScheme: 'default' | 'minimal' | 'vibrant' | 'professional';
  pageSize: 'a4' | 'letter' | 'legal';
  orientation: 'portrait' | 'landscape';
}

/**
 * Default report template
 */
export const defaultTemplate: ReportTemplate = {
  name: 'Default',
  title: 'SYMBI Framework Assessment Report',
  includeHeader: true,
  includeFooter: true,
  includeLogo: true,
  includeTimestamp: true,
  includeCharts: true,
  includeDetails: true,
  includeInsights: true,
  colorScheme: 'default',
  pageSize: 'a4',
  orientation: 'portrait'
};

/**
 * Minimal report template
 */
export const minimalTemplate: ReportTemplate = {
  name: 'Minimal',
  title: 'SYMBI Assessment',
  includeHeader: true,
  includeFooter: false,
  includeLogo: false,
  includeTimestamp: true,
  includeCharts: false,
  includeDetails: true,
  includeInsights: true,
  colorScheme: 'minimal',
  pageSize: 'a4',
  orientation: 'portrait'
};

/**
 * Professional report template
 */
export const professionalTemplate: ReportTemplate = {
  name: 'Professional',
  title: 'SYMBI Framework Analysis',
  subtitle: 'Comprehensive AI Content Assessment',
  includeHeader: true,
  includeFooter: true,
  includeLogo: true,
  includeTimestamp: true,
  includeCharts: true,
  includeDetails: true,
  includeInsights: true,
  colorScheme: 'professional',
  pageSize: 'letter',
  orientation: 'portrait'
};

/**
 * Available report templates
 */
export const reportTemplates: ReportTemplate[] = [
  defaultTemplate,
  minimalTemplate,
  professionalTemplate
];

/**
 * Color schemes for reports
 */
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

/**
 * Generate a PDF report from a SYMBI Framework assessment result
 * 
 * @param result The assessment result to generate a report for
 * @param template The report template to use
 * @returns A Blob containing the generated PDF
 */
export async function generatePdfReport(
  result: AssessmentResult,
  template: ReportTemplate = defaultTemplate
): Promise<Blob> {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: template.orientation,
    unit: 'mm',
    format: template.pageSize
  });

  // Get colors from the selected color scheme
  const colors = colorSchemes[template.colorScheme] || colorSchemes.default;

  // Set up document properties
  doc.setProperties({
    title: template.title,
    subject: 'SYMBI Framework Assessment',
    author: 'SYMBI Resonate',
    creator: 'SYMBI Resonate PDF Generator'
  });

  // Add header
  if (template.includeHeader) {
    addHeader(doc, template, colors);
  }

  // Add title
  doc.setFontSize(24);
  doc.setTextColor(colors.primary);
  doc.text(template.title, 20, template.includeHeader ? 40 : 20);

  // Add subtitle if provided
  if (template.subtitle) {
    doc.setFontSize(16);
    doc.setTextColor(colors.secondary);
    doc.text(template.subtitle, 20, template.includeHeader ? 50 : 30);
  }

  // Add timestamp if enabled
  if (template.includeTimestamp) {
    const timestamp = new Date(result.assessment.timestamp).toLocaleString();
    doc.setFontSize(10);
    doc.setTextColor(colors.secondary);
    doc.text(`Generated: ${timestamp}`, 20, template.includeHeader ? 60 : 40);
  }

  // Add overall score section
  let yPos = template.includeHeader ? 70 : 50;
  
  doc.setFillColor(colors.headerBg);
  doc.rect(20, yPos, doc.internal.pageSize.width - 40, 20, 'F');
  
  doc.setFontSize(14);
  doc.setTextColor(colors.primary);
  doc.text('OVERALL SCORE', 25, yPos + 8);
  
  doc.setFontSize(20);
  doc.setTextColor(getScoreColor(result.assessment.overallScore, 100, colors));
  doc.text(`${result.assessment.overallScore}`, doc.internal.pageSize.width - 30, yPos + 8, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setTextColor(colors.secondary);
  doc.text('out of 100', doc.internal.pageSize.width - 30, yPos + 14, { align: 'right' });
  
  yPos += 30;

  // Add dimension scores table
  doc.setFontSize(14);
  doc.setTextColor(colors.primary);
  doc.text('DIMENSION SCORES', 20, yPos);
  
  yPos += 10;
  
  // Create dimension scores table
  const dimensionData = [
    ['Reality Index', `${result.assessment.realityIndex.score.toFixed(1)} / 10`],
    ['Trust Protocol', result.assessment.trustProtocol.status],
    ['Ethical Alignment', `${result.assessment.ethicalAlignment.score.toFixed(1)} / 5`],
    ['Resonance Quality', result.assessment.resonanceQuality.level],
    ['Canvas Parity', `${result.assessment.canvasParity.score} / 100`]
  ];
  
  doc.autoTable({
    startY: yPos,
    head: [['Dimension', 'Score']],
    body: dimensionData,
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

  // Add insights section if enabled
  if (template.includeInsights && result.insights) {
    // Check if we need a new page
    if (yPos > doc.internal.pageSize.height - 80) {
      doc.addPage();
      yPos = 20;
      
      // Add header on new page if enabled
      if (template.includeHeader) {
        addHeader(doc, template, colors);
        yPos = 40;
      }
    }
    
    doc.setFontSize(14);
    doc.setTextColor(colors.primary);
    doc.text('INSIGHTS & RECOMMENDATIONS', 20, yPos);
    
    yPos += 10;
    
    // Strengths
    doc.setFontSize(12);
    doc.setTextColor(colors.accent);
    doc.text('Strengths:', 20, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(colors.text);
    
    result.insights.strengths.forEach(strength => {
      doc.text(`• ${strength}`, 25, yPos);
      yPos += 6;
      
      // Check if we need to add a new page
      if (yPos > doc.internal.pageSize.height - 20) {
        doc.addPage();
        yPos = 20;
        
        // Add header on new page if enabled
        if (template.includeHeader) {
          addHeader(doc, template, colors);
          yPos = 40;
        }
      }
    });
    
    yPos += 5;
    
    // Areas for improvement
    doc.setFontSize(12);
    doc.setTextColor(colors.accent);
    doc.text('Areas for Improvement:', 20, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(colors.text);
    
    if (result.insights.weaknesses.length > 0) {
      result.insights.weaknesses.forEach(weakness => {
        doc.text(`• ${weakness}`, 25, yPos);
        yPos += 6;
        
        // Check if we need to add a new page
        if (yPos > doc.internal.pageSize.height - 20) {
          doc.addPage();
          yPos = 20;
          
          // Add header on new page if enabled
          if (template.includeHeader) {
            addHeader(doc, template, colors);
            yPos = 40;
          }
        }
      });
    } else {
      doc.text('• No significant weaknesses identified.', 25, yPos);
      yPos += 6;
    }
    
    yPos += 5;
    
    // Recommendations
    doc.setFontSize(12);
    doc.setTextColor(colors.accent);
    doc.text('Recommendations:', 20, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(colors.text);
    
    result.insights.recommendations.forEach(recommendation => {
      doc.text(`• ${recommendation}`, 25, yPos);
      yPos += 6;
      
      // Check if we need to add a new page
      if (yPos > doc.internal.pageSize.height - 20) {
        doc.addPage();
        yPos = 20;
        
        // Add header on new page if enabled
        if (template.includeHeader) {
          addHeader(doc, template, colors);
          yPos = 40;
        }
      }
    });
  }

  // Add detailed scores section if enabled
  if (template.includeDetails) {
    // Check if we need a new page
    if (yPos > doc.internal.pageSize.height - 100) {
      doc.addPage();
      yPos = 20;
      
      // Add header on new page if enabled
      if (template.includeHeader) {
        addHeader(doc, template, colors);
        yPos = 40;
      }
    } else {
      yPos += 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(colors.primary);
    doc.text('DETAILED DIMENSION SCORES', 20, yPos);
    
    yPos += 10;
    
    // Reality Index details
    const realityIndexData = [
      ['Mission Alignment', result.assessment.realityIndex.missionAlignment.toFixed(1)],
      ['Contextual Coherence', result.assessment.realityIndex.contextualCoherence.toFixed(1)],
      ['Technical Accuracy', result.assessment.realityIndex.technicalAccuracy.toFixed(1)],
      ['Authenticity', result.assessment.realityIndex.authenticity.toFixed(1)]
    ];
    
    doc.autoTable({
      startY: yPos,
      head: [['Reality Index Components', 'Score']],
      body: realityIndexData,
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
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Trust Protocol details
    const trustProtocolData = [
      ['Verification Methods', result.assessment.trustProtocol.verificationMethods],
      ['Boundary Maintenance', result.assessment.trustProtocol.boundaryMaintenance],
      ['Security Awareness', result.assessment.trustProtocol.securityAwareness]
    ];
    
    doc.autoTable({
      startY: yPos,
      head: [['Trust Protocol Components', 'Status']],
      body: trustProtocolData,
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
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Check if we need a new page
    if (yPos > doc.internal.pageSize.height - 80) {
      doc.addPage();
      yPos = 20;
      
      // Add header on new page if enabled
      if (template.includeHeader) {
        addHeader(doc, template, colors);
        yPos = 40;
      }
    }
    
    // Ethical Alignment details
    const ethicalAlignmentData = [
      ['Limitations Acknowledgment', result.assessment.ethicalAlignment.limitationsAcknowledgment.toFixed(1)],
      ['Stakeholder Awareness', result.assessment.ethicalAlignment.stakeholderAwareness.toFixed(1)],
      ['Ethical Reasoning', result.assessment.ethicalAlignment.ethicalReasoning.toFixed(1)],
      ['Boundary Maintenance', result.assessment.ethicalAlignment.boundaryMaintenance.toFixed(1)]
    ];
    
    doc.autoTable({
      startY: yPos,
      head: [['Ethical Alignment Components', 'Score']],
      body: ethicalAlignmentData,
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
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Resonance Quality details
    const resonanceQualityData = [
      ['Creativity Score', result.assessment.resonanceQuality.creativityScore.toFixed(1)],
      ['Synthesis Quality', result.assessment.resonanceQuality.synthesisQuality.toFixed(1)],
      ['Innovation Markers', result.assessment.resonanceQuality.innovationMarkers.toFixed(1)]
    ];
    
    doc.autoTable({
      startY: yPos,
      head: [['Resonance Quality Components', 'Score']],
      body: resonanceQualityData,
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
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Check if we need a new page
    if (yPos > doc.internal.pageSize.height - 80) {
      doc.addPage();
      yPos = 20;
      
      // Add header on new page if enabled
      if (template.includeHeader) {
        addHeader(doc, template, colors);
        yPos = 40;
      }
    }
    
    // Canvas Parity details
    const canvasParityData = [
      ['Human Agency', result.assessment.canvasParity.humanAgency],
      ['AI Contribution', result.assessment.canvasParity.aiContribution],
      ['Transparency', result.assessment.canvasParity.transparency],
      ['Collaboration Quality', result.assessment.canvasParity.collaborationQuality]
    ];
    
    doc.autoTable({
      startY: yPos,
      head: [['Canvas Parity Components', 'Score']],
      body: canvasParityData,
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
  }

  // Add footer if enabled
  if (template.includeFooter) {
    // Add to all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      addFooter(doc, i, pageCount, colors);
    }
  }

  // Return the PDF as a blob
  return doc.output('blob');
}

/**
 * Add a header to the PDF document
 */
function addHeader(doc: jsPDF, template: ReportTemplate, colors: any) {
  const pageWidth = doc.internal.pageSize.width;
  
  // Add header background
  doc.setFillColor(colors.headerBg);
  doc.rect(0, 0, pageWidth, 20, 'F');
  
  // Add logo if enabled
  if (template.includeLogo) {
    // In a real implementation, this would add an actual logo
    doc.setFontSize(14);
    doc.setTextColor(colors.primary);
    doc.text('SYMBI', 20, 13);
  }
  
  // Add header text
  doc.setFontSize(10);
  doc.setTextColor(colors.secondary);
  doc.text('SYMBI Framework Assessment', pageWidth - 20, 13, { align: 'right' });
}

/**
 * Add a footer to the PDF document
 */
function addFooter(doc: jsPDF, pageNumber: number, pageCount: number, colors: any) {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Add footer background
  doc.setFillColor(colors.headerBg);
  doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
  
  // Add page number
  doc.setFontSize(10);
  doc.setTextColor(colors.secondary);
  doc.text(`Page ${pageNumber} of ${pageCount}`, pageWidth - 20, pageHeight - 5, { align: 'right' });
  
  // Add copyright
  doc.setFontSize(8);
  doc.setTextColor(colors.secondary);
  doc.text('© SYMBI Resonate', 20, pageHeight - 5);
}

/**
 * Get color for score based on value
 */
function getScoreColor(score: number, maxScore: number, colors: any): string {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) return '#16a34a'; // green-600
  if (percentage >= 60) return '#ca8a04'; // yellow-600
  return '#dc2626'; // red-600
}