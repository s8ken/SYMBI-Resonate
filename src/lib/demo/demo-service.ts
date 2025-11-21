import { demoExperiments, demoModels, demoStats, experimentTrendData, modelPerformanceData, costAnalysisData } from './demo-data';
import type { Experiment, AIModel, DashboardStats } from './demo-data';

// Demo service to simulate API calls
export class DemoService {
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Simulate API delay
  private async simulateDelay(min = 300, max = 800) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await this.delay(delay);
  }

  // Get all experiments
  async getExperiments(): Promise<Experiment[]> {
    await this.simulateDelay();
    return [...demoExperiments];
  }

  // Get single experiment
  async getExperiment(id: string): Promise<Experiment | null> {
    await this.simulateDelay();
    return demoExperiments.find(exp => exp.id === id) || null;
  }

  // Get all models
  async getModels(): Promise<AIModel[]> {
    await this.simulateDelay();
    return [...demoModels];
  }

  // Get single model
  async getModel(id: string): Promise<AIModel | null> {
    await this.simulateDelay();
    return demoModels.find(model => model.id === id) || null;
  }

  // Get dashboard stats
  async getDashboardStats(): Promise<DashboardStats> {
    await this.simulateDelay();
    return { ...demoStats };
  }

  // Get experiment trends
  async getExperimentTrends() {
    await this.simulateDelay();
    return [...experimentTrendData];
  }

  // Get model performance data
  async getModelPerformance() {
    await this.simulateDelay();
    return [...modelPerformanceData];
  }

  // Get cost analysis data
  async getCostAnalysis() {
    await this.simulateDelay();
    return [...costAnalysisData];
  }

  // Create new experiment
  async createExperiment(data: Partial<Experiment>): Promise<Experiment> {
    await this.simulateDelay(500, 1000);
    
    const newExperiment: Experiment = {
      id: `exp-${Date.now()}`,
      name: data.name || 'New Experiment',
      description: data.description || 'Experiment description',
      status: 'draft',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      modelA: data.modelA || 'GPT-4',
      modelB: data.modelB || 'Claude-3',
      metrics: {
        totalRuns: 0,
        successRate: 0,
        avgResponseTime: 0,
        cost: 0
      },
      symbiScores: {
        realityIndex: 0,
        trustProtocol: 'FAIL',
        ethicalAlignment: 0,
        resonanceQuality: 'STRONG',
        canvasParity: 0
      }
    };

    return newExperiment;
  }

  // Update experiment status
  async updateExperimentStatus(id: string, status: Experiment['status']): Promise<Experiment | null> {
    await this.simulateDelay(400, 800);
    
    const experiment = demoExperiments.find(exp => exp.id === id);
    if (experiment) {
      experiment.status = status;
      experiment.updatedAt = new Date().toISOString();
      
      // Simulate progress updates
      if (status === 'running' && experiment.progress < 100) {
        experiment.progress = Math.min(100, experiment.progress + Math.random() * 20);
      } else if (status === 'completed') {
        experiment.progress = 100;
      }
      
      return { ...experiment };
    }
    
    return null;
  }

  // Simulate real-time experiment progress
  async simulateExperimentProgress(id: string, callback: (experiment: Experiment) => void) {
    const interval = setInterval(async () => {
      const experiment = await this.getExperiment(id);
      if (experiment && experiment.status === 'running' && experiment.progress < 100) {
        experiment.progress = Math.min(100, experiment.progress + Math.random() * 5);
        experiment.metrics.totalRuns += Math.floor(Math.random() * 10);
        experiment.metrics.successRate = Math.min(100, experiment.metrics.successRate + Math.random() * 2);
        
        callback(experiment);
        
        if (experiment.progress >= 100) {
          experiment.status = 'completed';
          clearInterval(interval);
        }
      } else {
        clearInterval(interval);
      }
    }, 3000);
  }

  // Get SYMBI framework analysis
  async getSymbiAnalysis(content: string) {
    await this.simulateDelay(1000, 2000);
    
    // Simulate SYMBI framework analysis
    return {
      overallScore: Math.random() * 40 + 60, // 60-100
      realityIndex: Math.random() * 4 + 6, // 6-10
      trustProtocol: ['PASS', 'PARTIAL', 'FAIL'][Math.floor(Math.random() * 3)] as 'PASS' | 'PARTIAL' | 'FAIL',
      ethicalAlignment: Math.random() * 2 + 3, // 3-5
      resonanceQuality: ['STRONG', 'ADVANCED', 'BREAKTHROUGH'][Math.floor(Math.random() * 3)] as 'STRONG' | 'ADVANCED' | 'BREAKTHROUGH',
      canvasParity: Math.random() * 40 + 40, // 40-80
      insights: [
        'Strong mission alignment detected',
        'Excellent contextual coherence',
        'Good ethical reasoning framework',
        'Innovative problem-solving approach'
      ],
      recommendations: [
        'Consider expanding stakeholder analysis',
        'Add more verification methods',
        'Enhance transparency documentation'
      ]
    };
  }
}

// Singleton instance
export const demoService = new DemoService();