import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  Square, 
  Plus, 
  BarChart3, 
  TrendingUp, 
  Clock,
  DollarSign,
  Users,
  Filter,
  Download,
  Eye,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { Experiment, ExperimentRun } from '@/lib/experiments/types';
import type { ExperimentStatus } from '@/lib/experiments/types';
import { ExperimentWizard } from '@/components/ExperimentWizard';
import { ExperimentDetail } from '@/components/ExperimentDetail';
import { experimentsAPI } from '@/lib/api/experiments';

interface ExperimentsPageProps {
  className?: string;
}

export const ExperimentsPage: React.FC<ExperimentsPageProps> = ({ className }) => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [activeRuns, setActiveRuns] = useState<ExperimentRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  // Toast notifications

  useEffect(() => {
    loadExperiments();
  }, []);

  const loadExperiments = async () => {
    try {
      setLoading(true);
      
      // Load experiments from API
      const experimentsData = await experimentsAPI.getExperiments();
      setExperiments(experimentsData);
      
      // Load active runs for running experiments
      const runningExperiments = experimentsData.filter(exp => 
        exp.status === ExperimentStatus.RUNNING || exp.status === ExperimentStatus.PAUSED
      );
      
      const runsPromises = runningExperiments.map(exp => experimentsAPI.getExperimentRuns(exp.id));
      const runsResults = await Promise.all(runsPromises);
      
      // Flatten all runs and filter for active ones
      const allRuns = runsResults.flat();
      const activeRuns = allRuns.filter(run => 
        run.status === ExperimentStatus.RUNNING || run.status === ExperimentStatus.PAUSED
      );
      
      setActiveRuns(activeRuns);
    } catch (error) {
      toast.error('Failed to load experiment data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: ExperimentStatus) => {
    const variants = {
      [ExperimentStatus.DRAFT]: 'secondary',
      [ExperimentStatus.SCHEDULED]: 'outline',
      [ExperimentStatus.RUNNING]: 'default',
      [ExperimentStatus.PAUSED]: 'warning',
      [ExperimentStatus.COMPLETED]: 'success',
      [ExperimentStatus.FAILED]: 'destructive',
      [ExperimentStatus.CANCELLED]: 'secondary'
    };

    return (
      <Badge variant={variants[status]}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const handleExperimentAction = async (experiment: Experiment, action: 'start' | 'pause' | 'stop') => {
    try {
      let newStatus: ExperimentStatus;
      
      switch (action) {
        case 'start':
          newStatus = ExperimentStatus.RUNNING;
          // Create a new run when starting
          await experimentsAPI.createExperimentRun(experiment.id);
          break;
        case 'pause':
          newStatus = ExperimentStatus.PAUSED;
          break;
        case 'stop':
          newStatus = ExperimentStatus.CANCELLED;
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
      
      // Update experiment status
      await experimentsAPI.updateExperimentStatus(experiment.id, newStatus);
      
      // Reload experiments to reflect changes
      await loadExperiments();
      
      toast.success(`${experiment.name} has been ${action}ed successfully.`);
    } catch (error) {
      toast.error(`Failed to ${action} experiment. Please try again.`);
    }
  };

  const handleCreateExperiment = async (config: any) => {
    try {
      // Create experiment via API
      const newExperiment = await experimentsAPI.createExperiment({
        name: config.name,
        description: config.description,
        organizationId: 'org_123', // TODO: Get from auth context
        config,
      });
      
      // Reload experiments to include the new one
      await loadExperiments();
      
      setShowWizard(false);
      toast.success(`${config.name} has been created successfully.`);
    } catch (error) {
      toast.error('An error occurred while creating the experiment. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (selectedExperiment) {
    return (
      <ExperimentDetail 
        experiment={selectedExperiment} 
        onClose={() => setSelectedExperiment(null)} 
      />
    );
  }

  if (showWizard) {
    return (
      <ExperimentWizard
        onComplete={handleCreateExperiment}
        onCancel={() => setShowWizard(false)}
      />
    );
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Experiments</h1>
            <p className="text-muted-foreground">
              Run multi-agent experiments to compare AI model performance
            </p>
          </div>
          <Button onClick={() => setShowWizard(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Experiment
          </Button>
        </div>

        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {experiments.filter(exp => 
                exp.status === ExperimentStatus.RUNNING || 
                exp.status === ExperimentStatus.PAUSED
              ).map(experiment => (
                <ExperimentCard
                  key={experiment.id}
                  experiment={experiment}
                  activeRun={activeRuns.find(run => run.experimentId === experiment.id)}
                  onAction={handleExperimentAction}
                  onView={setSelectedExperiment}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {experiments.filter(exp => exp.status === ExperimentStatus.COMPLETED).map(experiment => (
                <ExperimentCard
                  key={experiment.id}
                  experiment={experiment}
                  onView={setSelectedExperiment}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="drafts" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {experiments.filter(exp => exp.status === ExperimentStatus.DRAFT).map(experiment => (
                <ExperimentCard
                  key={experiment.id}
                  experiment={experiment}
                  onAction={handleExperimentAction}
                  onView={setSelectedExperiment}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

interface ExperimentCardProps {
  experiment: Experiment;
  activeRun?: ExperimentRun;
  onAction?: (experiment: Experiment, action: 'start' | 'pause' | 'stop') => void;
  onView: (experiment: Experiment) => void;
}

const ExperimentCard: React.FC<ExperimentCardProps> = ({ experiment, activeRun, onAction, onView }) => {
  const progress = activeRun ? activeRun.progress : 0;
  const totalCost = experiment.metadata?.totalCost || 0;
  const completedTrials = activeRun ? activeRun.completedTrials : experiment.metadata?.completedTrials || 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg">{experiment.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {experiment.description}
            </CardDescription>
          </div>
          {getStatusBadge(experiment.status)}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {experiment.status === ExperimentStatus.RUNNING && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{experiment.config.sampleSize} samples</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>${totalCost.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span>{experiment.config.variants.length} variants</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{completedTrials}/{experiment.config.sampleSize}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onView(experiment)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Button>
          
          {experiment.status === ExperimentStatus.RUNNING && onAction && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onAction(experiment, 'pause')}
              >
                <Pause className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onAction(experiment, 'stop')}
              >
                <Square className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {experiment.status === ExperimentStatus.DRAFT && onAction && (
            <Button 
              variant="default" 
              size="sm"
              onClick={() => onAction(experiment, 'start')}
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const getStatusBadge = (status: ExperimentStatus) => {
  const variants = {
    [ExperimentStatus.DRAFT]: 'secondary',
    [ExperimentStatus.SCHEDULED]: 'outline',
    [ExperimentStatus.RUNNING]: 'default',
    [ExperimentStatus.PAUSED]: 'warning',
    [ExperimentStatus.COMPLETED]: 'success',
    [ExperimentStatus.FAILED]: 'destructive',
    [ExperimentStatus.CANCELLED]: 'secondary'
  };

  return (
    <Badge variant={variants[status]}>
      {status.replace('_', ' ')}
    </Badge>
  );
};

export default ExperimentsPage;