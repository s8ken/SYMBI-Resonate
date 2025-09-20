import { TrendingUp, Target, Award, Users, FileText, CheckCircle, AlertTriangle, Brain, BarChart3 } from "lucide-react";

export function AssessmentSummary() {
  // Empty state values
  const summaryStats = {
    totalArtifacts: 0,
    processed: 0,
    eligible: 0,
    rlhfReady: 0,
    avgRealityIndex: 0,
    trustPassRate: 0,
    breakthroughRate: 0,
    processingEfficiency: 0,
    timesSaved: 0
  };

  const EmptyChart = ({ title }: { title: string }) => (
    <div className="h-64 border-4 border-brutalist-black bg-brutalist-gray-light p-4 flex items-center justify-center">
      <div className="text-center">
        <BarChart3 className="w-12 h-12 text-brutalist-black mx-auto mb-4" />
        <p className="text-sm font-bold text-brutalist-black uppercase">NO {title} DATA</p>
        <p className="text-xs font-bold text-brutalist-black uppercase mt-1">UPLOAD ARTIFACTS TO GENERATE INSIGHTS</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="brutalist-card text-center">
          <div className="w-16 h-16 bg-brutalist-black mx-auto mb-4 flex items-center justify-center">
            <FileText className="w-8 h-8 text-brutalist-white" />
          </div>
          <h3 className="text-3xl font-black text-brutalist-black mb-2">{summaryStats.processed}</h3>
          <p className="text-sm font-bold text-brutalist-black uppercase">ARTIFACTS PROCESSED</p>
          <div className="mt-2 text-xs font-bold text-brutalist-black uppercase">
            READY FOR UPLOAD
          </div>
        </div>

        <div className="brutalist-card text-center">
          <div className="w-16 h-16 bg-brutalist-black mx-auto mb-4 flex items-center justify-center">
            <Target className="w-8 h-8 text-brutalist-white" />
          </div>
          <h3 className="text-3xl font-black text-brutalist-black mb-2">{summaryStats.rlhfReady}</h3>
          <p className="text-sm font-bold text-brutalist-black uppercase">RLHF CANDIDATES</p>
          <div className="mt-2 text-xs font-bold text-brutalist-black uppercase">
            AWAITING ASSESSMENT
          </div>
        </div>

        <div className="brutalist-card text-center">
          <div className="w-16 h-16 bg-brutalist-black mx-auto mb-4 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-brutalist-white" />
          </div>
          <h3 className="text-3xl font-black text-brutalist-black mb-2">{summaryStats.avgRealityIndex || "0.0"}</h3>
          <p className="text-sm font-bold text-brutalist-black uppercase">AVG REALITY INDEX</p>
          <div className="mt-2 text-xs font-bold text-brutalist-black uppercase">
            NO DATA YET
          </div>
        </div>

        <div className="brutalist-card text-center">
          <div className="w-16 h-16 bg-brutalist-black mx-auto mb-4 flex items-center justify-center">
            <Award className="w-8 h-8 text-brutalist-white" />
          </div>
          <h3 className="text-3xl font-black text-brutalist-black mb-2">{summaryStats.breakthroughRate}%</h3>
          <p className="text-sm font-bold text-brutalist-black uppercase">BREAKTHROUGH RATE</p>
          <div className="mt-2 text-xs font-bold text-brutalist-black uppercase">
            NO DATA YET
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quality Distribution */}
        <div className="brutalist-card">
          <h3 className="text-xl font-black text-brutalist-black mb-6 uppercase">RESONANCE QUALITY DISTRIBUTION</h3>
          <EmptyChart title="QUALITY" />
        </div>

        {/* Weekly Progress */}
        <div className="brutalist-card">
          <h3 className="text-xl font-black text-brutalist-black mb-6 uppercase">WEEKLY PROCESSING PROGRESS</h3>
          <EmptyChart title="PROGRESS" />
        </div>
      </div>

      {/* Dimension Performance */}
      <div className="brutalist-card">
        <h3 className="text-xl font-black text-brutalist-black mb-6 uppercase">ASSESSMENT DIMENSION PERFORMANCE</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {["Reality Index", "Trust Protocol", "Ethical Align", "Canvas Parity"].map((dimension, index) => (
            <div key={index} className="border-2 border-brutalist-black bg-brutalist-white p-4 text-center">
              <h4 className="font-black text-brutalist-black text-sm uppercase mb-3">{dimension}</h4>
              <div className="text-3xl font-black text-brutalist-black mb-2">
                {dimension.includes("Trust") ? "0%" : "0.0"}
              </div>
              <div className="flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 text-brutalist-black" />
                <span className="text-sm font-bold text-brutalist-black">
                  NO DATA YET
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="brutalist-card text-center">
          <div className="w-12 h-12 bg-brutalist-black mx-auto mb-4 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-brutalist-white" />
          </div>
          <h3 className="text-2xl font-black text-brutalist-black mb-2">READY</h3>
          <p className="text-sm font-bold text-brutalist-black uppercase">SYSTEM STATUS</p>
          <div className="mt-2 text-xs font-bold text-brutalist-black uppercase">
            AWAITING FIRST UPLOAD
          </div>
        </div>

        <div className="brutalist-card text-center">
          <div className="w-12 h-12 bg-brutalist-black mx-auto mb-4 flex items-center justify-center">
            <Users className="w-6 h-6 text-brutalist-white" />
          </div>
          <h3 className="text-2xl font-black text-brutalist-black mb-2">0h</h3>
          <p className="text-sm font-bold text-brutalist-black uppercase">TIME SAVED</p>
          <div className="mt-2 text-xs font-bold text-brutalist-black uppercase">
            THROUGH AUTOMATION
          </div>
        </div>

        <div className="brutalist-card text-center">
          <div className="w-12 h-12 bg-brutalist-black mx-auto mb-4 flex items-center justify-center">
            <Brain className="w-6 h-6 text-brutalist-white" />
          </div>
          <h3 className="text-2xl font-black text-brutalist-black mb-2">100%</h3>
          <p className="text-sm font-bold text-brutalist-black uppercase">FRAMEWORK READY</p>
          <div className="mt-2 text-xs font-bold text-brutalist-black uppercase">
            GROK COMPLIANT
          </div>
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="brutalist-card">
        <h3 className="text-xl font-black text-brutalist-black mb-6 uppercase">GETTING STARTED WITH SYMBI ASSESSMENT</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-brutalist-black text-brutalist-white flex items-center justify-center font-black text-sm">1</div>
              <div>
                <h4 className="font-black text-brutalist-black uppercase text-sm mb-1">UPLOAD ARTIFACTS</h4>
                <p className="text-sm font-bold text-brutalist-black">Navigate to Assessment page and upload HTML conversation files</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-brutalist-black text-brutalist-white flex items-center justify-center font-black text-sm">2</div>
              <div>
                <h4 className="font-black text-brutalist-black uppercase text-sm mb-1">AUTO-PROCESSING</h4>
                <p className="text-sm font-bold text-brutalist-black">Files under 400 words are automatically filtered out</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-brutalist-black text-brutalist-white flex items-center justify-center font-black text-sm">3</div>
              <div>
                <h4 className="font-black text-brutalist-black uppercase text-sm mb-1">5-DIMENSION ASSESSMENT</h4>
                <p className="text-sm font-bold text-brutalist-black">Each artifact scored across Reality, Trust, Ethics, Resonance, Canvas</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-brutalist-black text-brutalist-white flex items-center justify-center font-black text-sm">4</div>
              <div>
                <h4 className="font-black text-brutalist-black uppercase text-sm mb-1">CROSS-CHECK REVIEW</h4>
                <p className="text-sm font-bold text-brutalist-black">AI validation layer ensures scoring accuracy and consistency</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-brutalist-black text-brutalist-white flex items-center justify-center font-black text-sm">5</div>
              <div>
                <h4 className="font-black text-brutalist-black uppercase text-sm mb-1">RLHF DATASET</h4>
                <p className="text-sm font-bold text-brutalist-black">High-quality artifacts automatically flagged for training use</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-brutalist-black text-brutalist-white flex items-center justify-center font-black text-sm">6</div>
              <div>
                <h4 className="font-black text-brutalist-black uppercase text-sm mb-1">ANALYTICS & INSIGHTS</h4>
                <p className="text-sm font-bold text-brutalist-black">Comprehensive reporting and trend analysis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}