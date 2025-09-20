/**
 * SYMBI Framework Page
 * 
 * This page provides access to the SYMBI framework detection and validation tools.
 */

import { SymbiFrameworkAssessment } from "../SymbiFrameworkAssessment";

export function SymbiFrameworkPage() {
  return (
    <>
      {/* Header */}
      <header className="bg-brutalist-white border-b-4 border-brutalist-black px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black text-brutalist-black mb-3">SYMBI FRAMEWORK</h1>
            <p className="text-brutalist-black font-bold uppercase tracking-wide">
              DETECT AND VALIDATE THE 5-DIMENSION SYMBI FRAMEWORK
            </p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="brutalist-tag">
              FRAMEWORK DETECTION
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8 bg-brutalist-white">
        <SymbiFrameworkAssessment />
      </main>
    </>
  );
}