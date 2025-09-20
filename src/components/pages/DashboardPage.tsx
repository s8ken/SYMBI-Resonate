import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Eye, Target, Trophy, MessageSquare, Download, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { MetricsChart } from "../MetricsChart";
import { OptimizationDonut } from "../OptimizationDonut";
import { ModelPerformanceGrid } from "../ModelPerformanceGrid";
import { TopPerformingPrompts } from "../TopPerformingPrompts";
import { CompetitorRanking } from "../CompetitorRanking";

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
  return (
    <>
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