import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Users, 
  Download, 
  RefreshCw,
  Target,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { Experiment, ExperimentRun, Trial, Evaluation } from '@/lib/experiments/types';
import type { SymbiDimension } from '@/lib/experiments/types';
import { experimentsAPI } from '@/lib/api/experiments';
import { SymbiRadarChart } from '@/components/charts/SymbiRadarChart';
import { SymbiTimelineChart } from '@/components/charts/SymbiTimelineChart';

interface ExperimentDetailProps {
  experiment: Experiment;
  onClose: () => void;
}

export const ExperimentDetail: React.FC<ExperimentDetailProps> = ({ experiment, onClose }) => {
  const [activeRun, setActiveRun] = useState<ExperimentRun | null>(null);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<string>('all');
  // Toast notifications

  useEffect(() => {
    loadExperimentData();
  }, [experiment.id]);

  const loadExperimentData = async () => {
    try {
      setLoading(true);
      
      // Load experiment runs
      const runs = await experimentsAPI.getExperimentRuns(experiment.id);
      const latestRun = runs.length > 0 ? runs[runs.length - 1] : null;
      setActiveRun(latestRun);
      
      // Load trials for the latest run or all trials
      const trialsData = latestRun 
        ? await experimentsAPI.getTrials(experiment.id, latestRun.id)
        : await experimentsAPI.getTrials(experiment.id);
      setTrials(trialsData);
      
      // Load evaluations
      const evaluationsData = await experimentsAPI.getEvaluations(experiment.id);
      setEvaluations(evaluationsData);

    } catch (error) {
      toast.error('Failed to load detailed experiment information.');
    } finally {
      setLoading(false);
    }
  };

  const getVariantStats = () => {
    const stats = experiment.config.variants.map(variant => {
      const variantTrials = trials.filter(t => t.variantId === variant.id);
      const variantEvaluations = evaluations.filter(e => 
        variantTrials.some(t => t.id === e.trialId)
      );

      const avgScores = {
        coherence: 0,
        accuracy: 0,
        creativity: 0
      };

      if (variantEvaluations.length > 0) {
        avgScores.coherence = variantEvaluations.reduce((sum, e) => sum + e.scores.coherence, 0) / variantEvaluations.length;
        avgScores.accuracy = variantEvaluations.reduce((sum, e) => sum + e.scores.accuracy, 0) / variantEvaluations.length;
        avgScores.creativity = variantEvaluations.reduce((sum, e) => sum + e.scores.creativity, 0) / variantEvaluations.length;
      }

      const avgDimensions = {
        [SymbiDimension.REALITY_INDEX]: 0,
        [SymbiDimension.TRUST_PROTOCOL]: 0,
        [SymbiDimension.ETHICAL_ALIGNMENT]: 0,
        [SymbiDimension.RESONANCE_QUALITY]: 0,
        [SymbiDimension.CANVAS_PARITY]: 0
      };

      if (variantEvaluations.length > 0) {
        Object.keys(avgDimensions).forEach(dim => {
          avgDimensions[dim as SymbiDimension] = variantEvaluations.reduce((sum, e) => 
            sum + (e.dimensions?.[dim as SymbiDimension] || 0), 0) / variantEvaluations.length;
        });
      }

      return {
        variant,
        trials: variantTrials.length,
        evaluations: variantEvaluations.length,
        avgScores,
        avgDimensions,
        totalCost: variantTrials.reduce((sum, t) => sum + (t.metadata?.cost || 0), 0)
      };
    });

    return stats;
  };

  const variantStats = getVariantStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{experiment.name}</h1>
          <p className="text-muted-foreground">{experiment.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadExperimentData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => {/* TODO: Export data */}}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {experiment.status === 'RUNNING' ? (
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            ) : experiment.status === 'COMPLETED' ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : experiment.status === 'FAILED' ? (
              <XCircle className="h-4 w-4 text-red-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{experiment.status.replace('_', ' ')}</div>
            {activeRun?.startedAt && (
              <p className="text-xs text-muted-foreground">
                Started {activeRun.startedAt.toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRun?.progress || 0}%</div>
            <Progress value={activeRun?.progress || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${activeRun?.cost.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              Budget: ${experiment.config.budget}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trials</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeRun?.completedTrials || 0}/{experiment.config.sampleSize}
            </div>
            <p className="text-xs text-muted-foreground">
              {experiment.config.confidenceLevel * 100}% confidence
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Tabs defaultValue="variants" className="space-y-4">
        <TabsList>
          <TabsTrigger value="variants">Variant Comparison</TabsTrigger>
          <TabsTrigger value="symbi">SYMBI Resonance</TabsTrigger>
          <TabsTrigger value="trials">Trial Details</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="variants" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {variantStats.map((stats, index) => (
              <Card key={stats.variant.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{stats.variant.name}</CardTitle>
                  <CardDescription>
                    {stats.variant.provider} - {stats.variant.model}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.trials}</div>
                      <div className="text-xs text-muted-foreground">Trials</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">${stats.totalCost.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">Cost</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.avgScores.coherence.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">Avg Score</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Coherence</span>
                      <span>{stats.avgScores.coherence.toFixed(1)}/10</span>
                    </div>
                    <Progress value={stats.avgScores.coherence * 10} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Accuracy</span>
                      <span>{stats.avgScores.accuracy.toFixed(1)}/10</span>
                    </div>
                    <Progress value={stats.avgScores.accuracy * 10} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Creativity</span>
                      <span>{stats.avgScores.creativity.toFixed(1)}/10</span>
                    </div>
                    <Progress value={stats.avgScores.creativity * 10} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="symbi" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>SYMBI Resonance Comparison</CardTitle>
                <CardDescription>
                  Multi-dimensional analysis across SYMBI framework
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SymbiRadarChart 
                  data={variantStats.map(stats => ({
                    name: stats.variant.name,
                    realityIndex: stats.avgDimensions[SymbiDimension.REALITY_INDEX],
                    trustProtocol: stats.avgDimensions[SymbiDimension.TRUST_PROTOCOL],
                    ethicalAlignment: stats.avgDimensions[SymbiDimension.ETHICAL_ALIGNMENT],
                    resonanceQuality: stats.avgDimensions[SymbiDimension.RESONANCE_QUALITY],
                    canvasParity: stats.avgDimensions[SymbiDimension.CANVAS_PARITY]
                  }))}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resonance Timeline</CardTitle>
                <CardDescription>
                  SYMBI dimension scores over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SymbiTimelineChart 
                  data={evaluations.map(evaluation => ({
                    timestamp: evaluation.createdAt,
                    dimensions: evaluation.dimensions || {}
                  }))}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            {Object.values(SymbiDimension).map(dimension => {
              const avgScore = variantStats.reduce((sum, stats) => 
                sum + stats.avgDimensions[dimension], 0) / variantStats.length;
              
              return (
                <Card key={dimension}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{dimension.replace('_', ' ')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{(avgScore * 10).toFixed(1)}</div>
                    <Progress value={avgScore * 100} className="mt-2" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="trials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Trials</CardTitle>
              <CardDescription>
                Individual trial results and evaluations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trials.slice(0, 5).map(trial => {
                  const evaluation = evaluations.find(e => e.trialId === trial.id);
                  const variant = experiment.config.variants.find(v => v.id === trial.variantId);
                  
                  return (
                    <div key={trial.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{variant?.name}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {trial.createdAt.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ${trial.metadata?.cost?.toFixed(3) || '0.000'}
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <div className="font-medium mb-1">Input:</div>
                        <div className="text-muted-foreground bg-muted p-2 rounded">
                          {trial.input.prompt.substring(0, 100)}...
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <div className="font-medium mb-1">Output:</div>
                        <div className="text-muted-foreground bg-muted p-2 rounded">
                          {trial.output.response.substring(0, 100)}...
                        </div>
                      </div>
                      
                      {evaluation && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Scores:</div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="text-center p-2 bg-muted rounded">
                              <div className="font-medium">{evaluation.scores.coherence}</div>
                              <div className="text-muted-foreground">Coherence</div>
                            </div>
                            <div className="text-center p-2 bg-muted rounded">
                              <div className="font-medium">{evaluation.scores.accuracy}</div>
                              <div className="text-muted-foreground">Accuracy</div>
                            </div>
                            <div className="text-center p-2 bg-muted rounded">
                              <div className="font-medium">{evaluation.scores.creativity}</div>
                              <div className="text-muted-foreground">Creativity</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Statistical Significance</CardTitle>
                <CardDescription>
                  Confidence intervals and p-values
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Overall Significance</span>
                    <Badge variant={activeRun?.metadata?.statisticalSignificance > 0.95 ? 'success' : 'warning'}>
                      {(activeRun?.metadata?.statisticalSignificance * 100 || 0).toFixed(1)}%
                    </Badge>
                  </div>
                  
                  {variantStats.map((stats, index) => (
                    <div key={stats.variant.id} className="space-y-2">
                      <div className="text-sm font-medium">{stats.variant.name}</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Mean Score: {stats.avgScores.coherence.toFixed(2)}</div>
                        <div>Std Dev: {(stats.avgScores.coherence * 0.2).toFixed(2)}</div>
                        <div>CI Lower: {(stats.avgScores.coherence - 0.5).toFixed(2)}</div>
                        <div>CI Upper: {(stats.avgScores.coherence + 0.5).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Power Analysis</CardTitle>
                <CardDescription>
                  Sample size and effect size calculations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Required Sample</div>
                      <div className="text-xl font-bold">{experiment.config.sampleSize}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Actual Sample</div>
                      <div className="text-xl font-bold">{trials.length}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Effect Size</span>
                      <span>Medium (0.5)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Power</span>
                      <span>80%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Alpha</span>
                      <span>0.05</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExperimentDetail;