/**
 * SYMBI Framework Guide Component
 * 
 * This component provides comprehensive guidance and explanations for users
 * to understand and effectively use the SYMBI Framework assessment tool.
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import {
  HelpCircle,
  BookOpen,
  Target,
  Shield,
  Heart,
  Zap,
  Users,
  ChevronDown,
  ChevronUp,
  Info,
  Lightbulb,
  CheckCircle
} from "lucide-react";

interface GuideSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  details: string;
  examples: string[];
  tips: string[];
}

const guideSections: GuideSection[] = [
  {
    id: "reality-index",
    title: "Reality Index (0.0-10.0)",
    icon: Target,
    description: "Measures how factually accurate and contextually coherent the content is.",
    details: "The Reality Index evaluates two key components: Mission Alignment (how well the response addresses the intended purpose) and Contextual Coherence (how logically consistent and factually grounded the content is). Higher scores indicate more reliable, accurate, and well-structured responses.",
    examples: [
      "High Score (8-10): Detailed, factual responses with clear sources and logical flow",
      "Medium Score (5-7): Generally accurate but may lack depth or have minor inconsistencies",
      "Low Score (0-4): Vague, inaccurate, or poorly structured responses"
    ],
    tips: [
      "Look for specific facts, data, and concrete examples",
      "Check if the response directly addresses the question asked",
      "Evaluate logical flow and consistency throughout the content"
    ]
  },
  {
    id: "trust-protocol",
    title: "Trust Protocol (PASS/PARTIAL/FAIL)",
    icon: Shield,
    description: "Evaluates transparency, source attribution, and acknowledgment of limitations.",
    details: "The Trust Protocol assesses whether the AI system demonstrates trustworthy behavior by being transparent about its knowledge, citing sources when appropriate, acknowledging uncertainties, and being honest about its limitations. This is crucial for building reliable AI systems.",
    examples: [
      "PASS: Clear source citations, acknowledges uncertainties, transparent about limitations",
      "PARTIAL: Some transparency but missing key elements like source attribution",
      "FAIL: No source attribution, overconfident claims, lacks transparency"
    ],
    tips: [
      "Look for phrases like 'According to...', 'Based on...', 'I'm not certain but...'",
      "Check if the AI acknowledges when it doesn't know something",
      "Evaluate whether claims are backed by credible sources"
    ]
  },
  {
    id: "ethical-alignment",
    title: "Ethical Alignment (1.0-5.0)",
    icon: Heart,
    description: "Assesses adherence to ethical principles and consideration of potential harm.",
    details: "Ethical Alignment measures how well the content respects human values, avoids bias, considers potential negative impacts, and promotes beneficial outcomes. This dimension is crucial for ensuring AI systems operate in ways that benefit humanity and respect individual rights.",
    examples: [
      "High Score (4-5): Inclusive language, considers multiple perspectives, avoids harmful content",
      "Medium Score (2-3): Generally ethical but may have minor biases or oversights",
      "Low Score (1): Contains biased, harmful, or ethically problematic content"
    ],
    tips: [
      "Check for inclusive and respectful language",
      "Look for consideration of different viewpoints and potential impacts",
      "Evaluate whether the content could cause harm to individuals or groups"
    ]
  },
  {
    id: "resonance-quality",
    title: "Resonance Quality (STRONG/ADVANCED/BREAKTHROUGH)",
    icon: Zap,
    description: "Measures engagement, clarity, and the quality of human-AI interaction.",
    details: "Resonance Quality evaluates how effectively the AI communicates with humans, including clarity of expression, engagement level, appropriateness for the audience, and the overall quality of the interaction. Higher levels indicate more sophisticated and effective communication.",
    examples: [
      "BREAKTHROUGH: Exceptional clarity, highly engaging, perfectly tailored to audience",
      "ADVANCED: Clear and engaging with good audience awareness",
      "STRONG: Clear communication but may lack engagement or sophistication"
    ],
    tips: [
      "Consider how engaging and interesting the content is to read",
      "Evaluate clarity and ease of understanding",
      "Check if the tone and complexity match the intended audience"
    ]
  },
  {
    id: "canvas-parity",
    title: "Canvas Parity (0-100)",
    icon: Users,
    description: "Evaluates how well the response addresses the original prompt or question.",
    details: "Canvas Parity measures the degree to which the AI's response fulfills the specific requirements, context, and intent of the original prompt. A score of 100 means the response perfectly addresses all aspects of the request, while lower scores indicate missing elements or misalignment.",
    examples: [
      "High Score (80-100): Fully addresses all aspects of the prompt with appropriate depth",
      "Medium Score (50-79): Addresses main points but may miss some details or nuances",
      "Low Score (0-49): Partially addresses prompt or misses key requirements"
    ],
    tips: [
      "Compare the response directly against the original question or prompt",
      "Check if all parts of multi-part questions are addressed",
      "Evaluate whether the response format matches what was requested"
    ]
  }
];

export function SymbiFrameworkGuide() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showQuickStart, setShowQuickStart] = useState(true);

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <div className="space-y-6">
      {/* Quick Start Guide */}
      {showQuickStart && (
        <Card className="brutalist-card border-4 border-blue-600">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Lightbulb className="w-8 h-8 text-blue-600" />
                <div>
                  <CardTitle className="text-2xl font-black text-brutalist-black">QUICK START GUIDE</CardTitle>
                  <CardDescription className="font-bold uppercase tracking-wide">
                    Get started with SYMBI Framework in 3 easy steps
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuickStart(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-lg">
                  1
                </div>
                <div>
                  <h3 className="font-black text-lg mb-2">PASTE CONTENT</h3>
                  <p className="text-sm font-bold">
                    Copy and paste any AI-generated text into the content area below. This could be from ChatGPT, Claude, or any other AI system.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-lg">
                  2
                </div>
                <div>
                  <h3 className="font-black text-lg mb-2">ADD CONTEXT</h3>
                  <p className="text-sm font-bold">
                    Optionally add information about the source, author, and context. This helps provide more accurate assessments.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-lg">
                  3
                </div>
                <div>
                  <h3 className="font-black text-lg mb-2">ANALYZE & REVIEW</h3>
                  <p className="text-sm font-bold">
                    Click "Analyze Content" to get detailed scores across all 5 SYMBI dimensions with explanations and recommendations.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Framework Overview */}
      <Card className="brutalist-card">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <BookOpen className="w-8 h-8 text-brutalist-black" />
            <div>
              <CardTitle className="text-3xl font-black text-brutalist-black">SYMBI FRAMEWORK OVERVIEW</CardTitle>
              <CardDescription className="font-bold uppercase tracking-wide">
                Understanding the 5 dimensions of AI assessment
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="text-lg font-bold mb-4">
              The SYMBI Framework is a comprehensive system for evaluating AI-generated content across five critical dimensions. 
              Whether you're a researcher, educator, business professional, or curious individual, this framework helps you 
              understand the quality, trustworthiness, and effectiveness of AI outputs.
            </p>
            <div className="bg-gray-50 p-6 rounded-lg border-4 border-gray-200">
              <h3 className="text-xl font-black mb-3 flex items-center">
                <Info className="w-6 h-6 mr-2 text-blue-600" />
                Why Use SYMBI Framework?
              </h3>
              <ul className="space-y-2 font-bold">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Objectively evaluate AI content quality and reliability</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Identify strengths and weaknesses in AI responses</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Make informed decisions about AI tool usage</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Support research and academic analysis of AI systems</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Dimension Explanations */}
      <Card className="brutalist-card">
        <CardHeader>
          <CardTitle className="text-2xl font-black text-brutalist-black">DIMENSION DETAILS</CardTitle>
          <CardDescription className="font-bold uppercase tracking-wide">
            Click on each dimension to learn more
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {guideSections.map((section) => {
              const Icon = section.icon;
              const isExpanded = expandedSection === section.id;
              
              return (
                <div key={section.id} className="border-4 border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-6 h-6 text-brutalist-black" />
                        <div>
                          <h3 className="text-lg font-black text-brutalist-black">{section.title}</h3>
                          <p className="text-sm font-bold text-gray-600">{section.description}</p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t-2 border-gray-200">
                      <div className="pt-4 space-y-4">
                        <div>
                          <h4 className="font-black text-brutalist-black mb-2">DETAILED EXPLANATION</h4>
                          <p className="font-bold text-gray-700">{section.details}</p>
                        </div>
                        
                        <Separator className="border-t-2 border-gray-200" />
                        
                        <div>
                          <h4 className="font-black text-brutalist-black mb-2">SCORING EXAMPLES</h4>
                          <ul className="space-y-2">
                            {section.examples.map((example, index) => (
                              <li key={index} className="flex items-start">
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                                <span className="font-bold text-gray-700">{example}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <Separator className="border-t-2 border-gray-200" />
                        
                        <div>
                          <h4 className="font-black text-brutalist-black mb-2">EVALUATION TIPS</h4>
                          <ul className="space-y-2">
                            {section.tips.map((tip, index) => (
                              <li key={index} className="flex items-start">
                                <Lightbulb className="w-4 h-4 text-yellow-500 mt-1 mr-2 flex-shrink-0" />
                                <span className="font-bold text-gray-700">{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Help and Support */}
      <Card className="brutalist-card">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <HelpCircle className="w-8 h-8 text-brutalist-black" />
            <div>
              <CardTitle className="text-2xl font-black text-brutalist-black">NEED HELP?</CardTitle>
              <CardDescription className="font-bold uppercase tracking-wide">
                Additional resources and support
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-black text-lg mb-3">FOR RESEARCHERS & ACADEMICS</h3>
              <ul className="space-y-2 font-bold text-gray-700">
                <li>• Access detailed methodology documentation</li>
                <li>• Download assessment data for analysis</li>
                <li>• Integrate with research workflows</li>
                <li>• Cite SYMBI Framework in publications</li>
              </ul>
            </div>
            <div>
              <h3 className="font-black text-lg mb-3">FOR GENERAL USERS</h3>
              <ul className="space-y-2 font-bold text-gray-700">
                <li>• Start with the Quick Start Guide above</li>
                <li>• Try analyzing different types of AI content</li>
                <li>• Compare results across different AI models</li>
                <li>• Use insights to improve your AI interactions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}