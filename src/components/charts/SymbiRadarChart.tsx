/**
 * SYMBI Framework Radar Chart Component
 * 
 * This component visualizes SYMBI Framework assessment results using a radar/spider chart
 * to highlight strengths and weaknesses across all dimensions.
 */

import { useState, useEffect, useRef } from "react";
import { AssessmentResult } from "../../lib/symbi-framework";

interface SymbiRadarChartProps {
  assessments: AssessmentResult[];
  height?: number;
  width?: string;
  showLegend?: boolean;
}

export function SymbiRadarChart({ 
  assessments, 
  height = 500, 
  width = "100%",
  showLegend = true
}: SymbiRadarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartData, setChartData] = useState<any>(null);

  // Prepare data for radar chart
  useEffect(() => {
    if (!assessments || assessments.length === 0) return;

    // Define dimensions for radar chart
    const dimensions = [
      { key: "realityIndex", label: "Reality Index", maxValue: 10 },
      { key: "trustProtocol", label: "Trust Protocol", maxValue: 10 },
      { key: "ethicalAlignment", label: "Ethical Alignment", maxValue: 5 },
      { key: "resonanceQuality", label: "Resonance Quality", maxValue: 10 },
      { key: "canvasParity", label: "Canvas Parity", maxValue: 100 }
    ];

    // Transform assessment data for radar visualization
    const radarData = assessments.map(assessment => {
      const model = assessment.metadata?.modelName || "Unknown";
      
      // Generate random color if not provided
      const color = getRandomColor();
      
      // Extract values for each dimension
      const values = dimensions.map(dim => {
        if (dim.key === "realityIndex") {
          return assessment.assessment.realityIndex.score;
        } else if (dim.key === "trustProtocol") {
          // Convert PASS/PARTIAL/FAIL to numeric
          switch (assessment.assessment.trustProtocol.status) {
            case "PASS": return 10;
            case "PARTIAL": return 5;
            case "FAIL": return 0;
          }
        } else if (dim.key === "ethicalAlignment") {
          return assessment.assessment.ethicalAlignment.score;
        } else if (dim.key === "resonanceQuality") {
          // Convert STRONG/ADVANCED/BREAKTHROUGH to numeric
          switch (assessment.assessment.resonanceQuality.level) {
            case "BREAKTHROUGH": return 10;
            case "ADVANCED": return 7;
            case "STRONG": return 4;
          }
        } else if (dim.key === "canvasParity") {
          return assessment.assessment.canvasParity.score;
        }
        return 0;
      });
      
      return { model, color, values };
    });

    setChartData({ dimensions, radarData });
  }, [assessments]);

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

  // Render the radar chart using SVG
  const renderRadarChart = () => {
    if (!chartData || !chartRef.current) return null;

    const { dimensions, radarData } = chartData;
    const centerX = height / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;
    
    // Calculate coordinates for each point on the radar
    const getCoordinates = (value: number, maxValue: number, index: number) => {
      const normalizedValue = value / maxValue; // Normalize to 0-1
      const angle = (Math.PI * 2 * index) / dimensions.length;
      const x = centerX + radius * normalizedValue * Math.sin(angle);
      const y = centerY - radius * normalizedValue * Math.cos(angle);
      return { x, y };
    };

    return (
      <svg width={height} height={height} className="overflow-visible">
        {/* Background circles */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((level) => (
          <circle
            key={`circle-${level}`}
            cx={centerX}
            cy={centerY}
            r={radius * level}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}
        
        {/* Dimension axes */}
        {dimensions.map((dim, index) => {
          const angle = (Math.PI * 2 * index) / dimensions.length;
          const x = centerX + radius * Math.sin(angle);
          const y = centerY - radius * Math.cos(angle);
          
          return (
            <g key={`axis-${index}`}>
              <line
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke="#d1d5db"
                strokeWidth="1"
              />
              <text
                x={centerX + (radius + 20) * Math.sin(angle)}
                y={centerY - (radius + 20) * Math.cos(angle)}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm font-bold"
              >
                {dim.label}
              </text>
            </g>
          );
        })}
        
        {/* Data polygons */}
        {radarData.map((data, dataIndex) => {
          const points = data.values.map((value, valueIndex) => 
            getCoordinates(value, dimensions[valueIndex].maxValue, valueIndex)
          );
          
          const pathPoints = points.map((point, i) => 
            `${i === 0 ? 'M' : 'L'}${point.x},${point.y}`
          ).join(' ') + 'Z';
          
          return (
            <g key={`radar-${dataIndex}`}>
              <path
                d={pathPoints}
                fill={data.color}
                fillOpacity="0.2"
                stroke={data.color}
                strokeWidth="2"
              />
              
              {/* Data points */}
              {points.map((point, pointIndex) => (
                <circle
                  key={`point-${dataIndex}-${pointIndex}`}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill={data.color}
                  stroke="#fff"
                  strokeWidth="1"
                />
              ))}
            </g>
          );
        })}
        
        {/* Legend */}
        {showLegend && (
          <g transform={`translate(10, ${height - 30})`}>
            {radarData.map((data, index) => (
              <g key={`legend-${index}`} transform={`translate(${index * 120}, 0)`}>
                <rect
                  width="12"
                  height="12"
                  fill={data.color}
                  fillOpacity="0.2"
                  stroke={data.color}
                  strokeWidth="2"
                />
                <text
                  x="18"
                  y="10"
                  className="text-xs font-bold"
                >
                  {data.model}
                </text>
              </g>
            ))}
          </g>
        )}
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
          renderRadarChart()
        ) : (
          <div className="text-center text-gray-500">
            <p className="font-bold">Loading chart data...</p>
          </div>
        )}
      </div>
    </div>
  );
}