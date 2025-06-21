// Shared types for the AIRWAVE workflow system

export interface WorkflowStep {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

export interface BriefData {
  title: string;
  objective: string;
  targetAudience: string;
  keyMessages: string[];
  platforms: string[];
  budget: string;
  timeline: string;
  product?: string;
  service?: string;
  valueProposition?: string;
  brandGuidelines?: string;
  requirements?: string[];
  industry?: string;
  competitors?: string[];
}

export interface Motivation {
  id: string;
  title: string;
  description: string;
  score: number;
  selected: boolean;
}

export interface CopyVariation {
  id: string;
  text: string;
  platform: string;
  selected: boolean;
}

export interface Asset {
  id: string;
  type: 'image' | 'video' | 'copy' | 'template';
  url?: string;
  content?: string;
  metadata?: Record<string, any>;
  selected: boolean;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  category: string;
  selected: boolean;
}

export interface WorkflowState {
  // Current step
  currentStep: number;
  
  // Data for each step
  briefData: BriefData | null;
  originalBriefData: BriefData | null;
  motivations: Motivation[];
  copyVariations: CopyVariation[];
  selectedAssets: Asset[];
  selectedTemplate: Template | null;
  
  // UI state
  processing: boolean;
  uploadedFile: File | null;
  showBriefReview: boolean;
  briefConfirmed: boolean;
  lastError: string | null;
  
  // Client context
  clientId: string | null;
}

export interface WorkflowActions {
  // Navigation
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  
  // Brief handling
  uploadBrief: (file: File) => Promise<void>;
  confirmBrief: (briefData: BriefData) => void;
  resetBrief: () => void;
  
  // Motivations
  generateMotivations: () => Promise<void>;
  selectMotivation: (id: string) => void;
  
  // Copy generation
  generateCopy: () => Promise<void>;
  selectCopy: (id: string) => void;
  storeCopyVariations: (selectedCopy: CopyVariation[]) => Promise<any>;
  
  // Asset selection
  selectAsset: (asset: Asset) => void;
  removeAsset: (id: string) => void;
  
  // Template selection
  selectTemplate: (template: Template) => void;
  
  // Error handling
  clearError: () => void;
  setError: (error: string) => void;
  
  // Reset workflow
  resetWorkflow: () => void;
}

export interface WorkflowContext {
  state: WorkflowState;
  actions: WorkflowActions;
}

// Step component props interface
export interface StepComponentProps {
  onNext?: () => void;
  onPrevious?: () => void;
  onComplete?: (data: any) => void;
}

// Workflow events for XState machine
export type WorkflowEvent =
  | { type: 'UPLOAD_BRIEF'; file: File }
  | { type: 'CONFIRM_BRIEF'; briefData: BriefData }
  | { type: 'GENERATE_MOTIVATIONS' }
  | { type: 'SELECT_MOTIVATION'; id: string }
  | { type: 'GENERATE_COPY' }
  | { type: 'SELECT_COPY'; id: string }
  | { type: 'SELECT_ASSET'; asset: Asset }
  | { type: 'SELECT_TEMPLATE'; template: Template }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'GO_TO_STEP'; step: number }
  | { type: 'RESET_WORKFLOW' }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'CLEAR_ERROR' };

// Workflow machine context
export interface WorkflowMachineContext {
  currentStep: number;
  briefData: BriefData | null;
  originalBriefData: BriefData | null;
  motivations: Motivation[];
  copyVariations: CopyVariation[];
  selectedAssets: Asset[];
  selectedTemplate: Template | null;
  processing: boolean;
  uploadedFile: File | null;
  showBriefReview: boolean;
  briefConfirmed: boolean;
  lastError: string | null;
  clientId: string | null;
}

// Cost control integration
export interface CostCheckRequest {
  service: 'openai' | 'anthropic' | 'elevenlabs';
  model: string;
  estimatedTokens: number;
  operation: string;
  operationData?: any;
}

export interface CostCheckResponse {
  allowed: boolean;
  reason?: string;
  fallbackModel?: string;
  budgetRemaining?: number;
  usageStats?: {
    percentOfBudget: number;
    totalSpent: number;
    monthlyLimit: number;
  };
}
