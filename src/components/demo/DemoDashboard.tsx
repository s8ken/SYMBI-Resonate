import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui-shadcn/card';
import { Badge } from '../ui-shadcn/badge';
import { Button } from '../ui-shadcn/button';
import { Progress } from '../ui-shadcn/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui-shadcn/tabs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Beaker,
  CheckCircle,
  Clock,
  DollarSign,
  Activity,
  Brain,
  Zap,
  Plus,
  Play,
  Pause,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react';
import { demoService } from '../../lib/demo/demo-service';
import type { DashboardStats } from '../../lib/demo/demo-data';

const COLORS = ['#0ea5e9', '#a855f7', '#22c55e', '#f59e0b', '#ef4444'];

export function DemoDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [experimentTrends, setExperimentTrends] = useState<any[]>([]);
  const [modelPerformance, setModelPerformance] = useState<any[]>([]);
  const [costAnalysis, setCostAnalysis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, trends, performance, costs] = await Promise.all([
        demoService.getDashboardStats(),
        demoService.getExperimentTrends(),
        demoService.getModelPerformance(),
        demoService.getCostAnalysis()
      ]);
      
      setStats(statsData);
      setExperimentTrends(trends);
      setModelPerformance(performance);
      setCostAnalysis(costs);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className={`flex items-center text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {change}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Demo Dashboard</h1>
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SYMBI Resonate Demo</h1>
          <p className="text-muted-foreground">Interactive AI Model Evaluation Platform</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Experiments"
          value={stats?.totalExperiments || 0}
          change="+12% from last month"
          icon={Beaker}
          trend="up"
        />
        <StatCard
          title="Active Experiments"
          value={stats?.activeExperiments || 0}
          change="5 running"
          icon={Activity}
          trend="up"
        />
        <StatCard
          title="Avg SYMBI Score"
          value={`${stats?.avgSymbiScore || 0}%`}
          change="+2.1% improvement"
          icon={Brain}
          trend="up"
        />
        <StatCard
          title="Cost Savings"
          value={`$${stats?.costSavings?.toLocaleString() || 0}`}
          change="-18% vs projected"
          icon={DollarSign}
          trend="up"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="experiments">Experiments</TabsTrigger>
          <TabsTrigger value="models">AI Models</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Experiment Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Experiment Trends</CardTitle>
                <CardDescription>Monthly experiment volume and success rates</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={experimentTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="experiments" stroke="#0ea5e9" name="Experiments" />
                    <Line type="monotone" dataKey="successRate" stroke="#22c55e" name="Success Rate (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cost Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
                <CardDescription>Actual vs projected costs</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={costAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="cost" fill="#0ea5e9" name="Actual Cost" />
                    <Bar dataKey="projected" fill="#a855f7" name="Projected Cost" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Model Performance Radar */}
          <Card>
            <CardHeader>
              <CardTitle>Model Performance Comparison</CardTitle>
              <CardDescription>SYMBI framework scores across dimensions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={modelPerformance}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="SYMBI Score" dataKey="symbiScore" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
                  <Radar name="Accuracy" dataKey="accuracy" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                  <Radar name="Speed" dataKey="speed" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experiments" className="space-y-4">
          <DemoExperimentsList />
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <DemoModelsList />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <DemoAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DemoDashboard;

// Demo Experiments List Component
function DemoExperimentsList() {
  const [experiments, setExperiments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExperiments();
  }, []);

  const loadExperiments = async () => {
    try {
      const data = await demoService.getExperiments();
      setExperiments(data);
    } catch (error) {
      console.error('Failed to load experiments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      running: { className: 'bg-blue-100 text-blue-800', icon: <RefreshCw className="h-3 w-3" /> },
      completed: { className: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
      paused: { className: 'bg-yellow-100 text-yellow-800', icon: <Pause className="h-3 w-3" /> },
      draft: { className: 'bg-gray-100 text-gray-800', icon: <Clock className="h-3 w-3" /> }
    };
    
    const variant = variants[status as keyof typeof variants] || variants.draft;
    
    return (
      <Badge className={variant.className} variant="secondary">
        {variant.icon}
        <span className="ml-1">{status}</span>
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading experiments...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Active Experiments</h3>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Experiment
        </Button>
      </div>

      <div className="grid gap-4">
        {experiments.map((experiment) => (
          <Card key={experiment.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{experiment.name}</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {experiment.description}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(experiment.status)}
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Progress</span>
                  <span>{experiment.progress.toFixed(0)}%</span>
                </div>
                <Progress value={experiment.progress} className="h-2" />
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Total Runs</div>
                    <div className="font-semibold">{experiment.metrics.totalRuns.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Success Rate</div>
                    <div className="font-semibold">{experiment.metrics.successRate.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Avg Response</div>
                    <div className="font-semibold">{experiment.metrics.avgResponseTime.toFixed(1)}s</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Cost</div>
                    <div className="font-semibold">${experiment.metrics.cost.toFixed(2)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
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
    </div>
  );
}

// Demo Models List Component
function DemoModelsList() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const data = await demoService.getModels();
      setModels(data);
    } catch (error) {
      console.error('Failed to load models:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading models...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">AI Models</h3>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Model
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {models.map((model) => (
          <Card key={model.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{model.name}</CardTitle>
                  <CardDescription className="text-sm">{model.provider}</CardDescription>
                </div>
                <Badge variant="secondary">{model.symbiScore}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{model.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Accuracy</span>
                  <span className="font-medium">{model.performance.accuracy}%</span>
                </div>
                <Progress value={model.performance.accuracy} className="h-2" />
                
                <div className="flex justify-between text-sm">
                  <span>Speed</span>
                  <span className="font-medium">{model.performance.speed}%</span>
                </div>
                <Progress value={model.performance.speed} className="h-2" />
                
                <div className="flex justify-between text-sm">
                  <span>Reliability</span>
                  <span className="font-medium">{model.performance.reliability}%</span>
                </div>
                <Progress value={model.performance.reliability} className="h-2" />
              </div>

              <div className="flex flex-wrap gap-1 pt-2">
                {model.capabilities.map((capability: string) => (
                  <Badge key={capability} variant="outline" className="text-xs">
                    {capability}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Demo Analytics Component
function DemoAnalytics() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Advanced Analytics</h3>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>SYMBI Framework Distribution</CardTitle>
            <CardDescription>Score distribution across all evaluations</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Excellent (90-100)', value: 35, fill: '#22c55e' },
                    { name: 'Good (70-89)', value: 45, fill: '#0ea5e9' },
                    { name: 'Fair (50-69)', value: 15, fill: '#f59e0b' },
                    { name: 'Needs Improvement (0-49)', value: 5, fill: '#ef4444' }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
            <CardDescription>Key metrics and recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Model Evaluation Efficiency</span>
                <Badge variant="secondary" className="text-xs">+15%</Badge>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Cost Optimization</span>
                <Badge variant="secondary" className="text-xs">Excellent</Badge>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Experiment Success Rate</span>
                <Badge variant="secondary" className="text-xs">94.2%</Badge>
              </div>
              <Progress value={94} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest experiment updates and model evaluations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { time: '2 minutes ago', action: 'Experiment "Consciousness Detection" progressed to 78%', type: 'progress' },
              { time: '15 minutes ago', action: 'Model "Claude-3-Opus" evaluation completed', type: 'completed' },
              { time: '1 hour ago', action: 'New experiment "Ethical Reasoning" created', type: 'created' },
              { time: '2 hours ago', action: 'Cost analysis updated for November', type: 'updated' }
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'completed' ? 'bg-green-500' :
                  activity.type === 'progress' ? 'bg-blue-500' :
                  activity.type === 'created' ? 'bg-purple-500' : 'bg-gray-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}