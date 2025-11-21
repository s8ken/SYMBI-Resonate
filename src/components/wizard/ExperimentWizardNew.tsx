import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Textarea, Select } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Modal, ModalFooter } from '../ui/Modal';
import { useToast } from '../ui/Toast';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check,
  Plus,
  X,
  Sparkles,
  Settings,
  Target
} from 'lucide-react';
import { cn } from '../../utils/cn';

// Types
interface Variant {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google';
  model: string;
  systemPrompt: string;
}

interface ExperimentConfig {
  name: string;
  description: string;
  variants: Variant[];
  evaluationCriteria: string[];
  sampleSize: number;
  budget: number;
  confidenceLevel: number;
}

interface ExperimentWizardNewProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (config: ExperimentConfig) => void;
}

const STEPS = [
  { id: 1, title: 'Setup', description: 'Basic experiment details', icon: Settings },
  { id: 2, title: 'Configure', description: 'Add variants and criteria', icon: Sparkles },
  { id: 3, title: 'Review', description: 'Confirm and launch', icon: Target },
];

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'google', label: 'Google' },
];

const MODELS: Record<string, { value: string; label: string }[]> = {
  openai: [
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  ],
  anthropic: [
    { value: 'claude-3-opus', label: 'Claude 3 Opus' },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
    { value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
  ],
  google: [
    { value: 'gemini-pro', label: 'Gemini Pro' },
    { value: 'gemini-pro-vision', label: 'Gemini Pro Vision' },
  ],
};

const EVALUATION_CRITERIA = [
  'coherence',
  'accuracy',
  'creativity',
  'helpfulness',
  'relevance',
  'clarity',
  'completeness',
  'factual_correctness',
];

export const ExperimentWizardNew: React.FC<ExperimentWizardNewProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { addToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<Partial<ExperimentConfig>>({
    name: '',
    description: '',
    variants: [],
    evaluationCriteria: ['coherence', 'accuracy', 'creativity'],
    sampleSize: 100,
    budget: 500,
    confidenceLevel: 0.95,
  });

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(STEPS.length, prev + 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const validateCurrentStep = (): boolean => {
    if (currentStep === 1) {
      if (!config.name?.trim()) {
        addToast({
          title: 'Validation Error',
          description: 'Please enter an experiment name',
          variant: 'danger',
        });
        return false;
      }
    }

    if (currentStep === 2) {
      if (!config.variants || config.variants.length < 2) {
        addToast({
          title: 'Validation Error',
          description: 'Please add at least 2 variants',
          variant: 'danger',
        });
        return false;
      }

      const hasInvalidVariant = config.variants.some(
        (v) => !v.name || !v.provider || !v.model
      );
      if (hasInvalidVariant) {
        addToast({
          title: 'Validation Error',
          description: 'Please complete all variant details',
          variant: 'danger',
        });
        return false;
      }
    }

    return true;
  };

  const handleComplete = () => {
    if (validateCurrentStep()) {
      onComplete(config as ExperimentConfig);
      addToast({
        title: 'Experiment Created',
        description: 'Your experiment has been successfully created',
        variant: 'success',
      });
      onClose();
    }
  };

  const addVariant = () => {
    const newVariant: Variant = {
      id: `variant_${Date.now()}`,
      name: '',
      provider: 'openai',
      model: 'gpt-4',
      systemPrompt: '',
    };
    setConfig((prev) => ({
      ...prev,
      variants: [...(prev.variants || []), newVariant],
    }));
  };

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    setConfig((prev) => ({
      ...prev,
      variants: prev.variants?.map((v, i) =>
        i === index ? { ...v, [field]: value } : v
      ),
    }));
  };

  const removeVariant = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      variants: prev.variants?.filter((_, i) => i !== index),
    }));
  };

  const toggleCriterion = (criterion: string) => {
    setConfig((prev) => {
      const criteria = prev.evaluationCriteria || [];
      const newCriteria = criteria.includes(criterion)
        ? criteria.filter((c) => c !== criterion)
        : [...criteria, criterion];
      return { ...prev, evaluationCriteria: newCriteria };
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <Input
              label="Experiment Name"
              placeholder="e.g., Customer Support Response Quality"
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              helperText="A descriptive name for your experiment"
            />

            <Textarea
              label="Description (Optional)"
              placeholder="Describe the purpose and goals of this experiment..."
              value={config.description}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              helperText="Help your team understand what you're testing"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Sample Size"
                type="number"
                value={config.sampleSize}
                onChange={(e) =>
                  setConfig({ ...config, sampleSize: parseInt(e.target.value) })
                }
                helperText="Number of test cases"
              />

              <Input
                label="Budget ($)"
                type="number"
                value={config.budget}
                onChange={(e) =>
                  setConfig({ ...config, budget: parseFloat(e.target.value) })
                }
                helperText="Maximum spend"
              />

              <Input
                label="Confidence Level"
                type="number"
                step="0.01"
                min="0.8"
                max="0.99"
                value={config.confidenceLevel}
                onChange={(e) =>
                  setConfig({ ...config, confidenceLevel: parseFloat(e.target.value) })
                }
                helperText="Statistical confidence"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Variants Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Model Variants
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Add at least 2 variants to compare
                  </p>
                </div>
                <Button onClick={addVariant} leftIcon={<Plus className="w-4 h-4" />}>
                  Add Variant
                </Button>
              </div>

              <div className="space-y-4">
                {config.variants?.map((variant, index) => (
                  <Card key={variant.id} variant="bordered">
                    <CardContent>
                      <div className="flex items-start justify-between mb-4">
                        <Badge variant="primary">Variant {index + 1}</Badge>
                        {config.variants!.length > 2 && (
                          <button
                            onClick={() => removeVariant(index)}
                            className="text-neutral-400 hover:text-danger-600 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Variant Name"
                          placeholder="e.g., GPT-4 Baseline"
                          value={variant.name}
                          onChange={(e) =>
                            updateVariant(index, 'name', e.target.value)
                          }
                        />

                        <Select
                          label="Provider"
                          value={variant.provider}
                          onChange={(e) =>
                            updateVariant(index, 'provider', e.target.value)
                          }
                          options={PROVIDERS}
                        />

                        <Select
                          label="Model"
                          value={variant.model}
                          onChange={(e) =>
                            updateVariant(index, 'model', e.target.value)
                          }
                          options={MODELS[variant.provider] || []}
                        />

                        <Textarea
                          label="System Prompt (Optional)"
                          placeholder="Custom instructions for this variant..."
                          value={variant.systemPrompt}
                          onChange={(e) =>
                            updateVariant(index, 'systemPrompt', e.target.value)
                          }
                          className="md:col-span-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Evaluation Criteria */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Evaluation Criteria
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Select the criteria to evaluate your variants
              </p>

              <div className="flex flex-wrap gap-2">
                {EVALUATION_CRITERIA.map((criterion) => {
                  const isSelected = config.evaluationCriteria?.includes(criterion);
                  return (
                    <button
                      key={criterion}
                      onClick={() => toggleCriterion(criterion)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                        isSelected
                          ? 'bg-primary-600 text-white'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                      )}
                    >
                      {criterion.replace(/_/g, ' ')}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <Card variant="elevated">
              <CardHeader
                title="Experiment Summary"
                description="Review your configuration before launching"
              />
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Name
                    </h4>
                    <p className="text-base text-neutral-900 dark:text-neutral-100">
                      {config.name}
                    </p>
                  </div>

                  {config.description && (
                    <div>
                      <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Description
                      </h4>
                      <p className="text-base text-neutral-900 dark:text-neutral-100">
                        {config.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Sample Size
                      </h4>
                      <p className="text-base text-neutral-900 dark:text-neutral-100">
                        {config.sampleSize}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Budget
                      </h4>
                      <p className="text-base text-neutral-900 dark:text-neutral-100">
                        ${config.budget}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Confidence
                      </h4>
                      <p className="text-base text-neutral-900 dark:text-neutral-100">
                        {(config.confidenceLevel! * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                      Variants ({config.variants?.length})
                    </h4>
                    <div className="space-y-2">
                      {config.variants?.map((variant, index) => (
                        <div
                          key={variant.id}
                          className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-neutral-100">
                              {variant.name}
                            </p>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                              {variant.provider} - {variant.model}
                            </p>
                          </div>
                          <Badge variant="primary">Variant {index + 1}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                      Evaluation Criteria
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {config.evaluationCriteria?.map((criterion) => (
                        <Badge key={criterion} variant="secondary">
                          {criterion.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title="Create New Experiment"
      description="Set up a multi-agent experiment to compare AI models"
    >
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center transition-all',
                      isActive &&
                        'bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-900/30',
                      isCompleted && 'bg-success-600 text-white',
                      !isActive &&
                        !isCompleted &&
                        'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="text-center">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        isActive && 'text-primary-600 dark:text-primary-400',
                        !isActive && 'text-neutral-600 dark:text-neutral-400'
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-500">
                      {step.description}
                    </p>
                  </div>
                </div>

                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-1 mx-4 rounded-full transition-all',
                      isCompleted
                        ? 'bg-success-600'
                        : 'bg-neutral-200 dark:bg-neutral-800'
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">{renderStepContent()}</div>

      {/* Footer Actions */}
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        {currentStep > 1 && (
          <Button
            variant="ghost"
            onClick={handlePrevious}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Previous
          </Button>
        )}
        {currentStep < STEPS.length ? (
          <Button
            onClick={handleNext}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Next
          </Button>
        ) : (
          <Button variant="primary" onClick={handleComplete}>
            Launch Experiment
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};