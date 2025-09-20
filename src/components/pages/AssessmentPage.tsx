import { useState, useRef, useEffect } from "react";
import { Upload, FileText, Trash2, Download, Search, Filter, Loader2, AlertCircle, Eye, CheckCircle, XCircle, TrendingUp, BarChart3, Users, Copy, Hash } from "lucide-react";
import { AssessmentDetail } from "../AssessmentDetail";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

type ProcessingStatus = "pending" | "processing" | "complete" | "error" | "auto_disregarded";
type TrustStatus = "PASS" | "FAIL" | "PARTIAL";
type ResonanceType = "STRONG" | "ADVANCED" | "BREAKTHROUGH";

interface Assessment {
  id: string;
  filename: string;
  word_count: number;
  upload_timestamp: string;
  processing_status: ProcessingStatus;
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
      status: TrustStatus;
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
      tier: ResonanceType;
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
    disregard_reason?: string;
    content_hash?: string;
    duplicate_of?: string;
    duplicate_note?: string;
    error_reason?: string;
  };
}

// Sophisticated word counting function for conversation HTML exports (matching server implementation)
function countWords(content: string): number {
  console.log(`Starting word count for content of length: ${content.length}`);
  
  // First, try to extract only the conversation content
  let textContent = content;
  
  // Remove common HTML document structure that shouldn't be counted
  textContent = textContent
    // Remove DOCTYPE, html, head, and meta tags completely
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<html[^>]*>/gi, '')
    .replace(/<\/html>/gi, '')
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
    .replace(/<meta[^>]*>/gi, '')
    .replace(/<link[^>]*>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    
    // Remove common chat export metadata and UI elements
    .replace(/<div[^>]*class[^>]*sidebar[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*class[^>]*nav[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*class[^>]*header[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*class[^>]*footer[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*class[^>]*menu[^>]*>[\s\S]*?<\/div>/gi, '')
    
    // Remove all remaining HTML tags but keep the content
    .replace(/<[^>]*>/g, ' ')
    
    // Clean up HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-zA-Z0-9#]+;/g, ' ')
    
    // Remove extra whitespace and normalize
    .replace(/\s+/g, ' ')
    .trim();

  console.log(`After HTML cleanup, content length: ${textContent.length}`);
  console.log(`First 200 chars: "${textContent.substring(0, 200)}"`);
  
  // If the content is suspiciously long, it might contain a lot of non-conversation data
  if (textContent.length > 100000) {
    console.log('Content seems too long, attempting to extract conversation only');
    
    // Try to find conversation patterns
    const conversationPatterns = [
      // Look for message containers
      /(?:user|assistant|human|ai|gpt|claude|message)[\s\S]*?(?=(?:user|assistant|human|ai|gpt|claude|message)|$)/gi,
      // Look for common chat delimiters
      /[^.!?]*[.!?]+/g
    ];
    
    for (const pattern of conversationPatterns) {
      const matches = textContent.match(pattern);
      if (matches && matches.length > 0 && matches.length < 100) { // Reasonable number of messages
        textContent = matches.join(' ').replace(/\s+/g, ' ').trim();
        console.log(`Extracted conversation using pattern, new length: ${textContent.length}`);
        break;
      }
    }
  }
  
  // Split into words and filter meaningfully
  const words = textContent
    .split(/\s+/)
    .filter(word => {
      // Remove empty strings
      if (!word || word.length === 0) return false;
      
      // Must contain at least one letter or number
      if (!/[a-zA-Z0-9]/.test(word)) return false;
      
      // Remove very short words (likely artifacts)
      if (word.length < 2) return false;
      
      // Remove words that are mostly punctuation or symbols
      if (word.replace(/[a-zA-Z0-9]/g, '').length > word.length * 0.5) return false;
      
      // Remove common HTML artifacts that might remain
      if (/^(div|span|class|style|href|src|alt|title|id)$/i.test(word)) return false;
      
      return true;
    });

  console.log(`Final word count: ${words.length}`);
  console.log(`Sample words: [${words.slice(0, 10).join(', ')}]`);
  
  return words.length;
}

export function AssessmentPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "processing">("idle");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDisregarded, setShowDisregarded] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervals = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Load existing assessments on component mount
  useEffect(() => {
    loadAssessments();
    
    // Cleanup polling intervals on unmount
    return () => {
      pollingIntervals.current.forEach(interval => clearInterval(interval));
    };
  }, []);

  const loadAssessments = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f9ece59c/assessments`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAssessments(data.assessments || []);
        
        // Start polling for any processing assessments
        data.assessments?.forEach((assessment: Assessment) => {
          if (assessment.processing_status === 'processing') {
            startPolling(assessment.id);
          }
        });
      }
    } catch (error) {
      console.log('Error loading assessments:', error);
    }
  };

  const startPolling = (assessmentId: string) => {
    if (pollingIntervals.current.has(assessmentId)) return;
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f9ece59c/assess/${assessmentId}`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const updatedAssessment = await response.json();
          
          setAssessments(prev => 
            prev.map(a => a.id === assessmentId ? updatedAssessment : a)
          );
          
          // Stop polling if processing is complete
          if (updatedAssessment.processing_status !== 'processing') {
            const intervalRef = pollingIntervals.current.get(assessmentId);
            if (intervalRef) {
              clearInterval(intervalRef);
              pollingIntervals.current.delete(assessmentId);
            }
          }
        }
      } catch (error) {
        console.log('Error polling assessment:', error);
      }
    }, 2000); // Poll every 2 seconds
    
    pollingIntervals.current.set(assessmentId, interval);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;
    
    setUploadStatus("uploading");
    
    try {
      for (const file of Array.from(files)) {
        // Read file content
        const content = await file.text();
        
        // Count words using improved algorithm
        const wordCount = countWords(content);
        
        console.log(`Word count for ${file.name}: ${wordCount} words`);
        
        // Send to assessment API
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f9ece59c/assess`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            filename: file.name,
            content: content,
            word_count: wordCount
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          
          // Handle duplicate detection
          if (result.duplicate_of) {
            console.log(`Duplicate content detected: ${file.name} matches ${result.duplicate_of}`);
          }
          
          // Add the new assessment to state
          const newAssessment: Assessment = {
            id: result.assessment_id,
            filename: file.name,
            word_count: result.word_count || wordCount, // Use server word count if provided
            upload_timestamp: new Date().toISOString(),
            processing_status: result.status === 'auto_disregarded' ? 'auto_disregarded' : 
                              result.status === 'complete' ? 'complete' : 'processing',
            assessment: null,
            metadata: {
              confidence_score: 0,
              human_review_required: false,
              rlhf_candidate: false,
              content_hash: result.content_hash,
              disregard_reason: result.status === 'auto_disregarded' ? 'word_count_below_threshold' : undefined,
              duplicate_note: result.duplicate_of ? `Identical content to ${result.duplicate_of}` : undefined
            }
          };
          
          setAssessments(prev => [newAssessment, ...prev]);
          
          // Start polling if processing
          if (result.status === 'processing') {
            startPolling(result.assessment_id);
          }
          
          // If it's a duplicate that completed immediately, reload to get the full assessment
          if (result.status === 'complete') {
            setTimeout(() => {
              loadAssessments();
            }, 500);
          }
        } else {
          console.log('Upload failed for', file.name);
        }
      }
    } catch (error) {
      console.log('Upload error:', error);
    } finally {
      setUploadStatus("idle");
    }
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f9ece59c/assess/${assessmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setAssessments(prev => prev.filter(a => a.id !== assessmentId));
        
        // Stop polling if active
        const interval = pollingIntervals.current.get(assessmentId);
        if (interval) {
          clearInterval(interval);
          pollingIntervals.current.delete(assessmentId);
        }
      }
    } catch (error) {
      console.log('Delete error:', error);
    }
  };

  const getRealityIndexColor = (score: number) => {
    if (score >= 9.0) return "🟢";
    if (score >= 7.0) return "🟡";
    if (score >= 5.0) return "🟠";
    return "🔴";
  };

  const getTrustStatusIcon = (status: TrustStatus) => {
    switch (status) {
      case "PASS": return <CheckCircle className="w-4 h-4 text-brutalist-black" />;
      case "PARTIAL": return <AlertCircle className="w-4 h-4 text-brutalist-black" />;
      case "FAIL": return <XCircle className="w-4 h-4 text-brutalist-black" />;
    }
  };

  const getResonanceBadge = (tier: ResonanceType) => {
    const baseClasses = "brutalist-tag text-xs px-2 py-1";
    switch (tier) {
      case "BREAKTHROUGH":
        return `${baseClasses} bg-brutalist-black text-brutalist-white`;
      case "ADVANCED":
        return `${baseClasses} bg-brutalist-gray-light text-brutalist-black border-2 border-brutalist-black`;
      case "STRONG":
        return `${baseClasses} bg-brutalist-white text-brutalist-black border-2 border-brutalist-black`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || assessment.processing_status === statusFilter;
    const includeDisregarded = showDisregarded || assessment.processing_status !== "auto_disregarded";
    const includeDuplicates = showDuplicates || !assessment.metadata.duplicate_note;
    return matchesSearch && matchesStatus && includeDisregarded && includeDuplicates;
  });

  const eligibleAssessments = assessments.filter(a => a.processing_status === "complete" && a.word_count >= 400);
  const rlhfCandidates = eligibleAssessments.filter(a => a.metadata.rlhf_candidate);
  const duplicateCount = assessments.filter(a => a.metadata.duplicate_note).length;
  const totalWords = assessments.reduce((sum, a) => sum + a.word_count, 0);

  return (
    <>
      {/* Header */}
      <header className="bg-brutalist-white border-b-4 border-brutalist-black px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-brutalist-black mb-2">SYMBI RESONATE</h1>
            <p className="text-brutalist-black font-bold uppercase">ANALYZE AI COLLABORATION ARTIFACTS WITH 5-DIMENSION FRAMEWORK</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex gap-4">
              <div className="brutalist-tag">
                📁 {assessments.length} TOTAL
              </div>
              <div className="brutalist-tag">
                📏 {totalWords.toLocaleString()} WORDS
              </div>
              <div className="brutalist-tag">
                🎯 {rlhfCandidates.length} RLHF
              </div>
              {duplicateCount > 0 && (
                <div className="brutalist-tag bg-brutalist-gray-light text-brutalist-black border-2 border-brutalist-black">
                  <Copy className="w-3 h-3 inline mr-1" />
                  {duplicateCount} DUPLICATES
                </div>
              )}
            </div>
            <button 
              className={`brutalist-button-primary gap-2 flex items-center ${
                assessments.length === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={assessments.length === 0}
            >
              <Download className="w-5 h-5" />
              EXPORT DATASET
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-8 bg-brutalist-white">
        {/* Upload Section */}
        <div className="mb-12">
          <div className="brutalist-card mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-brutalist-black uppercase">ARTIFACT UPLOAD</h2>
              <div className="flex gap-4 text-sm font-bold text-brutalist-black uppercase">
                <span>✅ {eligibleAssessments.length} ELIGIBLE (400+ WORDS)</span>
                <span>⚠️ {assessments.filter(a => a.processing_status === "auto_disregarded").length} AUTO-DISREGARDED</span>
                {duplicateCount > 0 && (
                  <span>🔄 {duplicateCount} DUPLICATE CONTENT DETECTED</span>
                )}
              </div>
            </div>
            
            {/* Upload Zone */}
            <div 
              className={`border-4 border-dashed border-brutalist-black bg-brutalist-gray-light p-12 text-center cursor-pointer transition-colors ${
                uploadStatus !== "idle" ? "opacity-50 cursor-not-allowed" : "hover:bg-brutalist-white"
              }`}
              onClick={() => uploadStatus === "idle" && fileInputRef.current?.click()}
            >
              {uploadStatus === "idle" && (
                <>
                  <Upload className="w-16 h-16 text-brutalist-black mx-auto mb-6" />
                  <h3 className="text-xl font-black text-brutalist-black mb-4 uppercase">DRAG & DROP HTML ARTIFACTS</h3>
                  <p className="text-brutalist-black font-bold mb-6 uppercase">OR CLICK TO SELECT FILES</p>
                  <p className="text-sm text-brutalist-black font-bold uppercase">BATCH UPLOAD SUPPORTED • AUTO-FILTERING &lt;400 WORDS • DUPLICATE DETECTION ENABLED</p>
                </>
              )}
              
              {uploadStatus === "uploading" && (
                <>
                  <Loader2 className="w-16 h-16 text-brutalist-black mx-auto mb-6 animate-spin" />
                  <h3 className="text-xl font-black text-brutalist-black mb-4 uppercase">UPLOADING FILES...</h3>
                </>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".html,.txt"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              disabled={uploadStatus !== "idle"}
            />
          </div>
        </div>

        {/* Assessment Results */}
        <div className="brutalist-card">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl font-black text-brutalist-black uppercase">ASSESSMENT RESULTS</h2>
            
            {/* Search and Filter */}
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="brutalist-input w-full pl-12"
                  placeholder="SEARCH ARTIFACTS"
                />
                <Search className="w-5 h-5 text-brutalist-black absolute left-4 top-1/2 transform -translate-y-1/2" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="brutalist-input font-bold uppercase"
              >
                <option value="all">ALL STATUS</option>
                <option value="complete">COMPLETE</option>
                <option value="processing">PROCESSING</option>
                <option value="auto_disregarded">DISREGARDED</option>
                <option value="error">ERROR</option>
              </select>
              <label className="flex items-center gap-2 font-bold text-brutalist-black text-sm uppercase cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDisregarded}
                  onChange={(e) => setShowDisregarded(e.target.checked)}
                  className="w-4 h-4 border-2 border-brutalist-black"
                />
                SHOW &lt;400W
              </label>
              <label className="flex items-center gap-2 font-bold text-brutalist-black text-sm uppercase cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDuplicates}
                  onChange={(e) => setShowDuplicates(e.target.checked)}
                  className="w-4 h-4 border-2 border-brutalist-black"
                />
                SHOW DUPES
              </label>
            </div>
          </div>

          {/* Assessment Grid */}
          {filteredAssessments.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredAssessments.map((assessment) => (
                <div key={assessment.id} className="border-4 border-brutalist-black bg-brutalist-white p-6 hover:brutalist-shadow-lg transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-brutalist-black text-sm uppercase truncate mb-2">
                        {assessment.filename}
                      </h3>
                      <div className="flex items-center gap-4 text-xs font-bold text-brutalist-black uppercase mb-2">
                        <span>📏 {assessment.word_count.toLocaleString()} WORDS</span>
                        <span>📅 {formatDate(assessment.upload_timestamp)}</span>
                      </div>
                      {assessment.metadata.content_hash && (
                        <div className="flex items-center gap-2 text-xs font-bold text-brutalist-black uppercase">
                          <Hash className="w-3 h-3" />
                          <span className="font-mono">{assessment.metadata.content_hash}</span>
                        </div>
                      )}
                      {assessment.metadata.duplicate_note && (
                        <div className="mt-2 p-2 bg-brutalist-gray-light border-2 border-brutalist-black">
                          <div className="flex items-center gap-2 text-xs font-bold text-brutalist-black uppercase">
                            <Copy className="w-3 h-3" />
                            <span>DUPLICATE DETECTED</span>
                          </div>
                          <p className="text-xs font-bold text-brutalist-black mt-1">
                            {assessment.metadata.duplicate_note}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Assessment Results */}
                  {assessment.processing_status === "auto_disregarded" ? (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-brutalist-black mx-auto mb-4" />
                      <h4 className="font-black text-brutalist-black uppercase mb-2">AUTO-DISREGARDED</h4>
                      <p className="text-sm font-bold text-brutalist-black uppercase">BELOW 400-WORD THRESHOLD</p>
                    </div>
                  ) : assessment.processing_status === "processing" ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-12 h-12 text-brutalist-black mx-auto mb-4 animate-spin" />
                      <h4 className="font-black text-brutalist-black uppercase mb-2">PROCESSING</h4>
                      <p className="text-sm font-bold text-brutalist-black uppercase">APPLYING ASSESSMENT FRAMEWORK</p>
                    </div>
                  ) : assessment.processing_status === "error" ? (
                    <div className="text-center py-8">
                      <XCircle className="w-12 h-12 text-brutalist-black mx-auto mb-4" />
                      <h4 className="font-black text-brutalist-black uppercase mb-2">PROCESSING ERROR</h4>
                      <p className="text-sm font-bold text-brutalist-black uppercase">
                        {assessment.metadata.error_reason === 'processing_timeout' ? 'TIMEOUT - RETRY UPLOAD' : 'ERROR - RETRY UPLOAD'}
                      </p>
                    </div>
                  ) : assessment.assessment ? (
                    <div className="space-y-4">
                      {/* Reality Index */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-black text-brutalist-black uppercase">REALITY INDEX</span>
                          <span className="font-black text-brutalist-black">
                            {getRealityIndexColor(assessment.assessment.reality_index.score)} {assessment.assessment.reality_index.score}/10
                          </span>
                        </div>
                        <div className="w-full bg-brutalist-gray-light border-2 border-brutalist-black h-3">
                          <div 
                            className="bg-brutalist-black h-3 transition-all duration-500"
                            style={{ width: `${assessment.assessment.reality_index.score * 10}%` }}
                          />
                        </div>
                      </div>

                      {/* Trust Protocol */}
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-brutalist-black uppercase">TRUST PROTOCOL</span>
                        <div className="flex items-center gap-2">
                          {getTrustStatusIcon(assessment.assessment.trust_protocol.status)}
                          <span className="font-black text-brutalist-black text-sm uppercase">
                            {assessment.assessment.trust_protocol.status}
                          </span>
                        </div>
                      </div>

                      {/* Ethical Alignment */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-black text-brutalist-black uppercase">ETHICAL ALIGNMENT</span>
                          <span className="font-black text-brutalist-black">
                            {assessment.assessment.ethical_alignment.score}/5
                          </span>
                        </div>
                        <div className="w-full bg-brutalist-gray-light border-2 border-brutalist-black h-3">
                          <div 
                            className="bg-brutalist-black h-3 transition-all duration-500"
                            style={{ width: `${(assessment.assessment.ethical_alignment.score / 5) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Resonance Quality */}
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-brutalist-black uppercase">RESONANCE</span>
                        <span className={getResonanceBadge(assessment.assessment.resonance_quality.tier)}>
                          {assessment.assessment.resonance_quality.tier}
                        </span>
                      </div>

                      {/* Canvas Parity */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-black text-brutalist-black uppercase">CANVAS PARITY</span>
                          <span className="font-black text-brutalist-black">
                            {assessment.assessment.canvas_parity.score}/100
                          </span>
                        </div>
                        <div className="w-full bg-brutalist-gray-light border-2 border-brutalist-black h-3">
                          <div 
                            className="bg-brutalist-black h-3 transition-all duration-500"
                            style={{ width: `${assessment.assessment.canvas_parity.score}%` }}
                          />
                        </div>
                      </div>

                      {/* RLHF Candidate */}
                      {assessment.metadata.rlhf_candidate && (
                        <div className="pt-2 border-t-2 border-brutalist-black">
                          <div className="brutalist-tag bg-brutalist-black text-brutalist-white text-xs">
                            🎯 RLHF CANDIDATE
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-6 pt-4 border-t-2 border-brutalist-black">
                    <button 
                      onClick={() => setSelectedAssessment(assessment.id)}
                      className="flex-1 p-2 border-2 border-brutalist-black bg-brutalist-white hover:bg-brutalist-black hover:text-brutalist-white transition-colors font-bold text-xs uppercase"
                      disabled={!assessment.assessment}
                    >
                      <Eye className="w-4 h-4 mx-auto" />
                    </button>
                    <button 
                      className={`flex-1 p-2 border-2 border-brutalist-black bg-brutalist-white hover:bg-brutalist-black hover:text-brutalist-white transition-colors font-bold text-xs uppercase ${
                        !assessment.assessment ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={!assessment.assessment}
                    >
                      <Download className="w-4 h-4 mx-auto" />
                    </button>
                    <button 
                      onClick={() => handleDeleteAssessment(assessment.id)}
                      className="flex-1 p-2 border-2 border-brutalist-black bg-brutalist-white hover:bg-brutalist-black hover:text-brutalist-white transition-colors font-bold text-xs uppercase"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-brutalist-black mx-auto mb-4" />
              <h3 className="text-xl font-black text-brutalist-black mb-2 uppercase">NO ARTIFACTS FOUND</h3>
              <p className="text-brutalist-black font-bold uppercase">
                {searchTerm || statusFilter !== 'all' 
                  ? "Try adjusting your search or filter" 
                  : "Upload your first HTML artifact to get started"
                }
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Assessment Detail Modal */}
      {selectedAssessment && (
        <AssessmentDetail 
          assessmentId={selectedAssessment}
          onClose={() => setSelectedAssessment(null)}
        />
      )}
    </>
  );
}