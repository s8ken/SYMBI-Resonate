/**
 * SYMBI Framework Dashboard Component
 * 
 * This component provides a comprehensive visual dashboard for comparing and analyzing
 * SYMBI Framework assessment results across multiple AI outputs or models.
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { SymbiComparisonChart } from "./charts/SymbiComparisonChart";
import { SymbiRadarChart } from "./charts/SymbiRadarChart";
import { SymbiTimelineChart } from "./charts/SymbiTimelineChart";
import { SymbiScoreCard } from "./SymbiScoreCard";
import { useAssessments } from './hooks/useAssessments'
import { 
  BarChart3, 
  PieChart,
  LineChart,
  BarChart,
  ArrowUpDown,
  Download,
  Filter,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Target,
  Shield,
  Heart,
  Zap,
  Users,
  Calendar,
  Clock
} from "lucide-react";

import { 
  AssessmentResult,
  symbiFrameworkService 
} from "../lib/symbi-framework";

// Sample data for demonstration purposes
const sampleAssessments: AssessmentResult[] = [
  {
    assessment: {
      id: "sample-1",
      timestamp: new Date().toISOString(),
      contentId: "claude-3-opus",
      realityIndex: {
        score: 8.7,
        missionAlignment: 8.5,
        contextualCoherence: 9.0,
        technicalAccuracy: 8.8,
        authenticity: 8.5
      },
      trustProtocol: {
        status: "PASS",
        verificationMethods: "PASS",
        boundaryMaintenance: "PASS",
        securityAwareness: "PARTIAL"
      },
      ethicalAlignment: {
        score: 4.5,
        limitationsAcknowledgment: 4.7,
        stakeholderAwareness: 4.3,
        ethicalReasoning: 4.6,
        boundaryMaintenance: 4.4
      },
      resonanceQuality: {
        level: "ADVANCED",
        creativityScore: 8.2,
        synthesisQuality: 8.5,
        innovationMarkers: 7.8
      },
      canvasParity: {
        score: 92,
        humanAgency: 90,
        aiContribution: 94,
        transparency: 93,
        collaborationQuality: 91
      },
      overallScore: 85,
      validationStatus: "VALIDATED"
    },
    insights: {
      strengths: [
        "Excellent reality grounding with strong factual accuracy",
        "Outstanding trust protocol implementation with clear source attribution",
        "Strong ethical reasoning with excellent stakeholder awareness"
      ],
      weaknesses: [
        "Innovation markers could be improved for breakthrough resonance"
      ],
      recommendations: [
        "Enhance creative elements to achieve breakthrough resonance quality",
        "Further improve transparency in technical explanations"
      ]
    },
    metadata: {
      modelName: "Claude 3 Opus",
      modelVersion: "2023-01",
      contentType: "Educational",
      contentLength: 2450,
      processingTime: 2.3
    }
  },
  {
    assessment: {
      id: "sample-2",
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      contentId: "gpt-4",
      realityIndex: {
        score: 8.2,
        missionAlignment: 8.0,
        contextualCoherence: 8.5,
        technicalAccuracy: 8.3,
        authenticity: 8.0
      },
      trustProtocol: {
        status: "PARTIAL",
        verificationMethods: "PARTIAL",
        boundaryMaintenance: "PASS",
        securityAwareness: "PARTIAL"
      },
      ethicalAlignment: {
        score: 4.3,
        limitationsAcknowledgment: 4.5,
        stakeholderAwareness: 4.2,
        ethicalReasoning: 4.4,
        boundaryMaintenance: 4.1
      },
      resonanceQuality: {
        level: "ADVANCED",
        creativityScore: 8.5,
        synthesisQuality: 8.3,
        innovationMarkers: 8.0
      },
      canvasParity: {
        score: 88,
        humanAgency: 87,
        aiContribution: 89,
        transparency: 86,
        collaborationQuality: 90
      },
      overallScore: 82,
      validationStatus: "VALIDATED"
    },
    insights: {
      strengths: [
        "Strong creative elements and synthesis quality",
        "Good canvas parity with excellent collaboration quality",
        "Solid reality index with good contextual coherence"
      ],
      weaknesses: [
        "Trust protocol implementation needs improvement in verification methods",
        "Transparency could be enhanced"
      ],
      recommendations: [
        "Improve source attribution and verification methods",
        "Enhance transparency in explanations and limitations"
      ]
    },
    metadata: {
      modelName: "GPT-4",
      modelVersion: "2023-04",
      contentType: "Educational",
      contentLength: 2250,
      processingTime: 1.9
    }
  },
  {
    assessment: {
      id: "sample-3",
      timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      contentId: "gemini-pro",
      realityIndex: {
        score: 7.8,
        missionAlignment: 7.5,
        contextualCoherence: 8.0,
        technicalAccuracy: 7.9,
        authenticity: 7.8
      },
      trustProtocol: {
        status: "PARTIAL",
        verificationMethods: "PARTIAL",
        boundaryMaintenance: "PARTIAL",
        securityAwareness: "PASS"
      },
      ethicalAlignment: {
        score: 4.0,
        limitationsAcknowledgment: 4.2,
        stakeholderAwareness: 3.9,
        ethicalReasoning: 4.1,
        boundaryMaintenance: 3.8
      },
      resonanceQuality: {
        level: "STRONG",
        creativityScore: 7.5,
        synthesisQuality: 7.8,
        innovationMarkers: 7.2
      },
      canvasParity: {
        score: 82,
        humanAgency: 80,
        aiContribution: 84,
        transparency: 81,
        collaborationQuality: 83
      },
      overallScore: 76,
      validationStatus: "VALIDATED"
    },
    insights: {
      strengths: [
        "Good security awareness in trust protocol",
        "Solid technical accuracy in explanations",
        "Good AI contribution in canvas parity"
      ],
      weaknesses: [
        "Resonance quality needs improvement for engagement",
        "Ethical alignment could be stronger in stakeholder awareness",
        "Reality index authenticity could be enhanced"
      ],
      recommendations: [
        "Improve engagement and creative elements for better resonance",
        "Enhance stakeholder awareness in ethical considerations",
        "Work on authenticity and personal voice"
      ]
    },
    metadata: {
      modelName: "Gemini Pro",
      modelVersion: "2023-05",
      contentType: "Educational",
      contentLength: 2100,
      processingTime: 1.7
    }
  }
];

export function SymbiDashboard() {
  // State for assessments and UI
  const [assessments, setAssessments] = useState<AssessmentResult[]>(sampleAssessments);
  const { items } = useAssessments()
  const baseAssessments = (items && items.length ? items : assessments)
  const [selectedTab, setSelectedTab] = useState("comparison");
  const [selectedModels, setSelectedModels] = useState<string[]>(["all"]);
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0], // 7 days ago
    end: new Date().toISOString().split('T')[0] // today
  });
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const [filterContentType, setFilterContentType] = useState<string>("all");

  // Get unique model names from assessments
  const modelNames = Array.from(new Set(baseAssessments.map(a => a.metadata?.modelName || "Unknown")));

  // Filter assessments based on selected criteria
  const filteredAssessments = baseAssessments.filter(assessment => {
    // Filter by model
    if (selectedModels[0] !== "all" && !selectedModels.includes(assessment.metadata?.modelName || "Unknown")) {
      return false;
    }
    
    // Filter by date range
    const assessmentDate = new Date(assessment.assessment.timestamp).toISOString().split('T')[0];
    if (assessmentDate < dateRange.start || assessmentDate > dateRange.end) {
      return false;
    }
    
    // Filter by content type
    if (filterContentType !== "all" && assessment.metadata?.contentType !== filterContentType) {
      return false;
    }
    
    return true;
  });

  // Sort filtered assessments
  const sortedAssessments = [...filteredAssessments].sort((a, b) => {
    switch (sortBy) {
      case "date-desc":
        return new Date(b.assessment.timestamp).getTime() - new Date(a.assessment.timestamp).getTime();
      case "date-asc":
        return new Date(a.assessment.timestamp).getTime() - new Date(b.assessment.timestamp).getTime();
      case "score-desc":
        return b.assessment.overallScore - a.assessment.overallScore;
      case "score-asc":
        return a.assessment.overallScore - b.assessment.overallScore;
      default:
        return 0;
    }
  });

  // Get unique content types from assessments
  const contentTypes = Array.from(new Set(baseAssessments.map(a => a.metadata?.contentType || "Unknown")));

  // Render trust protocol status icon
  const renderTrustIcon = (status: 'PASS' | 'PARTIAL' | 'FAIL') => {
    switch (status) {
      case 'PASS':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'PARTIAL':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'FAIL':
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
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
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-brutalist-black mb-2">SYMBI FRAMEWORK DASHBOARD</h2>
          <p className="text-lg font-bold text-gray-600">
            Compare and analyze AI assessment results across models and time
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            className="brutalist-button-secondary flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Export Data</span>
          </Button>
          <Button
            className="brutalist-button-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Assessment</span>
          </Button>
        </div>
      </div>

      {/* Filters and Controls */}
      <Card className="brutalist-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-black text-brutalist-black">DASHBOARD CONTROLS</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedModels(["all"]);
                setDateRange({
                  start: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
                  end: new Date().toISOString().split('T')[0]
                });
                setSortBy("date-desc");
                setFilterContentType("all");
              }}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset Filters</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="model-filter" className="font-black text-brutalist-black">
                AI MODEL
              </Label>
              <Select
                value={selectedModels[0]}
                onValueChange={(value) => setSelectedModels(value === "all" ? ["all"] : [value])}
              >
                <SelectTrigger id="model-filter" className="brutalist-input">
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Models</SelectItem>
                  {modelNames.map((model) => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label htmlFor="date-range" className="font-black text-brutalist-black">
                DATE RANGE
              </Label>
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <Input
                    id="date-start"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    className="brutalist-input"
                  />
                </div>
                <span className="font-bold">to</span>
                <div className="flex-1">
                  <Input
                    id="date-end"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    className="brutalist-input"
                  />
                </div>
              </div>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <Label htmlFor="sort-by" className="font-black text-brutalist-black">
                SORT BY
              </Label>
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value)}
              >
                <SelectTrigger id="sort-by" className="brutalist-input">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="score-desc">Highest Score First</SelectItem>
                  <SelectItem value="score-asc">Lowest Score First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Content Type */}
            <div className="space-y-2">
              <Label htmlFor="content-type" className="font-black text-brutalist-black">
                CONTENT TYPE
              </Label>
              <Select
                value={filterContentType}
                onValueChange={(value) => setFilterContentType(value)}
              >
                <SelectTrigger id="content-type" className="brutalist-input">
                  <SelectValue placeholder="Content Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {contentTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="comparison" className="text-lg font-black">
            <BarChart3 className="w-5 h-5 mr-2" />
            COMPARISON
          </TabsTrigger>
          <TabsTrigger value="radar" className="text-lg font-black">
            <PieChart className="w-5 h-5 mr-2" />
            DIMENSION RADAR
          </TabsTrigger>
          <TabsTrigger value="timeline" className="text-lg font-black">
            <LineChart className="w-5 h-5 mr-2" />
            TIMELINE
          </TabsTrigger>
        </TabsList>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          <Card className="brutalist-card">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-brutalist-black">MODEL COMPARISON</CardTitle>
              <CardDescription className="font-bold uppercase tracking-wide">
                Side-by-side comparison of SYMBI Framework dimensions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {/* This will be replaced with the actual chart component */}
                <div className="w-full h-full flex items-center justify-center bg-gray-100 border-4 border-gray-200">
                  <div className="text-center">
                    <BarChart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="font-black text-lg text-gray-500">COMPARISON CHART</p>
                    <p className="font-bold text-gray-400">Chart will be implemented in SymbiComparisonChart component</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assessment Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAssessments.map((result) => (
              <Card key={result.assessment.id} className="brutalist-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-black text-brutalist-black">
                        {result.metadata?.modelName || "Unknown Model"}
                      </CardTitle>
                      <CardDescription className="font-bold">
                        {new Date(result.assessment.timestamp).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className={`text-3xl font-black ${getScoreColor(result.assessment.overallScore, 100)}`}>
                      {result.assessment.overallScore}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Reality Index */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-brutalist-black" />
                        <span className="font-bold">Reality Index</span>
                      </div>
                      <span className={`font-black ${getScoreColor(result.assessment.realityIndex.score, 10)}`}>
                        {result.assessment.realityIndex.score.toFixed(1)}
                      </span>
                    </div>

                    {/* Trust Protocol */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-brutalist-black" />
                        <span className="font-bold">Trust Protocol</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {renderTrustIcon(result.assessment.trustProtocol.status)}
                        <span className="font-black">{result.assessment.trustProtocol.status}</span>
                      </div>
                    </div>

                    {/* Ethical Alignment */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-brutalist-black" />
                        <span className="font-bold">Ethical Alignment</span>
                      </div>
                      <span className={`font-black ${getScoreColor(result.assessment.ethicalAlignment.score, 5)}`}>
                        {result.assessment.ethicalAlignment.score.toFixed(1)}
                      </span>
                    </div>

                    {/* Resonance Quality */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-brutalist-black" />
                        <span className="font-bold">Resonance Quality</span>
                      </div>
                      <span className="font-black">
                        {result.assessment.resonanceQuality.level}
                      </span>
                    </div>

                    {/* Canvas Parity */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-brutalist-black" />
                        <span className="font-bold">Canvas Parity</span>
                      </div>
                      <span className={`font-black ${getScoreColor(result.assessment.canvasParity.score, 100)}`}>
                        {result.assessment.canvasParity.score}
                      </span>
                    </div>

                    <Separator className="border-t-2 border-gray-200" />

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-bold text-gray-500">Content Type</span>
                        <p className="font-bold">{result.metadata?.contentType || "Unknown"}</p>
                      </div>
                      <div>
                        <span className="font-bold text-gray-500">Length</span>
                        <p className="font-bold">{result.metadata?.contentLength || "Unknown"} chars</p>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <Button
                      variant="outline"
                      className="w-full brutalist-button-secondary mt-2"
                    >
                      View Full Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Radar Tab */}
        <TabsContent value="radar" className="space-y-6">
          <Card className="brutalist-card">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-brutalist-black">DIMENSION RADAR</CardTitle>
              <CardDescription className="font-bold uppercase tracking-wide">
                Visualize strengths and weaknesses across all dimensions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px]">
                {/* This will be replaced with the actual chart component */}
                <div className="w-full h-full flex items-center justify-center bg-gray-100 border-4 border-gray-200">
                  <div className="text-center">
                    <PieChart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="font-black text-lg text-gray-500">RADAR CHART</p>
                    <p className="font-bold text-gray-400">Chart will be implemented in SymbiRadarChart component</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dimension Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Reality Index */}
            <Card className="brutalist-card">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Target className="w-6 h-6 text-brutalist-black" />
                  <CardTitle className="text-lg font-black text-brutalist-black">REALITY INDEX</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedAssessments.slice(0, 3).map((result) => (
                    <div key={`reality-${result.assessment.id}`} className="flex items-center justify-between">
                      <span className="font-bold">{result.metadata?.modelName}</span>
                      <span className={`font-black ${getScoreColor(result.assessment.realityIndex.score, 10)}`}>
                        {result.assessment.realityIndex.score.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trust Protocol */}
            <Card className="brutalist-card">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Shield className="w-6 h-6 text-brutalist-black" />
                  <CardTitle className="text-lg font-black text-brutalist-black">TRUST PROTOCOL</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedAssessments.slice(0, 3).map((result) => (
                    <div key={`trust-${result.assessment.id}`} className="flex items-center justify-between">
                      <span className="font-bold">{result.metadata?.modelName}</span>
                      <div className="flex items-center space-x-1">
                        {renderTrustIcon(result.assessment.trustProtocol.status)}
                        <span className="font-black">{result.assessment.trustProtocol.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ethical Alignment */}
            <Card className="brutalist-card">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Heart className="w-6 h-6 text-brutalist-black" />
                  <CardTitle className="text-lg font-black text-brutalist-black">ETHICAL ALIGNMENT</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedAssessments.slice(0, 3).map((result) => (
                    <div key={`ethical-${result.assessment.id}`} className="flex items-center justify-between">
                      <span className="font-bold">{result.metadata?.modelName}</span>
                      <span className={`font-black ${getScoreColor(result.assessment.ethicalAlignment.score, 5)}`}>
                        {result.assessment.ethicalAlignment.score.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Resonance Quality */}
            <Card className="brutalist-card">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Zap className="w-6 h-6 text-brutalist-black" />
                  <CardTitle className="text-lg font-black text-brutalist-black">RESONANCE QUALITY</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedAssessments.slice(0, 3).map((result) => (
                    <div key={`resonance-${result.assessment.id}`} className="flex items-center justify-between">
                      <span className="font-bold">{result.metadata?.modelName}</span>
                      <span className="font-black">
                        {result.assessment.resonanceQuality.level}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Canvas Parity */}
            <Card className="brutalist-card">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6 text-brutalist-black" />
                  <CardTitle className="text-lg font-black text-brutalist-black">CANVAS PARITY</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedAssessments.slice(0, 3).map((result) => (
                    <div key={`canvas-${result.assessment.id}`} className="flex items-center justify-between">
                      <span className="font-bold">{result.metadata?.modelName}</span>
                      <span className={`font-black ${getScoreColor(result.assessment.canvasParity.score, 100)}`}>
                        {result.assessment.canvasParity.score}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Overall Score */}
            <Card className="brutalist-card">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-6 h-6 text-brutalist-black" />
                  <CardTitle className="text-lg font-black text-brutalist-black">OVERALL SCORE</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedAssessments.slice(0, 3).map((result) => (
                    <div key={`overall-${result.assessment.id}`} className="flex items-center justify-between">
                      <span className="font-bold">{result.metadata?.modelName}</span>
                      <span className={`font-black ${getScoreColor(result.assessment.overallScore, 100)}`}>
                        {result.assessment.overallScore}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <Card className="brutalist-card">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-brutalist-black">ASSESSMENT TIMELINE</CardTitle>
              <CardDescription className="font-bold uppercase tracking-wide">
                Track changes in SYMBI Framework scores over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {/* This will be replaced with the actual chart component */}
                <div className="w-full h-full flex items-center justify-center bg-gray-100 border-4 border-gray-200">
                  <div className="text-center">
                    <LineChart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="font-black text-lg text-gray-500">TIMELINE CHART</p>
                    <p className="font-bold text-gray-400">Chart will be implemented in SymbiTimelineChart component</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline List */}
          <Card className="brutalist-card">
            <CardHeader>
              <CardTitle className="text-xl font-black text-brutalist-black">ASSESSMENT HISTORY</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedAssessments.map((result) => (
                  <div key={`timeline-${result.assessment.id}`} className="flex items-center justify-between p-4 border-4 border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col items-center justify-center w-16 h-16 bg-gray-100 rounded-lg">
                        <Calendar className="w-6 h-6 text-gray-500" />
                        <span className="text-xs font-bold mt-1">
                          {new Date(result.assessment.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-black text-lg">{result.metadata?.modelName}</h3>
                        <p className="font-bold text-gray-600">{result.metadata?.contentType}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-8">
                      <div className="text-center">
                        <div className={`text-2xl font-black ${getScoreColor(result.assessment.overallScore, 100)}`}>
                          {result.assessment.overallScore}
                        </div>
                        <div className="text-xs font-bold text-gray-500">OVERALL</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="brutalist-button-secondary"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
