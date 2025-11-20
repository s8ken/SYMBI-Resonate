import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Dashboard } from "./components/Dashboard";
import { ExperimentsPage } from "./components/pages/ExperimentsPage";
import { Button } from "./components/ui/button";
import { Beaker, BarChart3 } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        {/* Navigation Header */}
        <nav className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  SYMBI RESONATE
                </Link>
                <div className="flex space-x-2">
                  <Link to="/">
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Analytics</span>
                    </Button>
                  </Link>
                  <Link to="/experiments">
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <Beaker className="h-4 w-4" />
                      <span>Experiments</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/experiments" element={<ExperimentsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;