/**
 * Report Generator Component for SYMBI Framework
 * 
 * This component provides an interface for generating PDF reports from
 * SYMBI Framework assessment results with customizable templates.
 */

import { useState } from "react";
import { 
  AssessmentResult,
  symbiFrameworkService
} from "../lib/symbi-framework";
import { 
  generatePdfReport, 
  ReportTemplate, 
  defaultTemplate, 
  minimalTemplate, 
  professionalTemplate 
} from "../lib/reporting";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { 
  FileText, 
  Download, 
  Loader2, 
  CheckCircle, 
  Settings, 
  ChevronDown, 
  ChevronUp,
  FileOutput,
  Palette,
  Layout,
  Image,
  Clock,
  BarChart,
  ListChecks,
  Lightbulb
} from "lucide-react";

interface ReportGeneratorProps {
  assessment: AssessmentResult | null;
  assessmentHistory?: AssessmentResult[];
}

export function ReportGenerator({ assessment, assessmentHistory = [] }: ReportGeneratorProps) {
  // State for report options
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate>(defaultTemplate);
  const [customTemplate, setCustomTemplate] = useState<ReportTemplate>({...defaultTemplate});
  const [useCustomTemplate, setUseCustomTemplate] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(
    assessment ? assessment.assessment.id : null
  );
  
  // State for report generation
  const [generating, setGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<Blob | null>(null);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get the selected assessment
  const getSelectedAssessment = (): AssessmentResult | null => {
    if (!selectedAssessmentId) return assessment;
    
    if (assessment && assessment.assessment.id === selectedAssessmentId) {
      return assessment;
    }
    
    return assessmentHistory.find(a => a.assessment.id === selectedAssessmentId) || assessment;
  };

  // Handle template selection
  const handleTemplateChange = (templateName: string) => {
    switch (templateName) {
      case 'default':
        setSelectedTemplate(defaultTemplate);
        break;
      case 'minimal':
        setSelectedTemplate(minimalTemplate);
        break;
      case 'professional':
        setSelectedTemplate(professionalTemplate);
        break;
      case 'custom':
        setUseCustomTemplate(true);
        setSelectedTemplate(customTemplate);
        break;
      default:
        setSelectedTemplate(defaultTemplate);
    }
    
    if (templateName !== 'custom') {
      setUseCustomTemplate(false);
    }
  };

  // Update custom template
  const updateCustomTemplate = (field: keyof ReportTemplate, value: any) => {
    setCustomTemplate(prev => {
      const updated = { ...prev, [field]: value };
      
      // If using custom template, update selected template as well
      if (useCustomTemplate) {
        setSelectedTemplate(updated);
      }
      
      return updated;
    });
  };

  // Generate report
  const handleGenerateReport = async () => {
    const selectedAssessment = getSelectedAssessment();
    
    if (!selectedAssessment) {
      setError("No assessment selected");
      return;
    }
    
    setGenerating(true);
    setError(null);
    
    try {
      // Use custom template if enabled, otherwise use selected template
      const template = useCustomTemplate ? customTemplate : selectedTemplate;
      
      // Generate PDF report
      const reportBlob = await generatePdfReport(selectedAssessment, template);
      setGeneratedReport(reportBlob);
      
      // Create URL for the report
      if (reportUrl) {
        URL.revokeObjectURL(reportUrl);
      }
      
      const url = URL.createObjectURL(reportBlob);
      setReportUrl(url);
    } catch (err) {
      setError("Error generating report: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setGenerating(false);
    }
  };

  // Download report
  const handleDownloadReport = () => {
    if (!reportUrl) return;
    
    const link = document.createElement('a');
    link.href = reportUrl;
    link.download = `SYMBI_Assessment_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // View report
  const handleViewReport = () => {
    if (!reportUrl) return;
    
    window.open(reportUrl, '_blank');
  };

  return (
    <Card className="brutalist-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-black text-brutalist-black">REPORT GENERATOR</CardTitle>
            <CardDescription className="font-bold uppercase tracking-wide">
              Generate customizable PDF reports from assessment results
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="flex items-center space-x-2"
            >
              {showAdvancedOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>Advanced</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Assessment Selection */}
        {assessmentHistory.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="assessment-select" className="font-black text-brutalist-black">
              SELECT ASSESSMENT
            </Label>
            <Select
              value={selectedAssessmentId || ''}
              onValueChange={(value) => setSelectedAssessmentId(value)}
            >
              <SelectTrigger id="assessment-select" className="brutalist-input">
                <SelectValue placeholder="Select assessment" />
              </SelectTrigger>
              <SelectContent>
                {assessment && (
                  <SelectItem value={assessment.assessment.id}>
                    Current Assessment - {new Date(assessment.assessment.timestamp).toLocaleString()}
                  </SelectItem>
                )}
                {assessmentHistory.map((historyItem) => (
                  <SelectItem key={historyItem.assessment.id} value={historyItem.assessment.id}>
                    {historyItem.metadata?.modelName || 'Unknown'} - {new Date(historyItem.assessment.timestamp).toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Template Selection */}
        <div className="space-y-2">
          <Label className="font-black text-brutalist-black">
            REPORT TEMPLATE
          </Label>
          <RadioGroup
            defaultValue="default"
            onValueChange={handleTemplateChange}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="flex items-center space-x-2 border-2 border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="default" id="template-default" />
              <Label htmlFor="template-default" className="cursor-pointer flex-1">
                <div className="font-bold">Default</div>
                <div className="text-sm text-gray-500">Standard report with all details</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 border-2 border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="minimal" id="template-minimal" />
              <Label htmlFor="template-minimal" className="cursor-pointer flex-1">
                <div className="font-bold">Minimal</div>
                <div className="text-sm text-gray-500">Clean, simplified report format</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 border-2 border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="professional" id="template-professional" />
              <Label htmlFor="template-professional" className="cursor-pointer flex-1">
                <div className="font-bold">Professional</div>
                <div className="text-sm text-gray-500">Formal report with detailed analysis</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 border-2 border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer md:col-span-3">
              <RadioGroupItem value="custom" id="template-custom" />
              <Label htmlFor="template-custom" className="cursor-pointer flex-1">
                <div className="font-bold">Custom</div>
                <div className="text-sm text-gray-500">Create your own template with custom settings</div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Advanced Options */}
        {showAdvancedOptions && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-gray-500" />
              <h3 className="font-black text-lg text-brutalist-black">ADVANCED REPORT OPTIONS</h3>
            </div>

            <Separator className="border-t-2 border-gray-200" />

            {/* Page Settings */}
            <div className="space-y-2">
              <Label className="font-bold text-brutalist-black flex items-center">
                <Layout className="w-4 h-4 mr-2" />
                PAGE SETTINGS
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="page-size" className="text-sm">Page Size</Label>
                  <Select
                    value={customTemplate.pageSize}
                    onValueChange={(value) => updateCustomTemplate('pageSize', value as 'a4' | 'letter' | 'legal')}
                    disabled={!useCustomTemplate}
                  >
                    <SelectTrigger id="page-size" className="brutalist-input">
                      <SelectValue placeholder="Select page size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a4">A4</SelectItem>
                      <SelectItem value="letter">Letter</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orientation" className="text-sm">Orientation</Label>
                  <Select
                    value={customTemplate.orientation}
                    onValueChange={(value) => updateCustomTemplate('orientation', value as 'portrait' | 'landscape')}
                    disabled={!useCustomTemplate}
                  >
                    <SelectTrigger id="orientation" className="brutalist-input">
                      <SelectValue placeholder="Select orientation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Appearance Settings */}
            <div className="space-y-2">
              <Label className="font-bold text-brutalist-black flex items-center">
                <Palette className="w-4 h-4 mr-2" />
                APPEARANCE
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color-scheme" className="text-sm">Color Scheme</Label>
                  <Select
                    value={customTemplate.colorScheme}
                    onValueChange={(value) => updateCustomTemplate('colorScheme', value as 'default' | 'minimal' | 'vibrant' | 'professional')}
                    disabled={!useCustomTemplate}
                  >
                    <SelectTrigger id="color-scheme" className="brutalist-input">
                      <SelectValue placeholder="Select color scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="vibrant">Vibrant</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="report-title" className="text-sm">Report Title</Label>
                  <input
                    id="report-title"
                    type="text"
                    value={customTemplate.title}
                    onChange={(e) => updateCustomTemplate('title', e.target.value)}
                    className="brutalist-input w-full"
                    disabled={!useCustomTemplate}
                  />
                </div>
              </div>
            </div>

            {/* Content Options */}
            <div className="space-y-2">
              <Label className="font-bold text-brutalist-black flex items-center">
                <ListChecks className="w-4 h-4 mr-2" />
                CONTENT OPTIONS
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-header"
                    checked={customTemplate.includeHeader}
                    onCheckedChange={(checked) => updateCustomTemplate('includeHeader', !!checked)}
                    disabled={!useCustomTemplate}
                  />
                  <Label htmlFor="include-header" className="text-sm cursor-pointer">Include Header</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-footer"
                    checked={customTemplate.includeFooter}
                    onCheckedChange={(checked) => updateCustomTemplate('includeFooter', !!checked)}
                    disabled={!useCustomTemplate}
                  />
                  <Label htmlFor="include-footer" className="text-sm cursor-pointer">Include Footer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-logo"
                    checked={customTemplate.includeLogo}
                    onCheckedChange={(checked) => updateCustomTemplate('includeLogo', !!checked)}
                    disabled={!useCustomTemplate}
                  />
                  <Label htmlFor="include-logo" className="text-sm cursor-pointer">Include Logo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-timestamp"
                    checked={customTemplate.includeTimestamp}
                    onCheckedChange={(checked) => updateCustomTemplate('includeTimestamp', !!checked)}
                    disabled={!useCustomTemplate}
                  />
                  <Label htmlFor="include-timestamp" className="text-sm cursor-pointer">Include Timestamp</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-charts"
                    checked={customTemplate.includeCharts}
                    onCheckedChange={(checked) => updateCustomTemplate('includeCharts', !!checked)}
                    disabled={!useCustomTemplate}
                  />
                  <Label htmlFor="include-charts" className="text-sm cursor-pointer">Include Charts</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-details"
                    checked={customTemplate.includeDetails}
                    onCheckedChange={(checked) => updateCustomTemplate('includeDetails', !!checked)}
                    disabled={!useCustomTemplate}
                  />
                  <Label htmlFor="include-details" className="text-sm cursor-pointer">Include Detailed Scores</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-insights"
                    checked={customTemplate.includeInsights}
                    onCheckedChange={(checked) => updateCustomTemplate('includeInsights', !!checked)}
                    disabled={!useCustomTemplate}
                  />
                  <Label htmlFor="include-insights" className="text-sm cursor-pointer">Include Insights</Label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border-4 border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-red-600" />
              <span className="font-bold text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={handleGenerateReport}
            className="brutalist-button-secondary"
            disabled={generating || !getSelectedAssessment()}
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                GENERATING...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                GENERATE REPORT
              </>
            )}
          </Button>
          
          {reportUrl && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={handleViewReport}
                className="brutalist-button-secondary"
              >
                <FileOutput className="w-4 h-4 mr-2" />
                VIEW
              </Button>
              <Button
                onClick={handleDownloadReport}
                className="brutalist-button-primary"
              >
                <Download className="w-4 h-4 mr-2" />
                DOWNLOAD
              </Button>
            </div>
          )}
        </div>

        {/* Report Preview */}
        {reportUrl && !generating && (
          <div className="mt-4 p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-bold text-green-800">Report generated successfully!</span>
            </div>
            <div className="flex items-center justify-center p-4">
              <iframe
                src={reportUrl}
                className="w-full h-[400px] border-2 border-gray-300 rounded-md"
                title="Report Preview"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}