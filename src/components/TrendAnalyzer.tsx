/**
 * Trend Analyzer Component for SYMBI Framework
 * 
 * This component provides visualizations and analysis of trends in SYMBI Framework
 * assessment results over time and across different models.
 */

import { useState, useEffect } from "react";
import { 
  AssessmentResult,
  symbiFrameworkService
} from "../lib/symbi-framework";
import { 
  analyzeTrends,
  TrendAnalysisOptions,
  defaultTrendOptions,
  TrendAnalysisResult,
  TrendPeriod,
  TrendDimension,
  TrendDataPoint,
  groupTrendDataByModel,
  generateBenchmarkComparison
} from "../lib/reporting";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  LineChart, 
  BarChart3, 
  PieChart,
  RefreshCw,
  ChevronDown, 
  ChevronUp,
  Settings, 
  Calendar,
  Target,
  Shield,
  Heart,
  Zap,
  Users,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus,
  Info
} from "lucide-react";

interface TrendAnalyzerProps {
  assessmentHistory: AssessmentResult[];
}

export function TrendAnalyzer({ assessmentHistory }: TrendAnalyzerProps) {
  // State for trend analysis options
  const [options, setOptions] = useState<TrendAnalysisOptions>(defaultTrendOptions);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("timeline");
  const [benchmarkModel, setBenchmarkModel] = useState<string | null>(null);
  
  // State for trend analysis results
  const [trendResult, setTrendResult] = useState<TrendAnalysisResult | null>(null);
  const [modelTrends, setModelTrends] = useState<Map<string, TrendAnalysisResult> | null>(null);
  const [benchmarkComparison, setBenchmarkComparison] = useState<{
    benchmarkData: TrendAnalysisResult;
    comparisonData: Map<string, {
      trendData: TrendAnalysisResult;
      relativeDifference: number;
    }>;
  } | null>(null);

  // Get unique model names from assessment history
  const modelNames = Array.from(new Set(assessmentHistory.map(a => a.metadata?.modelName || "Unknown")));
  
  // Get unique content types from assessment history
  const contentTypes = Array.from(new Set(assessmentHistory.map(a => a.metadata?.contentType || "Unknown")));

  // Update trend analysis when options change or assessment history changes
  useEffect(() => {
    if (assessmentHistory.length === 0) return;
    
    // Analyze trends
    const result = analyzeTrends(assessmentHistory, options);
    setTrendResult(result);
    
    // Group trends by model
    const byModel = groupTrendDataByModel(assessmentHistory, options);
    setModelTrends(byModel);
    
    // Generate benchmark comparison if benchmark model is selected
    if (benchmarkModel) {
      const comparison = generateBenchmarkComparison(assessmentHistory, benchmarkModel, options);
      setBenchmarkComparison(comparison);
    } else {
      setBenchmarkComparison(null);
    }
  }, [assessmentHistory, options, benchmarkModel]);

  // Get dimension label
  const getDimensionLabel = (dimension: TrendDimension): string => {
    switch (dimension) {
      case 'overall': return 'Overall Score';
      case 'realityIndex': return 'Reality Index';
      case 'trustProtocol': return 'Trust Protocol';
      case 'ethicalAlignment': return 'Ethical Alignment';
      case 'resonanceQuality': return 'Resonance Quality';
      case 'canvasParity': return 'Canvas Parity';
      default: return 'Score';
    }
  };

  // Get dimension icon
  const getDimensionIcon = (dimension: TrendDimension) => {
    switch (dimension) {
      case 'realityIndex': return <Target className="w-5 h-5" />;
      case 'trustProtocol': return <Shield className="w-5 h-5" />;
      case 'ethicalAlignment': return <Heart className="w-5 h-5" />;
      case 'resonanceQuality': return <Zap className="w-5 h-5" />;
      case 'canvasParity': return <Users className="w-5 h-5" />;
      default: return <BarChart3 className="w-5 h-5" />;
    }
  };

  // Get period label
  const getPeriodLabel = (period: TrendPeriod): string => {
    switch (period) {
      case 'day': return 'Last 24 Hours';
      case 'week': return 'Last 7 Days';
      case 'month': return 'Last 30 Days';
      case 'quarter': return 'Last 90 Days';
      case 'year': return 'Last 365 Days';
      case 'all': return 'All Time';
      default: return 'Custom Period';
    }
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  // Get color for trend direction
  const getTrendColor = (value: number): string => {
    if (value > 5) return "text-green-600";
    if (value < -5) return "text-red-600";
    return "text-yellow-600";
  };

  // Get icon for trend direction
  const getTrendIcon = (value: number) => {
    if (value > 5) return <ArrowUp className="w-4 h-4 text-green-600" />;
    if (value < -5) return <ArrowDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-yellow-600" />;
  };

  // Render timeline chart
  const renderTimelineChart = () => {
    if (!trendResult || trendResult.dataPoints.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px] bg-gray-50 border-2 border-gray-200 rounded-lg">
          <LineChart className="w-16 h-16 text-gray-300 mb-2" />
          <p className="text-gray-500 font-bold">No trend data available</p>
        </div>
      );
    }

    const { dataPoints, trendLine } = trendResult;
    const maxValue = Math.max(...dataPoints.map(p => p.value)) * 1.1; // Add 10% padding
    const minValue = Math.min(0, ...dataPoints.map(p => p.value)) * 0.9; // Add 10% padding
    const valueRange = maxValue - minValue;
    
    // Calculate chart dimensions
    const width = 800;
    const height = 300;
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    // Calculate scales
    const timeRange = dataPoints[dataPoints.length - 1].date.getTime() - dataPoints[0].date.getTime();
    const xScale = (date: Date) => {
      return padding.left + ((date.getTime() - dataPoints[0].date.getTime()) / timeRange) * chartWidth;
    };
    
    const yScale = (value: number) => {
      return padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;
    };
    
    // Generate path for data points
    const linePath = dataPoints.map((point, i) => {
      const x = xScale(point.date);
      const y = yScale(point.value);
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    }).join(' ');
    
    // Generate path for trend line if available
    const trendPath = trendLine ? trendLine.map((point, i) => {
      const x = xScale(point.date);
      const y = yScale(point.value);
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    }).join(' ') : '';
    
    // Generate x-axis ticks
    const xTicks = [];
    const tickCount = Math.min(6, dataPoints.length);
    for (let i = 0; i < tickCount; i++) {
      const index = Math.floor(i * (dataPoints.length - 1) / (tickCount - 1));
      const point = dataPoints[index];
      const x = xScale(point.date);
      xTicks.push(
        <g key={`x-tick-${i}`}>
          <line
            x1={x}
            y1={padding.top + chartHeight}
            x2={x}
            y2={padding.top + chartHeight + 5}
            stroke="#000"
            strokeWidth="1"
          />
          <text
            x={x}
            y={padding.top + chartHeight + 20}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
          >
            {formatDate(point.date)}
          </text>
        </g>
      );
    }
    
    // Generate y-axis ticks
    const yTicks = [];
    const yTickCount = 5;
    for (let i = 0; i <= yTickCount; i++) {
      const value = minValue + (i / yTickCount) * valueRange;
      const y = yScale(value);
      yTicks.push(
        <g key={`y-tick-${i}`}>
          <line
            x1={padding.left - 5}
            y1={y}
            x2={padding.left}
            y2={y}
            stroke="#000"
            strokeWidth="1"
          />
          <text
            x={padding.left - 10}
            y={y}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize="12"
            fontWeight="bold"
          >
            {value.toFixed(1)}
          </text>
          <line
            x1={padding.left}
            y1={y}
            x2={width - padding.right}
            y2={y}
            stroke="#e5e7eb"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        </g>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <svg width={width} height={height} className="mx-auto">
          {/* X and Y axes */}
          <line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={width - padding.right}
            y2={padding.top + chartHeight}
            stroke="#000"
            strokeWidth="2"
          />
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + chartHeight}
            stroke="#000"
            strokeWidth="2"
          />
          
          {/* X and Y axis ticks */}
          {xTicks}
          {yTicks}
          
          {/* Data points line */}
          <path
            d={linePath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          
          {/* Data points */}
          {dataPoints.map((point, i) => (
            <circle
              key={`point-${i}`}
              cx={xScale(point.date)}
              cy={yScale(point.value)}
              r="4"
              fill="#3b82f6"
              stroke="#fff"
              strokeWidth="2"
            />
          ))}
          
          {/* Trend line if available */}
          {trendLine && (
            <path
              d={trendPath}
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray="6 4"
            />
          )}
          
          {/* Y-axis label */}
          <text
            x={padding.left - 35}
            y={padding.top + chartHeight / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="14"
            fontWeight="bold"
            transform={`rotate(-90, ${padding.left - 35}, ${padding.top + chartHeight / 2})`}
          >
            {getDimensionLabel(options.dimension)}
          </text>
        </svg>
      </div>
    );
  };

  // Render comparison chart
  const renderComparisonChart = () => {
    if (!modelTrends || modelTrends.size === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px] bg-gray-50 border-2 border-gray-200 rounded-lg">
          <BarChart3 className="w-16 h-16 text-gray-300 mb-2" />
          <p className="text-gray-500 font-bold">No comparison data available</p>
        </div>
      );
    }

    // Calculate chart dimensions
    const width = 800;
    const height = 400;
    const padding = { top: 20, right: 100, bottom: 60, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    // Get model names and average values
    const models = Array.from(modelTrends.keys());
    const values = models.map(model => {
      const trend = modelTrends.get(model);
      return trend ? trend.averageValue : 0;
    });
    
    // Calculate max value for y-axis
    const maxValue = Math.max(...values) * 1.1; // Add 10% padding
    
    // Calculate bar width and spacing
    const barWidth = chartWidth / models.length * 0.7;
    const barSpacing = chartWidth / models.length * 0.3;
    
    // Generate bars
    const bars = models.map((model, i) => {
      const trend = modelTrends.get(model);
      if (!trend) return null;
      
      const value = trend.averageValue;
      const x = padding.left + i * (barWidth + barSpacing) + barSpacing / 2;
      const barHeight = (value / maxValue) * chartHeight;
      const y = padding.top + chartHeight - barHeight;
      
      // Generate color based on model name
      const colors = [
        "#3b82f6", // blue
        "#ef4444", // red
        "#10b981", // green
        "#8b5cf6", // purple
        "#f59e0b", // amber
        "#ec4899", // pink
        "#6366f1", // indigo
        "#14b8a6", // teal
      ];
      const color = colors[i % colors.length];
      
      return (
        <g key={`bar-${i}`}>
          <rect
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            fill={color}
            stroke="#fff"
            strokeWidth="1"
          />
          <text
            x={x + barWidth / 2}
            y={y - 10}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
          >
            {value.toFixed(2)}
          </text>
          <text
            x={x + barWidth / 2}
            y={padding.top + chartHeight + 20}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            transform={`rotate(45, ${x + barWidth / 2}, ${padding.top + chartHeight + 20})`}
          >
            {model}
          </text>
        </g>
      );
    });
    
    // Generate y-axis ticks
    const yTicks = [];
    const yTickCount = 5;
    for (let i = 0; i <= yTickCount; i++) {
      const value = (i / yTickCount) * maxValue;
      const y = padding.top + chartHeight - (i / yTickCount) * chartHeight;
      yTicks.push(
        <g key={`y-tick-${i}`}>
          <line
            x1={padding.left - 5}
            y1={y}
            x2={padding.left}
            y2={y}
            stroke="#000"
            strokeWidth="1"
          />
          <text
            x={padding.left - 10}
            y={y}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize="12"
            fontWeight="bold"
          >
            {value.toFixed(1)}
          </text>
          <line
            x1={padding.left}
            y1={y}
            x2={width - padding.right}
            y2={y}
            stroke="#e5e7eb"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        </g>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <svg width={width} height={height} className="mx-auto">
          {/* X and Y axes */}
          <line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={width - padding.right}
            y2={padding.top + chartHeight}
            stroke="#000"
            strokeWidth="2"
          />
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + chartHeight}
            stroke="#000"
            strokeWidth="2"
          />
          
          {/* Y axis ticks */}
          {yTicks}
          
          {/* Bars */}
          {bars}
          
          {/* Y-axis label */}
          <text
            x={padding.left - 35}
            y={padding.top + chartHeight / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="14"
            fontWeight="bold"
            transform={`rotate(-90, ${padding.left - 35}, ${padding.top + chartHeight / 2})`}
          >
            {getDimensionLabel(options.dimension)}
          </text>
          
          {/* X-axis label */}
          <text
            x={padding.left + chartWidth / 2}
            y={padding.top + chartHeight + 50}
            textAnchor="middle"
            fontSize="14"
            fontWeight="bold"
          >
            AI Models
          </text>
        </svg>
      </div>
    );
  };

  // Render benchmark chart
  const renderBenchmarkChart = () => {
    if (!benchmarkComparison) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px] bg-gray-50 border-2 border-gray-200 rounded-lg">
          <BarChart3 className="w-16 h-16 text-gray-300 mb-2" />
          <p className="text-gray-500 font-bold">No benchmark data available</p>
          <p className="text-gray-500">Select a benchmark model to compare</p>
        </div>
      );
    }

    const { benchmarkData, comparisonData } = benchmarkComparison;
    
    // Calculate chart dimensions
    const width = 800;
    const height = 400;
    const padding = { top: 20, right: 100, bottom: 60, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    // Get model names and relative differences
    const models = Array.from(comparisonData.keys());
    const differences = models.map(model => {
      const comparison = comparisonData.get(model);
      return comparison ? comparison.relativeDifference : 0;
    });
    
    // Calculate max value for y-axis
    const maxDiff = Math.max(Math.abs(Math.min(...differences)), Math.max(...differences)) * 1.1; // Add 10% padding
    
    // Calculate bar width and spacing
    const barWidth = chartWidth / models.length * 0.7;
    const barSpacing = chartWidth / models.length * 0.3;
    
    // Generate bars
    const bars = models.map((model, i) => {
      const comparison = comparisonData.get(model);
      if (!comparison) return null;
      
      const diff = comparison.relativeDifference;
      const x = padding.left + i * (barWidth + barSpacing) + barSpacing / 2;
      
      // Calculate bar height and position
      const barHeight = Math.abs(diff) / maxDiff * (chartHeight / 2);
      const y = diff >= 0 
        ? padding.top + chartHeight / 2 - barHeight 
        : padding.top + chartHeight / 2;
      
      // Generate color based on difference
      const color = diff >= 0 ? "#10b981" : "#ef4444"; // green for positive, red for negative
      
      return (
        <g key={`bar-${i}`}>
          <rect
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            fill={color}
            stroke="#fff"
            strokeWidth="1"
          />
          <text
            x={x + barWidth / 2}
            y={diff >= 0 ? y - 10 : y + barHeight + 15}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
          >
            {diff >= 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`}
          </text>
          <text
            x={x + barWidth / 2}
            y={padding.top + chartHeight + 20}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            transform={`rotate(45, ${x + barWidth / 2}, ${padding.top + chartHeight + 20})`}
          >
            {model}
          </text>
        </g>
      );
    });
    
    // Generate y-axis ticks
    const yTicks = [];
    const yTickCount = 4;
    for (let i = -yTickCount / 2; i <= yTickCount / 2; i++) {
      const value = (i / (yTickCount / 2)) * maxDiff;
      const y = padding.top + chartHeight / 2 - (i / (yTickCount / 2)) * (chartHeight / 2);
      yTicks.push(
        <g key={`y-tick-${i}`}>
          <line
            x1={padding.left - 5}
            y1={y}
            x2={padding.left}
            y2={y}
            stroke="#000"
            strokeWidth="1"
          />
          <text
            x={padding.left - 10}
            y={y}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize="12"
            fontWeight="bold"
          >
            {value >= 0 ? `+${value.toFixed(0)}%` : `${value.toFixed(0)}%`}
          </text>
          <line
            x1={padding.left}
            y1={y}
            x2={width - padding.right}
            y2={y}
            stroke={i === 0 ? "#000" : "#e5e7eb"}
            strokeWidth={i === 0 ? "2" : "1"}
            strokeDasharray={i === 0 ? "" : "4 4"}
          />
        </g>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Info className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-blue-800">
              Benchmark: {benchmarkModel} - Average {getDimensionLabel(options.dimension)}: {benchmarkData.averageValue.toFixed(2)}
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <svg width={width} height={height} className="mx-auto">
            {/* X and Y axes */}
            <line
              x1={padding.left}
              y1={padding.top + chartHeight}
              x2={width - padding.right}
              y2={padding.top + chartHeight}
              stroke="#000"
              strokeWidth="2"
            />
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={padding.top + chartHeight}
              stroke="#000"
              strokeWidth="2"
            />
            
            {/* Y axis ticks */}
            {yTicks}
            
            {/* Bars */}
            {bars}
            
            {/* Y-axis label */}
            <text
              x={padding.left - 35}
              y={padding.top + chartHeight / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="14"
              fontWeight="bold"
              transform={`rotate(-90, ${padding.left - 35}, ${padding.top + chartHeight / 2})`}
            >
              Difference from Benchmark (%)
            </text>
            
            {/* X-axis label */}
            <text
              x={padding.left + chartWidth / 2}
              y={padding.top + chartHeight + 50}
              textAnchor="middle"
              fontSize="14"
              fontWeight="bold"
            >
              AI Models
            </text>
          </svg>
        </div>
      </div>
    );
  };

  return (
    <Card className="brutalist-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-black text-brutalist-black">TREND ANALYZER</CardTitle>
            <CardDescription className="font-bold uppercase tracking-wide">
              Analyze trends in SYMBI Framework assessments over time
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="flex items-center space-x-2"
            >
              {showAdvancedOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>Advanced</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {assessmentHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <LineChart className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-black text-gray-500 mb-2">No Assessment History</h3>
            <p className="text-gray-500 font-bold">
              Complete assessments to see trend analysis
            </p>
          </div>
        ) : (
          <>
            {/* Analysis Options */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dimension" className="font-bold">Dimension</Label>
                  <Select
                    value={options.dimension}
                    onValueChange={(value) => setOptions({
                      ...options,
                      dimension: value as TrendDimension
                    })}
                  >
                    <SelectTrigger id="dimension" className="brutalist-input">
                      <SelectValue placeholder="Select dimension" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overall">Overall Score</SelectItem>
                      <SelectItem value="realityIndex">Reality Index</SelectItem>
                      <SelectItem value="trustProtocol">Trust Protocol</SelectItem>
                      <SelectItem value="ethicalAlignment">Ethical Alignment</SelectItem>
                      <SelectItem value="resonanceQuality">Resonance Quality</SelectItem>
                      <SelectItem value="canvasParity">Canvas Parity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period" className="font-bold">Time Period</Label>
                  <Select
                    value={options.period}
                    onValueChange={(value) => setOptions({
                      ...options,
                      period: value as TrendPeriod
                    })}
                  >
                    <SelectTrigger id="period" className="brutalist-input">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Last 24 Hours</SelectItem>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last 30 Days</SelectItem>
                      <SelectItem value="quarter">Last 90 Days</SelectItem>
                      <SelectItem value="year">Last 365 Days</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="benchmark" className="font-bold">Benchmark Model</Label>
                  <Select
                    value={benchmarkModel || ""}
                    onValueChange={(value) => setBenchmarkModel(value || null)}
                  >
                    <SelectTrigger id="benchmark" className="brutalist-input">
                      <SelectValue placeholder="Select benchmark model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {modelNames.map((model) => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Options */}
              {showAdvancedOptions && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-gray-500" />
                    <h3 className="font-black text-lg text-brutalist-black">ADVANCED OPTIONS</h3>
                  </div>

                  <Separator className="border-t-2 border-gray-200" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="model-filter" className="font-bold">Model Filter</Label>
                      <Select
                        value={options.modelFilter || ""}
                        onValueChange={(value) => setOptions({
                          ...options,
                          modelFilter: value || undefined
                        })}
                      >
                        <SelectTrigger id="model-filter" className="brutalist-input">
                          <SelectValue placeholder="Filter by model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Models</SelectItem>
                          {modelNames.map((model) => (
                            <SelectItem key={model} value={model}>{model}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="context-filter" className="font-bold">Context Filter</Label>
                      <Select
                        value={options.contextFilter || ""}
                        onValueChange={(value) => setOptions({
                          ...options,
                          contextFilter: value || undefined
                        })}
                      >
                        <SelectTrigger id="context-filter" className="brutalist-input">
                          <SelectValue placeholder="Filter by context" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Contexts</SelectItem>
                          {contentTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="smoothing"
                        checked={options.smoothing}
                        onCheckedChange={(checked) => setOptions({
                          ...options,
                          smoothing: !!checked
                        })}
                      />
                      <Label htmlFor="smoothing" className="cursor-pointer">
                        Enable Trend Line Smoothing
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-confidence"
                        checked={options.includeConfidence}
                        onCheckedChange={(checked) => setOptions({
                          ...options,
                          includeConfidence: !!checked
                        })}
                      />
                      <Label htmlFor="include-confidence" className="cursor-pointer">
                        Include Confidence Metrics
                      </Label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Analysis Summary */}
            {trendResult && (
              <Card className="bg-gray-50 border-2 border-gray-200">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    {getDimensionIcon(options.dimension)}
                    <CardTitle className="text-xl font-black text-brutalist-black">
                      {getDimensionLabel(options.dimension)} Trends
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                      <div className="text-sm font-bold text-gray-600">AVERAGE</div>
                      <div className="text-2xl font-black text-brutalist-black">
                        {trendResult.averageValue.toFixed(2)}
                      </div>
                    </div>
                    <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                      <div className="text-sm font-bold text-gray-600">CHANGE</div>
                      <div className={`text-2xl font-black flex items-center justify-center ${getTrendColor(trendResult.changeRate)}`}>
                        {getTrendIcon(trendResult.changeRate)}
                        <span className="ml-1">{trendResult.changeRate.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                      <div className="text-sm font-bold text-gray-600">RANGE</div>
                      <div className="text-2xl font-black text-brutalist-black">
                        {trendResult.minValue.toFixed(1)} - {trendResult.maxValue.toFixed(1)}
                      </div>
                    </div>
                    <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                      <div className="text-sm font-bold text-gray-600">VOLATILITY</div>
                      <div className="text-2xl font-black text-brutalist-black">
                        {trendResult.volatility.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Visualization Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="timeline" className="text-lg font-black">
                  <LineChart className="w-5 h-5 mr-2" />
                  TIMELINE
                </TabsTrigger>
                <TabsTrigger value="comparison" className="text-lg font-black">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  COMPARISON
                </TabsTrigger>
                <TabsTrigger value="benchmark" className="text-lg font-black">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  BENCHMARK
                </TabsTrigger>
              </TabsList>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="space-y-4">
                <div className="p-4 border-2 border-gray-200 rounded-lg">
                  <h3 className="text-xl font-black text-brutalist-black mb-4">
                    {getDimensionLabel(options.dimension)} Timeline - {getPeriodLabel(options.period)}
                  </h3>
                  {renderTimelineChart()}
                </div>
              </TabsContent>

              {/* Comparison Tab */}
              <TabsContent value="comparison" className="space-y-4">
                <div className="p-4 border-2 border-gray-200 rounded-lg">
                  <h3 className="text-xl font-black text-brutalist-black mb-4">
                    {getDimensionLabel(options.dimension)} Comparison by Model
                  </h3>
                  {renderComparisonChart()}
                </div>
              </TabsContent>

              {/* Benchmark Tab */}
              <TabsContent value="benchmark" className="space-y-4">
                <div className="p-4 border-2 border-gray-200 rounded-lg">
                  <h3 className="text-xl font-black text-brutalist-black mb-4">
                    {getDimensionLabel(options.dimension)} Benchmark Comparison
                  </h3>
                  {renderBenchmarkChart()}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
}