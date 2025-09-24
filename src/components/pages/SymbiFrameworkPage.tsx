/**
 * Enhanced SYMBI Framework Page
 * 
 * This page provides comprehensive access to the SYMBI framework detection and validation tools
 * with enhanced user guidance, explanations, and visual dashboard.
 */

import { useState } from "react";
import { SymbiFrameworkAssessment } from "../SymbiFrameworkAssessment";
import { SymbiDashboard } from "../SymbiDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  Target, 
  Shield, 
  Heart, 
  Zap, 
  Users, 
  BookOpen, 
  Lightbulb,
  TrendingUp,
  Award,
  BarChart3,
  LineChart
} from "lucide-react";

export function SymbiFrameworkPage() {
  const [activeTab, setActiveTab] = useState<string>("assessment");

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

      {/* Main Content with Tabs */}
      <main className="flex-1 overflow-auto p-8 bg-brutalist-white">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger value="assessment" className="text-lg font-black">
                <Target className="w-5 h-5 mr-2" />
                ASSESSMENT
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="text-lg font-black">
                <BarChart3 className="w-5 h-5 mr-2" />
                DASHBOARD
              </TabsTrigger>
            </TabsList>

            <TabsContent value="assessment">
              <SymbiFrameworkAssessment />
            </TabsContent>

            <TabsContent value="dashboard">
              <SymbiDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}