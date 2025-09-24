/**
 * 404 Not Found Page Component
 * 
 * Displayed when users navigate to a non-existent route or page.
 * Provides navigation options to help users find their way back.
 */

import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, FileX, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-brutalist-white flex items-center justify-center p-6">
      <Card className="brutalist-card max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-yellow-100 border-4 border-yellow-600 brutalist-shadow">
              <FileX className="w-12 h-12 text-yellow-600" />
            </div>
            <div>
              <CardTitle className="text-4xl font-black text-brutalist-black mb-2">
                404 - PAGE NOT FOUND
              </CardTitle>
              <p className="font-bold text-gray-600 uppercase tracking-wide text-lg">
                The page you're looking for doesn't exist
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Error Description */}
          <div className="p-6 bg-yellow-50 border-4 border-yellow-200 rounded-lg">
            <h3 className="font-black text-xl text-yellow-800 mb-3">WHAT HAPPENED?</h3>
            <div className="space-y-2 text-yellow-700 font-bold">
              <p>• The page URL might be incorrect</p>
              <p>• The page might have been moved or deleted</p>
              <p>• You might not have permission to access this page</p>
              <p>• There might be a temporary server issue</p>
            </div>
          </div>

          {/* Navigation Options */}
          <div className="space-y-6">
            <h3 className="font-black text-2xl text-brutalist-black">NAVIGATION OPTIONS</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleGoHome}
                className="brutalist-button-primary flex items-center justify-center space-x-3 p-4"
              >
                <Home className="w-5 h-5" />
                <span>GO TO DASHBOARD</span>
              </Button>
              
              <Button
                onClick={handleGoBack}
                className="brutalist-button-secondary flex items-center justify-center space-x-3 p-4"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>GO BACK</span>
              </Button>
              
              <Button
                onClick={handleReload}
                className="brutalist-button-secondary flex items-center justify-center space-x-3 p-4"
              >
                <RefreshCw className="w-5 h-5" />
                <span>RELOAD PAGE</span>
              </Button>
              
              <Button
                onClick={() => window.open('https://github.com/s8ken/SYMBI-Resonate/issues', '_blank')}
                className="brutalist-button-secondary flex items-center justify-center space-x-3 p-4"
              >
                <Search className="w-5 h-5" />
                <span>REPORT ISSUE</span>
              </Button>
            </div>
          </div>

          {/* Quick Access Menu */}
          <div className="space-y-4">
            <h3 className="font-black text-xl text-brutalist-black">QUICK ACCESS</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => navigate('/')}
                className="p-3 bg-white border-3 border-brutalist-black font-bold text-sm hover:bg-brutalist-black hover:text-white transition-colors"
              >
                DASHBOARD
              </button>
              <button
                onClick={() => navigate('/assessment')}
                className="p-3 bg-white border-3 border-brutalist-black font-bold text-sm hover:bg-brutalist-black hover:text-white transition-colors"
              >
                ASSESSMENT
              </button>
              <button
                onClick={() => navigate('/symbi-framework')}
                className="p-3 bg-white border-3 border-brutalist-black font-bold text-sm hover:bg-brutalist-black hover:text-white transition-colors"
              >
                SYMBI FRAMEWORK
              </button>
              <button
                onClick={() => navigate('/analytics')}
                className="p-3 bg-white border-3 border-brutalist-black font-bold text-sm hover:bg-brutalist-black hover:text-white transition-colors"
              >
                ANALYTICS
              </button>
            </div>
          </div>

          {/* Help Section */}
          <div className="p-6 bg-blue-50 border-4 border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Search className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h4 className="font-black text-blue-800 mb-3 text-lg">NEED MORE HELP?</h4>
                <div className="space-y-2 text-blue-700 font-bold text-sm">
                  <p>• Check the URL spelling and try again</p>
                  <p>• Visit the main dashboard to navigate properly</p>
                  <p>• Clear your browser cache and cookies</p>
                  <p>• Contact support if the problem persists</p>
                </div>
                
                <div className="mt-4 text-xs font-bold text-blue-600">
                  Current URL: {window.location.pathname}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}