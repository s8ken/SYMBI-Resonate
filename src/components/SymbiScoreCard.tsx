/**
 * SYMBI Framework Score Card Component
 * 
 * This component displays a summary card for a SYMBI Framework assessment result,
 * showing key scores and metrics in a compact, visually appealing format.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Target, 
  Shield, 
  Heart, 
  Zap, 
  Users,
  ExternalLink
} from "lucide-react";

import { AssessmentResult } from "../lib/symbi-framework";

interface SymbiScoreCardProps {
  result: AssessmentResult;
  compact?: boolean;
  onViewDetails?: () => void;
}

export function SymbiScoreCard({ result, compact = false, onViewDetails }: SymbiScoreCardProps) {
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

  // Render resonance quality badge
  const renderResonanceBadge = (level: 'STRONG' | 'ADVANCED' | 'BREAKTHROUGH') => {
    let className = "px-2 py-1 text-xs font-bold uppercase tracking-wider rounded";
    
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

  return (
    <Card className={`brutalist-card ${compact ? 'border-2' : 'border-4'}`}>
      <CardHeader className={compact ? 'p-4' : 'p-6'}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={`${compact ? 'text-lg' : 'text-xl'} font-black text-brutalist-black`}>
              {result.metadata?.modelName || "Unknown Model"}
            </CardTitle>
            <CardDescription className="font-bold">
              {new Date(result.assessment.timestamp).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className={`${compact ? 'text-2xl' : 'text-3xl'} font-black ${getScoreColor(result.assessment.overallScore, 100)}`}>
            {result.assessment.overallScore}
          </div>
        </div>
      </CardHeader>
      <CardContent className={compact ? 'p-4' : 'p-6'}>
        <div className="space-y-3">
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
            {compact ? (
              <span className="font-black">
                {result.assessment.resonanceQuality.level}
              </span>
            ) : (
              renderResonanceBadge(result.assessment.resonanceQuality.level)
            )}
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

          {!compact && (
            <>
              <div className="border-t-2 border-gray-200 my-3"></div>

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
              {onViewDetails && (
                <Button
                  variant="outline"
                  className="w-full brutalist-button-secondary mt-2 flex items-center justify-center"
                  onClick={onViewDetails}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Full Details
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}