import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { auditSystem } from '@/lib/audit';

interface AuditDashboardProps {
  tenantId: string;
  data: any;
}

export const AuditDashboard: React.FC<AuditDashboardProps> = ({ tenantId, data }) => {
  const [auditResult, setAuditResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runAudit = async () => {
      try {
        const result = await auditSystem.validateSYMBIImplementation(data);
        setAuditResult(result);
      } catch (error) {
        console.error('Audit failed:', error);
      } finally {
        setLoading(false);
      }
    };

    runAudit();
  }, [tenantId, data]);

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 0.9) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 0.7) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-sm text-muted-foreground">Running SYMBI audit...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!auditResult) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Audit results unavailable</p>
        </CardContent>
      </Card>
    );
  }

  const scores = auditResult.scores;
  const recommendations = auditResult.recommendations;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SYMBI Framework Audit Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(scores).map(([dimension, score]) => (
              <div key={dimension} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium capitalize">
                    {dimension.replace('_', ' ')}
                  </span>
                  {getScoreBadge(score as number)}
                </div>
                <Progress value={(score as number) * 100} className="h-2" />
                <span className={`text-sm font-bold ${getScoreColor(score as number)}`}>
                  {(score as number * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-muted-foreground">
                • {rec}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Reality Check</h4>
              <p className="text-sm text-muted-foreground">
                Schema validation and ground truth verification
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Trust Metrics</h4>
              <p className="text-sm text-muted-foreground">
                Confidence scoring and fallback mechanisms
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Ethical Alignment</h4>
              <p className="text-sm text-muted-foreground">
                Bias detection and multilingual testing
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Resonance Quality</h4>
              <p className="text-sm text-muted-foreground">
                UI-implementation coherence verification
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Canvas Parity</h4>
              <p className="text-sm text-muted-foreground">
                Documentation-code alignment verification
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};