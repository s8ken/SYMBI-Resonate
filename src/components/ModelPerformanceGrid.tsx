import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";

const models = [
  {
    name: "OPENAI",
    logo: "🤖",
    synergy: 8.7,
    presence: 82,
    change: 12.5,
    trend: "up"
  },
  {
    name: "CLAUDE", 
    logo: "🔮",
    synergy: 7.2,
    presence: 68,
    change: 5.3,
    trend: "up"
  },
  {
    name: "GEMINI",
    logo: "✨", 
    synergy: 6.8,
    presence: 71,
    change: -2.1,
    trend: "down"
  },
  {
    name: "META AI",
    logo: "🌐",
    synergy: 5.9,
    presence: 64,
    change: 8.7,
    trend: "up"
  },
  {
    name: "GROK",
    logo: "⚡",
    synergy: 4.2,
    presence: 45,
    change: 0,
    trend: "neutral"
  },
  {
    name: "DEEPSEEK",
    logo: "🧠",
    synergy: 3.1,
    presence: 38,
    change: 15.2,
    trend: "up"
  },
];

export function ModelPerformanceGrid() {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-5 h-5 text-brutalist-black" />;
      case "down":
        return <TrendingDown className="w-5 h-5 text-brutalist-black" />;
      default:
        return <Minus className="w-5 h-5 text-brutalist-black" />;
    }
  };

  return (
    <div className="brutalist-card">
      <div className="flex flex-row items-center justify-between pb-8">
        <div>
          <h3 className="text-2xl font-black text-brutalist-black mb-3 uppercase">MODEL SYNERGY PERFORMANCE</h3>
          <p className="text-brutalist-black font-bold uppercase tracking-wide">
            YOUR BRAND'S COLLABORATIVE POTENTIAL ACROSS DIFFERENT AI ECOSYSTEMS
          </p>
        </div>
        <button className="brutalist-button-secondary gap-3 flex items-center">
          VIEW DETAILS
          <ExternalLink className="w-5 h-5" />
        </button>
      </div>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {models.map((model) => (
            <div
              key={model.name}
              className="border-4 border-brutalist-black bg-brutalist-white p-6 hover:brutalist-shadow-lg transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-brutalist-gray-light border-4 border-brutalist-black flex items-center justify-center">
                    <span className="text-3xl">{model.logo}</span>
                  </div>
                  <div>
                    <h3 className="font-black text-brutalist-black text-xl uppercase">{model.name}</h3>
                    <div className="flex items-center space-x-2 mt-2">
                      {getTrendIcon(model.trend)}
                      <span className="text-lg font-black text-brutalist-black uppercase">
                        {model.change > 0 ? "+" : ""}{model.change}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-brutalist-black font-bold uppercase tracking-widest">SYNERGY</span>
                    <span className="font-black text-brutalist-black text-lg">{model.synergy}/10</span>
                  </div>
                  <div className="w-full bg-brutalist-gray-light border-2 border-brutalist-black h-4">
                    <div 
                      className="bg-brutalist-black h-4 transition-all duration-500"
                      style={{ width: `${model.synergy * 10}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-brutalist-black font-bold uppercase tracking-widest">PRESENCE</span>
                    <span className="font-black text-brutalist-black text-lg">{model.presence}%</span>
                  </div>
                  <div className="w-full bg-brutalist-gray-light border-2 border-brutalist-black h-4">
                    <div 
                      className="bg-brutalist-black h-4 transition-all duration-500"
                      style={{ width: `${model.presence}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}