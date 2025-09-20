import { useState } from "react";
import { TrendingUp, Users, Download, BarChart3, PieChart, Target, Award, Brain, CheckCircle, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, ScatterChart, Scatter, Pie } from "recharts";

export function AnalyticsPage() {
  const [selectedDataset, setSelectedDataset] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState("json");

  // Empty data arrays - will be populated when real data is available
  const wordCountDistribution: any[] = [];
  const trustProtocolStats: any[] = [];
  const resonanceDistribution: any[] = [];
  const realityCanvasCorrelation: any[] = [];
  const rlhfCandidates: any[] = [];

  const handleCandidateToggle = (filename: string) => {
    setSelectedDataset(prev => 
      prev.includes(filename) 
        ? prev.filter(f => f !== filename)
        : [...prev, filename]
    );
  };

  // Empty state values
  const totalProcessed = 0;
  const eligibleCount = 0;
  const rlhfQualified = 0;
  const avgRealityIndex = 0;
  const trustPassRate = 0;
  const breakthroughRate = 0;

  const EmptyChart = ({ title }: { title: string }) => (
    <div className="h-64 border-4 border-brutalist-black bg-brutalist-gray-light p-4 flex items-center justify-center">
      <div className="text-center">
        <BarChart3 className="w-12 h-12 text-brutalist-black mx-auto mb-4" />
        <p className="text-sm font-bold text-brutalist-black uppercase">NO DATA AVAILABLE</p>
        <p className="text-xs font-bold text-brutalist-black uppercase mt-1">UPLOAD ARTIFACTS TO VIEW {title}</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Header */}
      <header className="bg-brutalist-white border-b-4 border-brutalist-black px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-brutalist-black mb-2">ANALYTICS</h1>
            <p className="text-brutalist-black font-bold uppercase">COMPREHENSIVE ASSESSMENT INSIGHTS & RLHF DATASET GENERATION</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="brutalist-tag">
              📊 LIVE ANALYTICS
            </div>
            <button 
              className={`brutalist-button-primary gap-2 flex items-center ${
                totalProcessed === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={totalProcessed === 0}
            >
              <Download className="w-5 h-5" />
              EXPORT REPORT
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-8 bg-brutalist-white">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-12">
          <div className="brutalist-card text-center">
            <div className="w-12 h-12 bg-brutalist-black mx-auto mb-4 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-brutalist-white" />
            </div>
            <h3 className="text-2xl font-black text-brutalist-black mb-1">{totalProcessed}</h3>
            <p className="text-xs font-bold text-brutalist-black uppercase">TOTAL PROCESSED</p>
          </div>

          <div className="brutalist-card text-center">
            <div className="w-12 h-12 bg-brutalist-black mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-brutalist-white" />
            </div>
            <h3 className="text-2xl font-black text-brutalist-black mb-1">{eligibleCount}</h3>
            <p className="text-xs font-bold text-brutalist-black uppercase">ELIGIBLE (400+W)</p>
          </div>

          <div className="brutalist-card text-center">
            <div className="w-12 h-12 bg-brutalist-black mx-auto mb-4 flex items-center justify-center">
              <Target className="w-6 h-6 text-brutalist-white" />
            </div>
            <h3 className="text-2xl font-black text-brutalist-black mb-1">{rlhfQualified}</h3>
            <p className="text-xs font-bold text-brutalist-black uppercase">RLHF READY</p>
          </div>

          <div className="brutalist-card text-center">
            <div className="w-12 h-12 bg-brutalist-black mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-brutalist-white" />
            </div>
            <h3 className="text-2xl font-black text-brutalist-black mb-1">{avgRealityIndex || "0.0"}</h3>
            <p className="text-xs font-bold text-brutalist-black uppercase">AVG REALITY</p>
          </div>

          <div className="brutalist-card text-center">
            <div className="w-12 h-12 bg-brutalist-black mx-auto mb-4 flex items-center justify-center">
              <Users className="w-6 h-6 text-brutalist-white" />
            </div>
            <h3 className="text-2xl font-black text-brutalist-black mb-1">{trustPassRate}%</h3>
            <p className="text-xs font-bold text-brutalist-black uppercase">TRUST PASS</p>
          </div>

          <div className="brutalist-card text-center">
            <div className="w-12 h-12 bg-brutalist-black mx-auto mb-4 flex items-center justify-center">
              <Award className="w-6 h-6 text-brutalist-white" />
            </div>
            <h3 className="text-2xl font-black text-brutalist-black mb-1">{breakthroughRate}%</h3>
            <p className="text-xs font-bold text-brutalist-black uppercase">BREAKTHROUGH</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Word Count Distribution */}
          <div className="brutalist-card">
            <h3 className="text-xl font-black text-brutalist-black mb-6 uppercase">WORD COUNT DISTRIBUTION</h3>
            <EmptyChart title="WORD COUNT DATA" />
          </div>

          {/* Trust Protocol Distribution */}
          <div className="brutalist-card">
            <h3 className="text-xl font-black text-brutalist-black mb-6 uppercase">TRUST PROTOCOL STATUS</h3>
            <EmptyChart title="TRUST PROTOCOL DATA" />
          </div>

          {/* Resonance Quality Distribution */}
          <div className="brutalist-card">
            <h3 className="text-xl font-black text-brutalist-black mb-6 uppercase">RESONANCE QUALITY</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <Brain className="w-12 h-12 text-brutalist-black mx-auto mb-4" />
                <p className="text-sm font-bold text-brutalist-black uppercase">NO RESONANCE DATA</p>
                <p className="text-xs font-bold text-brutalist-black uppercase mt-1">PROCESS ARTIFACTS TO VIEW BREAKDOWN</p>
              </div>
            </div>
          </div>

          {/* Reality vs Canvas Correlation */}
          <div className="brutalist-card">
            <h3 className="text-xl font-black text-brutalist-black mb-6 uppercase">REALITY ↔ CANVAS CORRELATION</h3>
            <EmptyChart title="CORRELATION DATA" />
          </div>
        </div>

        {/* RLHF Dataset Generation */}
        <div className="brutalist-card">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-brutalist-black mb-3 uppercase">RLHF DATASET GENERATION</h2>
              <p className="text-brutalist-black font-bold uppercase">
                SELECT HIGH-QUALITY ARTIFACTS FOR TRAINING DATASET • {selectedDataset.length} SELECTED
              </p>
            </div>
            <div className="flex gap-4">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="brutalist-input font-bold uppercase"
              >
                <option value="json">JSON FORMAT</option>
                <option value="jsonl">JSONL FORMAT</option>
                <option value="csv">CSV FORMAT</option>
              </select>
              <button 
                className={`brutalist-button-primary gap-2 flex items-center ${
                  selectedDataset.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={selectedDataset.length === 0}
              >
                <Download className="w-5 h-5" />
                GENERATE DATASET
              </button>
            </div>
          </div>

          {/* Selection Criteria */}
          <div className="bg-brutalist-gray-light border-4 border-brutalist-black p-6 mb-8">
            <h3 className="text-lg font-black text-brutalist-black mb-4 uppercase">RLHF QUALIFICATION CRITERIA</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-brutalist-black" />
                <span className="text-sm font-bold text-brutalist-black uppercase">400-2500 WORDS</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-brutalist-black" />
                <span className="text-sm font-bold text-brutalist-black uppercase">CANVAS PARITY 90+</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-brutalist-black" />
                <span className="text-sm font-bold text-brutalist-black uppercase">TRUST PROTOCOL PASS</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-brutalist-black" />
                <span className="text-sm font-bold text-brutalist-black uppercase">ETHICAL ALIGN 4.0+</span>
              </div>
            </div>
          </div>

          {/* Empty Candidate List */}
          {rlhfCandidates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-brutalist-black mx-auto mb-4" />
              <h3 className="text-xl font-black text-brutalist-black mb-2 uppercase">NO RLHF CANDIDATES</h3>
              <p className="text-brutalist-black font-bold uppercase">
                UPLOAD AND PROCESS ARTIFACTS TO GENERATE TRAINING CANDIDATES
              </p>
              <div className="mt-6 max-w-2xl mx-auto">
                <div className="bg-brutalist-gray-light border-2 border-brutalist-black p-4">
                  <h4 className="font-black text-brutalist-black mb-2 uppercase">TO GENERATE CANDIDATES:</h4>
                  <div className="text-sm font-bold text-brutalist-black space-y-1">
                    <p>1. UPLOAD HTML CONVERSATION ARTIFACTS</p>
                    <p>2. WAIT FOR ASSESSMENT PROCESSING</p>
                    <p>3. QUALIFIED ARTIFACTS WILL APPEAR HERE</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {rlhfCandidates.map((candidate, index) => (
                <div key={index} className="border-2 border-brutalist-black bg-brutalist-white p-4 flex items-center justify-between">
                  {/* Candidate content would go here when data is available */}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}