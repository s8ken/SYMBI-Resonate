import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Select } from '../ui/Input';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Clock,
  DollarSign,
  Filter,
  Download
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface ExperimentResult {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed';
  variants: VariantResult[];
  startedAt: string;
  completedAt?: string;
  totalCost: number;
  sampleSize: number;
}

interface VariantResult {
  id: string;
  name: string;
  provider: string;
  model: string;
  scores: {
    coherence: number;
    accuracy: number;
    creativity: number;
    helpfulness: number;
    overall: number;
  };
  avgResponseTime: number;
  cost: number;
  successRate: number;
}

interface ResultsOverviewProps {
  experiments: ExperimentResult[];
  onExperimentClick?: (id: string) => void;
}

export const ResultsOverview: React.FC<ResultsOverviewProps> = ({
  experiments,
  onExperimentClick,
}) => {
  const [selectedExperiment, setSelectedExperiment] = useState<string>(
    experiments[0]?.id || ''
  );
  const [sortBy, setSortBy] = useState<string>('overall');

  const experiment = experiments.find((e) => e.id === selectedExperiment);

  if (!experiment) {
    return (
      <Card>
        <CardContent>
          <p className="text-center text-neutral-600 dark:text-neutral-400 py-8">
            No experiments found
          </p>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for charts
  const variantComparisonData = experiment.variants.map((variant) => ({
    name: variant.name,
    coherence: variant.scores.coherence,
    accuracy: variant.scores.accuracy,
    creativity: variant.scores.creativity,
    helpfulness: variant.scores.helpfulness,
    overall: variant.scores.overall,
  }));

  const radarData = Object.keys(experiment.variants[0].scores)
    .filter((key) => key !== 'overall')
    .map((criterion) => {
      const dataPoint: any = { criterion: criterion.charAt(0).toUpperCase() + criterion.slice(1) };
      experiment.variants.forEach((variant) => {
        dataPoint[variant.name] = variant.scores[criterion as keyof typeof variant.scores];
      });
      return dataPoint;
    });

  const costComparisonData = experiment.variants.map((variant) => ({
    name: variant.name,
    cost: variant.cost,
    responseTime: variant.avgResponseTime,
  }));

  // Find best performer
  const sortedVariants = [...experiment.variants].sort(
    (a, b) => b.scores.overall - a.scores.overall
  );
  const bestVariant = sortedVariants[0];
  const improvement = sortedVariants.length > 1
    ? ((bestVariant.scores.overall - sortedVariants[1].scores.overall) / sortedVariants[1].scores.overall) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Experiment Results
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Compare variant performance and insights
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select
            value={selectedExperiment}
            onChange={(e) => setSelectedExperiment(e.target.value)}
            options={experiments.map((exp) => ({
              value: exp.id,
              label: exp.name,
            }))}
          />
          <Button variant="ghost" leftIcon={<Filter className="w-4 h-4" />}>
            Filter
          </Button>
          <Button variant="ghost" leftIcon={<Download className="w-4 h-4" />}>
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="elevated">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Best Performer
                </p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                  {bestVariant.name}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-success-600" />
                  <span className="text-sm text-success-600 font-medium">
                    +{improvement.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Avg Response Time
                </p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                  {(experiment.variants.reduce((sum, v) => sum + v.avgResponseTime, 0) / experiment.variants.length).toFixed(0)}ms
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                  Across all variants
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Total Cost
                </p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                  ${experiment.totalCost.toFixed(2)}
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                  {experiment.sampleSize} samples
                </p>
              </div>
              <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900/30 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-warning-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                  {(experiment.variants.reduce((sum, v) => sum + v.successRate, 0) / experiment.variants.length).toFixed(1)}%
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                  Average across variants
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/30 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-secondary-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Variant Comparison Chart */}
      <Card>
        <CardHeader
          title="Overall Performance Comparison"
          description="Compare variants across all evaluation criteria"
        />
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={variantComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="coherence" fill="#0ea5e9" name="Coherence" />
              <Bar dataKey="accuracy" fill="#a855f7" name="Accuracy" />
              <Bar dataKey="creativity" fill="#22c55e" name="Creativity" />
              <Bar dataKey="helpfulness" fill="#f59e0b" name="Helpfulness" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Multi-Dimensional Analysis"
            description="Radar view of all evaluation criteria"
          />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e5e5" />
                <PolarAngleAxis dataKey="criterion" />
                <PolarRadiusAxis domain={[0, 100]} />
                {experiment.variants.map((variant, index) => (
                  <Radar
                    key={variant.id}
                    name={variant.name}
                    dataKey={variant.name}
                    stroke={['#0ea5e9', '#a855f7', '#22c55e', '#f59e0b'][index % 4]}
                    fill={['#0ea5e9', '#a855f7', '#22c55e', '#f59e0b'][index % 4]}
                    fillOpacity={0.3}
                  />
                ))}
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost vs Performance */}
        <Card>
          <CardHeader
            title="Cost Efficiency"
            description="Cost and response time comparison"
          />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="cost" fill="#f59e0b" name="Cost ($)" />
                <Bar yAxisId="right" dataKey="responseTime" fill="#0ea5e9" name="Response Time (ms)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Variant Details Table */}
      <Card>
        <CardHeader
          title="Detailed Variant Metrics"
          description="Complete breakdown of all variants"
        />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    Variant
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    Model
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    Overall Score
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    Success Rate
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    Avg Time
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    Cost
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedVariants.map((variant, index) => (
                  <tr
                    key={variant.id}
                    className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {index === 0 && (
                          <Award className="w-4 h-4 text-warning-600" />
                        )}
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {variant.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary">
                        {variant.provider} - {variant.model}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {variant.scores.overall.toFixed(1)}
                        </span>
                        <div className="w-16 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-600 rounded-full"
                            style={{ width: `${variant.scores.overall}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-neutral-900 dark:text-neutral-100">
                        {variant.successRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-neutral-900 dark:text-neutral-100">
                        {variant.avgResponseTime}ms
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-neutral-900 dark:text-neutral-100">
                        ${variant.cost.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onExperimentClick?.(experiment.id)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};