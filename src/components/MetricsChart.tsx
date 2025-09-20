import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const synergyData = [
  { date: "JAN 18", synergy: 6.8, presence: 68 },
  { date: "JAN 19", synergy: 7.2, presence: 71 },
  { date: "JAN 20", synergy: 6.9, presence: 69 },
  { date: "JAN 21", synergy: 7.8, presence: 73 },
  { date: "JAN 22", synergy: 8.1, presence: 76 },
  { date: "JAN 23", synergy: 8.4, presence: 74 },
  { date: "JAN 24", synergy: 8.4, presence: 74 },
];

const collaborationData = [
  { date: "JAN 18", collaborations: 156, integrations: 89 },
  { date: "JAN 19", collaborations: 203, integrations: 112 },
  { date: "JAN 20", collaborations: 178, integrations: 95 },
  { date: "JAN 21", collaborations: 234, integrations: 134 },
  { date: "JAN 22", collaborations: 289, integrations: 167 },
  { date: "JAN 23", collaborations: 312, integrations: 189 },
  { date: "JAN 24", collaborations: 298, integrations: 172 },
];

export function MetricsChart() {
  const [activeTab, setActiveTab] = useState("synergy");

  return (
    <div className="brutalist-card">
      <div className="pb-8">
        <h3 className="text-2xl font-black text-brutalist-black mb-3 uppercase">SYNERGY & PRESENCE TRENDS</h3>
        <p className="text-brutalist-black font-bold uppercase tracking-wide">
          TRACK YOUR BRAND'S COLLABORATIVE PERFORMANCE ACROSS AI ECOSYSTEMS OVER THE LAST 7 DAYS
        </p>
      </div>
      <div>
        {/* Tab Buttons */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab("synergy")}
            className={`brutalist-button-secondary flex-1 ${
              activeTab === "synergy" ? "bg-brutalist-black text-brutalist-white" : ""
            }`}
          >
            SYNERGY & PRESENCE
          </button>
          <button 
            onClick={() => setActiveTab("collaboration")}
            className={`brutalist-button-secondary flex-1 ${
              activeTab === "collaboration" ? "bg-brutalist-black text-brutalist-white" : ""
            }`}
          >
            COLLABORATIONS & INTEGRATIONS
          </button>
        </div>
        
        {/* Chart Container */}
        <div className="h-80 border-4 border-brutalist-black bg-brutalist-gray-light p-4">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === "synergy" ? (
              <LineChart data={synergyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="0" stroke="#000000" strokeWidth={2} />
                <XAxis 
                  dataKey="date" 
                  stroke="#000000"
                  fontSize={12}
                  fontWeight={700}
                  tickLine={{ stroke: "#000000", strokeWidth: 2 }}
                  axisLine={{ stroke: "#000000", strokeWidth: 4 }}
                />
                <YAxis 
                  stroke="#000000"
                  fontSize={12}
                  fontWeight={700}
                  tickLine={{ stroke: "#000000", strokeWidth: 2 }}
                  axisLine={{ stroke: "#000000", strokeWidth: 4 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "4px solid #000000",
                    borderRadius: "0px",
                    boxShadow: "4px 4px 0px #000000",
                    fontWeight: 700,
                    color: "#000000",
                    textTransform: "uppercase"
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="synergy" 
                  stroke="#000000" 
                  strokeWidth={4}
                  dot={{ fill: "#000000", strokeWidth: 0, r: 6 }}
                  activeDot={{ r: 8, stroke: "#000000", strokeWidth: 4, fill: "#FFFFFF" }}
                  name="SYNERGY SCORE"
                />
                <Line 
                  type="monotone" 
                  dataKey="presence" 
                  stroke="#666666" 
                  strokeWidth={4}
                  dot={{ fill: "#666666", strokeWidth: 0, r: 6 }}
                  activeDot={{ r: 8, stroke: "#666666", strokeWidth: 4, fill: "#FFFFFF" }}
                  name="PRESENCE %"
                />
              </LineChart>
            ) : (
              <LineChart data={collaborationData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="0" stroke="#000000" strokeWidth={2} />
                <XAxis 
                  dataKey="date" 
                  stroke="#000000"
                  fontSize={12}
                  fontWeight={700}
                  tickLine={{ stroke: "#000000", strokeWidth: 2 }}
                  axisLine={{ stroke: "#000000", strokeWidth: 4 }}
                />
                <YAxis 
                  stroke="#000000"
                  fontSize={12}
                  fontWeight={700}
                  tickLine={{ stroke: "#000000", strokeWidth: 2 }}
                  axisLine={{ stroke: "#000000", strokeWidth: 4 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "4px solid #000000",
                    borderRadius: "0px",
                    boxShadow: "4px 4px 0px #000000",
                    fontWeight: 700,
                    color: "#000000",
                    textTransform: "uppercase"
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="collaborations" 
                  stroke="#000000" 
                  strokeWidth={4}
                  dot={{ fill: "#000000", strokeWidth: 0, r: 6 }}
                  activeDot={{ r: 8, stroke: "#000000", strokeWidth: 4, fill: "#FFFFFF" }}
                  name="TOTAL COLLABORATIONS"
                />
                <Line 
                  type="monotone" 
                  dataKey="integrations" 
                  stroke="#666666" 
                  strokeWidth={4}
                  dot={{ fill: "#666666", strokeWidth: 0, r: 6 }}
                  activeDot={{ r: 8, stroke: "#666666", strokeWidth: 4, fill: "#FFFFFF" }}
                  name="INTEGRATIONS"
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}