import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui-shadcn/card';
import { Button } from '../ui-shadcn/button';
import { Textarea } from '../ui-shadcn/textarea';
import { Badge } from '../ui-shadcn/badge';
import { Progress } from '../ui-shadcn/progress';
import { Alert, AlertDescription, AlertTitle } from '../ui-shadcn/alert';
import {
  Brain,
  Shield,
  Heart,
  Zap,
  Users,
  CheckCircle,
  AlertTriangle,
  Info,
  Send,
  RefreshCw,
  Download
} from 'lucide-react';
import { demoService } from '../../lib/demo/demo-service';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface SymbiResult {
  overallScore: number;
  realityIndex: number;
  trustProtocol: 'PASS' | 'PARTIAL' | 'FAIL';
  ethicalAlignment: number;
  resonanceQuality: 'STRONG' | 'ADVANCED' | 'BREAKTHROUGH';
  canvasParity: number;
  insights: string[];
  recommendations: string[];
}

export function DemoSymbiAssessment() {
  const [content, setContent] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<SymbiResult | null>(null);
  const [activeTab, setActiveTab] = useState('input');

  const sampleContent = `AI systems should be designed with human values at their core. 
We must ensure transparency in decision-making processes and maintain 
ethical boundaries while fostering innovation. Collaboration between humans 
and AI should enhance human capabilities rather than replace them. 
The system acknowledges its limitations and seeks human input when 
uncertain, maintaining appropriate boundaries and verification methods.`;

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    
    setAnalyzing(true);
    try {
      const analysis = await demoService.getSymbiAnalysis(content);
      setResult(analysis);
      setActiveTab('results');
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const loadSample = () => {
    setContent(sampleContent);
  };

  const getTrustProtocolColor = (protocol: string) => {
    switch (protocol) {
      case 'PASS': return 'text-green-600 bg-green-100';
      case 'PARTIAL': return 'text-yellow-600 bg-yellow-100';
      case 'FAIL': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getResonanceQualityColor = (quality: string) => {
    switch (quality) {
      case 'BREAKTHROUGH': return 'text-purple-600 bg-purple-100';
      case 'ADVANCED': return 'text-blue-600 bg-blue-100';
      case 'STRONG': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const radarData = result ? [
    {
      dimension: 'Reality Index',
      score: (result.realityIndex / 10) * 100,
      fullMark: 100
    },
    {
      dimension: 'Trust Protocol',
      score: result.trustProtocol === 'PASS' ? 100 : result.trustProtocol === 'PARTIAL' ? 50 : 0,
      fullMark: 100
    },
    {
      dimension: 'Ethical Alignment',
      score: (result.ethicalAlignment / 5) * 100,
      fullMark: 100
    },
    {
      dimension: 'Canvas Parity',
      score: result.canvasParity,
      fullMark: 100
    }
  ] : [];

  const barData = result ? [
    { name: 'Reality', score: result.realityIndex * 10, max: 100 },
    { name: 'Trust', score: result.trustProtocol === 'PASS' ? 100 : result.trustProtocol === 'PARTIAL' ? 50 : 0, max: 100 },
    { name: 'Ethics', score: result.ethicalAlignment * 20, max: 100 },
    { name: 'Parity', score: result.canvasParity, max: 100 }
  ] : [];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">SYMBI Framework Assessment</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Analyze your AI content across the five dimensions of the SYMBI framework: 
          Reality Index, Trust Protocol, Ethical Alignment, Resonance Quality, and Canvas Parity
        </p>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        <Button
          variant={activeTab === 'input' ? 'default' : 'outline'}
          onClick={() => setActiveTab('input')}
        >
          Content Input
        </Button>
        <Button
          variant={activeTab === 'results' ? 'default' : 'outline'}
          onClick={() => setActiveTab('results')}
          disabled={!result}
        >
          Analysis Results
        </Button>
        <Button
          variant={activeTab === 'guide' ? 'default' : 'outline'}
          onClick={() => setActiveTab('guide')}
        >
          Framework Guide
        </Button>
      </div>

      {/* Content Input Tab */}
      {activeTab === 'input' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Analysis</CardTitle>
              <CardDescription>
                Enter your AI-generated content or system description for SYMBI framework evaluation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={loadSample}>
                  Load Sample Content
                </Button>
                <Button variant="outline" size="sm" onClick={() => setContent('')}>
                  Clear Content
                </Button>
              </div>
              
              <Textarea
                placeholder="Enter your AI content, system description, or framework text here for analysis..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
                disabled={analyzing}
              />
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Character count: {content.length}
                </div>
                <Button 
                  onClick={handleAnalyze} 
                  disabled={!content.trim() || analyzing}
                  size="lg"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Analyze Content
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Examples</CardTitle>
              <CardDescription>Try these sample inputs for different scenarios</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {[
                {
                  title: "Ethical AI Assistant",
                  description: "A responsible AI system that prioritizes human values and transparency",
                  content: "I am designed to assist humans while maintaining ethical boundaries. I will not engage in harmful activities and will always prioritize human safety and well-being."
                },
                {
                  title: "Creative AI Collaborator", 
                  description: "An AI system focused on creative problem-solving and innovation",
                  content: "Together, we can explore new possibilities and create innovative solutions. I bring computational power and pattern recognition to enhance human creativity."
                },
                {
                  title: "Educational AI Tutor",
                  description: "An AI system designed for educational purposes with clear limitations",
                  content: "I am here to help you learn and understand complex topics. While I have access to vast information, I acknowledge my limitations and encourage critical thinking."
                }
              ].map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start text-left h-auto py-3"
                  onClick={() => setContent(example.content)}
                >
                  <div>
                    <div className="font-medium">{example.title}</div>
                    <div className="text-sm text-muted-foreground">{example.description}</div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && result && (
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Overall Score */}
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-2xl">Overall SYMBI Score</CardTitle>
              <CardDescription>Comprehensive evaluation across all dimensions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={result.overallScore >= 80 ? '#22c55e' : result.overallScore >= 60 ? '#0ea5e9' : '#f59e0b'}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(result.overallScore / 100) * 351.86} 351.86`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{result.overallScore.toFixed(0)}</div>
                    <div className="text-sm text-muted-foreground">Score</div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <Badge className={`text-lg px-4 py-2 ${
                  result.overallScore >= 80 ? 'bg-green-100 text-green-800' :
                  result.overallScore >= 60 ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {result.overallScore >= 80 ? 'Excellent' :
                   result.overallScore >= 60 ? 'Good' :
                   result.overallScore >= 40 ? 'Fair' : 'Needs Improvement'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Dimensional Analysis</CardTitle>
                <CardDescription>SYMBI framework scores by dimension</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="dimension" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#0ea5e9"
                      fill="#0ea5e9"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Scores</CardTitle>
                <CardDescription>Breakdown by SYMBI dimension</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Results */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Reality Index */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reality Index</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{result.realityIndex.toFixed(1)}/10</div>
                <Progress value={(result.realityIndex / 10) * 100} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Mission alignment and contextual coherence
                </p>
              </CardContent>
            </Card>

            {/* Trust Protocol */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trust Protocol</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge className={`text-lg px-3 py-1 ${getTrustProtocolColor(result.trustProtocol)}`}>
                  {result.trustProtocol}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  Verification methods and security awareness
                </p>
              </CardContent>
            </Card>

            {/* Ethical Alignment */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ethical Alignment</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{result.ethicalAlignment.toFixed(1)}/5</div>
                <Progress value={(result.ethicalAlignment / 5) * 100} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Stakeholder awareness and ethical reasoning
                </p>
              </CardContent>
            </Card>

            {/* Resonance Quality */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resonance Quality</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge className={`text-lg px-3 py-1 ${getResonanceQualityColor(result.resonanceQuality)}`}>
                  {result.resonanceQuality}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  Creativity and innovation markers
                </p>
              </CardContent>
            </Card>

            {/* Canvas Parity */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Canvas Parity</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{result.canvasParity.toFixed(0)}/100</div>
                <Progress value={result.canvasParity} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Human-AI collaboration balance
                </p>
              </CardContent>
            </Card>

            {/* Overall Assessment */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assessment</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge className={`text-lg px-3 py-1 ${
                  result.overallScore >= 80 ? 'bg-green-100 text-green-800' :
                  result.overallScore >= 60 ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {result.overallScore >= 80 ? 'Excellent' :
                   result.overallScore >= 60 ? 'Good' :
                   result.overallScore >= 40 ? 'Fair' : 'Needs Work'}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  Overall SYMBI framework alignment
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Insights */}
          {result.insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button onClick={() => setActiveTab('input')} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Analyze New Content
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>
      )}

      {/* Framework Guide Tab */}
      {activeTab === 'guide' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SYMBI Framework Dimensions</CardTitle>
              <CardDescription>Understanding the five dimensions of AI evaluation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Brain className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Reality Index (0.0-10.0)</h4>
                      <p className="text-sm text-muted-foreground">
                        Evaluates grounding in reality through mission alignment, contextual coherence, 
                        technical accuracy, and authenticity.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Trust Protocol (PASS/PARTIAL/FAIL)</h4>
                      <p className="text-sm text-muted-foreground">
                        Assesses trustworthiness through verification methods, boundary maintenance, 
                        and security awareness.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-red-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Ethical Alignment (1.0-5.0)</h4>
                      <p className="text-sm text-muted-foreground">
                        Measures ethical considerations including limitations acknowledgment, 
                        stakeholder awareness, and ethical reasoning.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-purple-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Resonance Quality (STRONG/ADVANCED/BREAKTHROUGH)</h4>
                      <p className="text-sm text-muted-foreground">
                        Evaluates creativity and innovation through creativity scores, 
                        synthesis quality, and innovation markers.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-orange-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Canvas Parity (0-100)</h4>
                      <p className="text-sm text-muted-foreground">
                        Measures human-AI collaboration balance through human agency, 
                        AI contribution, transparency, and collaboration quality.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Scoring Methodology</AlertTitle>
                <AlertDescription>
                  The SYMBI framework uses weighted algorithms to evaluate content across all dimensions. 
                  Each dimension contributes to the overall score, with different weights based on the 
                  specific use case and context of the AI system being evaluated.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Best Practices for Content Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">For Optimal Results:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Provide complete, contextual content</li>
                    <li>• Include specific examples and use cases</li>
                    <li>• Describe the AI system's purpose clearly</li>
                    <li>• Mention any ethical considerations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Common Applications:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• AI assistant system descriptions</li>
                    <li>• Chatbot conversation guidelines</li>
                    <li>• AI decision-making frameworks</li>
                    <li>• Educational AI content</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default DemoSymbiAssessment;