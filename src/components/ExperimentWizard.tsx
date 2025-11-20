import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  X, 
  Settings,
  Target,
  DollarSign,
  Users,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { ExperimentConfig, Provider, Model, EvaluationCriteria } from '@/lib/experiments/types';
import { ValidationHelpers } from '@/lib/experiments/utils';

interface ExperimentWizardProps {
  onComplete: (config: ExperimentConfig) => void;
  onCancel: () => void;
}

const AVAILABLE_PROVIDERS: Provider[] = ['openai', 'anthropic', 'google'];
const AVAILABLE_MODELS: Record<Provider, Model[]> = {
  openai: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
  google: ['gemini-pro', 'gemini-pro-vision']
};

const AVAILABLE_CRITERIA: EvaluationCriteria[] = [
  'coherence',
  'accuracy', 
  'creativity',
  'helpfulness',
  'relevance',
  'clarity',
  'completeness',
  'factual_correctness',
  'instruction_following',
  'tone_appropriateness'
];

const STEPS = [
  { id: 1, title: 'Basic Info', icon: Settings },
  { id: 2, title: 'Variants', icon: BarChart3 },
  { id: 3, title: 'Evaluation', icon: Target },
  { id: 4, title: 'Budget & Sample', icon: DollarSign },
  { id: 5, title: 'Review', icon: Users }
];

export const ExperimentWizard: React.FC<ExperimentWizardProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<Partial<ExperimentConfig>>({
    sampleSize: 100,
    confidenceLevel: 0.95,
    budget: 500,
    variants: [],
    evaluationCriteria: ['coherence', 'accuracy', 'creativity'],
    metadata: {}
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Toast notifications using sonner

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!config.name) {
        newErrors.name = 'Experiment name is required';
      } else {
        try {
          ValidationHelpers.validateExperimentName(config.name);
        } catch (error) {
          newErrors.name = error instanceof Error ? error.message : 'Invalid name';
        }
      }

      if (config.description) {
        try {
          ValidationHelpers.validateDescription(config.description);
        } catch (error) {
          newErrors.description = error instanceof Error ? error.message : 'Invalid description';
        }
      }
    }

    if (step === 2) {
      if (!config.variants || config.variants.length < 2) {
        newErrors.variants = 'At least 2 variants are required';
      }

      config.variants?.forEach((variant, index) => {
        if (!variant.name) {
          newErrors[`variant_${index}_name`] = 'Variant name is required';
        }
        if (!variant.provider) {
          newErrors[`variant_${index}_provider`] = 'Provider is required';
        }
        if (!variant.model) {
          newErrors[`variant_${index}_model`] = 'Model is required';
        }
      });
    }

    if (step === 3) {
      if (!config.evaluationCriteria || config.evaluationCriteria.length === 0) {
        newErrors.evaluationCriteria = 'At least one evaluation criterion is required';
      }
    }

    if (step === 4) {
      if (!config.sampleSize || config.sampleSize < 1) {
        newErrors.sampleSize = 'Sample size must be at least 1';
      } else {
        try {
          ValidationHelpers.validateSampleSize(config.sampleSize);
        } catch (error) {
          newErrors.sampleSize = error instanceof Error ? error.message : 'Invalid sample size';
        }
      }

      if (!config.budget || config.budget < 0) {
        newErrors.budget = 'Budget must be positive';
      } else {
        try {
          ValidationHelpers.validateBudget(config.budget);
        } catch (error) {
          newErrors.budget = error instanceof Error ? error.message : 'Invalid budget';
        }
      }

      if (!config.confidenceLevel || config.confidenceLevel < 0.8 || config.confidenceLevel > 0.999) {
        newErrors.confidenceLevel = 'Confidence level must be between 0.8 and 0.999';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(STEPS.length, prev + 1));
    } else {
      toast.error('Please fix the errors before proceeding.');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleComplete = () => {
    if (validateStep(currentStep)) {
      try {
        const finalConfig: ExperimentConfig = {
          name: config.name!,
          description: config.description || '',
          sampleSize: config.sampleSize!,
          confidenceLevel: config.confidenceLevel!,
          budget: config.budget!,
          variants: config.variants!,
          evaluationCriteria: config.evaluationCriteria!,
          metadata: config.metadata || {}
        };
        onComplete(finalConfig);
      } catch (error) {
        toast.error('Failed to create experiment configuration.');
      }
    }
  };

  const addVariant = () => {
    const newVariant = {
      id: `variant_${Date.now()}`,
      name: '',
      provider: 'openai' as Provider,
      model: 'gpt-4' as Model,
      systemPrompt: ''
    };
    setConfig(prev => ({
      ...prev,
      variants: [...(prev.variants || []), newVariant]
    }));
  };

  const updateVariant = (index: number, field: keyof typeof config.variants[0], value: any) => {
    setConfig(prev => ({
      ...prev,
      variants: prev.variants?.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }));
  };

  const removeVariant = (index: number) => {
    setConfig(prev => ({
      ...prev,
      variants: prev.variants?.filter((_, i) => i !== index)
    }));
  };

  const toggleCriterion = (criterion: EvaluationCriteria) => {
    setConfig(prev => ({
      ...prev,
      evaluationCriteria: prev.evaluationCriteria?.includes(criterion)
        ? prev.evaluationCriteria.filter(c => c !== criterion)
        : [...(prev.evaluationCriteria || []), criterion]
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Experiment Name *</Label>
              <Input
                id="name"
                value={config.name || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., GPT-4 vs Claude-3 Content Quality"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={config.description || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the purpose and goals of this experiment..."
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
            </div>

            <div>
              <Label>Categories (optional)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add category..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const value = (e.target as HTMLInputElement).value;
                      if (value) {
                        setConfig(prev => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            categories: [...(prev.metadata?.categories || []), value]
                          }
                        }));
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {config.metadata?.categories?.map((cat, index) => (
                  <Badge key={index} variant="secondary">
                    {cat}
                    <button
                      onClick={() => setConfig(prev => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          categories: prev.metadata?.categories?.filter((_, i) => i !== index)
                        }
                      }))}
                      className="ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Variants * (minimum 2)</Label>
              <Button onClick={addVariant} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Variant
              </Button>
            </div>

            {errors.variants && (
              <p className="text-sm text-red-500">{errors.variants}</p>
            )}

            <div className="space-y-4">
              {config.variants?.map((variant, index) => (
                <Card key={variant.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Variant {index + 1}</CardTitle>
                      {config.variants!.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVariant(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label>Name *</Label>
                      <Input
                        value={variant.name}
                        onChange={(e) => updateVariant(index, 'name', e.target.value)}
                        placeholder="e.g., GPT-4 Turbo"
                        className={errors[`variant_${index}_name`] ? 'border-red-500' : ''}
                      />
                      {errors[`variant_${index}_name`] && (
                        <p className="text-sm text-red-500 mt-1">{errors[`variant_${index}_name`]}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Provider *</Label>
                        <Select
                          value={variant.provider}
                          onValueChange={(value) => updateVariant(index, 'provider', value)}
                        >
                          <SelectTrigger className={errors[`variant_${index}_provider`] ? 'border-red-500' : ''}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {AVAILABLE_PROVIDERS.map(provider => (
                              <SelectItem key={provider} value={provider}>
                                {provider.charAt(0).toUpperCase() + provider.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors[`variant_${index}_provider`] && (
                          <p className="text-sm text-red-500 mt-1">{errors[`variant_${index}_provider`]}</p>
                        )}
                      </div>

                      <div>
                        <Label>Model *</Label>
                        <Select
                          value={variant.model}
                          onValueChange={(value) => updateVariant(index, 'model', value)}
                        >
                          <SelectTrigger className={errors[`variant_${index}_model`] ? 'border-red-500' : ''}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {AVAILABLE_MODELS[variant.provider]?.map(model => (
                              <SelectItem key={model} value={model}>
                                {model}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors[`variant_${index}_model`] && (
                          <p className="text-sm text-red-500 mt-1">{errors[`variant_${index}_model`]}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label>System Prompt (optional)</Label>
                      <Textarea
                        value={variant.systemPrompt || ''}
                        onChange={(e) => updateVariant(index, 'systemPrompt', e.target.value)}
                        placeholder="Custom system prompt for this variant..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label>Evaluation Criteria *</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Select the criteria that evaluators will use to score responses
              </p>
              {errors.evaluationCriteria && (
                <p className="text-sm text-red-500 mb-2">{errors.evaluationCriteria}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {AVAILABLE_CRITERIA.map(criterion => (
                <div
                  key={criterion}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    config.evaluationCriteria?.includes(criterion)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => toggleCriterion(criterion)}
                >
                  <div className="flex items-center justify-between">
                    <span className="capitalize">
                      {criterion.replace('_', ' ')}
                    </span>
                    {config.evaluationCriteria?.includes(criterion) && (
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Selected Criteria:</h4>
              <div className="flex flex-wrap gap-2">
                {config.evaluationCriteria?.map(criterion => (
                  <Badge key={criterion} variant="secondary">
                    {criterion.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Sample Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="sampleSize">Sample Size *</Label>
                    <Input
                      id="sampleSize"
                      type="number"
                      min="1"
                      max="10000"
                      value={config.sampleSize || ''}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        sampleSize: parseInt(e.target.value) || 0 
                      }))}
                      className={errors.sampleSize ? 'border-red-500' : ''}
                    />
                    {errors.sampleSize && (
                      <p className="text-sm text-red-500 mt-1">{errors.sampleSize}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Number of trials per variant (1-10,000)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="confidenceLevel">Confidence Level *</Label>
                    <Select
                      value={config.confidenceLevel?.toString()}
                      onValueChange={(value) => setConfig(prev => ({ 
                        ...prev, 
                        confidenceLevel: parseFloat(value) 
                      }))}
                    >
                      <SelectTrigger className={errors.confidenceLevel ? 'border-red-500' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.8">80%</SelectItem>
                        <SelectItem value="0.9">90%</SelectItem>
                        <SelectItem value="0.95">95%</SelectItem>
                        <SelectItem value="0.99">99%</SelectItem>
                        <SelectItem value="0.999">99.9%</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.confidenceLevel && (
                      <p className="text-sm text-red-500 mt-1">{errors.confidenceLevel}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Budget Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="budget">Budget * ($USD)</Label>
                    <Input
                      id="budget"
                      type="number"
                      min="0"
                      step="0.01"
                      value={config.budget || ''}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        budget: parseFloat(e.target.value) || 0 
                      }))}
                      className={errors.budget ? 'border-red-500' : ''}
                    />
                    {errors.budget && (
                      <p className="text-sm text-red-500 mt-1">{errors.budget}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Maximum budget for this experiment
                    </p>
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Estimated Cost per Trial:</span>
                        <span className="font-medium">$0.02</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Estimated Cost:</span>
                        <span className="font-medium">
                          ${((config.sampleSize || 0) * config.variants?.length * 0.02).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Budget Utilization:</span>
                        <span className="font-medium">
                          {((config.sampleSize || 0) * config.variants?.length * 0.02 / (config.budget || 1) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Experiment Summary</CardTitle>
                <CardDescription>
                  Review your experiment configuration before creating it
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Basic Information</h4>
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Name:</dt>
                        <dd className="font-medium">{config.name}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Description:</dt>
                        <dd className="font-medium">{config.description || 'N/A'}</dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Configuration</h4>
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Sample Size:</dt>
                        <dd className="font-medium">{config.sampleSize}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Confidence:</dt>
                        <dd className="font-medium">{(config.confidenceLevel! * 100).toFixed(0)}%</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Budget:</dt>
                        <dd className="font-medium">${config.budget?.toFixed(2)}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Variants ({config.variants?.length})</h4>
                  <div className="space-y-2">
                    {config.variants?.map((variant, index) => (
                      <div key={variant.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div>
                          <div className="font-medium">{variant.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {variant.provider} - {variant.model}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Evaluation Criteria ({config.evaluationCriteria?.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {config.evaluationCriteria?.map(criterion => (
                      <Badge key={criterion} variant="secondary">
                        {criterion.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <step.icon className="h-5 w-5" />
              </div>
              <div className="ml-2">
                <div className="text-sm font-medium">{step.title}</div>
              </div>
              {index < STEPS.length - 1 && (
                <div className="flex-1 h-1 bg-muted mx-4" />
              )}
            </div>
          ))}
        </div>
        <Progress value={(currentStep / STEPS.length) * 100} className="h-2" />
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
          <CardDescription>
            {currentStep === 1 && "Configure basic experiment information"}
            {currentStep === 2 && "Set up AI model variants to compare"}
            {currentStep === 3 && "Choose evaluation criteria for scoring"}
            {currentStep === 4 && "Configure sample size and budget"}
            {currentStep === 5 && "Review and confirm your experiment configuration"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          
          {currentStep < STEPS.length ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleComplete}>
              Create Experiment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExperimentWizard;