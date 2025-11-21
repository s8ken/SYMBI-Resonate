import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DemoLandingPage from '@/components/demo/DemoLandingPage';
import DemoDashboard from '@/components/demo/DemoDashboard';
import DemoSymbiAssessment from '@/components/demo/DemoSymbiAssessment';
import DemoExperiments from '@/components/demo/DemoExperiments';

export function DemoRouter() {
  return (
    <Routes>
      <Route path="/" element={<DemoLandingPage />} />
      <Route path="/dashboard" element={<DemoDashboard />} />
      <Route path="/symbi" element={<DemoSymbiAssessment />} />
      <Route path="/experiments" element={<DemoExperiments />} />
    </Routes>
  );
}