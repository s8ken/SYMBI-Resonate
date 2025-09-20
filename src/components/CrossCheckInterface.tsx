import { useState } from "react";
import { AlertTriangle, CheckCircle, XCircle, Flag, MessageSquare, Eye, TrendingUp, Users, Brain, X } from "lucide-react";

interface CrossCheckInterfaceProps {
  artifactId: string;
  onClose: () => void;
  onApprove: (adjustments?: any) => void;
}

export function CrossCheckInterface({ artifactId, onClose, onApprove }: CrossCheckInterfaceProps) {
  const [activeTab, setActiveTab] = useState("comparison");

  return (
    <div className="fixed inset-0 bg-brutalist-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-brutalist-white border-4 border-brutalist-black brutalist-shadow-lg w-full max-w-7xl h-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="border-b-4 border-brutalist-black p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-brutalist-black uppercase mb-2">CROSS-CHECK REVIEW</h2>
            <div className="flex items-center gap-6 text-sm font-bold text-brutalist-black uppercase">
              <span>📄 ARTIFACT ID: {artifactId}</span>
              <span>🔧 INTEGRATION REQUIRED</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="brutalist-tag bg-brutalist-gray-light text-brutalist-black border-2 border-brutalist-black">
              ⏳ AWAITING SETUP
            </div>
            <button onClick={onClose} className="brutalist-button-secondary">
              CLOSE
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b-4 border-brutalist-black">
          <div className="flex">
            {[
              { id: "comparison", label: "SIDE-BY-SIDE", icon: Eye },
              { id: "discrepancies", label: "DISCREPANCIES", icon: AlertTriangle },
              { id: "grok", label: "GROK COMPLIANCE", icon: CheckCircle },
              { id: "review", label: "FINAL REVIEW", icon: MessageSquare }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 border-r-2 border-brutalist-black font-bold text-sm uppercase flex items-center gap-2 transition-colors ${
                    activeTab === tab.id 
                      ? "bg-brutalist-black text-brutalist-white" 
                      : "bg-brutalist-white text-brutalist-black hover:bg-brutalist-gray-light"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-brutalist-gray-light border-4 border-brutalist-black mx-auto mb-8 flex items-center justify-center">
              <TrendingUp className="w-12 h-12 text-brutalist-black" />
            </div>
            
            <h3 className="text-2xl font-black text-brutalist-black mb-4 uppercase">CROSS-CHECK SYSTEM READY</h3>
            
            <div className="max-w-3xl mx-auto space-y-6">
              <p className="text-brutalist-black font-bold uppercase">
                AUTOMATED VS AI REVIEW COMPARISON INTERFACE CONFIGURED
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-brutalist-gray-light border-4 border-brutalist-black p-6 text-left">
                  <h4 className="font-black text-brutalist-black mb-4 uppercase">AUTOMATED ASSESSMENT</h4>
                  <div className="space-y-3 text-sm font-bold text-brutalist-black">
                    <div>• REALITY INDEX CALCULATION</div>
                    <div>• TRUST PROTOCOL VERIFICATION</div>
                    <div>• ETHICAL ALIGNMENT SCORING</div>
                    <div>• RESONANCE QUALITY DETECTION</div>
                    <div>• CANVAS PARITY MEASUREMENT</div>
                  </div>
                </div>

                <div className="bg-brutalist-black text-brutalist-white border-4 border-brutalist-black p-6 text-left">
                  <h4 className="font-black text-brutalist-white mb-4 uppercase">AI CROSS-CHECK</h4>
                  <div className="space-y-3 text-sm font-bold text-brutalist-white">
                    <div>• SECONDARY VALIDATION LAYER</div>
                    <div>• DISCREPANCY DETECTION</div>
                    <div>• CONFIDENCE SCORING</div>
                    <div>• GROK METHODOLOGY COMPLIANCE</div>
                    <div>• EVIDENCE-BASED REVIEW</div>
                  </div>
                </div>
              </div>

              <div className="bg-brutalist-gray-light border-4 border-brutalist-black p-6">
                <h4 className="font-black text-brutalist-black mb-4 uppercase">CROSS-CHECK WORKFLOW:</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-brutalist-black text-brutalist-white mx-auto flex items-center justify-center font-black">1</div>
                    <p className="text-xs font-bold text-brutalist-black uppercase">AUTOMATED PROCESSING</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-brutalist-black text-brutalist-white mx-auto flex items-center justify-center font-black">2</div>
                    <p className="text-xs font-bold text-brutalist-black uppercase">AI REVIEW</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-brutalist-black text-brutalist-white mx-auto flex items-center justify-center font-black">3</div>
                    <p className="text-xs font-bold text-brutalist-black uppercase">DISCREPANCY ANALYSIS</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-brutalist-black text-brutalist-white mx-auto flex items-center justify-center font-black">4</div>
                    <p className="text-xs font-bold text-brutalist-black uppercase">FINAL APPROVAL</p>
                  </div>
                </div>
              </div>

              <div className="bg-brutalist-black text-brutalist-white border-4 border-brutalist-black p-6">
                <h4 className="font-black text-brutalist-white mb-3 uppercase">GROK ANTI-UNIFORM METHODOLOGY:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-bold">
                  <div>✓ GRANULAR EVIDENCE-BASED SCORING</div>
                  <div>✓ NON-UNIFORM SCORE DISTRIBUTION</div>
                  <div>✓ TIERED RESONANCE CLASSIFICATION</div>
                  <div>✓ RLHF TRAINING DATA OPTIMIZATION</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}