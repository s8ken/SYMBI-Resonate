import { useState, Suspense, lazy } from "react";
import { 
  BarChart3, 
  FileText, 
  Lightbulb, 
  Settings, 
  Brain, 
  Heart, 
  Quote, 
  Search, 
  Zap, 
  BookOpen, 
  Puzzle, 
  User,
  Upload,
  Target,
  TrendingUp,
  CheckSquare,
} from "lucide-react";
import { Separator } from "./ui/separator";
import { SectionErrorBoundary } from "./ErrorBoundary";
import { FullPageLoading, CardSkeleton } from "./LoadingStates";

// Lazy load page components for better performance
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const AssessmentPage = lazy(() => import("./pages/AssessmentPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const PromptsPage = lazy(() => import("./pages/PromptsPage"));
const OptimizePage = lazy(() => import("./pages/OptimizePage"));
const IntelligencePage = lazy(() => import("./pages/IntelligencePage"));
const SentimentPage = lazy(() => import("./pages/SentimentPage"));
const CitationsPage = lazy(() => import("./pages/CitationsPage"));
const CrawlersPage = lazy(() => import("./pages/CrawlersPage"));
const LLMTrafficPage = lazy(() => import("./pages/LLMTrafficPage"));
const IntegrationsPage = lazy(() => import("./pages/IntegrationsPage"));
const ConversationsPage = lazy(() => import("./pages/ConversationsPage"));
const SymbiFrameworkPage = lazy(() => import("./pages/SymbiFrameworkPage"));

// Loading fallback for lazy-loaded components
const PageLoadingFallback = () => (
  <div className="space-y-6 p-8">
    <div className="space-y-4">
      <div className="h-8 bg-gray-200 animate-pulse w-1/3"></div>
      <div className="h-4 bg-gray-200 animate-pulse w-2/3"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  </div>
);

const mainNavItems = [
  { icon: BarChart3, label: "Dashboard", active: true },
  { icon: Target, label: "Assessment" },
  { icon: TrendingUp, label: "Analytics" },
  { icon: FileText, label: "Reports" },
];

const insightItems = [
  { icon: Brain, label: "Intelligence" },
  { icon: Heart, label: "Sentiment" },
  { icon: Quote, label: "Citations" },
  { icon: CheckSquare, label: "SYMBI Framework" },
];

const analyticsItems = [
  { icon: Search, label: "Crawlers" },
  { icon: Zap, label: "LLM Traffic" },
];

const dataItems = [
  { icon: Upload, label: "Conversations" },
];

const otherItems = [
  { icon: Lightbulb, label: "Prompts" },
  { icon: Settings, label: "Optimize" },
  { icon: BookOpen, label: "Learn" },
  { icon: Puzzle, label: "Integrations" },
  { icon: User, label: "My Account" },
];

export function Dashboard() {
  const [activePage, setActivePage] = useState("Dashboard");

  const renderNavItem = (item: any, isActive: boolean) => {
    const Icon = item.icon;
    return (
      <button
        key={item.label}
        onClick={() => setActivePage(item.label)}
        className={`brutalist-nav-item w-full text-left ${
          isActive ? "brutalist-nav-item-active" : ""
        }`}
      >
        <Icon className="w-5 h-5" />
        <span>{item.label}</span>
      </button>
    );
  };

  const renderContent = () => {
    const PageComponent = () => {
      switch (activePage) {
        case "Dashboard":
          return <DashboardPage />;
        case "Assessment":
          return <AssessmentPage />;
        case "Analytics":
          return <AnalyticsPage />;
        case "Reports":
          return <ReportsPage />;
        case "Prompts":
          return <PromptsPage />;
        case "Optimize":
          return <OptimizePage />;
        case "Intelligence":
          return <IntelligencePage />;
        case "Sentiment":
          return <SentimentPage />;
        case "Citations":
          return <CitationsPage />;
        case "Crawlers":
          return <CrawlersPage />;
        case "LLM Traffic":
          return <LLMTrafficPage />;
        case "Conversations":
          return <ConversationsPage />;
        case "Integrations":
          return <IntegrationsPage />;
        case "SYMBI Framework":
          return <SymbiFrameworkPage />;
        default:
          return <DashboardPage />;
      }
    };

    return (
      <SectionErrorBoundary sectionName={`${activePage} Page`}>
        <Suspense fallback={<PageLoadingFallback />}>
          <PageComponent />
        </Suspense>
      </SectionErrorBoundary>
    );
  };

  return (
    <div className="flex h-screen bg-brutalist-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Sidebar */}
      <div className="w-80 bg-brutalist-black border-r-4 border-brutalist-black flex flex-col">
        {/* Logo */}
        <div className="p-8 border-b-4 border-brutalist-white">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-brutalist-white border-4 border-brutalist-white flex items-center justify-center brutalist-shadow relative">
              <span className="text-brutalist-black font-black text-xl">SY</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-brutalist-white">SYMBI</h1>
              <p className="text-sm text-brutalist-white font-bold uppercase tracking-widest">RESONATE ANALYTICS</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-8 overflow-y-auto">
          {/* Main Navigation */}
          <div className="space-y-3">
            {mainNavItems.map((item) => renderNavItem(item, activePage === item.label))}
          </div>

          <div className="h-1 bg-brutalist-white" />

          {/* Insight Group */}
          <div className="space-y-4">
            <div className="px-4">
              <h3 className="text-xs font-black text-brutalist-white uppercase tracking-widest">INSIGHT</h3>
            </div>
            <div className="space-y-3">
              {insightItems.map((item) => renderNavItem(item, activePage === item.label))}
            </div>
          </div>

          <div className="h-1 bg-brutalist-white" />

          {/* Analytics Group */}
          <div className="space-y-4">
            <div className="px-4">
              <h3 className="text-xs font-black text-brutalist-white uppercase tracking-widest">ANALYTICS</h3>
            </div>
            <div className="space-y-3">
              {analyticsItems.map((item) => renderNavItem(item, activePage === item.label))}
            </div>
          </div>

          <div className="h-1 bg-brutalist-white" />

          {/* Data Group */}
          <div className="space-y-4">
            <div className="px-4">
              <h3 className="text-xs font-black text-brutalist-white uppercase tracking-widest">DATA</h3>
            </div>
            <div className="space-y-3">
              {dataItems.map((item) => renderNavItem(item, activePage === item.label))}
            </div>
          </div>

          <div className="h-1 bg-brutalist-white" />

          {/* Other */}
          <div className="space-y-4">
            <div className="px-4">
              <h3 className="text-xs font-black text-brutalist-white uppercase tracking-widest">OTHER</h3>
            </div>
            <div className="space-y-3">
              {otherItems.map((item) => renderNavItem(item, activePage === item.label))}
            </div>
          </div>
        </nav>

        {/* Bottom CTA */}
        <div className="p-6 border-t-4 border-brutalist-white">
          <div className="bg-brutalist-white border-4 border-brutalist-white p-6 text-center brutalist-shadow">
            <h4 className="text-lg font-black text-brutalist-black mb-3 uppercase">UPGRADE TO PRO</h4>
            <p className="text-sm text-brutalist-black font-bold mb-4 uppercase">UNLOCK RESONANCE POTENTIAL</p>
            <button className="brutalist-button-primary w-full">
              UPGRADE NOW
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}