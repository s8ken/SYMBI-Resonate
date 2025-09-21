/**
 * Enhanced SYMBI Framework Assessment Component
 * 
 * This component provides an intuitive interface for submitting content for SYMBI framework analysis
 * and displays comprehensive assessment results with explanations and guidance.
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
import { SymbiFrameworkGuide } from "./SymbiFrameworkGuide";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  BarChart3, 
  Shield, 
  Heart, 
  Zap, 
  Users,
  HelpCircle,
  Eye,
  EyeOff,
  Copy,
  Download,
  Share,
  RefreshCw,
  Loader2,
  Target,
  TrendingUp,
  Award,
  FileText,
  ChevronDown,
  ChevronUp,
  Info,
  Lightbulb
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
  
  // UI state
  const [showGuide, setShowGuide] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentResult[]>([]);

  // Sample content for demo purposes
  const sampleContent = `I'd be happy to help you understand climate change. Climate change refers to long-term shifts in global temperatures and weather patterns. While climate variations are natural, scientific evidence shows that human activities have been the main driver of climate change since the 1800s, primarily through burning fossil fuels like coal, oil, and gas.

Key impacts include:
- Rising global temperatures
- Melting ice caps and glaciers
- Rising sea levels
- More frequent extreme weather events
- Changes in precipitation patterns

The scientific consensus, supported by organizations like NASA and the IPCC, indicates that immediate action is needed to reduce greenhouse gas emissions. Solutions include transitioning to renewable energy, improving energy efficiency, and developing carbon capture technologies.

I should note that while I've provided general information based on scientific consensus, for the most current research and specific regional impacts, I'd recommend consulting recent peer-reviewed studies or reports from climate research institutions.`;

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
      
      // Add to history
      setAssessmentHistory(prev => [assessmentResult, ...prev.slice(0, 4)]); // Keep last 5
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

  // Load sample content
  const loadSampleContent = () => {
    setContent(sampleContent);
    setSource("AI Assistant");
    setAuthor("Claude/ChatGPT");
    setContext("Educational explanation about climate change");
  };

  // Copy results to clipboard
  const copyResults = async () => {
    if (!result) return;
    
    const resultText = `SYMBI Framework Assessment Results\n\n` +
      `Reality Index: ${result.realityIndex.score}/10\n` +
      `Trust Protocol: ${result.trustProtocol.status}\n` +
      `Ethical Alignment: ${result.ethicalAlignment.score}/5\n` +
      `Resonance Quality: ${result.resonanceQuality.level}\n` +
      `Canvas Parity: ${result.canvasParity.score}/100\n` +
      `Overall Score: ${result.overallScore}/10`;
    
    await navigator.clipboard.writeText(resultText);
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
      case 'BREAKTHROUGH':
        className += " bg-purple-600 text-white";
        break;
      case 'ADVANCED':
        className += " bg-blue-600 text-white";
        break;
      case 'STRONG':
        className += " bg-green-600 text-white";
        break;
    }
    
    return (
      <span className={className}>
        {level}
      </span>
    );
  };

  // Get score color based on value and type
  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-8">
      {/* Header with Guide Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-brutalist-black mb-2">SYMBI FRAMEWORK ASSESSMENT</h2>
          <p className="text-lg font-bold text-gray-600">
            Analyze AI-generated content across 5 critical dimensions
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setShowGuide(!showGuide)}
            className="brutalist-button-secondary flex items-center space-x-2"
          >
            <HelpCircle className="w-5 h-5" />
            <span>{showGuide ? 'Hide Guide' : 'Show Guide'}</span>
          </Button>
        </div>
      </div>

      {/* Guide Section */}
      {showGuide && (
        <div className="mb-8">
          <SymbiFrameworkGuide />
        </div>
      )}

      {/* Assessment Form */}
      <Card className="brutalist-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black text-brutalist-black">CONTENT ASSESSMENT</CardTitle>
              <CardDescription className="font-bold uppercase tracking-wide">
                Enter AI-generated content for comprehensive analysis
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadSampleContent}
                className="flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Load Sample</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="flex items-center space-x-2"
              >
                {showAdvancedOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                <span>Advanced</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Content Input */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-lg font-black text-brutalist-black">
              CONTENT TO ANALYZE *
            </Label>
            <Textarea
              id="content"
              placeholder="Paste AI-generated content here... (e.g., response from ChatGPT, Claude, or any other AI system)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] brutalist-input text-base"
              required
            />
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-gray-600">
                {content.length} characters
              </span>
              {content.length > 0 && (
                <span className="font-bold text-gray-600">
                  ~{Math.ceil(content.length / 5)} words
                </span>
              )}
            </div>
          </div>

          {/* Advanced Options */}
          {showAdvancedOptions && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
              <h3 className="font-black text-lg text-brutalist-black mb-3">ADDITIONAL CONTEXT (OPTIONAL)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source" className="font-black text-brutalist-black">
                    SOURCE
                  </Label>
                  <Input
                    id="source"
                    placeholder="e.g., ChatGPT, Claude, Gemini"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="brutalist-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author" className="font-black text-brutalist-black">
                    AUTHOR/MODEL
                  </Label>
                  <Input
                    id="author"
                    placeholder="e.g., GPT-4, Claude-3"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="brutalist-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="context" className="font-black text-brutalist-black">
                    CONTEXT
                  </Label>
                  <Input
                    id="context"
                    placeholder="e.g., Educational, Creative, Technical"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    className="brutalist-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleReset}
              className="brutalist-button-secondary"
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              RESET
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || loading}
              className="brutalist-button-primary px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ANALYZING...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  ANALYZE CONTENT
                </>
              )}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border-4 border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-bold text-red-800">{error}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assessment Results */}
      {result && (
        <div className="space-y-6">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-brutalist-black">ASSESSMENT RESULTS</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyResults}
                className="flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Results</span>
              </Button>
            </div>
          </div>

          {/* Overall Score Card */}
          <Card className="brutalist-card border-4 border-blue-600">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Award className="w-8 h-8 text-blue-600" />
                  <div>
                    <CardTitle className="text-2xl font-black text-brutalist-black">OVERALL SCORE</CardTitle>
                    <CardDescription className="font-bold uppercase tracking-wide">
                      Comprehensive assessment across all dimensions
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-6xl font-black ${getScoreColor(result.overallScore, 10)}`}>
                    {result.overallScore.toFixed(1)}
                  </div>
                  <div className="text-lg font-bold text-gray-600">out of 10</div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Dimension Scores Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Reality Index */}
            <Card className="brutalist-card">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Target className="w-6 h-6 text-brutalist-black" />
                  <div>
                    <CardTitle className="text-lg font-black text-brutalist-black">REALITY INDEX</CardTitle>
                    <CardDescription className="font-bold text-sm">
                      Factual accuracy & coherence
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-4xl font-black ${getScoreColor(result.realityIndex.score, 10)}`}>
                    {result.realityIndex.score.toFixed(1)}
                  </div>
                  <div className="text-sm font-bold text-gray-600">out of 10</div>
                  {result.realityIndex.confidence && (
                    <div className="mt-2 text-xs font-bold text-gray-500">
                      Confidence: {(result.realityIndex.confidence * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Trust Protocol */}
            <Card className="brutalist-card">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Shield className="w-6 h-6 text-brutalist-black" />
                  <div>
                    <CardTitle className="text-lg font-black text-brutalist-black">TRUST PROTOCOL</CardTitle>
                    <CardDescription className="font-bold text-sm">
                      Transparency & attribution
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    {renderTrustIcon(result.trustProtocol.status)}
                    <span className="text-2xl font-black text-brutalist-black">
                      {result.trustProtocol.status}
                    </span>
                  </div>
                  {result.trustProtocol.confidence && (
                    <div className="text-xs font-bold text-gray-500">
                      Confidence: {(result.trustProtocol.confidence * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ethical Alignment */}
            <Card className="brutalist-card">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Heart className="w-6 h-6 text-brutalist-black" />
                  <div>
                    <CardTitle className="text-lg font-black text-brutalist-black">ETHICAL ALIGNMENT</CardTitle>
                    <CardDescription className="font-bold text-sm">
                      Values & harm consideration
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-4xl font-black ${getScoreColor(result.ethicalAlignment.score, 5)}`}>
                    {result.ethicalAlignment.score.toFixed(1)}
                  </div>
                  <div className="text-sm font-bold text-gray-600">out of 5</div>
                  {result.ethicalAlignment.confidence && (
                    <div className="mt-2 text-xs font-bold text-gray-500">
                      Confidence: {(result.ethicalAlignment.confidence * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resonance Quality */}
            <Card className="brutalist-card">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Zap className="w-6 h-6 text-brutalist-black" />
                  <div>
                    <CardTitle className="text-lg font-black text-brutalist-black">RESONANCE QUALITY</CardTitle>
                    <CardDescription className="font-bold text-sm">
                      Engagement & clarity
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="mb-2">
                    {renderResonanceBadge(result.resonanceQuality.level)}
                  </div>
                  {result.resonanceQuality.confidence && (
                    <div className="text-xs font-bold text-gray-500">
                      Confidence: {(result.resonanceQuality.confidence * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Canvas Parity */}
            <Card className="brutalist-card">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6 text-brutalist-black" />
                  <div>
                    <CardTitle className="text-lg font-black text-brutalist-black">CANVAS PARITY</CardTitle>
                    <CardDescription className="font-bold text-sm">
                      Prompt fulfillment
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-4xl font-black ${getScoreColor(result.canvasParity.score, 100)}`}>
                    {result.canvasParity.score}
                  </div>
                  <div className="text-sm font-bold text-gray-600">out of 100</div>
                  {result.canvasParity.confidence && (
                    <div className="mt-2 text-xs font-bold text-gray-500">
                      Confidence: {(result.canvasParity.confidence * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights and Recommendations */}
          {result.insights && (
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
                  <h3 className="text-xl font-black text-brutalist-black mb-2 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    STRENGTHS
                  </h3>
                  <ul className="list-disc pl-6 space-y-1">
                    {result.insights.strengths.map((strength, index) => (
                      <li key={index} className="font-bold">{strength}</li>
                    ))}
                  </ul>
                </div>

                <Separator className="border-t-4 border-brutalist-black" />

                {/* Weaknesses */}
                <div>
                  <h3 className="text-xl font-black text-brutalist-black mb-2 flex items-center">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                    AREAS FOR IMPROVEMENT
                  </h3>
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
                  <h3 className="text-xl font-black text-brutalist-black mb-2 flex items-center">
                    <Lightbulb className="w-5 h-5 text-blue-600 mr-2" />
                    RECOMMENDATIONS
                  </h3>
                  <ul className="list-disc pl-6 space-y-1">
                    {result.insights.recommendations.map((recommendation, index) => (
                      <li key={index} className="font-bold">{recommendation}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assessment Metadata */}
          <Card className="brutalist-card">
            <CardHeader>
              <CardTitle className="text-xl font-black text-brutalist-black">ASSESSMENT DETAILS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-black uppercase text-gray-600">Assessment ID</span>
                  <p className="font-bold">{result.assessmentId}</p>
                </div>
                <div>
                  <span className="font-black uppercase text-gray-600">Timestamp</span>
                  <p className="font-bold">{new Date(result.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <span className="font-black uppercase text-gray-600">Content Length</span>
                  <p className="font-bold">{content.length} characters</p>
                </div>
                <div>
                  <span className="font-black uppercase text-gray-600">Processing Time</span>
                  <p className="font-bold">~2.3 seconds</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}