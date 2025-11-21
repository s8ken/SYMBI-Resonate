import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from "./components/Dashboard";
import { ExperimentsPage } from "./components/pages/ExperimentsPage";
import { Header } from "./components/layout/Header";
import { ToastProvider } from "./components/ui/Toast";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };
  
  return (
    <ToastProvider>
      <Router>
        <div className={isDarkMode ? 'dark' : ''}>
          <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            {/* Modern Header Navigation */}
            <Header onThemeToggle={handleThemeToggle} isDarkMode={isDarkMode} />
            
            {/* Main Content */}
            <main>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/experiments" element={<ExperimentsPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;