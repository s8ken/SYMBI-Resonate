/**
 * Loading State Components
 * 
 * Centralized loading states and skeletons for SYMBI Resonate application.
 * Provides consistent loading experiences across different components.
 */

import React from 'react';
import { Loader2, BarChart3, Brain, Zap, Shield, Users } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';

/**
 * Basic Loading Spinner
 */
export function LoadingSpinner({ 
  size = 'default',
  className = ''
}: { 
  size?: 'small' | 'default' | 'large';
  className?: string;
}) {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
}

/**
 * Full Page Loading Screen
 */
export function FullPageLoading({ message = 'Loading SYMBI Resonate...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-brutalist-white flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* SYMBI Logo */}
        <div className="w-24 h-24 bg-brutalist-black border-4 border-brutalist-black flex items-center justify-center brutalist-shadow mx-auto">
          <span className="text-brutalist-white font-black text-3xl">SY</span>
        </div>
        
        {/* Loading Animation */}
        <div className="flex items-center justify-center space-x-2">
          <LoadingSpinner size="large" className="text-brutalist-black" />
          <span className="text-2xl font-black text-brutalist-black uppercase tracking-wide">
            {message}
          </span>
        </div>
        
        {/* Loading Steps */}
        <div className="space-y-2 text-sm font-bold text-gray-600 uppercase">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-brutalist-black animate-pulse"></div>
            <span>Initializing SYMBI Framework</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-brutalist-black animate-pulse delay-100"></div>
            <span>Loading Analysis Components</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-brutalist-black animate-pulse delay-200"></div>
            <span>Preparing Interface</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Card Loading Skeleton
 */
export function CardSkeleton() {
  return (
    <Card className="brutalist-card">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 animate-pulse"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 animate-pulse w-3/4"></div>
            <div className="h-3 bg-gray-200 animate-pulse w-1/2"></div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 animate-pulse w-full"></div>
          <div className="h-4 bg-gray-200 animate-pulse w-2/3"></div>
          <div className="h-4 bg-gray-200 animate-pulse w-1/2"></div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Assessment Loading Component
 */
export function AssessmentLoading() {
  const stages = [
    { icon: BarChart3, label: 'Analyzing Reality Index', delay: 0 },
    { icon: Shield, label: 'Evaluating Trust Protocol', delay: 1000 },
    { icon: Brain, label: 'Measuring Ethical Alignment', delay: 2000 },
    { icon: Zap, label: 'Computing Resonance Quality', delay: 3000 },
    { icon: Users, label: 'Calculating Canvas Parity', delay: 4000 },
  ];

  const [currentStage, setCurrentStage] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStage(prev => (prev + 1) % stages.length);
    }, 1200);

    return () => clearInterval(timer);
  }, [stages.length]);

  return (
    <Card className="brutalist-card">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 bg-brutalist-black flex items-center justify-center">
              <LoadingSpinner size="default" className="text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-black text-brutalist-black">SYMBI ANALYSIS IN PROGRESS</h3>
            <p className="font-bold text-gray-600 uppercase tracking-wide text-sm">
              Processing content across 5 dimensions
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress Indicator */}
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isActive = index === currentStage;
            const isComplete = index < currentStage;
            
            return (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-8 h-8 border-2 flex items-center justify-center transition-all duration-300 ${
                  isActive 
                    ? 'bg-brutalist-black border-brutalist-black text-white' 
                    : isComplete
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'bg-white border-gray-300 text-gray-300'
                }`}>
                  {isActive ? (
                    <LoadingSpinner size="small" className="text-white" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span className={`font-bold transition-all duration-300 ${
                  isActive 
                    ? 'text-brutalist-black' 
                    : isComplete
                    ? 'text-green-600'
                    : 'text-gray-400'
                }`}>
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Processing Details */}
        <div className="p-4 bg-blue-50 border-4 border-blue-200">
          <h4 className="font-black text-blue-800 mb-2">PROCESSING DETAILS</h4>
          <div className="space-y-1 text-sm font-bold text-blue-700">
            <div>• Analyzing linguistic patterns and structure</div>
            <div>• Evaluating emergence indicators</div>
            <div>• Computing dimensional scores</div>
            <div>• Generating insights and recommendations</div>
          </div>
        </div>

        {/* Estimated Time */}
        <div className="text-center">
          <p className="font-bold text-gray-600 text-sm">
            Estimated completion: 15-30 seconds
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Dashboard Loading Grid
 */
export function DashboardLoading() {
  return (
    <div className="space-y-8 p-8">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 animate-pulse w-1/3"></div>
        <div className="h-4 bg-gray-200 animate-pulse w-2/3"></div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>

      {/* Chart Skeleton */}
      <Card className="brutalist-card">
        <CardHeader>
          <div className="h-6 bg-gray-200 animate-pulse w-1/4"></div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 animate-pulse"></div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Text Loading Skeleton
 */
export function TextSkeleton({ 
  lines = 3,
  className = ''
}: { 
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div 
          key={index} 
          className={`h-4 bg-gray-200 animate-pulse ${
            index === lines - 1 ? 'w-2/3' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

/**
 * Button Loading State
 */
export function LoadingButton({ 
  children,
  loading = false,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
  [key: string]: any;
}) {
  return (
    <button 
      className={`${className} ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <LoadingSpinner size="small" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * Loading Overlay
 */
export function LoadingOverlay({ 
  isVisible,
  message = 'Loading...'
}: { 
  isVisible: boolean;
  message?: string;
}) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="brutalist-card">
        <CardContent className="p-8">
          <div className="flex items-center space-x-4">
            <LoadingSpinner size="large" className="text-brutalist-black" />
            <span className="text-xl font-black text-brutalist-black">
              {message.toUpperCase()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Page Transition Loading
 */
export function PageTransitionLoading() {
  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
      <div className="h-full bg-brutalist-black animate-pulse"></div>
    </div>
  );
}

export default {
  LoadingSpinner,
  FullPageLoading,
  CardSkeleton,
  AssessmentLoading,
  DashboardLoading,
  TextSkeleton,
  LoadingButton,
  LoadingOverlay,
  PageTransitionLoading
};