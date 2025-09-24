/**
 * SYMBI Framework Comparison Chart Component
 * 
 * This component provides a visual comparison of SYMBI Framework assessment results
 * across multiple AI models or content pieces.
 */

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "../ui/card";
import { AssessmentResult } from "../../lib/symbi-framework";

interface SymbiComparisonChartProps {
  assessments: AssessmentResult[];
  height?: number;
  width?: string;
}

export function SymbiComparisonChart({ 
  assessments, 
  height = 400, 
  width = "100%" 
}: SymbiComparisonChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartData, setChartData] = useState<any>(null);

  // Prepare data for chart
  useEffect(() => {
    if (!assessments || assessments.length === 0) return;

    // Transform assessment data for chart visualization
    const models = assessments.map(a => a.metadata?.modelName || "Unknown");
    
    // Reality Index data (0-10 scale)
    const realityData = assessments.map(a => a.assessment.realityIndex.score);
    
    // Trust Protocol data (convert PASS/PARTIAL/FAIL to numeric)
    const trustData = assessments.map(a => {
      switch (a.assessment.trustProtocol.status) {
        case "PASS": return 10;
        case "PARTIAL": return 5;
        case "FAIL": return 0;
        default: return 0;
      }
    });
    
    // Ethical Alignment data (1-5 scale, normalize to 0-10)
    const ethicalData = assessments.map(a => a.assessment.ethicalAlignment.score * 2);
    
    // Resonance Quality data (convert STRONG/ADVANCED/BREAKTHROUGH to numeric)
    const resonanceData = assessments.map(a => {
      switch (a.assessment.resonanceQuality.level) {
        case "BREAKTHROUGH": return 10;
        case "ADVANCED": return 7;
        case "STRONG": return 4;
        default: return 0;
      }
    });
    
    // Canvas Parity data (0-100 scale, normalize to 0-10)
    const canvasData = assessments.map(a => a.assessment.canvasParity.score / 10);
    
    // Overall score data (0-100 scale, normalize to 0-10)
    const overallData = assessments.map(a => a.assessment.overallScore / 10);

    setChartData({
      models,
      dimensions: [
        { name: "Reality Index", data: realityData, color: "#2563eb" },
        { name: "Trust Protocol", data: trustData, color: "#16a34a" },
        { name: "Ethical Alignment", data: ethicalData, color: "#dc2626" },
        { name: "Resonance Quality", data: resonanceData, color: "#9333ea" },
        { name: "Canvas Parity", data: canvasData, color: "#ea580c" },
        { name: "Overall Score", data: overallData, color: "#000000" }
      ]
    });
  }, [assessments]);

  // Render the chart using SVG
  const renderChart = () => {
    if (!chartData || !chartRef.current) return null;

    const { models, dimensions } = chartData;
    const barWidth = 30;
    const barGap = 10;
    const groupWidth = (barWidth + barGap) * dimensions.length;
    const groupGap = 60;
    const chartWidth = (groupWidth + groupGap) * models.length;
    const chartHeight = height - 100; // Leave room for labels
    const maxValue = 10; // All data normalized to 0-10 scale
    
    // Calculate scale for y-axis
    const yScale = (value: number) => chartHeight - (value / maxValue) * chartHeight;
    
    return (
      <svg width={chartWidth} height={height} className="overflow-visible">
        {/* Y-axis */}
        <line x1="0" y1="0" x2="0" y2={chartHeight} stroke="#000" strokeWidth="2" />
        
        {/* Y-axis labels */}
        {[0, 2, 4, 6, 8, 10].map((value) => (
          <g key={`y-label-${value}`}>
            <line 
              x1="-5" 
              y1={yScale(value)} 
              x2="0" 
              y2={yScale(value)} 
              stroke="#000" 
              strokeWidth="1" 
            />
            <text 
              x="-10" 
              y={yScale(value)} 
              textAnchor="end" 
              dominantBaseline="middle" 
              className="text-xs font-bold"
            >
              {value}
            </text>
          </g>
        ))}
        
        {/* X-axis */}
        <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#000" strokeWidth="2" />
        
        {/* Bars for each model and dimension */}
        {models.map((model, modelIndex) => (
          <g key={`model-${modelIndex}`} transform={`translate(${modelIndex * (groupWidth + groupGap) + groupGap/2}, 0)`}>
            {/* Model label */}
            <text 
              x={groupWidth / 2} 
              y={chartHeight + 30} 
              textAnchor="middle" 
              className="text-sm font-bold"
            >
              {model}
            </text>
            
            {/* Dimension bars */}
            {dimensions.map((dimension, dimIndex) => {
              const value = dimension.data[modelIndex];
              const barHeight = (value / maxValue) * chartHeight;
              const x = dimIndex * (barWidth + barGap);
              
              return (
                <g key={`bar-${modelIndex}-${dimIndex}`}>
                  <rect
                    x={x}
                    y={chartHeight - barHeight}
                    width={barWidth}
                    height={barHeight}
                    fill={dimension.color}
                    stroke="#000"
                    strokeWidth="1"
                  />
                  
                  {/* Value label */}
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight - barHeight - 5}
                    textAnchor="middle"
                    className="text-xs font-bold"
                  >
                    {dimension.name === "Trust Protocol" 
                      ? ["FAIL", "PARTIAL", "PASS"][Math.round(value / 5)]
                      : dimension.name === "Resonance Quality"
                        ? ["STRONG", "ADVANCED", "BREAKTHROUGH"][Math.min(2, Math.floor(value / 4))]
                        : dimension.name === "Canvas Parity" || dimension.name === "Overall Score"
                          ? Math.round(value * 10)
                          : value.toFixed(1)
                    }
                  </text>
                </g>
              );
            })}
          </g>
        ))}
        
        {/* Legend */}
        <g transform={`translate(10, ${chartHeight + 50})`}>
          {dimensions.map((dimension, index) => (
            <g key={`legend-${index}`} transform={`translate(${index * 120}, 0)`}>
              <rect
                width="12"
                height="12"
                fill={dimension.color}
                stroke="#000"
                strokeWidth="1"
              />
              <text
                x="18"
                y="10"
                className="text-xs font-bold"
              >
                {dimension.name}
              </text>
            </g>
          ))}
        </g>
      </svg>
    );
  };

  return (
    <div className="w-full overflow-auto" style={{ height: `${height}px` }}>
      <div ref={chartRef} className="min-w-full h-full flex items-center justify-center">
        {assessments.length === 0 ? (
          <div className="text-center text-gray-500">
            <p className="font-bold">No assessment data available</p>
          </div>
        ) : chartData ? (
          <div className="pl-10 pt-10">
            {renderChart()}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <p className="font-bold">Loading chart data...</p>
          </div>
        )}
      </div>
    </div>
  );
}