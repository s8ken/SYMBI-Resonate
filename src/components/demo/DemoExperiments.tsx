import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui-shadcn/card';
import { Button } from '../ui-shadcn/button';
import { Badge } from '../ui-shadcn/badge';
import { Input } from '../ui-shadcn/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui-shadcn/select';
import { Progress } from '../ui-shadcn/progress';
import { Alert, AlertDescription, AlertTitle } from '../ui-shadcn/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui-shadcn/dialog';
import {
  Plus,
  Search,
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Download,
  Eye,
  TrendingUp,
  DollarSign,
  Zap,
  Brain
} from 'lucide-react';
import { demoService } from '../../lib/demo/demo-service';
import type { Experiment } from '../../lib/demo/demo-data';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

function DemoExperiments() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [filteredExperiments, setFilteredExperiments] = useState<Experiment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadExperiments();
  }, []);

  useEffect(() => {
    filterExperiments();
  }, [experiments, searchTerm, statusFilter]);

  const loadExperiments = async () => {
    try {
      setLoading(true);
      const data = await demoService.getExperiments();
      setExperiments(data);
    } catch (error) {
      console.error('Failed to load experiments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterExperiments = () => {
    let filtered = experiments;

    if (searchTerm) {
      filtered = filtered.filter(exp => 
        exp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(exp => exp.status === statusFilter);
    }

    setFilteredExperiments(filtered);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      running: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      draft: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      running: <RefreshCw className="h-3 w-3" />,
      completed: <CheckCircle className="h-3 w-3" />,
      paused: <Pause className="h-3 w-3" />,
      draft: <Clock className="h-3 w-3" />
    };
    return icons[status as keyof typeof icons] || icons.draft;
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">AI Model Experiments</h1>
        </div>
        <div className="text-center py-8">Loading experiments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Model Experiments</h1>
          <p className="text-muted-foreground">Double-blind evaluation of AI models using the SYMBI framework</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Experiment
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Experiments</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{experiments.length}</div>
            <p className="text-xs text-muted-foreground">+2 this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{experiments.filter(e => e.status === 'running').length}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">+1.3% vs last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12.4k</div>
            <p className="text-xs text-muted-foreground">18% under budget</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search experiments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredExperiments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No experiments found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first experiment to get started"
                }
              </p>
              {(searchTerm || statusFilter !== 'all') && (
                <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredExperiments.map((experiment) => (
              <Card key={experiment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{experiment.name}</CardTitle>
                        <Badge className={getStatusColor(experiment.status)}>
                          {getStatusIcon(experiment.status)}
                          <span className="ml-1 capitalize">{experiment.status}</span>
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {experiment.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedExperiment(experiment)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{experiment.progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={experiment.progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{experiment.metrics.totalRuns.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Total Runs</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{experiment.metrics.successRate.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">Success Rate</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{experiment.metrics.avgResponseTime.toFixed(1)}s</div>
                      <div className="text-xs text-muted-foreground">Avg Response</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">${experiment.metrics.cost.toFixed(0)}</div>
                      <div className="text-xs text-muted-foreground">Total Cost</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Models:</span>
                      <Badge variant="outline">{experiment.modelA}</Badge>
                      <span className="text-muted-foreground">vs</span>
                      <Badge variant="outline">{experiment.modelB}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedExperiment} onOpenChange={() => setSelectedExperiment(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedExperiment?.name}</DialogTitle>
            <DialogDescription>{selectedExperiment?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  SYMBI Framework Scores
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{selectedExperiment?.symbiScores.realityIndex}</div>
                  <div className="text-xs text-muted-foreground">Reality Index</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{selectedExperiment?.symbiScores.trustProtocol}</div>
                  <div className="text-xs text-muted-foreground">Trust Protocol</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">{selectedExperiment?.symbiScores.ethicalAlignment}</div>
                  <div className="text-xs text-muted-foreground">Ethical Alignment</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">{selectedExperiment?.symbiScores.resonanceQuality}</div>
                  <div className="text-xs text-muted-foreground">Resonance Quality</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-lg font-bold text-red-600">{selectedExperiment?.symbiScores.canvasParity}</div>
                  <div className="text-xs text-muted-foreground">Canvas Parity</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DemoExperiments;