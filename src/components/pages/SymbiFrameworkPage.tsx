/**
 * Enhanced SYMBI Framework Page
 * 
 * This page provides comprehensive access to the SYMBI framework detection and validation tools
 * with enhanced user guidance and explanations.
 */

import { SymbiFrameworkAssessment } from "../SymbiFrameworkAssessment";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { 
  Target, 
  Shield, 
  Heart, 
  Zap, 
  Users, 
  BookOpen, 
  Lightbulb,
  TrendingUp,
  Award
} from "lucide-react";

function SymbiFrameworkPage() {
  return (
    <>
      {/* Enhanced Header */}
      <header className="bg-brutalist-white border-b-4 border-brutalist-black px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-black text-brutalist-black mb-3">SYMBI FRAMEWORK</h1>
              <p className="text-xl font-bold text-gray-700 mb-2">
                Comprehensive AI Content Assessment Platform
              </p>
              <p className="text-brutalist-black font-bold uppercase tracking-wide">
                DETECT AND VALIDATE AI OUTPUTS ACROSS 5 CRITICAL DIMENSIONS
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="brutalist-tag bg-blue-600 text-white">
                FRAMEWORK DETECTION
              </div>
              <div className="brutalist-tag bg-green-600 text-white">
                RESEARCH VALIDATED
              </div>
            </div>
          </div>
          
          {/* Quick Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-white border-4 border-gray-200 p-4 text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-black text-sm text-brutalist-black mb-1">REALITY INDEX</h3>
              <p className="text-xs font-bold text-gray-600">Factual Accuracy</p>
            </div>
            <div className="bg-white border-4 border-gray-200 p-4 text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-black text-sm text-brutalist-black mb-1">TRUST PROTOCOL</h3>
              <p className="text-xs font-bold text-gray-600">Transparency</p>
            </div>
            <div className="bg-white border-4 border-gray-200 p-4 text-center">
              <Heart className="w-8 h-8 mx-auto mb-2 text-red-600" />
              <h3 className="font-black text-sm text-brutalist-black mb-1">ETHICAL ALIGNMENT</h3>
              <p className="text-xs font-bold text-gray-600">Values & Ethics</p>
            </div>
            <div className="bg-white border-4 border-gray-200 p-4 text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-black text-sm text-brutalist-black mb-1">RESONANCE QUALITY</h3>
              <p className="text-xs font-bold text-gray-600">Engagement</p>
            </div>
            <div className="bg-white border-4 border-gray-200 p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <h3 className="font-black text-sm text-brutalist-black mb-1">CANVAS PARITY</h3>
              <p className="text-xs font-bold text-gray-600">Prompt Fulfillment</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8 bg-brutalist-white">
        <div className="max-w-7xl mx-auto">
          <SymbiFrameworkAssessment />
        </div>
      </main>
    </>
  );
}

export default SymbiFrameworkPage;
export { SymbiFrameworkPage };