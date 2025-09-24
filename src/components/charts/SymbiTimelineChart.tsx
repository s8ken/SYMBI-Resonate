/**
 * SYMBI Framework Timeline Chart Component
 * 
 * This component visualizes SYMBI Framework assessment results over time,
 * allowing users to track changes and trends in scores across different dimensions.
 */

import { useState, useEffect, useRef } from "react";
import { AssessmentResult } from "../../lib/symbi-framework";

interface SymbiTimelineChartProps {
  assessments: AssessmentResult[];
  height?: number;
  width?: string;
  dimension?: 'overall' | 'realityIndex' | 'trustProtocol' | 'ethicalAlignment' | 'resonanceQuality' | 'canvasParity';
  modelFilter?: string;
}

export function SymbiTimelineChart({ 
  assessments, 
  height = 400, 
  width = "100%",
  dimension = 'overall',
  modelFilter
}: SymbiTimelineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartData, setChartData] = useState<any>(null);

  // Prepare data for timeline chart
  useEffect(() => {
    if (!assessments || assessments.length === 0) return;

    // Filter assessments by model if specified
    const filteredAssessments = modelFilter 
      ? assessments.filter(a => a.metadata?.modelName === modelFilter)
      : assessments;

    // Sort assessments by timestamp
    const sortedAssessments = [...filteredAssessments].sort(
      (a, b) => new Date(a.assessment.timestamp).getTime() - new Date(b.assessment.timestamp).getTime()
    );

    // Group assessments by model
    const modelGroups = sortedAssessments.reduce((groups, assessment) => {
      const modelName = assessment.metadata?.modelName || "Unknown";
      if (!groups[modelName]) {
        groups[modelName] = [];
      }
      groups[modelName].push(assessment);
      return groups;
    }, {} as Record<string, AssessmentResult[]>);

    // Extract values for the selected dimension
    const timelineData = Object.entries(modelGroups).map(([model, assessments]) => {
      // Generate random color if not provided
      const color = getRandomColor();
      
      // Extract values and dates
      const dataPoints = assessments.map(assessment => {
        const date = new Date(assessment.assessment.timestamp);
        let value = 0;
        
        switch (dimension) {
          case 'overall':
            value = assessment.assessment.overallScore;
            break;
          case 'realityIndex':
            value = assessment.assessment.realityIndex.score * 10; // Scale to 0-100
            break;
          case 'trustProtocol':
            // Convert PASS/PARTIAL/FAIL to numeric
            switch (assessment.assessment.trustProtocol.status) {
              case "PASS": return { date, value: 100 };
              case "PARTIAL": return { date, value: 50 };
              case "FAIL": return { date, value: 0 };
            }
            break;
          case 'ethicalAlignment':
            value = assessment.assessment.ethicalAlignment.score * 20; // Scale to 0-100
            break;
          case 'resonanceQuality':
            // Convert STRONG/ADVANCED/BREAKTHROUGH to numeric
            switch (assessment.assessment.resonanceQuality.level) {
              case "BREAKTHROUGH": return { date, value: 100 };
              case "ADVANCED": return { date, value: 70 };
              case "STRONG": return { date, value: 40 };
            }
            break;
          case 'canvasParity':
            value = assessment.assessment.canvasParity.score;
            break;
        }
        
        return { date, value };
      });
      
      return { model, color, dataPoints };
    });

    // Get min and max dates for x-axis
    const allDates = sortedAssessments.map(a => new Date(a.assessment.timestamp));
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    
    // Add padding to date range
    const dateRange = maxDate.getTime() - minDate.getTime();
    const paddingDays = Math.max(1, Math.ceil(dateRange / (1000 * 60 * 60 * 24) * 0.1)); // 10% padding
    
    minDate.setDate(minDate.getDate() - paddingDays);
    maxDate.setDate(maxDate.getDate() + paddingDays);

    setChartData({ 
      timelineData, 
      dateRange: { min: minDate, max: maxDate },
      dimensionLabel: getDimensionLabel(dimension),
      dimensionMax: getDimensionMax(dimension)
    });
  }, [assessments, dimension, modelFilter]);

  // Get dimension label
  const getDimensionLabel = (dim: string) => {
    switch (dim) {
      case 'overall': return 'Overall Score';
      case 'realityIndex': return 'Reality Index';
      case 'trustProtocol': return 'Trust Protocol';
      case 'ethicalAlignment': return 'Ethical Alignment';
      case 'resonanceQuality': return 'Resonance Quality';
      case 'canvasParity': return 'Canvas Parity';
      default: return 'Score';
    }
  };

  // Get dimension maximum value
  const getDimensionMax = (dim: string) => {
    switch (dim) {
      case 'realityIndex': return 100; // Scaled from 0-10
      case 'ethicalAlignment': return 100; // Scaled from 1-5
      default: return 100;
    }
  };

  // Generate random color for chart
  const getRandomColor = () => {
    const colors = [
      "#3b82f6", // blue
      "#10b981", // green
      "#ef4444", // red
      "#8b5cf6", // purple
      "#f59e0b", // amber
      "#6366f1", // indigo
      "#ec4899", // pink
      "#14b8a6", // teal
      "#f97316", // orange
      "#6b7280"  // gray
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Render the timeline chart using SVG
  const renderTimelineChart = () => {
    if (!chartData || !chartRef.current) return null;

    const { timelineData, dateRange, dimensionLabel, dimensionMax } = chartData;
    const chartWidth = chartRef.current.clientWidth - 80; // Leave room for y-axis
    const chartHeight = height - 80; // Leave room for x-axis and legend
    
    // Calculate scales for x and y axes
    const xScale = (date: Date) => {
      const dateTime = date.getTime();
      const minTime = dateRange.min.getTime();
      const maxTime = dateRange.max.getTime();
      const range = maxTime - minTime;
      return 60 + ((dateTime - minTime) / range) * chartWidth;
    };
    
    const yScale = (value: number) => {
      return chartHeight - (value / dimensionMax) * chartHeight + 20;
    };

    // Generate line path for each model
    const generateLinePath = (dataPoints: { date: Date, value: number }[]) => {
      if (dataPoints.length === 0) return "";
      
      return dataPoints.map((point, i) => {
        const x = xScale(point.date);
        const y = yScale(point.value);
        return `${i === 0 ? 'M' : 'L'}${x},${y}`;
      }).join(' ');
    };

    // Calculate x-axis tick values
    const getXAxisTicks = () => {
      const minTime = dateRange.min.getTime();
      const maxTime = dateRange.max.getTime();
      const range = maxTime - minTime;
      
      // Determine number of ticks based on chart width
      const numTicks = Math.min(10, Math.max(2, Math.floor(chartWidth / 100)));
      
      const ticks = [];
      for (let i = 0; i <= numTicks; i++) {
        const tickTime = minTime + (range * i) / numTicks;
        ticks.push(new Date(tickTime));
      }
      
      return ticks;
    };

    // Calculate y-axis tick values
    const getYAxisTicks = () => {
      const numTicks = 5;
      const ticks = [];
      
      for (let i = 0; i <= numTicks; i++) {
        ticks.push((dimensionMax * i) / numTicks);
      }
      
      return ticks;
    };

    const xAxisTicks = getXAxisTicks();
    const yAxisTicks = getYAxisTicks();

    return (
      <svg width="100%" height={height} className="overflow-visible">
        {/* Y-axis */}
        <line x1="60" y1="20" x2="60" y2={chartHeight + 20} stroke="#000" strokeWidth="2" />
        
        {/* Y-axis label */}
        <text 
          x="20" 
          y={chartHeight / 2 + 20} 
          transform={`rotate(-90, 20, ${chartHeight / 2 + 20})`}
          textAnchor="middle"
          className="text-sm font-bold"
        >
          {dimensionLabel}
        </text>
        
        {/* Y-axis ticks and grid lines */}
        {yAxisTicks.map((tick, i) => (
          <g key={`y-tick-${i}`}>
            <line 
              x1="55" 
              y1={yScale(tick)} 
              x2="60" 
              y2={yScale(tick)} 
              stroke="#000" 
              strokeWidth="1" 
            />
            <text 
              x="50" 
              y={yScale(tick)} 
              textAnchor="end" 
              dominantBaseline="middle" 
              className="text-xs font-bold"
            >
              {tick}
            </text>
            <line 
              x1="60" 
              y1={yScale(tick)} 
              x2={chartWidth + 60} 
              y2={yScale(tick)} 
              stroke="#e5e7eb" 
              strokeWidth="1" 
              strokeDasharray="4 4" 
            />
          </g>
        ))}
        
        {/* X-axis */}
        <line x1="60" y1={chartHeight + 20} x2={chartWidth + 60} y2={chartHeight + 20} stroke="#000" strokeWidth="2" />
        
        {/* X-axis ticks and labels */}
        {xAxisTicks.map((date, i) => (
          <g key={`x-tick-${i}`}>
            <line 
              x1={xScale(date)} 
              y1={chartHeight + 20} 
              x2={xScale(date)} 
              y2={chartHeight + 25} 
              stroke="#000" 
              strokeWidth="1" 
            />
            <text 
              x={xScale(date)} 
              y={chartHeight + 40} 
              textAnchor="middle" 
              className="text-xs font-bold"
            >
              {formatDate(date)}
            </text>
          </g>
        ))}
        
        {/* Data lines */}
        {timelineData.map((data, dataIndex) => (
          <g key={`line-${dataIndex}`}>
            <path
              d={generateLinePath(data.dataPoints)}
              fill="none"
              stroke={data.color}
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            
            {/* Data points */}
            {data.dataPoints.map((point, pointIndex) => (
              <circle
                key={`point-${dataIndex}-${pointIndex}`}
                cx={xScale(point.date)}
                cy={yScale(point.value)}
                r="5"
                fill={data.color}
                stroke="#fff"
                strokeWidth="2"
              />
            ))}
          </g>
        ))}
        
        {/* Legend */}
        <g transform={`translate(60, ${chartHeight + 60})`}>
          {timelineData.map((data, index) => (
            <g key={`legend-${index}`} transform={`translate(${index * 120}, 0)`}>
              <line
                x1="0"
                y1="0"
                x2="20"
                y2="0"
                stroke={data.color}
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle
                cx="10"
                cy="0"
                r="4"
                fill={data.color}
                stroke="#fff"
                strokeWidth="1"
              />
              <text
                x="25"
                y="4"
                className="text-xs font-bold"
              >
                {data.model}
              </text>
            </g>
          ))}
        </g>
      </svg>
    );
  };

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <div ref={chartRef} className="w-full h-full flex items-center justify-center">
        {assessments.length === 0 ? (
          <div className="text-center text-gray-500">
            <p className="font-bold">No assessment data available</p>
          </div>
        ) : chartData ? (
          renderTimelineChart()
        ) : (
          <div className="text-center text-gray-500">
            <p className="font-bold">Loading chart data...</p>
          </div>
        )}
      </div>
    </div>
  );
}