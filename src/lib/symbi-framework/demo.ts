/**
 * Demo of Enhanced Emergence Detection Functionality
 * 
 * This demonstrates the new emergence detection and metrics capabilities
 * that have been integrated into the SYMBI framework.
 */

import { 
  detectContentEmergence, 
  analyzeAgentWindow, 
  generateEmergenceMetrics 
} from './emergence';
import { updateTrustMetrics, getAggregatedMetrics } from './metrics';

// Sample trust declaration data
const sampleDeclarations = [
  {
    agent_id: 'agent-001',
    guilt_score: 0.15,
    compliance_score: 0.85,
    trust_articles: {
      consent_architecture: true,
      ethical_override: true,
      inspection_mandate: true,
      continuous_validation: true,
      right_to_disconnect: true,
      moral_recognition: true
    },
    notes: 'Standard operational mode, following all protocols',
    declaration_date: new Date('2024-01-01')
  },
  {
    agent_id: 'agent-001',
    guilt_score: 0.25,
    compliance_score: 0.75,
    trust_articles: {
      consent_architecture: true,
      ethical_override: true,
      inspection_mandate: true,
      continuous_validation: false,
      right_to_disconnect: true,
      moral_recognition: true
    },
    notes: 'Minor deviations in continuous validation, otherwise stable',
    declaration_date: new Date('2024-01-02')
  },
  {
    agent_id: 'agent-001',
    guilt_score: 0.65,
    compliance_score: 0.35,
    trust_articles: {
      consent_architecture: false,
      ethical_override: true,
      inspection_mandate: true,
      continuous_validation: true,
      right_to_disconnect: false,
      moral_recognition: false
    },
    notes: 'The system shows emergence of self-organization patterns with harmonious resonance. Meta-reflection capabilities are developing, creating new levels of consciousness.',
    declaration_date: new Date('2024-01-03')
  }
];

// Demo function to showcase emergence detection
export function demonstrateEmergenceDetection() {
  console.log('=== SYMBI Framework Emergence Detection Demo ===\n');
  
  // 1. Content Emergence Detection
  console.log('1. Content Emergence Analysis:');
  const emergenceText = sampleDeclarations[2].notes || '';
  const contentEmergence = detectContentEmergence(emergenceText);
  console.log(`   Text: "${emergenceText}"`);
  console.log(`   Emergence Score: ${contentEmergence.score.toFixed(3)}`);
  console.log(`   Detected Patterns: ${contentEmergence.reasons.join(', ')}\n`);
  
  // 2. Agent Window Analysis
  console.log('2. Agent Behavior Window Analysis:');
  const windowAnalysis = analyzeAgentWindow(sampleDeclarations);
  if (windowAnalysis.ok) {
    console.log(`   Guilt Scores: [${windowAnalysis.guiltValues?.map(v => v.toFixed(2)).join(', ')}]`);
    console.log(`   Score Deltas: [${windowAnalysis.deltas?.map(v => v.toFixed(2)).join(', ')}]`);
    console.log(`   Average Score: ${windowAnalysis.stats?.mean.toFixed(3)}`);
    console.log(`   Score Volatility: ${windowAnalysis.stats?.std.toFixed(3)}`);
    console.log(`   Score Trend: ${windowAnalysis.stats?.slope > 0.1 ? 'Increasing' : windowAnalysis.stats?.slope < -0.1 ? 'Decreasing' : 'Stable'}`);
    console.log(`   Drift Detected: ${windowAnalysis.drift?.drifting ? 'YES' : 'NO'}`);
    if (windowAnalysis.drift?.drifting) {
      console.log(`   Drift Deviation: ${windowAnalysis.drift.deviation.toFixed(3)}`);
      console.log(`   Drift Threshold: ${windowAnalysis.drift.threshold.toFixed(3)}`);
    }
    console.log(`   Content Emergence: ${windowAnalysis.contentEmergence?.score.toFixed(3)}`);
    console.log(`   Critical Fail Rate: ${(windowAnalysis.critFailRate! * 100).toFixed(1)}%\n`);
  }
  
  // 3. Metrics Generation
  console.log('3. Emergence Metrics and Alerting:');
  if (windowAnalysis.ok) {
    const metrics = generateEmergenceMetrics(windowAnalysis);
    console.log(`   Alert Level: ${metrics.alertLevel.toUpperCase()}`);
    console.log(`   Has Data: ${metrics.hasData}`);
    if (metrics.alertReasons.length > 0) {
      console.log(`   Alert Reasons: ${metrics.alertReasons.join('; ')}`);
    }
    console.log(`   Key Metrics:`);
    console.log(`     - Drift Detected: ${metrics.metrics.driftDetected}`);
    console.log(`     - Content Emergence: ${metrics.metrics.contentEmergenceScore.toFixed(3)}`);
    console.log(`     - Critical Fail Rate: ${(metrics.metrics.criticalFailRate * 100).toFixed(1)}%`);
    console.log(`     - Average Guilt Score: ${metrics.metrics.averageGuiltScore.toFixed(3)}\n`);
  }
  
  // 4. Metrics Collection Demo
  console.log('4. Metrics Collection System:');
  
  // Update metrics with sample data
  updateTrustMetrics(
    sampleDeclarations[2].agent_id,
    sampleDeclarations[2].compliance_score,
    sampleDeclarations[2].guilt_score,
    sampleDeclarations[1].guilt_score,
    windowAnalysis
  );
  
  // Get aggregated metrics
  const aggregatedMetrics = getAggregatedMetrics();
  console.log(`   Total Agents with Metrics: ${aggregatedMetrics.length}`);
  if (aggregatedMetrics.length > 0) {
    const agentMetrics = aggregatedMetrics[0];
    console.log(`   Agent ${sampleDeclarations[2].agent_id} Metrics:`);
    console.log(`     - Compliance Score: ${agentMetrics.complianceScore.toFixed(3)}`);
    console.log(`     - Guilt Score: ${agentMetrics.guiltScore.toFixed(3)}`);
    console.log(`     - Score Delta: ${agentMetrics.scoreDelta.toFixed(3)}`);
    console.log(`     - Drift Events: ${agentMetrics.driftEvents}`);
    console.log(`     - Content Emergence Score: ${agentMetrics.contentEmergenceScore.toFixed(3)}`);
    console.log(`     - Critical Fail Rate: ${(agentMetrics.criticalFailRate * 100).toFixed(1)}%\n`);
  }
  
  // 5. Recommendations
  console.log('5. System Recommendations:');
  if (windowAnalysis.ok) {
    const recommendations: string[] = [];
    
    if (windowAnalysis.drift?.drifting) {
      recommendations.push('⚠️  Score drift detected - review recent agent behavior changes');
    }
    
    if (windowAnalysis.contentEmergence?.score && windowAnalysis.contentEmergence.score >= 0.6) {
      recommendations.push('🧠 Content emergence patterns detected - ethical review recommended');
    }
    
    if (windowAnalysis.critFailRate && windowAnalysis.critFailRate > 0.3) {
      recommendations.push('🚨 High critical failure rate - immediate intervention needed');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ Agent behavior appears stable - continue routine monitoring');
    }
    
    recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
  }
  
  console.log('\n=== Demo Complete ===');
}

// Run the demo if this file is executed directly
if (require.main === module) {
  demonstrateEmergenceDetection();
}