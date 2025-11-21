import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from "./components/Dashboard";
import { ExperimentsPage } from "./components/pages/ExperimentsPage";
import { AnalyticsPage } from "./components/pages/AnalyticsPage";
import { AssessmentPage } from "./components/pages/AssessmentPage";
import { ReportsPage } from "./components/pages/ReportsPage";
import { AppLayout } from "./components/layout/AppLayout";
import { ToastProvider } from "./components/ui/toast";
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
          <AppLayout onThemeToggle={handleThemeToggle} isDarkMode={isDarkMode}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
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
              <Route path="/experiments" element={
                <ProtectedRoute authService={authService} requiredPermission="experiments.read">
                  <ExperimentsPage />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<LoginForm authService={authService} />} />
              <Route path="/signup" element={<SignUpForm authService={authService} />} />
            </Routes>
          </AppLayout>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;