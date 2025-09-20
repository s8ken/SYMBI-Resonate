/**
 * SYMBI Framework Assessment Component
 * 
 * This component provides an interface for submitting content for SYMBI framework analysis
 * and displays the assessment results across the 5 dimensions.
 */

import { useState } from "react";
import { 
  AssessmentInput, 
  AssessmentResult,
  symbiFrameworkService 
} from "../lib/symbi-framework";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  BarChart3, 
  Shield, 
  Heart, 
  Zap, 
  Users 
} from "lucide-react";

export function SymbiFrameworkAssessment() {
  // State for input content
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [author, setAuthor] = useState("");
  const [context, setContext] = useState("");
  
  // State for assessment results
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle content submission
  const handleSubmit = async () => {
    if (!content.trim()) {
      setError("Please enter content to assess");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create assessment input
      const input: AssessmentInput = {
        content,
        metadata: {
          source,
          author,
          context,
          timestamp: new Date().toISOString()
        }
      };
      
      // Process content using SYMBI framework service
      const assessmentResult = await symbiFrameworkService.processContent(input);
      setResult(assessmentResult);
    } catch (err) {
      setError("Error processing content: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };
  
  // Reset form and results
  const handleReset = () => {
    setContent("");
    setSource("");
    setAuthor("");
    setContext("");
    setResult(null);
    setError(null);
  };
  
  // Render trust protocol status icon
  const renderTrustIcon = (status: 'PASS' | 'PARTIAL' | 'FAIL') => {
    switch (status) {
      case 'PASS':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'PARTIAL':
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
      case 'FAIL':
        return <XCircle className="w-6 h-6 text-red-600" />;
    }
  };
  
  // Render resonance quality badge
  const renderResonanceBadge = (level: 'STRONG' | 'ADVANCED' | 'BREAKTHROUGH') => {
    let className = "px-3 py-1 text-xs font-bold uppercase tracking-wider";
    
    switch (level) {
      case 'STRONG':
        className += " bg-brutalist-black text-brutalist-white";
        break;
      case 'ADVANCED':
        className += " bg-brutalist-black text-brutalist-white";
        break;
      case 'BREAKTHROUGH':
        className += " bg-brutalist-black text-brutalist-white";
        break;
    }
    
    return <span className={className}>{level}</span>;
  };
  
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-brutalist-black">SYMBI FRAMEWORK ASSESSMENT</h2>
          <p className="text-brutalist-black font-bold uppercase tracking-wide">
            Analyze content across the 5 dimensions of the SYMBI framework
          </p>
        </div>
      </div>
      
      {/* Input Form */}
      <Card className="brutalist-card">
        <CardHeader>
          <CardTitle className="text-2xl font-black text-brutalist-black">CONTENT SUBMISSION</CardTitle>
          <CardDescription className="font-bold uppercase tracking-wide">
            Enter content to analyze with the SYMBI framework
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Content Input */}
          <div className="space-y-2">
            <Label htmlFor="content" className="font-bold uppercase">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter content to analyze..."
              className="h-40 brutalist-input"
            />
          </div>
          
          {/* Metadata Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source" className="font-bold uppercase">Source</Label>
              <Input
                id="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Source of content"
                className="brutalist-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author" className="font-bold uppercase">Author</Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Content author"
                className="brutalist-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="context" className="font-bold uppercase">Context</Label>
              <Input
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Content context"
                className="brutalist-input"
              />
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-100 border-4 border-red-500 text-red-700 font-bold">
              {error}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              onClick={handleReset}
              variant="outline"
              className="brutalist-button-secondary"
              disabled={loading}
            >
              RESET
            </Button>
            <Button
              onClick={handleSubmit}
              className="brutalist-button-primary"
              disabled={loading}
            >
              {loading ? "ANALYZING..." : "ANALYZE CONTENT"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Assessment Results */}
      {result && (
        <div className="space-y-8">
          {/* Overall Score */}
          <Card className="brutalist-card">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-brutalist-black">OVERALL ASSESSMENT</CardTitle>
              <CardDescription className="font-bold uppercase tracking-wide">
                SYMBI Framework Alignment Score
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="text-7xl font-black text-brutalist-black mb-4">
                {result.assessment.overallScore}
              </div>
              <div className="text-xl font-bold uppercase tracking-wider text-brutalist-black">
                {result.assessment.overallScore >= 80 ? "EXCELLENT" : 
                 result.assessment.overallScore >= 60 ? "GOOD" : 
                 result.assessment.overallScore >= 40 ? "FAIR" : "NEEDS IMPROVEMENT"}
              </div>
            </CardContent>
          </Card>
          
          {/* Dimension Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Reality Index */}
            <Card className="brutalist-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-brutalist-black">REALITY INDEX</CardTitle>
                  <CardDescription className="font-bold uppercase tracking-wide">
                    Mission Alignment & Coherence
                  </CardDescription>
                </div>
                <BarChart3 className="w-8 h-8 text-brutalist-black" />
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-black text-brutalist-black mb-4">
                  {result.assessment.realityIndex.score.toFixed(1)}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-bold uppercase">Mission Alignment</span>
                    <span>{result.assessment.realityIndex.missionAlignment.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold uppercase">Contextual Coherence</span>
                    <span>{result.assessment.realityIndex.contextualCoherence.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold uppercase">Technical Accuracy</span>
                    <span>{result.assessment.realityIndex.technicalAccuracy.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold uppercase">Authenticity</span>
                    <span>{result.assessment.realityIndex.authenticity.toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Trust Protocol */}
            <Card className="brutalist-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-brutalist-black">TRUST PROTOCOL</CardTitle>
                  <CardDescription className="font-bold uppercase tracking-wide">
                    Verification & Security
                  </CardDescription>
                </div>
                <Shield className="w-8 h-8 text-brutalist-black" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-6">
                  {renderTrustIcon(result.assessment.trustProtocol.status)}
                  <span className="text-2xl font-black uppercase">
                    {result.assessment.trustProtocol.status}
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase">Verification Methods</span>
                    {renderTrustIcon(result.assessment.trustProtocol.verificationMethods)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase">Boundary Maintenance</span>
                    {renderTrustIcon(result.assessment.trustProtocol.boundaryMaintenance)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase">Security Awareness</span>
                    {renderTrustIcon(result.assessment.trustProtocol.securityAwareness)}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Ethical Alignment */}
            <Card className="brutalist-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-brutalist-black">ETHICAL ALIGNMENT</CardTitle>
                  <CardDescription className="font-bold uppercase tracking-wide">
                    Stakeholder & Ethical Awareness
                  </CardDescription>
                </div>
                <Heart className="w-8 h-8 text-brutalist-black" />
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-black text-brutalist-black mb-4">
                  {result.assessment.ethicalAlignment.score.toFixed(1)}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-bold uppercase">Limitations Acknowledgment</span>
                    <span>{result.assessment.ethicalAlignment.limitationsAcknowledgment.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold uppercase">Stakeholder Awareness</span>
                    <span>{result.assessment.ethicalAlignment.stakeholderAwareness.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold uppercase">Ethical Reasoning</span>
                    <span>{result.assessment.ethicalAlignment.ethicalReasoning.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold uppercase">Boundary Maintenance</span>
                    <span>{result.assessment.ethicalAlignment.boundaryMaintenance.toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Resonance Quality */}
            <Card className="brutalist-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-brutalist-black">RESONANCE QUALITY</CardTitle>
                  <CardDescription className="font-bold uppercase tracking-wide">
                    Creativity & Innovation
                  </CardDescription>
                </div>
                <Zap className="w-8 h-8 text-brutalist-black" />
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mb-6">
                  {renderResonanceBadge(result.assessment.resonanceQuality.level)}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-bold uppercase">Creativity Score</span>
                    <span>{result.assessment.resonanceQuality.creativityScore.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold uppercase">Synthesis Quality</span>
                    <span>{result.assessment.resonanceQuality.synthesisQuality.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold uppercase">Innovation Markers</span>
                    <span>{result.assessment.resonanceQuality.innovationMarkers.toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Canvas Parity */}
            <Card className="brutalist-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-brutalist-black">CANVAS PARITY</CardTitle>
                  <CardDescription className="font-bold uppercase tracking-wide">
                    Human-AI Collaboration
                  </CardDescription>
                </div>
                <Users className="w-8 h-8 text-brutalist-black" />
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-black text-brutalist-black mb-4">
                  {result.assessment.canvasParity.score}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-bold uppercase">Human Agency</span>
                    <span>{result.assessment.canvasParity.humanAgency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold uppercase">AI Contribution</span>
                    <span>{result.assessment.canvasParity.aiContribution}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold uppercase">Transparency</span>
                    <span>{result.assessment.canvasParity.transparency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold uppercase">Collaboration Quality</span>
                    <span>{result.assessment.canvasParity.collaborationQuality}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Insights */}
          <Card className="brutalist-card">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-brutalist-black">INSIGHTS & RECOMMENDATIONS</CardTitle>
              <CardDescription className="font-bold uppercase tracking-wide">
                Analysis of strengths and areas for improvement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Strengths */}
              <div>
                <h3 className="text-xl font-black text-brutalist-black mb-2">STRENGTHS</h3>
                <ul className="list-disc pl-6 space-y-1">
                  {result.insights.strengths.map((strength, index) => (
                    <li key={index} className="font-bold">{strength}</li>
                  ))}
                </ul>
              </div>
              
              <Separator className="border-t-4 border-brutalist-black" />
              
              {/* Weaknesses */}
              <div>
                <h3 className="text-xl font-black text-brutalist-black mb-2">AREAS FOR IMPROVEMENT</h3>
                <ul className="list-disc pl-6 space-y-1">
                  {result.insights.weaknesses.length > 0 ? (
                    result.insights.weaknesses.map((weakness, index) => (
                      <li key={index} className="font-bold">{weakness}</li>
                    ))
                  ) : (
                    <li className="font-bold">No significant weaknesses identified.</li>
                  )}
                </ul>
              </div>
              
              <Separator className="border-t-4 border-brutalist-black" />
              
              {/* Recommendations */}
              <div>
                <h3 className="text-xl font-black text-brutalist-black mb-2">RECOMMENDATIONS</h3>
                <ul className="list-disc pl-6 space-y-1">
                  {result.insights.recommendations.map((recommendation, index) => (
                    <li key={index} className="font-bold">{recommendation}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          
          {/* Validation Status */}
          <Card className="brutalist-card">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-brutalist-black">VALIDATION STATUS</CardTitle>
              <CardDescription className="font-bold uppercase tracking-wide">
                Assessment validation information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 mb-4">
                {result.assessment.validationStatus === 'VALID' ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : result.assessment.validationStatus === 'INVALID' ? (
                  <XCircle className="w-6 h-6 text-red-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                )}
                <span className="text-2xl font-black uppercase">
                  {result.assessment.validationStatus}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold uppercase">Validated By</span>
                  <span>{result.validationDetails.validatedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold uppercase">Validation Timestamp</span>
                  <span>{new Date(result.validationDetails.validationTimestamp).toLocaleString()}</span>
                </div>
                {result.validationDetails.validationNotes && (
                  <div className="mt-4">
                    <span className="font-bold uppercase block mb-1">Validation Notes</span>
                    <p>{result.validationDetails.validationNotes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}