import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui-shadcn/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui-shadcn/tabs';
import { Badge } from '../ui-shadcn/badge';
import { Button } from '../ui-shadcn/button';
import { Progress } from '../ui-shadcn/progress';
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
  PieChart,
  Pie,
  Cell,
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
} from 'lucide-react';

const experimentData = [
  { name: 'Week 1', experiments: 12, success: 10 },
  { name: 'Week 2', experiments: 19, success: 16 },
  { name: 'Week 3', experiments: 15, success: 14 },
  { name: 'Week 4', experiments: 22, success: 20 },
  { name: 'Week 5', experiments: 28, success: 25 },
  { name: 'Week 6', experiments: 25, success: 23 },
];

const performanceData = [
  { name: 'GPT-4', score: 92, color: '#0ea5e9' },
  { name: 'Claude 3', score: 89, color: '#a855f7' },
  { name: 'Gemini Pro', score: 85, color: '#22c55e' },
  { name: 'GPT-3.5', score: 78, color: '#f59e0b' },
];

const COLORS = ['#0ea5e9', '#a855f7', '#22c55e', '#f59e0b'];

export function EnhancedDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your AI experiments.
          </p>
        </div>
        <Button size="lg" className="gap-2">
          <Plus className="w-4 h-4" />
          New Experiment
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Experiments</CardTitle>
            <Beaker className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">121</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">91.2%</div>
            <Progress value={91.2} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+2.1%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2s</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingDown className="w-3 h-3 text-green-600" />
              <span className="text-green-600">-0.3s</span> faster
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,847</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-orange-600" />
              <span className="text-orange-600">+8.2%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="experiments">Experiments</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Experiment Trends */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Experiment Trends</CardTitle>
                <CardDescription>
                  Your experiment activity over the last 6 weeks
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={experimentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="experiments" fill="#0ea5e9" name="Total" />
                    <Bar dataKey="success" fill="#22c55e" name="Successful" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest experiment results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: 'GPT-4 vs Claude Comparison',
                      status: 'completed',
                      time: '2 hours ago',
                      score: 92,
                    },
                    {
                      name: 'Prompt Engineering Test',
                      status: 'running',
                      time: '5 hours ago',
                      score: null,
                    },
                    {
                      name: 'Multi-Model Evaluation',
                      status: 'completed',
                      time: '1 day ago',
                      score: 87,
                    },
                    {
                      name: 'Response Quality Analysis',
                      status: 'completed',
                      time: '2 days ago',
                      score: 94,
                    },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          activity.status === 'completed'
                            ? 'bg-green-500'
                            : 'bg-blue-500 animate-pulse'
                        }`}
                      />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {activity.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                      {activity.score && (
                        <Badge variant="secondary">{activity.score}%</Badge>
                      )}
                      {!activity.score && (
                        <Badge variant="outline">
                          <Activity className="w-3 h-3 mr-1" />
                          Running
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Model Performance */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Model Performance</CardTitle>
                <CardDescription>Average scores by model</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceData.map((model, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{model.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {model.score}%
                        </span>
                      </div>
                      <Progress value={model.score} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Distribution</CardTitle>
                <CardDescription>Spending by model provider</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={performanceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="score"
                    >
                      {performanceData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="experiments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Experiments</CardTitle>
              <CardDescription>
                Manage and monitor your AI experiments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Beaker className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No experiments yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get started by creating your first experiment
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Experiment
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                Detailed performance metrics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Performance data coming soon
                </h3>
                <p className="text-sm text-muted-foreground">
                  Run experiments to see detailed performance analytics
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
              <CardDescription>
                Intelligent recommendations and patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Zap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Insights will appear here
                </h3>
                <p className="text-sm text-muted-foreground">
                  Our AI will analyze your experiments and provide insights
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}