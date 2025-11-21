import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui-shadcn/card';
import { Button } from '../ui-shadcn/button';
import { Badge } from '../ui-shadcn/badge';
import { Input } from '../ui-shadcn/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui-shadcn/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui-shadcn/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui-shadcn/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui-shadcn/table';
import { Progress } from '../ui-shadcn/progress';
import {
  Plus,
  Search,
  Filter,
  Download,
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Eye,
  Trash2,
  Copy,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui-shadcn/dropdown-menu';

const mockExperiments = [
  {
    id: '1',
    name: 'GPT-4 vs Claude 3 Comparison',
    status: 'completed',
    variants: 2,
    trials: 100,
    successRate: 92,
    avgScore: 87.5,
    cost: 45.23,
    createdAt: '2024-11-20',
    completedAt: '2024-11-21',
  },
  {
    id: '2',
    name: 'Prompt Engineering Experiment',
    status: 'running',
    variants: 3,
    trials: 50,
    successRate: 88,
    avgScore: 84.2,
    cost: 28.50,
    createdAt: '2024-11-21',
    completedAt: null,
  },
  {
    id: '3',
    name: 'Multi-Model Evaluation',
    status: 'completed',
    variants: 4,
    trials: 200,
    successRate: 95,
    avgScore: 91.3,
    cost: 89.75,
    createdAt: '2024-11-19',
    completedAt: '2024-11-20',
  },
  {
    id: '4',
    name: 'Response Quality Analysis',
    status: 'failed',
    variants: 2,
    trials: 25,
    successRate: 45,
    avgScore: 62.1,
    cost: 12.30,
    createdAt: '2024-11-18',
    completedAt: '2024-11-18',
  },
];

export function EnhancedExperimentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      running: { variant: 'secondary', icon: Clock, color: 'text-blue-600' },
      failed: { variant: 'destructive', icon: AlertCircle, color: 'text-red-600' },
    };

    const config = variants[status] || variants.completed;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredExperiments = mockExperiments.filter((exp) => {
    const matchesSearch = exp.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || exp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Experiments</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage AI model experiments
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="w-4 h-4" />
              New Experiment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Experiment</DialogTitle>
              <DialogDescription>
                Set up a new experiment to compare AI models
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Experiment Name</label>
                <Input placeholder="e.g., GPT-4 vs Claude Comparison" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input placeholder="Describe the purpose of this experiment" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sample Size</label>
                  <Input type="number" placeholder="100" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Budget ($)</label>
                  <Input type="number" placeholder="500" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline">Cancel</Button>
                <Button>Create Experiment</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Experiments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockExperiments.length}</div>
            <p className="text-xs text-muted-foreground">
              {mockExperiments.filter((e) => e.status === 'running').length} running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                mockExperiments.reduce((sum, e) => sum + e.successRate, 0) /
                mockExperiments.length
              ).toFixed(1)}
              %
            </div>
            <Progress
              value={
                mockExperiments.reduce((sum, e) => sum + e.successRate, 0) /
                mockExperiments.length
              }
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                mockExperiments.reduce((sum, e) => sum + e.avgScore, 0) /
                mockExperiments.length
              ).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Across all experiments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${mockExperiments.reduce((sum, e) => sum + e.cost, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Experiments</CardTitle>
              <CardDescription>
                View and manage your experiment history
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search experiments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="table" className="space-y-4">
            <TabsList>
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Variants</TableHead>
                      <TableHead>Trials</TableHead>
                      <TableHead>Success Rate</TableHead>
                      <TableHead>Avg Score</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExperiments.map((experiment) => (
                      <TableRow key={experiment.id}>
                        <TableCell className="font-medium">
                          {experiment.name}
                        </TableCell>
                        <TableCell>{getStatusBadge(experiment.status)}</TableCell>
                        <TableCell>{experiment.variants}</TableCell>
                        <TableCell>{experiment.trials}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{experiment.successRate}%</span>
                            <Progress
                              value={experiment.successRate}
                              className="w-16 h-2"
                            />
                          </div>
                        </TableCell>
                        <TableCell>{experiment.avgScore.toFixed(1)}</TableCell>
                        <TableCell>${experiment.cost.toFixed(2)}</TableCell>
                        <TableCell>{experiment.createdAt}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem className="gap-2">
                                <Eye className="w-4 h-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Copy className="w-4 h-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Download className="w-4 h-4" />
                                Export Results
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2 text-destructive">
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="grid" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredExperiments.map((experiment) => (
                  <Card key={experiment.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">
                          {experiment.name}
                        </CardTitle>
                        {getStatusBadge(experiment.status)}
                      </div>
                      <CardDescription>
                        Created {experiment.createdAt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Variants</p>
                          <p className="font-medium">{experiment.variants}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Trials</p>
                          <p className="font-medium">{experiment.trials}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Success Rate</p>
                          <p className="font-medium">{experiment.successRate}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Cost</p>
                          <p className="font-medium">${experiment.cost.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Avg Score</span>
                          <span className="font-medium">
                            {experiment.avgScore.toFixed(1)}
                          </span>
                        </div>
                        <Progress value={experiment.avgScore} />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}