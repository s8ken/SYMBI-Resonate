/**
 * Export Service
 * Handles exporting experiment data in various formats
 */

import { UnifiedExperiment } from '../integration/unified-data-service';

export type ExportFormat = 'json' | 'csv' | 'pdf';

export class ExportService {
  /**
   * Export experiment data in specified format
   */
  static async exportExperiment(
    experiment: UnifiedExperiment,
    format: ExportFormat
  ): Promise<Blob> {
    switch (format) {
      case 'json':
        return this.exportJSON(experiment);
      case 'csv':
        return this.exportCSV(experiment);
      case 'pdf':
        return this.exportPDF(experiment);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Export as JSON
   */
  private static exportJSON(experiment: UnifiedExperiment): Blob {
    const json = JSON.stringify(experiment, null, 2);
    return new Blob([json], { type: 'application/json' });
  }

  /**
   * Export as CSV
   */
  private static exportCSV(experiment: UnifiedExperiment): Blob {
    const headers = [
      'Experiment',
      'Variant',
      'Provider',
      'Model',
      'Trial Count',
      'Avg Score',
      'Coherence',
      'Accuracy',
      'Creativity',
      'Helpfulness',
      'Avg Response Time (ms)',
      'Total Cost ($)',
      'Success Rate (%)',
    ];

    const rows = [headers];

    experiment.variants.forEach((variant) => {
      rows.push([
        experiment.name,
        variant.name,
        variant.provider,
        variant.model,
        variant.performance.trialCount.toString(),
        variant.performance.avgScore.toFixed(2),
        variant.performance.scores.coherence.toFixed(2),
        variant.performance.scores.accuracy.toFixed(2),
        variant.performance.scores.creativity.toFixed(2),
        variant.performance.scores.helpfulness.toFixed(2),
        variant.performance.avgResponseTime.toFixed(0),
        variant.performance.totalCost.toFixed(2),
        variant.performance.successRate.toFixed(1),
      ]);
    });

    const csv = rows.map((row) => row.join(',')).join('\n');
    return new Blob([csv], { type: 'text/csv' });
  }

  /**
   * Export as PDF (simplified - would use a library like jsPDF in production)
   */
  private static exportPDF(experiment: UnifiedExperiment): Blob {
    // This is a placeholder - in production, use jsPDF or similar
    const html = this.generatePDFHTML(experiment);
    return new Blob([html], { type: 'text/html' });
  }

  /**
   * Generate HTML for PDF export
   */
  private static generatePDFHTML(experiment: UnifiedExperiment): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${experiment.name} - Experiment Report</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px;
      color: #1a1a1a;
    }
    h1 { font-size: 32px; margin-bottom: 8px; }
    h2 { font-size: 24px; margin-top: 32px; margin-bottom: 16px; }
    h3 { font-size: 18px; margin-top: 24px; margin-bottom: 12px; }
    .meta { color: #666; font-size: 14px; margin-bottom: 24px; }
    .summary { 
      display: grid; 
      grid-template-columns: repeat(4, 1fr); 
      gap: 16px; 
      margin: 24px 0; 
    }
    .metric {
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }
    .metric-label { font-size: 12px; color: #666; margin-bottom: 4px; }
    .metric-value { font-size: 24px; font-weight: bold; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e5e5;
    }
    th {
      background: #f5f5f5;
      font-weight: 600;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      background: #e0f2fe;
      color: #0369a1;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }
    .footer {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #e5e5e5;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <h1>${experiment.name}</h1>
  <div class="meta">
    <p>${experiment.description || 'No description provided'}</p>
    <p>Status: <span class="badge">${experiment.status}</span></p>
    <p>Created: ${new Date(experiment.createdAt).toLocaleDateString()}</p>
    ${experiment.completedAt ? `<p>Completed: ${new Date(experiment.completedAt).toLocaleDateString()}</p>` : ''}
  </div>

  <h2>Summary</h2>
  <div class="summary">
    <div class="metric">
      <div class="metric-label">Total Trials</div>
      <div class="metric-value">${experiment.analytics.totalTrials}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Avg Score</div>
      <div class="metric-value">${experiment.analytics.avgScore.toFixed(1)}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Total Cost</div>
      <div class="metric-value">$${experiment.analytics.totalCost.toFixed(2)}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Success Rate</div>
      <div class="metric-value">${experiment.analytics.successRate.toFixed(1)}%</div>
    </div>
  </div>

  <h2>Variant Performance</h2>
  <table>
    <thead>
      <tr>
        <th>Variant</th>
        <th>Model</th>
        <th>Trials</th>
        <th>Avg Score</th>
        <th>Response Time</th>
        <th>Cost</th>
        <th>Success Rate</th>
      </tr>
    </thead>
    <tbody>
      ${experiment.variants
        .map(
          (v) => `
        <tr>
          <td>${v.name}</td>
          <td>${v.provider} - ${v.model}</td>
          <td>${v.performance.trialCount}</td>
          <td>${v.performance.avgScore.toFixed(1)}</td>
          <td>${v.performance.avgResponseTime.toFixed(0)}ms</td>
          <td>$${v.performance.totalCost.toFixed(2)}</td>
          <td>${v.performance.successRate.toFixed(1)}%</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <h2>Detailed Scores</h2>
  <table>
    <thead>
      <tr>
        <th>Variant</th>
        <th>Coherence</th>
        <th>Accuracy</th>
        <th>Creativity</th>
        <th>Helpfulness</th>
        <th>Overall</th>
      </tr>
    </thead>
    <tbody>
      ${experiment.variants
        .map(
          (v) => `
        <tr>
          <td>${v.name}</td>
          <td>${v.performance.scores.coherence.toFixed(1)}</td>
          <td>${v.performance.scores.accuracy.toFixed(1)}</td>
          <td>${v.performance.scores.creativity.toFixed(1)}</td>
          <td>${v.performance.scores.helpfulness.toFixed(1)}</td>
          <td><strong>${v.performance.scores.overall.toFixed(1)}</strong></td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  ${
    experiment.symbiScores
      ? `
  <h2>SYMBI Framework Analysis</h2>
  <table>
    <thead>
      <tr>
        <th>Dimension</th>
        <th>Score</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Self-Organization</td>
        <td>${experiment.symbiScores.selfOrganization.toFixed(1)}</td>
      </tr>
      <tr>
        <td>Meta-Reflection</td>
        <td>${experiment.symbiScores.metaReflection.toFixed(1)}</td>
      </tr>
      <tr>
        <td>Boundary Awareness</td>
        <td>${experiment.symbiScores.boundaryAwareness.toFixed(1)}</td>
      </tr>
      <tr>
        <td>Integration</td>
        <td>${experiment.symbiScores.integration.toFixed(1)}</td>
      </tr>
      <tr>
        <td><strong>Overall</strong></td>
        <td><strong>${experiment.symbiScores.overall.toFixed(1)}</strong></td>
      </tr>
    </tbody>
  </table>
  `
      : ''
  }

  <div class="footer">
    <p>Generated by SYMBI Resonate on ${new Date().toLocaleString()}</p>
    <p>© 2024 SYMBI AI Analytics Platform</p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Download file to user's computer
   */
  static downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Get appropriate filename for export
   */
  static getFilename(experimentName: string, format: ExportFormat): string {
    const sanitized = experimentName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().split('T')[0];
    return `${sanitized}_${timestamp}.${format}`;
  }
}