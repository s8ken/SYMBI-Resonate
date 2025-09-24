/**
 * Loading Components
 * 
 * Provides various loading states and skeletons for better user experience
 * during data fetching and component initialization.
 */

import { Loader2, Brain, Target, Shield, Heart, Zap, Users } from 'lucide-react';
import { Card, CardContent, CardHeader } from './card';

/**
 * Simple spinner loader
 */
export function LoadingSpinner({ 
  size = "default", 
  className = "" 
}: { 
  size?: "small" | "default" | "large"; 
  className?: string;
}) {
  const sizeClasses = {
    small: "w-4 h-4",
    default: "w-6 h-6",
    large: "w-8 h-8"
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
}

/**
 * Full page loading screen
 */
export function FullPageLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-brutalist-white flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="p-6 bg-white border-4 border-brutalist-black brutalist-shadow">
          <Brain className="w-16 h-16 text-brutalist-black mx-auto animate-pulse" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-brutalist-black mb-2">
            {message.toUpperCase()}
          </h2>
          <div className="flex items-center justify-center space-x-2">
            <LoadingSpinner />
            <span className="font-bold text-gray-600">PLEASE WAIT...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline loading state
 */
export function InlineLoading({ 
  message = "Loading...",
  size = "default" 
}: { 
  message?: string;
  size?: "small" | "default" | "large";
}) {
  return (
    <div className="flex items-center justify-center space-x-3 p-4">
      <LoadingSpinner size={size} className="text-brutalist-black" />
      <span className="font-bold text-gray-600">{message.toUpperCase()}</span>
    </div>
  );
}

/**
 * Button loading state
 */
export function ButtonLoading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center space-x-2">
      <LoadingSpinner size="small" />
      {children}
    </div>
  );
}

/**
 * Assessment loading skeleton
 */
export function AssessmentLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Overall Score Skeleton */}
      <Card className="brutalist-card border-4 border-gray-300 animate-pulse">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
              <div>
                <div className="h-6 bg-gray-300 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-64"></div>
              </div>
            </div>
            <div className="text-right">
              <div className="h-16 w-20 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-16 mt-2"></div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Dimension Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { icon: Target, name: "Reality Index" },
          { icon: Shield, name: "Trust Protocol" },
          { icon: Heart, name: "Ethical Alignment" },
          { icon: Zap, name: "Resonance Quality" },
          { icon: Users, name: "Canvas Parity" }
        ].map((dimension, index) => (
          <Card key={index} className="brutalist-card animate-pulse">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <dimension.icon className="w-6 h-6 text-gray-300" />
                <div>
                  <div className="h-5 bg-gray-300 rounded w-32 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-28"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="h-12 w-16 bg-gray-300 rounded mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20 mx-auto"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insights Skeleton */}
      <Card className="brutalist-card animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-300 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Strengths */}
          <div>
            <div className="h-5 bg-gray-300 rounded w-32 mb-2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>

          <div className="border-t-4 border-gray-200"></div>

          {/* Recommendations */}
          <div>
            <div className="h-5 bg-gray-300 rounded w-40 mb-2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Dashboard loading skeleton
 */
export function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-64 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-96"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="brutalist-card animate-pulse">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-300 rounded"></div>
                <div className="h-5 bg-gray-300 rounded w-24"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-300 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="brutalist-card animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-300 rounded w-48"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
        
        <Card className="brutalist-card animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-300 rounded w-40"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Table loading skeleton
 */
export function TableLoadingSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="animate-pulse">
      <div className="space-y-3">
        {/* Header Row */}
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="h-5 bg-gray-300 rounded"></div>
          ))}
        </div>
        
        {/* Data Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Custom loading state with progress
 */
export function ProgressLoading({ 
  progress, 
  message = "Processing..." 
}: { 
  progress: number; 
  message?: string; 
}) {
  return (
    <div className="text-center space-y-4 p-6">
      <Brain className="w-12 h-12 text-brutalist-black mx-auto animate-pulse" />
      <div>
        <h3 className="font-black text-lg text-brutalist-black mb-2">
          {message.toUpperCase()}
        </h3>
        <div className="w-full bg-gray-200 rounded-full h-3 border-2 border-brutalist-black">
          <div 
            className="bg-brutalist-black h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="font-bold text-gray-600 mt-2">{Math.round(progress)}% COMPLETE</p>
      </div>
    </div>
  );
}