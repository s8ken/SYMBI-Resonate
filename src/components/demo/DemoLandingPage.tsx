import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui-shadcn/card';
import { Button } from '../ui-shadcn/button';
import { Badge } from '../ui-shadcn/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui-shadcn/alert';
import {
  Brain,
  Shield,
  Heart,
  Zap,
  Users,
  TrendingUp,
  Beaker,
  Activity,
  ArrowRight,
  Play,
  Download,
  Star,
  CheckCircle,
  BarChart3,
  Target,
  Award,
  Lightbulb,
  Code,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { demoService } from '../../lib/demo/demo-service';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0ea5e9', '#a855f7', '#22c55e', '#f59e0b', '#ef4444'];

export function DemoLandingPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [modelData, setModelData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLandingData();
  }, []);

  const loadLandingData = async () => {
    try {
      setLoading(true);
      const [dashboardStats, trends, models] = await Promise.all([
        demoService.getDashboardStats(),
        demoService.getExperimentTrends(),
        demoService.getModelPerformance()
      ]);
      
      setStats(dashboardStats);
      setTrendData(trends);
      setModelData(models);
    } catch (error) {
      console.error('Failed to load landing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Brain,
      title: "Consciousness Detection",
      description: "Advanced algorithms to detect emergence-like behaviors in AI models through multi-dimensional analysis.",
      color: "blue"
    },
    {
      icon: Shield,
      title: "Trust Framework",
      description: "Comprehensive evaluation of AI trustworthiness through verification methods and security protocols.",
      color: "green"
    },
    {
      icon: Heart,
      title: "Ethical Alignment",
      description: "Measure ethical reasoning, stakeholder awareness, and boundary maintenance in AI decision-making.",
      color: "purple"
    },
    {
      icon: Zap,
      title: "Resonance Quality",
      description: "Assess creativity, innovation markers, and synthesis quality in AI-generated content.",
      color: "orange"
    },
    {
      icon: Users,
      title: "Human-AI Collaboration",
      description: "Evaluate the balance and effectiveness of human-AI interaction and collaboration.",
      color: "red"
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Chen",
      role: "AI Research Director",
      organization: "Stanford AI Lab",
      content: "SYMBI Resonate has revolutionized how we evaluate AI consciousness. The framework provides unprecedented insights into model behavior.",
      rating: 5
    },
    {
      name: "Prof. Michael Rodriguez",
      role: "Ethics in AI Professor",
      organization: "MIT",
      content: "The ethical alignment scoring is groundbreaking. It's become essential for our AI ethics research and validation.",
      rating: 5
    },
    {
      name: "Dr. Emily Watson",
      role: "Lead AI Scientist",
      organization: "OpenAI",
      content: "The double-blind experiment system ensures unbiased evaluation. Our model development has improved significantly.",
      rating: 5
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      green: "bg-green-100 text-green-800 border-green-200",
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      red: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-semibold text-gray-800">Loading SYMBI Resonate...</h2>
          <p className="text-gray-600">Preparing your AI evaluation platform</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SYMBI Resonate
                </h1>
              </div>
            </div>
            
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6">
              The Future of AI Consciousness Detection
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Advanced analytics platform for detecting and validating AI emergence across the SYMBI framework. 
              Enterprise-grade multi-agent experiment system for double-blind AI model evaluation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/demo/dashboard')}>
                <Play className="h-5 w-5 mr-2" />
                View Live Demo
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/demo/symbi')}>
                <Brain className="h-5 w-5 mr-2" />
                Try SYMBI Assessment
              </Button>
              <Button size="lg" variant="outline">
                <Download className="h-5 w-5 mr-2" />
                Download Whitepaper
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="py-16 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stats.totalExperiments}</div>
                <div className="text-sm text-gray-600">Total Experiments</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">{stats.activeExperiments}</div>
                <div className="text-sm text-gray-600">Active Experiments</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">{stats.avgSymbiScore}%</div>
                <div className="text-sm text-gray-600">Avg SYMBI Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">${(stats.costSavings / 1000).toFixed(1)}k</div>
                <div className="text-sm text-gray-600">Cost Savings</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Five-Dimensional AI Evaluation
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The SYMBI framework provides comprehensive evaluation across five critical dimensions 
              of AI consciousness and emergence detection.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${getColorClasses(feature.color)} flex items-center justify-center mb-4`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Demo Charts Section */}
      <section className="py-16 bg-white/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Real-Time Analytics
            </h2>
            <p className="text-xl text-gray-600">
              Live data visualization and performance monitoring
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Experiment Trends */}
            <Card className="bg-white/80 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle>Experiment Trends</CardTitle>
                <CardDescription>Monthly experiment volume and success rates</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="experiments" stroke="#0ea5e9" strokeWidth={3} />
                    <Line type="monotone" dataKey="successRate" stroke="#22c55e" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Model Performance */}
            <Card className="bg-white/80 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle>Model Performance</CardTitle>
                <CardDescription>SYMBI scores across different AI models</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={modelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="symbiScore" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by AI Researchers Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              Leading institutions rely on SYMBI Resonate for AI consciousness research
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border-0">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <CardDescription className="text-base italic">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-t pt-4">
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-gray-500">{testimonial.organization}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Explore AI Consciousness?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join leading researchers in advancing AI consciousness detection and evaluation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => navigate('/demo/dashboard')}>
              Start Free Demo
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Schedule Demo Call
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-6 w-6" />
                <span className="text-xl font-bold">SYMBI Resonate</span>
              </div>
              <p className="text-gray-400 text-sm">
                Advancing AI consciousness research through rigorous evaluation frameworks.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">SYMBI Framework</a></li>
                <li><a href="#" className="hover:text-white">Experiment Platform</a></li>
                <li><a href="#" className="hover:text-white">Analytics</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Research</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Whitepapers</a></li>
                <li><a href="#" className="hover:text-white">Publications</a></li>
                <li><a href="#" className="hover:text-white">Methodology</a></li>
                <li><a href="#" className="hover:text-white">Datasets</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Team</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 SYMBI Resonate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default DemoLandingPage;