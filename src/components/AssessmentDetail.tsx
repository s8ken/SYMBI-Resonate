import { useState, useEffect } from "react";
import { X, Download, Eye, CheckCircle, AlertCircle, XCircle, TrendingUp, Users, Brain, Target, Loader2 } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface AssessmentDetailProps {
  assessmentId: string;
  onClose: () => void;
}

interface AssessmentData {
  id: string;
  filename: string;
  word_count: number;
  upload_timestamp: string;
  processing_status: string;
  assessment: {
    reality_index: {
      score: number;
      components: {
        mission_alignment: number;
        contextual_coherence: number;
        technical_accuracy: number;
        authenticity: number;
      };
      evidence: string[];
    };
    trust_protocol: {
      status: string;
      trust_score: number;
      verification_methods: string[];
      evidence: string[];
    };
    ethical_alignment: {
      score: number;
      components: {
        limitations_acknowledgment: number;
        stakeholder_awareness: number;
        ethical_reasoning: number;
        boundary_maintenance: number;
      };
    };
    resonance_quality: {
      tier: string;
      creativity_score: number;
      synthesis_quality: string;
      innovation_markers: string[];
    };
    canvas_parity: {
      score: number;
      human_agency: number;
      ai_contribution: number;
      transparency: number;
      collaboration_quality: number;
    };
  } | null;
  metadata: {
    confidence_score: number;
    human_review_required: boolean;
    rlhf_candidate: boolean;
  };
}

export function AssessmentDetail({ assessmentId, onClose }: AssessmentDetailProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAssessment();
  }, [assessmentId]);

  const loadAssessment = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f9ece59c/assess/${assessmentId}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAssessment(data);
        setError(null);
      } else {
        setError('Failed to load assessment details');
      }
    } catch (err) {
      setError('Network error while loading assessment');
      console.log('Error loading assessment:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number, max: number = 10) => {
    const percentage = (score / max) * 100;
    if (percentage >= 90) return "text-green-700";
    if (percentage >= 70) return "text-yellow-600";
    if (percentage >= 50) return "text-orange-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-brutalist-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-brutalist-white border-4 border-brutalist-black brutalist-shadow-lg w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-brutalist-black mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-black text-brutalist-black uppercase">LOADING ASSESSMENT</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="fixed inset-0 bg-brutalist-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-brutalist-white border-4 border-brutalist-black brutalist-shadow-lg w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
          <div className="border-b-4 border-brutalist-black p-6 flex items-center justify-between">
            <h2 className="text-2xl font-black text-brutalist-black uppercase">ERROR</h2>
            <button onClick={onClose} className="p-2 border-2 border-brutalist-black bg-brutalist-white hover:bg-brutalist-black hover:text-brutalist-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-brutalist-black mx-auto mb-4" />
              <h3 className="text-xl font-black text-brutalist-black uppercase mb-2">ASSESSMENT NOT FOUND</h3>
              <p className="text-brutalist-black font-bold uppercase">{error || 'Assessment data unavailable'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment.assessment) {
    return (
      <div className="fixed inset-0 bg-brutalist-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-brutalist-white border-4 border-brutalist-black brutalist-shadow-lg w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
          <div className="border-b-4 border-brutalist-black p-6 flex items-center justify-between">
            <h2 className="text-2xl font-black text-brutalist-black uppercase">ASSESSMENT DETAILS</h2>
            <button onClick={onClose} className="p-2 border-2 border-brutalist-black bg-brutalist-white hover:bg-brutalist-black hover:text-brutalist-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              {assessment.processing_status === 'processing' ? (
                <>
                  <Loader2 className="w-16 h-16 text-brutalist-black mx-auto mb-4 animate-spin" />
                  <h3 className="text-xl font-black text-brutalist-black uppercase mb-2">PROCESSING</h3>
                  <p className="text-brutalist-black font-bold uppercase">Assessment in progress</p>
                </>
              ) : (
                <>
                  <AlertCircle className="w-16 h-16 text-brutalist-black mx-auto mb-4" />
                  <h3 className="text-xl font-black text-brutalist-black uppercase mb-2">NO ASSESSMENT DATA</h3>
                  <p className="text-brutalist-black font-bold uppercase">Assessment not yet completed</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-brutalist-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-brutalist-white border-4 border-brutalist-black brutalist-shadow-lg w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b-4 border-brutalist-black p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-brutalist-black uppercase mb-2">ASSESSMENT DETAILS</h2>
            <div className="flex items-center gap-6 text-sm font-bold text-brutalist-black uppercase">
              <span>📁 {assessment.filename}</span>
              <span>📏 {assessment.word_count.toLocaleString()} WORDS</span>
              <span>📅 {formatDate(assessment.upload_timestamp)}</span>
              {assessment.metadata.rlhf_candidate && (
                <span className="brutalist-tag bg-brutalist-black text-brutalist-white text-xs">🎯 RLHF</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-bold text-brutalist-black uppercase">CONFIDENCE</div>
              <div className="text-xl font-black text-brutalist-black">
                {Math.round(assessment.metadata.confidence_score * 100)}%
              </div>
            </div>
            <button 
              className="brutalist-button-secondary gap-2 flex items-center"
            >
              <Download className="w-4 h-4" />
              EXPORT
            </button>
            <button onClick={onClose} className="p-2 border-2 border-brutalist-black bg-brutalist-white hover:bg-brutalist-black hover:text-brutalist-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b-4 border-brutalist-black">
          <div className="flex overflow-x-auto">
            {[
              { id: "overview", label: "OVERVIEW", icon: Eye },
              { id: "reality", label: "REALITY INDEX", icon: Target },
              { id: "trust", label: "TRUST PROTOCOL", icon: CheckCircle },
              { id: "ethics", label: "ETHICS", icon: Users },
              { id: "resonance", label: "RESONANCE", icon: Brain },
              { id: "canvas", label: "CANVAS PARITY", icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 border-r-2 border-brutalist-black font-bold text-sm uppercase flex items-center gap-2 transition-colors whitespace-nowrap ${
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
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Reality Index */}
              <div className="brutalist-card">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 text-brutalist-black" />
                  <h3 className="font-black text-brutalist-black uppercase">Reality Index</h3>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-black mb-2 ${getScoreColor(assessment.assessment.reality_index.score)}`}>
                    {assessment.assessment.reality_index.score}/10
                  </div>
                  <div className="w-full bg-brutalist-gray-light border-2 border-brutalist-black h-4">
                    <div 
                      className="bg-brutalist-black h-4 transition-all duration-500"
                      style={{ width: `${assessment.assessment.reality_index.score * 10}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Trust Protocol */}
              <div className="brutalist-card">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-brutalist-black" />
                  <h3 className="font-black text-brutalist-black uppercase">Trust Protocol</h3>
                </div>
                <div className="text-center">
                  <div className={`brutalist-tag text-lg px-4 py-2 mb-4 ${
                    assessment.assessment.trust_protocol.status === 'PASS' 
                      ? 'bg-brutalist-black text-brutalist-white'
                      : 'bg-brutalist-gray-light text-brutalist-black border-2 border-brutalist-black'
                  }`}>
                    {assessment.assessment.trust_protocol.status}
                  </div>
                  <div className="text-2xl font-black text-brutalist-black">
                    {assessment.assessment.trust_protocol.trust_score}/100
                  </div>
                </div>
              </div>

              {/* Ethical Alignment */}
              <div className="brutalist-card">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-brutalist-black" />
                  <h3 className="font-black text-brutalist-black uppercase">Ethical Alignment</h3>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-black mb-2 ${getScoreColor(assessment.assessment.ethical_alignment.score, 5)}`}>
                    {assessment.assessment.ethical_alignment.score}/5
                  </div>
                  <div className="w-full bg-brutalist-gray-light border-2 border-brutalist-black h-4">
                    <div 
                      className="bg-brutalist-black h-4 transition-all duration-500"
                      style={{ width: `${(assessment.assessment.ethical_alignment.score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Resonance Quality */}
              <div className="brutalist-card">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="w-6 h-6 text-brutalist-black" />
                  <h3 className="font-black text-brutalist-black uppercase">Resonance Quality</h3>
                </div>
                <div className="text-center">
                  <div className={`brutalist-tag text-lg px-4 py-2 mb-4 ${
                    assessment.assessment.resonance_quality.tier === 'BREAKTHROUGH' 
                      ? 'bg-brutalist-black text-brutalist-white'
                      : 'bg-brutalist-gray-light text-brutalist-black border-2 border-brutalist-black'
                  }`}>
                    {assessment.assessment.resonance_quality.tier}
                  </div>
                  <div className="text-2xl font-black text-brutalist-black">
                    {assessment.assessment.resonance_quality.creativity_score}/100
                  </div>
                </div>
              </div>

              {/* Canvas Parity */}
              <div className="brutalist-card">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-brutalist-black" />
                  <h3 className="font-black text-brutalist-black uppercase">Canvas Parity</h3>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-black mb-2 ${getScoreColor(assessment.assessment.canvas_parity.score, 100)}`}>
                    {assessment.assessment.canvas_parity.score}/100
                  </div>
                  <div className="w-full bg-brutalist-gray-light border-2 border-brutalist-black h-4">
                    <div 
                      className="bg-brutalist-black h-4 transition-all duration-500"
                      style={{ width: `${assessment.assessment.canvas_parity.score}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="brutalist-card">
                <h3 className="font-black text-brutalist-black uppercase mb-4">Assessment Metadata</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-brutalist-black uppercase text-sm">Status</span>
                    <span className="font-black text-brutalist-black uppercase text-sm">{assessment.processing_status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-brutalist-black uppercase text-sm">Human Review</span>
                    <span className="font-black text-brutalist-black uppercase text-sm">
                      {assessment.metadata.human_review_required ? 'REQUIRED' : 'NOT REQUIRED'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-brutalist-black uppercase text-sm">RLHF Candidate</span>
                    <span className="font-black text-brutalist-black uppercase text-sm">
                      {assessment.metadata.rlhf_candidate ? 'YES' : 'NO'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Individual dimension tabs would show detailed breakdowns */}
          {activeTab === "reality" && (
            <div className="space-y-6">
              <div className="brutalist-card">
                <h3 className="text-xl font-black text-brutalist-black mb-6 uppercase">Reality Index Components</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(assessment.assessment.reality_index.components).map(([key, value]) => (
                    <div key={key} className="border-2 border-brutalist-black p-4">
                      <h4 className="font-black text-brutalist-black uppercase text-sm mb-2">
                        {key.replace('_', ' ')}
                      </h4>
                      <div className="text-2xl font-black text-brutalist-black mb-2">{value}/10</div>
                      <div className="w-full bg-brutalist-gray-light border-2 border-brutalist-black h-3">
                        <div 
                          className="bg-brutalist-black h-3 transition-all duration-500"
                          style={{ width: `${value * 10}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 bg-brutalist-gray-light border-2 border-brutalist-black p-4">
                  <h4 className="font-black text-brutalist-black uppercase mb-3">Evidence</h4>
                  <ul className="space-y-2">
                    {assessment.assessment.reality_index.evidence.map((evidence, index) => (
                      <li key={index} className="text-sm font-bold text-brutalist-black flex items-start gap-2">
                        <span>•</span>
                        <span>{evidence}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Add similar detailed views for other tabs */}
        </div>
      </div>
    </div>
  );
}