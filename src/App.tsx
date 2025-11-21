import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from './components/ui-shadcn/sidebar';
import { AppSidebar } from './components/layout/AppSidebar';
import { EnhancedDashboard } from './components/dashboard/EnhancedDashboard';
import { EnhancedExperimentsPage } from './components/experiments/EnhancedExperimentsPage';
import { Dashboard } from "./components/Dashboard";
import { ExperimentsPage } from "./components/pages/ExperimentsPage";
import { AnalyticsPage } from "./components/pages/AnalyticsPage";
import { AssessmentPage } from "./components/pages/AssessmentPage";
import { ReportsPage } from "./components/pages/ReportsPage";
import { Toaster } from './components/ui-shadcn/sonner';
import { ToastProvider } from "./components/ui/Toast";
import { LoginForm } from './components/auth/LoginForm';
import { SignUpForm } from './components/auth/SignUpForm';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthService } from './lib/auth/auth-service';
import { supabase } from './lib/supabase';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const authService = new AuthService(supabase);
  
  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };
  
  return (
    <ToastProvider>
      <Router>
        <div className={isDarkMode ? 'dark' : ''}>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <main className="flex-1 overflow-auto">
                <div className="container mx-auto p-6 space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <SidebarTrigger />
                  </div>
                  <Routes>
                    <Route path="/" element={<EnhancedDashboard />} />
                    <Route path="/experiments" element={
                      <ProtectedRoute authService={authService} requiredPermission="experiments.read">
                        <EnhancedExperimentsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/assessment" element={
                      <ProtectedRoute authService={authService} requiredPermission="analytics.read">
                        <AssessmentPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/analytics" element={
                      <ProtectedRoute authService={authService} requiredPermission="analytics.read">
                        <AnalyticsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/reports" element={
                      <ProtectedRoute authService={authService} requiredPermission="reports.read">
                        <ReportsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/symbi" element={<EnhancedDashboard />} />
                    <Route path="/activity" element={<EnhancedDashboard />} />
                    <Route path="/data-sources" element={<EnhancedDashboard />} />
                    <Route path="/team" element={<EnhancedDashboard />} />
                    <Route path="/security" element={<EnhancedDashboard />} />
                    <Route path="/settings" element={<EnhancedDashboard />} />
                    <Route path="/login" element={<LoginForm authService={authService} />} />
                    <Route path="/signup" element={<SignUpForm authService={authService} />} />
                  </Routes>
                </div>
              </main>
            </div>
            <Toaster />
          </SidebarProvider>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;