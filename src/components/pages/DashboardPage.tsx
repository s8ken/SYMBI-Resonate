import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import { Eye, Target, Trophy, MessageSquare, Download, TrendingUp, ArrowUp, ArrowDown, Play, ExternalLink } from "lucide-react";
import { MetricsChart } from "../MetricsChart";
import { OptimizationDonut } from "../OptimizationDonut";
import { ModelPerformanceGrid } from "../ModelPerformanceGrid";
import { TopPerformingPrompts } from "../TopPerformingPrompts";
import { CompetitorRanking } from "../CompetitorRanking";
import { useNavigate } from "react-router-dom";

const metrics = [
  {
    title: "SYNERGY SCORE",
    value: "8.4",
    change: "+12.5%",
    icon: Eye,
    isPositive: true
  },
  {
    title: "PRESENCE SCORE", 
    value: "74%",
    change: "+8.2%",
    icon: Target,
    isPositive: true
  },
  {
    title: "AVERAGE RANK",
    value: "2.3",
    change: "-0.4",
    icon: Trophy,
    isPositive: false
  },
  {
    title: "COLLABORATIONS",
    value: "1,247",
    change: "+23.1%",
    icon: MessageSquare,
    isPositive: true
  },
];

export function DashboardPage() {
  const navigate = useNavigate();

  return (
    <>
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <div>
              <h3 className="font-bold text-lg">🚀 Interactive Demo Available</h3>
              <p className="text-blue-100">Experience SYMBI Resonate with realistic AI consciousness detection</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => navigate('/demo')}
              className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-6 py-3 rounded-none border-2 border-white transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]"
            >
              <Play className="w-4 h-4 mr-2" />
              Launch Demo
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open('/demo', '_blank')}
              className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-blue-600 font-bold px-6 py-3 rounded-none transition-all duration-200"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in New Tab
            </Button>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-brutalist-white border-b-4 border-brutalist-black px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black text-brutalist-black mb-3">DASHBOARD</h1>
            <p className="text-brutalist-black font-bold uppercase tracking-wide">MONITOR YOUR BRAND'S SYNERGY ACROSS AI ECOSYSTEMS</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="brutalist-tag">
              LIVE SYNERGY
            </div>
            <button className="brutalist-button-primary gap-3 flex items-center">
              <Download className="w-5 h-5" />
              EXPORT REPORT
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-8 bg-brutalist-white">
        {/* Top-level Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            
            return (
              <div key={metric.title} className="brutalist-card hover:brutalist-shadow-lg transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-16 h-16 bg-brutalist-black border-4 border-brutalist-black flex items-center justify-center">
                    <Icon className="w-8 h-8 text-brutalist-white" />
                  </div>
                  <div className="flex items-center space-x-2">
                    {metric.isPositive ? (
                      <ArrowUp className="w-5 h-5 text-brutalist-black" />
                    ) : (
                      <ArrowDown className="w-5 h-5 text-brutalist-black" />
                    )}
                    <span className="text-lg font-black text-brutalist-black uppercase">
                      {metric.change}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-5xl font-black text-brutalist-black mb-3">{metric.value}</h3>
                  <p className="text-sm font-bold text-brutalist-black uppercase tracking-widest">{metric.title}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <MetricsChart />
          </div>
          <div>
            <OptimizationDonut />
          </div>
        </div>

        {/* Model Performance */}
        <div className="mb-12">
          <ModelPerformanceGrid />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TopPerformingPrompts />
          <CompetitorRanking />
        </div>
      </main>
    </>
  );
}