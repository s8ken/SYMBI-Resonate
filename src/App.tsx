import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from './components/ui-shadcn/sidebar';
import { AppSidebar } from './components/layout/AppSidebar';
import { EnhancedDashboard } from './components/dashboard/EnhancedDashboard';
import { EnhancedExperimentsPage } from './components/experiments/EnhancedExperimentsPage';
import { Toaster } from './components/ui-shadcn/sonner';

function App() {
  return (
    <Router>
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
                <Route path="/experiments" element={<EnhancedExperimentsPage />} />
                <Route path="/analytics" element={<EnhancedDashboard />} />
                <Route path="/symbi" element={<EnhancedDashboard />} />
                <Route path="/reports" element={<EnhancedDashboard />} />
                <Route path="/activity" element={<EnhancedDashboard />} />
                <Route path="/data-sources" element={<EnhancedDashboard />} />
                <Route path="/team" element={<EnhancedDashboard />} />
                <Route path="/security" element={<EnhancedDashboard />} />
                <Route path="/settings" element={<EnhancedDashboard />} />
              </Routes>
            </div>
          </main>
        </div>
        <Toaster />
      </SidebarProvider>
    </Router>
  );
}

export default App;