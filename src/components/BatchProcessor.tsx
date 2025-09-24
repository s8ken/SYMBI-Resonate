/**
 * Batch Processor Component for SYMBI Framework
 * 
 * This component provides an interface for processing multiple content pieces
 * in batch mode and generating aggregate reports.
 */

import { useState } from "react";
import { 
  AssessmentInput, 
  AssessmentResult,
  DetectorType
} from "../lib/symbi-framework";
import { 
  processBatch, 
  BatchProcessingOptions, 
  defaultBatchOptions, 
  BatchProcessingResult,
  ReportTemplate,
  defaultTemplate,
  minimalTemplate,
  professionalTemplate
} from "../lib/reporting";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { 
  FileText, 
  Upload, 
  Download, 
  Loader2, 
  CheckCircle, 
  XCircle,
  Settings, 
  ChevronDown, 
  ChevronUp,
  FileOutput,
  ListChecks,
  BarChart3,
  Clock,
  FilePlus2,
  FileDown,
  FileCheck2,
  FileX2,
  Lightbulb
} from "lucide-react";

export function BatchProcessor() {
  // State for batch inputs
  const [batchInputs, setBatchInputs] = useState<AssessmentInput[]>([]);
  const [inputText, setInputText] = useState("");
  const [inputFormat, setInputFormat] = useState<"json" | "text">("text");
  const [detectorType, setDetectorType] = useState<DetectorType>("final");
  const [reportTemplate, setReportTemplate] = useState<ReportTemplate>(defaultTemplate);
  
  // State for batch processing options
  const [batchOptions, setBatchOptions] = useState<BatchProcessingOptions>(defaultBatchOptions);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // State for batch processing
  const [processing, setProcessing] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [batchResult, setBatchResult] = useState<BatchProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("input");

  // Parse inputs from text
  const parseTextInputs = (text: string): AssessmentInput[] => {
    // Split text into separate content pieces
    const contentPieces = text.split(/\n\s*---\s*\n/).filter(piece => piece.trim().length > 0);
    
    return contentPieces.map((content, index) => {
      // Try to extract metadata from content
      let metadata: Record<string, string> = {};
      const metadataMatch = content.match(/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/);
      
      if (metadataMatch) {
        // Extract metadata from YAML-like format
        const metadataText = metadataMatch[1];
        content = metadataMatch[2].trim();
        
        // Parse metadata lines
        metadataText.split('\n').forEach(line => {
          const [key, value] = line.split(':').map(part => part.trim());
          if (key && value) {
            metadata[key] = value;
          }
        });
      }
      
      return {
        content,
        metadata: {
          id: `batch-${index + 1}`,
          source: metadata.source || `Batch Item ${index + 1}`,
          author: metadata.author || '',
          context: metadata.context || '',
          timestamp: new Date().toISOString()
        }
      };
    });
  };

  // Parse inputs from JSON
  const parseJsonInputs = (jsonText: string): AssessmentInput[] => {
    try {
      const parsed = JSON.parse(jsonText);
      
      // Handle array of objects
      if (Array.isArray(parsed)) {
        return parsed.map((item, index) => {
          // Ensure each item has required properties
          if (typeof item !== 'object' || !item.content) {
            throw new Error(`Item at index ${index} is missing required 'content' property`);
          }
          
          return {
            content: item.content,
            metadata: {
              id: `batch-${index + 1}`,
              source: item.source || item.metadata?.source || `Batch Item ${index + 1}`,
              author: item.author || item.metadata?.author || '',
              context: item.context || item.metadata?.context || '',
              timestamp: new Date().toISOString()
            }
          };
        });
      }
      
      // Handle single object with array of contents
      if (parsed.contents && Array.isArray(parsed.contents)) {
        return parsed.contents.map((content, index) => {
          return {
            content: typeof content === 'string' ? content : content.text || '',
            metadata: {
              id: `batch-${index + 1}`,
              source: content.source || parsed.source || `Batch Item ${index + 1}`,
              author: content.author || parsed.author || '',
              context: content.context || parsed.context || '',
              timestamp: new Date().toISOString()
            }
          };
        });
      }
      
      throw new Error('Invalid JSON format. Expected array of objects or object with contents array');
    } catch (err) {
      throw new Error(`Error parsing JSON: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Parse inputs based on format
  const parseInputs = () => {
    try {
      if (!inputText.trim()) {
        setError("Please enter content to process");
        return;
      }
      
      const inputs = inputFormat === "json" 
        ? parseJsonInputs(inputText)
        : parseTextInputs(inputText);
      
      if (inputs.length === 0) {
        setError("No valid inputs found");
        return;
      }
      
      setBatchInputs(inputs);
      setError(null);
      setActiveTab("process");
    } catch (err) {
      setError(`Error parsing inputs: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Handle template selection
  const handleTemplateChange = (templateName: string) => {
    switch (templateName) {
      case 'default':
        setReportTemplate(defaultTemplate);
        break;
      case 'minimal':
        setReportTemplate(minimalTemplate);
        break;
      case 'professional':
        setReportTemplate(professionalTemplate);
        break;
      default:
        setReportTemplate(defaultTemplate);
    }
    
    setBatchOptions(prev => ({
      ...prev,
      reportTemplate: templateName === 'default' ? defaultTemplate : 
                     templateName === 'minimal' ? minimalTemplate : 
                     templateName === 'professional' ? professionalTemplate : 
                     defaultTemplate
    }));
  };

  // Process batch
  const handleProcessBatch = async () => {
    if (batchInputs.length === 0) {
      setError("No inputs to process");
      return;
    }
    
    setProcessing(true);
    setCurrentProgress(0);
    setError(null);
    
    try {
      // Update batch options
      const options: BatchProcessingOptions = {
        ...batchOptions,
        detectorType,
        reportTemplate
      };
      
      // Process batch with progress updates
      const totalItems = batchInputs.length;
      let processedItems = 0;
      
      // Simulate progress updates (in a real implementation, this would come from the actual processing)
      const progressInterval = setInterval(() => {
        if (processedItems < totalItems) {
          processedItems += 1;
          setCurrentProgress(Math.round((processedItems / totalItems) * 100));
        }
      }, 500);
      
      // Process batch
      const result = await processBatch(batchInputs, options);
      setBatchResult(result);
      
      // Clear progress interval
      clearInterval(progressInterval);
      setCurrentProgress(100);
      
      // Switch to results tab
      setActiveTab("results");
    } catch (err) {
      setError(`Error processing batch: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setProcessing(false);
    }
  };

  // Download summary report
  const handleDownloadSummaryReport = () => {
    if (!batchResult?.summaryReport) return;
    
    const url = URL.createObjectURL(batchResult.summaryReport);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SYMBI_Batch_Summary_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download individual report
  const handleDownloadIndividualReport = (id: string) => {
    if (!batchResult?.individualReports?.has(id)) return;
    
    const reportBlob = batchResult.individualReports.get(id);
    if (!reportBlob) return;
    
    const url = URL.createObjectURL(reportBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SYMBI_Assessment_${id}_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Load sample inputs
  const loadSampleInputs = () => {
    const sampleText = `---
source: Claude-3-Opus
author: Anthropic
context: Educational
---
I'd be happy to explain how transformer models work in natural language processing.

Transformer models revolutionized NLP when they were introduced in the 2017 paper "Attention is All You Need" by Vaswani et al. Unlike previous sequence models that processed text sequentially (like RNNs and LSTMs), transformers process entire sequences in parallel, which allows for much more efficient training.

The key innovation in transformers is the self-attention mechanism, which allows the model to weigh the importance of different words in relation to each other, regardless of their position in the sequence. This helps the model capture long-range dependencies and relationships between words.

At their core, transformers consist of an encoder and decoder architecture, though many modern implementations like BERT use only the encoder, while models like GPT use only the decoder. The architecture includes several key components:

1. **Embedding Layer**: Converts input tokens into vector representations
2. **Positional Encoding**: Adds information about token position in the sequence
3. **Multi-Head Attention**: Allows the model to focus on different parts of the input simultaneously
4. **Feed-Forward Networks**: Process the attention outputs
5. **Layer Normalization and Residual Connections**: Help with training stability

I should note that while this explanation covers the basic architecture, modern transformer models have evolved with various optimizations and modifications to this core design.

---
source: GPT-4
author: OpenAI
context: Technical
---
# Understanding Quantum Computing

Quantum computing represents a paradigm shift in computational technology, leveraging the principles of quantum mechanics to process information in fundamentally new ways.

## Key Quantum Concepts

Quantum computers operate using quantum bits or "qubits" instead of classical bits. While classical bits exist in a state of either 0 or 1, qubits can exist in a superposition of both states simultaneously. This property allows quantum computers to explore multiple solutions to a problem at once.

Another crucial quantum phenomenon is entanglement, where qubits become correlated in such a way that the state of one qubit instantly influences another, regardless of distance. This enables quantum computers to perform certain calculations exponentially faster than classical computers.

## Quantum Algorithms

Several quantum algorithms demonstrate significant advantages over classical counterparts:

- **Shor's Algorithm**: Can factor large numbers exponentially faster than the best known classical algorithms, with implications for cryptography
- **Grover's Algorithm**: Provides a quadratic speedup for unstructured search problems
- **Quantum Simulation**: Efficiently models quantum systems that are intractable for classical computers

## Current Limitations

Despite their potential, quantum computers face significant challenges:
- Quantum decoherence and error rates
- Limited qubit counts and connectivity
- The need for extreme cooling requirements
- Difficulty in scaling quantum systems

It's important to note that quantum computers won't replace classical computers but will likely serve as specialized accelerators for specific problems where quantum advantages exist.

---
source: Gemini Pro
author: Google
context: Creative
---
The Forgotten Library

In the heart of the old city, where cobblestone streets wind like ancient rivers and buildings lean against each other like old friends sharing secrets, there exists a library that few can find twice.

Its entrance appears differently to each visitor—sometimes as an ornate wooden door nestled between a bakery and a watchmaker's shop, sometimes as a humble archway in a quiet courtyard, and occasionally as a spiral staircase descending from a bridge that crosses the canal.

Inside, the library defies conventional architecture. Bookshelves stretch impossibly high, requiring floating ladders that seem to know where you wish to go before you do. Reading nooks appear precisely when needed, offering the perfect chair, lighting, and view. Some visitors swear the ceiling reflects not the interior of the building but the night sky of distant worlds or times.

The books themselves are even more remarkable. Many change their contents depending on who reads them or what questions burn most urgently in the reader's mind. Some books whisper their stories aloud when opened, while others project their tales as gentle holograms that dance above the pages.

The librarians are few and mysterious. They never speak above a whisper, wear clothes of shifting colors that seem woven from shadow and light, and have an uncanny ability to recommend exactly the book a visitor needs—though not always the one they want.

It's said that no one has ever checked out the same book twice, and that the library contains volumes not yet written alongside ancient texts thought lost to history.

Those who find themselves drawn to this magical place often discover that upon leaving, they cannot recall the exact route they took to arrive, ensuring that each visit feels like the first—a perpetual rediscovery of wonder.`;
    
    setInputText(sampleText);
    setInputFormat("text");
  };

  return (
    <Card className="brutalist-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-black text-brutalist-black">BATCH PROCESSOR</CardTitle>
            <CardDescription className="font-bold uppercase tracking-wide">
              Process multiple content pieces and generate aggregate reports
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="input" className="text-lg font-black">
              <FilePlus2 className="w-5 h-5 mr-2" />
              INPUT
            </TabsTrigger>
            <TabsTrigger value="process" className="text-lg font-black">
              <FileCheck2 className="w-5 h-5 mr-2" />
              PROCESS
            </TabsTrigger>
            <TabsTrigger value="results" className="text-lg font-black">
              <FileDown className="w-5 h-5 mr-2" />
              RESULTS
            </TabsTrigger>
          </TabsList>

          {/* Input Tab */}
          <TabsContent value="input" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-x-4">
                <Button
                  variant="outline"
                  onClick={loadSampleInputs}
                  className="brutalist-button-secondary"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  LOAD SAMPLES
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="input-format" className="font-bold">FORMAT:</Label>
                <Select
                  value={inputFormat}
                  onValueChange={(value) => setInputFormat(value as "json" | "text")}
                >
                  <SelectTrigger id="input-format" className="w-[120px] brutalist-input">
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch-input" className="text-lg font-black text-brutalist-black">
                BATCH CONTENT
              </Label>
              <Textarea
                id="batch-input"
                placeholder={inputFormat === "json" 
                  ? "Enter JSON array of content objects or a single object with contents array"
                  : "Enter multiple content pieces separated by '---' lines. You can include YAML-style metadata at the beginning of each piece."
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[400px] brutalist-input text-base font-mono"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-gray-600">
                  {inputText.length} characters
                </span>
              </div>
            </div>

            {/* Format Help */}
            <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-blue-800">Format Help</span>
              </div>
              {inputFormat === "text" ? (
                <div className="text-sm space-y-2">
                  <p className="font-bold">Separate multiple content pieces with <code>---</code> lines.</p>
                  <p>You can include optional metadata at the beginning of each piece:</p>
                  <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto">
{`---
source: Claude-3-Opus
author: Anthropic
context: Educational
---
Content goes here...

---
source: GPT-4
author: OpenAI
context: Technical
---
Another content piece goes here...`}
                  </pre>
                </div>
              ) : (
                <div className="text-sm space-y-2">
                  <p className="font-bold">JSON format options:</p>
                  <p>Option 1: Array of objects with content and metadata:</p>
                  <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto">
{`[
  {
    "content": "First content piece...",
    "source": "Claude-3-Opus",
    "author": "Anthropic",
    "context": "Educational"
  },
  {
    "content": "Second content piece...",
    "source": "GPT-4",
    "author": "OpenAI",
    "context": "Technical"
  }
]`}
                  </pre>
                  <p>Option 2: Object with contents array:</p>
                  <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto">
{`{
  "contents": [
    {
      "text": "First content piece...",
      "source": "Claude-3-Opus",
      "author": "Anthropic",
      "context": "Educational"
    },
    {
      "text": "Second content piece...",
      "source": "GPT-4",
      "author": "OpenAI",
      "context": "Technical"
    }
  ]
}`}
                  </pre>
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border-4 border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="font-bold text-red-800">{error}</span>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="flex justify-end">
              <Button
                onClick={parseInputs}
                className="brutalist-button-primary px-8"
                disabled={!inputText.trim()}
              >
                <ChevronDown className="w-4 h-4 mr-2" />
                CONTINUE TO PROCESSING
              </Button>
            </div>
          </TabsContent>

          {/* Process Tab */}
          <TabsContent value="process" className="space-y-6">
            {/* Batch Summary */}
            <Card className="bg-gray-50 border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-black text-brutalist-black">BATCH SUMMARY</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                    <div className="text-4xl font-black text-brutalist-black">{batchInputs.length}</div>
                    <div className="text-sm font-bold text-gray-600">TOTAL ITEMS</div>
                  </div>
                  <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                    <div className="text-4xl font-black text-brutalist-black">
                      {batchInputs.reduce((sum, input) => sum + input.content.length, 0).toLocaleString()}
                    </div>
                    <div className="text-sm font-bold text-gray-600">TOTAL CHARACTERS</div>
                  </div>
                  <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                    <div className="text-4xl font-black text-brutalist-black">
                      {Math.round(batchInputs.reduce((sum, input) => sum + input.content.length, 0) / 5).toLocaleString()}
                    </div>
                    <div className="text-sm font-bold text-gray-600">ESTIMATED WORDS</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Processing Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-black text-brutalist-black">
                  PROCESSING OPTIONS
                </Label>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="detector-type" className="font-bold">Detector Type</Label>
                  <Select
                    value={detectorType}
                    onValueChange={(value) => setDetectorType(value as DetectorType)}
                  >
                    <SelectTrigger id="detector-type" className="brutalist-input">
                      <SelectValue placeholder="Select detector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="enhanced">Enhanced</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="calibrated">Calibrated</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                      <SelectItem value="ml-enhanced">ML-Enhanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="report-template" className="font-bold">Report Template</Label>
                  <Select
                    value={reportTemplate === defaultTemplate ? 'default' : 
                           reportTemplate === minimalTemplate ? 'minimal' : 
                           reportTemplate === professionalTemplate ? 'professional' : 'default'}
                    onValueChange={handleTemplateChange}
                  >
                    <SelectTrigger id="report-template" className="brutalist-input">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Options */}
              {showAdvancedOptions && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-gray-500" />
                    <h3 className="font-black text-lg text-brutalist-black">ADVANCED OPTIONS</h3>
                  </div>

                  <Separator className="border-t-2 border-gray-200" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max-concurrent" className="font-bold">Max Concurrent Processes</Label>
                      <Select
                        value={batchOptions.maxConcurrent.toString()}
                        onValueChange={(value) => setBatchOptions(prev => ({
                          ...prev,
                          maxConcurrent: parseInt(value)
                        }))}
                      >
                        <SelectTrigger id="max-concurrent" className="brutalist-input">
                          <SelectValue placeholder="Select max concurrent" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 (Sequential)</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold">Report Options</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-individual-reports"
                          checked={batchOptions.includeIndividualReports}
                          onCheckedChange={(checked) => setBatchOptions(prev => ({
                            ...prev,
                            includeIndividualReports: !!checked
                          }))}
                        />
                        <Label htmlFor="include-individual-reports" className="cursor-pointer">
                          Generate Individual Reports
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-summary-report"
                          checked={batchOptions.includeSummaryReport}
                          onCheckedChange={(checked) => setBatchOptions(prev => ({
                            ...prev,
                            includeSummaryReport: !!checked
                          }))}
                        />
                        <Label htmlFor="include-summary-report" className="cursor-pointer">
                          Generate Summary Report
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border-4 border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="font-bold text-red-800">{error}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setActiveTab("input")}
                className="brutalist-button-secondary"
                disabled={processing}
              >
                <ChevronUp className="w-4 h-4 mr-2" />
                BACK TO INPUT
              </Button>
              <Button
                onClick={handleProcessBatch}
                className="brutalist-button-primary px-8"
                disabled={processing || batchInputs.length === 0}
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    PROCESSING...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    PROCESS BATCH
                  </>
                )}
              </Button>
            </div>

            {/* Progress Bar */}
            {processing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{currentProgress}% Complete</span>
                  <span className="text-sm font-bold">
                    Processing {Math.ceil(batchInputs.length * (currentProgress / 100))} of {batchInputs.length}
                  </span>
                </div>
                <Progress value={currentProgress} className="h-2" />
              </div>
            )}
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {batchResult ? (
              <>
                {/* Results Summary */}
                <Card className="bg-gray-50 border-2 border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-xl font-black text-brutalist-black">BATCH RESULTS</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                      <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                        <div className="text-4xl font-black text-green-600">{batchResult.successCount}</div>
                        <div className="text-sm font-bold text-gray-600">SUCCESSFUL</div>
                      </div>
                      <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                        <div className="text-4xl font-black text-red-600">{batchResult.errorCount}</div>
                        <div className="text-sm font-bold text-gray-600">FAILED</div>
                      </div>
                      <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                        <div className="text-4xl font-black text-brutalist-black">{batchResult.processingTime.toFixed(1)}s</div>
                        <div className="text-sm font-bold text-gray-600">PROCESSING TIME</div>
                      </div>
                      <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                        <div className="text-4xl font-black text-brutalist-black">
                          {(batchResult.processingTime / batchResult.results.length).toFixed(1)}s
                        </div>
                        <div className="text-sm font-bold text-gray-600">AVG PER ITEM</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Summary Report */}
                {batchResult.summaryReport && (
                  <Card className="border-2 border-blue-200">
                    <CardHeader className="bg-blue-50">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-black text-brutalist-black flex items-center">
                          <FileText className="w-5 h-5 mr-2 text-blue-600" />
                          SUMMARY REPORT
                        </CardTitle>
                        <Button
                          onClick={handleDownloadSummaryReport}
                          className="brutalist-button-primary"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          DOWNLOAD
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-center p-4">
                        <iframe
                          src={URL.createObjectURL(batchResult.summaryReport)}
                          className="w-full h-[400px] border-2 border-gray-300 rounded-md"
                          title="Summary Report Preview"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Individual Results */}
                <div className="space-y-4">
                  <h3 className="text-xl font-black text-brutalist-black">INDIVIDUAL RESULTS</h3>
                  
                  <div className="space-y-4">
                    {batchResult.results.map((result, index) => (
                      <Card key={result.assessment.id} className="border-2 border-gray-200">
                        <CardHeader className="bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg font-black text-brutalist-black">
                                {result.metadata?.modelName || `Item ${index + 1}`}
                              </CardTitle>
                              <CardDescription className="font-bold">
                                {new Date(result.assessment.timestamp).toLocaleString()}
                              </CardDescription>
                            </div>
                            <div className="text-2xl font-black text-brutalist-black">
                              {result.assessment.overallScore}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
                            <div>
                              <div className="text-sm font-bold text-gray-600">Reality</div>
                              <div className="text-lg font-black">{result.assessment.realityIndex.score.toFixed(1)}</div>
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-600">Trust</div>
                              <div className="text-lg font-black">{result.assessment.trustProtocol.status}</div>
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-600">Ethical</div>
                              <div className="text-lg font-black">{result.assessment.ethicalAlignment.score.toFixed(1)}</div>
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-600">Resonance</div>
                              <div className="text-lg font-black">{result.assessment.resonanceQuality.level}</div>
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-600">Canvas</div>
                              <div className="text-lg font-black">{result.assessment.canvasParity.score}</div>
                            </div>
                          </div>
                          
                          {batchResult.individualReports?.has(result.assessment.id) && (
                            <div className="mt-4 flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadIndividualReport(result.assessment.id)}
                                className="flex items-center space-x-2"
                              >
                                <Download className="w-4 h-4" />
                                <span>Download Report</span>
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <FileX2 className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-black text-gray-500 mb-2">No Results Available</h3>
                <p className="text-gray-500 font-bold">
                  Process a batch to see results here
                </p>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("process")}
                  className="mt-4"
                >
                  Go to Processing
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}