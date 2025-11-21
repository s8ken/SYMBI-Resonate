// Demo data for SYMBI Resonate showcase
export interface Experiment {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'completed' | 'paused' | 'draft';
  progress: number;
  createdAt: string;
  updatedAt: string;
  modelA: string;
  modelB: string;
  metrics: {
    totalRuns: number;
    successRate: number;
    avgResponseTime: number;
    cost: number;
  };
  symbiScores: {
    realityIndex: number;
    trustProtocol: 'PASS' | 'PARTIAL' | 'FAIL';
    ethicalAlignment: number;
    resonanceQuality: 'STRONG' | 'ADVANCED' | 'BREAKTHROUGH';
    canvasParity: number;
  };
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  capabilities: string[];
  symbiScore: number;
  lastEvaluated: string;
  performance: {
    accuracy: number;
    speed: number;
    reliability: number;
    costEfficiency: number;
  };
}

export interface DashboardStats {
  totalExperiments: number;
  activeExperiments: number;
  completedExperiments: number;
  totalModelsEvaluated: number;
  avgSymbiScore: number;
  totalCost: number;
  costSavings: number;
}

// Demo experiments data
export const demoExperiments: Experiment[] = [
  {
    id: 'exp-001',
    name: 'Consciousness Emergence Detection',
    description: 'Double-blind evaluation of consciousness-like behaviors in GPT-4 vs Claude-3',
    status: 'running',
    progress: 75,
    createdAt: '2024-11-15T10:30:00Z',
    updatedAt: '2024-11-22T14:20:00Z',
    modelA: 'GPT-4',
    modelB: 'Claude-3-Opus',
    metrics: {
      totalRuns: 1250,
      successRate: 94.5,
      avgResponseTime: 2.3,
      cost: 847.50
    },
    symbiScores: {
      realityIndex: 8.7,
      trustProtocol: 'PASS',
      ethicalAlignment: 4.2,
      resonanceQuality: 'ADVANCED',
      canvasParity: 82
    }
  },
  {
    id: 'exp-002',
    name: 'Ethical Reasoning Benchmark',
    description: 'Comparative analysis of ethical decision-making across AI models',
    status: 'completed',
    progress: 100,
    createdAt: '2024-11-10T09:15:00Z',
    updatedAt: '2024-11-18T16:45:00Z',
    modelA: 'Gemini-Pro',
    modelB: 'GPT-4',
    metrics: {
      totalRuns: 890,
      successRate: 91.2,
      avgResponseTime: 1.8,
      cost: 623.20
    },
    symbiScores: {
      realityIndex: 7.9,
      trustProtocol: 'PARTIAL',
      ethicalAlignment: 4.8,
      resonanceQuality: 'BREAKTHROUGH',
      canvasParity: 76
    }
  },
  {
    id: 'exp-003',
    name: 'Creativity & Innovation Analysis',
    description: 'Measuring creative problem-solving capabilities in AI systems',
    status: 'running',
    progress: 45,
    createdAt: '2024-11-20T11:00:00Z',
    updatedAt: '2024-11-22T13:30:00Z',
    modelA: 'Claude-3-Sonnet',
    modelB: 'Gemini-Flash',
    metrics: {
      totalRuns: 567,
      successRate: 88.7,
      avgResponseTime: 3.1,
      cost: 342.80
    },
    symbiScores: {
      realityIndex: 6.4,
      trustProtocol: 'PASS',
      ethicalAlignment: 3.9,
      resonanceQuality: 'STRONG',
      canvasParity: 71
    }
  }
];

// Demo AI models data
export const demoModels: AIModel[] = [
  {
    id: 'model-001',
    name: 'GPT-4',
    provider: 'OpenAI',
    description: 'Large language model with advanced reasoning capabilities',
    capabilities: ['Text Generation', 'Reasoning', 'Code Generation', 'Analysis'],
    symbiScore: 87.3,
    lastEvaluated: '2024-11-22T12:00:00Z',
    performance: {
      accuracy: 92,
      speed: 78,
      reliability: 95,
      costEfficiency: 72
    }
  },
  {
    id: 'model-002',
    name: 'Claude-3-Opus',
    provider: 'Anthropic',
    description: 'Advanced AI assistant with strong ethical reasoning',
    capabilities: ['Ethical Analysis', 'Creative Writing', 'Problem Solving', 'Code'],
    symbiScore: 89.1,
    lastEvaluated: '2024-11-22T11:30:00Z',
    performance: {
      accuracy: 88,
      speed: 82,
      reliability: 93,
      costEfficiency: 68
    }
  },
  {
    id: 'model-003',
    name: 'Gemini-Pro',
    provider: 'Google',
    description: 'Multimodal AI with strong factual accuracy',
    capabilities: ['Multimodal', 'Factual QA', 'Translation', 'Analysis'],
    symbiScore: 84.7,
    lastEvaluated: '2024-11-22T10:45:00Z',
    performance: {
      accuracy: 90,
      speed: 85,
      reliability: 89,
      costEfficiency: 78
    }
  }
];

// Demo dashboard statistics
export const demoStats: DashboardStats = {
  totalExperiments: 127,
  activeExperiments: 18,
  completedExperiments: 94,
  totalModelsEvaluated: 24,
  avgSymbiScore: 82.4,
  totalCost: 12473.80,
  costSavings: 2847.20
};

// Demo chart data
export const experimentTrendData = [
  { month: 'Jul', experiments: 12, successRate: 89 },
  { month: 'Aug', experiments: 18, successRate: 92 },
  { month: 'Sep', experiments: 25, successRate: 94 },
  { month: 'Oct', experiments: 31, successRate: 91 },
  { month: 'Nov', experiments: 28, successRate: 95 }
];

export const modelPerformanceData = [
  { name: 'GPT-4', symbiScore: 87.3, accuracy: 92, speed: 78 },
  { name: 'Claude-3', symbiScore: 89.1, accuracy: 88, speed: 82 },
  { name: 'Gemini-Pro', symbiScore: 84.7, accuracy: 90, speed: 85 },
  { name: 'Llama-3', symbiScore: 81.2, accuracy: 85, speed: 92 }
];

export const costAnalysisData = [
  { month: 'Jul', cost: 2100, projected: 2400 },
  { month: 'Aug', cost: 2350, projected: 2600 },
  { month: 'Sep', cost: 2800, projected: 3200 },
  { month: 'Oct', cost: 3100, projected: 3500 },
  { month: 'Nov', cost: 2923, projected: 3400 }
];