import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from './components/ui-shadcn/sonner';
import { DemoRouter } from './demo-router';
import { Button } from './components/ui-shadcn/button';
import { Badge } from './components/ui-shadcn/badge';
import { Brain, ArrowLeft, Home, BarChart3, Beaker, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

function DemoHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isDemoPage = location.pathname.startsWith('/demo');
  
  if (!isDemoPage) return null;
  
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SYMBI Resonate
              </span>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Live Demo
            </Badge>
          </div>
          
          <nav className="hidden md:flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/demo/')}
              className={location.pathname === '/demo/' ? 'brutalist-nav-item brutalist-nav-item-active' : 'brutalist-nav-item'}
            >
              <Home className="h-4 w-4 mr-2" />
              Overview
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/demo/dashboard')}
              className={location.pathname === '/demo/dashboard' ? 'brutalist-nav-item brutalist-nav-item-active' : 'brutalist-nav-item'}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/demo/experiments')}
              className={location.pathname === '/demo/experiments' ? 'brutalist-nav-item brutalist-nav-item-active' : 'brutalist-nav-item'}
            >
              <Beaker className="h-4 w-4 mr-2" />
              Experiments
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/demo/symbi')}
              className={location.pathname === '/demo/symbi' ? 'brutalist-nav-item brutalist-nav-item-active' : 'brutalist-nav-item'}
            >
              <Zap className="h-4 w-4 mr-2" />
              SYMBI Test
            </Button>
          </nav>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/')}
            className="hidden sm:flex brutalist-button-secondary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to App
          </Button>
        </div>
      </div>
    </header>
  );
}

function DemoFooter() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isDemoPage = location.pathname.startsWith('/demo');
  
  if (!isDemoPage) return null;
  
  return (
    <footer className="bg-gray-900 text-white py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Brain className="h-5 w-5" />
            <span className="font-semibold">SYMBI Resonate Demo</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="link" size="sm" className="text-gray-300 hover:text-white" onClick={() => navigate('/demo/')}>
              Overview
            </Button>
            <Button variant="link" size="sm" className="text-gray-300 hover:text-white" onClick={() => navigate('/demo/dashboard')}>
              Dashboard
            </Button>
            <Button variant="link" size="sm" className="text-gray-300 hover:text-white" onClick={() => navigate('/demo/experiments')}>
              Experiments
            </Button>
            <Button variant="link" size="sm" className="text-gray-300 hover:text-white" onClick={() => navigate('/demo/symbi')}>
              SYMBI Test
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/')}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Main App
          </Button>
        </div>
        <div className="border-t border-gray-800 mt-6 pt-6 text-center text-sm text-gray-400">
          <p>&copy; 2024 SYMBI Resonate. This is a demonstration of the platform's capabilities.</p>
        </div>
      </div>
    </footer>
  );
}

export function DemoApp() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <BrowserRouter basename="/demo">
      <div className={isDarkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-background">
          <DemoHeader />
          <main className="flex-1">
            <DemoRouter />
          </main>
          <DemoFooter />
          <Toaster />
        </div>
      </div>
    </BrowserRouter>
  );
}