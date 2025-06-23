import { createMachine, assign } from 'xstate';
import {
  WorkflowMachineContext,
  WorkflowEvent} from './workflow-types';

// Initial context
const initialContext: WorkflowMachineContext = {
  currentStep: 0,
  briefData: null,
  originalBriefData: null,
  motivations: [],
  copyVariations: [],
  selectedAssets: [],
  selectedTemplate: null,
  processing: false,
  uploadedFile: null,
  showBriefReview: false,
  briefConfirmed: false,
  lastError: null,
  clientId: null};

// Guards
const guards = {
  hasBriefData: (context: WorkflowMachineContext, event: WorkflowEvent) =>
    event.type === 'CONFIRM_BRIEF' && event.briefData !== null,
  briefIsConfirmed: (context: WorkflowMachineContext) => context.briefConfirmed,
  hasSelectedMotivations: (context: WorkflowMachineContext) =>
    context.motivations.some(m => m.selected),
  hasSelectedCopy: (context: WorkflowMachineContext) =>
    context.copyVariations.some(c => c.selected),
  hasSelectedAssets: (context: WorkflowMachineContext) =>
    context.selectedAssets.length > 0,
  hasSelectedTemplate: (context: WorkflowMachineContext) =>
    context.selectedTemplate !== null,
  canProceedToMotivations: (context: WorkflowMachineContext) =>
    context.briefData !== null && context.briefConfirmed,
  canProceedToCopy: (context: WorkflowMachineContext) =>
    context.motivations.some(m => m.selected),
  canProceedToAssets: (context: WorkflowMachineContext) =>
    context.copyVariations.some(c => c.selected),
  canProceedToTemplate: (context: WorkflowMachineContext) =>
    context.selectedAssets.length > 0,
  canProceedToMatrix: (context: WorkflowMachineContext) =>
    context.selectedTemplate !== null,
  canProceedToRender: (context: WorkflowMachineContext) =>
    context.selectedTemplate !== null &&
    context.motivations.some(m => m.selected) &&
    context.copyVariations.some(c => c.selected) &&
    context.selectedAssets.length > 0};

// Actions
const actions = {
  setProcessing: assign<WorkflowMachineContext, WorkflowEvent>({
    processing: (_, event) =>
      event.type === 'UPLOAD_BRIEF' ||
      event.type === 'GENERATE_MOTIVATIONS' ||
      event.type === 'GENERATE_COPY'}),

  setBriefData: assign<WorkflowMachineContext, WorkflowEvent>({
    briefData: (_, event) =>
      event.type === 'CONFIRM_BRIEF' ? event.briefData : null,
    originalBriefData: (_, event) =>
      event.type === 'CONFIRM_BRIEF' ? event.briefData : null,
    briefConfirmed: (_, event) => event.type === 'CONFIRM_BRIEF',
    showBriefReview: false,
    currentStep: 1}),

  setUploadedFile: assign<WorkflowMachineContext, WorkflowEvent>({
    uploadedFile: (_, event) =>
      event.type === 'UPLOAD_BRIEF' ? event.file : null,
    showBriefReview: true}),

  selectMotivation: assign<WorkflowMachineContext, WorkflowEvent>({
    motivations: (context, event) => {
      if (event.type === 'SELECT_MOTIVATION') {
        return context.motivations.map((m: any) =>
          m.id === event.id ? { ...m, selected: !m.selected } : m
        );
      }
      return context.motivations;
    }}),

  selectCopy: assign<WorkflowMachineContext, WorkflowEvent>({
    copyVariations: (context, event) => {
      if (event.type === 'SELECT_COPY') {
        return context.copyVariations.map((c: any) =>
          c.id === event.id ? { ...c, selected: !c.selected } : c
        );
      }
      return context.copyVariations;
    }}),

  selectAsset: assign<WorkflowMachineContext, WorkflowEvent>({
    selectedAssets: (context, event) => {
      if (event.type === 'SELECT_ASSET') {
        const exists = context.selectedAssets.some(a => a.id === event.asset.id);
        if (exists) {
          return context.selectedAssets.filter((a: any) => a.id !== event.asset.id);
        } else {
          return [...context.selectedAssets, event.asset];
        }
      }
      return context.selectedAssets;
    }}),

  selectTemplate: assign<WorkflowMachineContext, WorkflowEvent>({
    selectedTemplate: (_, event) =>
      event.type === 'SELECT_TEMPLATE' ? event.template : null}),

  nextStep: assign<WorkflowMachineContext, WorkflowEvent>({
    currentStep: (context) => Math.min(context.currentStep + 1, 6)}),

  previousStep: assign<WorkflowMachineContext, WorkflowEvent>({
    currentStep: (context) => Math.max(context.currentStep - 1, 0)}),

  goToStep: assign<WorkflowMachineContext, WorkflowEvent>({
    currentStep: (_, event) =>
      event.type === 'GO_TO_STEP' ? Math.max(0, Math.min(event.step, 6)) : 0}),

  setError: assign<WorkflowMachineContext, WorkflowEvent>({
    lastError: (_, event) =>
      event.type === 'SET_ERROR' ? event.error : null}),

  clearError: assign<WorkflowMachineContext, WorkflowEvent>({
    lastError: null}),

  resetWorkflow: assign<WorkflowMachineContext, WorkflowEvent>(() => ({
    ...initialContext}))};

// Workflow machine definition
export const workflowMachine = createMachine<WorkflowMachineContext, WorkflowEvent>({
  id: 'airwaveWorkflow',
  initial: 'briefUpload',
  context: initialContext,
  predictableActionArguments: true,
  states: Record<string, unknown>$1
  briefUpload: Record<string, unknown>$1
  on: Record<string, unknown>$1
  UPLOAD_BRIEF: Record<string, unknown>$1
  actions: ['setUploadedFile', 'setProcessing']},
        CONFIRM_BRIEF: Record<string, unknown>$1
  target: 'motivationSelection',
          actions: ['setBriefData'],
          cond: 'hasBriefData' },
  SET_ERROR: Record<string, unknown>$1
  actions: ['setError'] },
  CLEAR_ERROR: Record<string, unknown>$1
  actions: ['clearError']}}},
    
    motivationSelection: Record<string, unknown>$1
  entry: ['clearError'],
      on: Record<string, unknown>$1
  GENERATE_MOTIVATIONS: Record<string, unknown>$1
  actions: ['setProcessing'] },
  SELECT_MOTIVATION: Record<string, unknown>$1
  actions: ['selectMotivation'] },
  NEXT_STEP: Record<string, unknown>$1
  target: 'copyGeneration',
          cond: 'hasSelectedMotivations',
          actions: ['nextStep'] },
  PREVIOUS_STEP: Record<string, unknown>$1
  target: 'briefUpload',
          actions: ['previousStep'] },
  SET_ERROR: Record<string, unknown>$1
  actions: ['setError'] },
  CLEAR_ERROR: Record<string, unknown>$1
  actions: ['clearError']}}},
    
    copyGeneration: Record<string, unknown>$1
  entry: ['clearError'],
      on: Record<string, unknown>$1
  GENERATE_COPY: Record<string, unknown>$1
  actions: ['setProcessing'] },
  SELECT_COPY: Record<string, unknown>$1
  actions: ['selectCopy'] },
  NEXT_STEP: Record<string, unknown>$1
  target: 'assetSelection',
          cond: 'hasSelectedCopy',
          actions: ['nextStep'] },
  PREVIOUS_STEP: Record<string, unknown>$1
  target: 'motivationSelection',
          actions: ['previousStep'] },
  SET_ERROR: Record<string, unknown>$1
  actions: ['setError'] },
  CLEAR_ERROR: Record<string, unknown>$1
  actions: ['clearError']}}},
    
    assetSelection: Record<string, unknown>$1
  entry: ['clearError'],
      on: Record<string, unknown>$1
  SELECT_ASSET: Record<string, unknown>$1
  actions: ['selectAsset'] },
  NEXT_STEP: Record<string, unknown>$1
  target: 'templateSelection',
          cond: 'hasSelectedAssets',
          actions: ['nextStep'] },
  PREVIOUS_STEP: Record<string, unknown>$1
  target: 'copyGeneration',
          actions: ['previousStep'] },
  SET_ERROR: Record<string, unknown>$1
  actions: ['setError'] },
  CLEAR_ERROR: Record<string, unknown>$1
  actions: ['clearError']}}},
    
    templateSelection: Record<string, unknown>$1
  entry: ['clearError'],
      on: Record<string, unknown>$1
  SELECT_TEMPLATE: Record<string, unknown>$1
  actions: ['selectTemplate'] },
  NEXT_STEP: Record<string, unknown>$1
  target: 'matrixBuild',
          cond: 'hasSelectedTemplate',
          actions: ['nextStep'] },
  PREVIOUS_STEP: Record<string, unknown>$1
  target: 'assetSelection',
          actions: ['previousStep'] },
  SET_ERROR: Record<string, unknown>$1
  actions: ['setError'] },
  CLEAR_ERROR: Record<string, unknown>$1
  actions: ['clearError']}}},
    
    matrixBuild: Record<string, unknown>$1
  entry: ['clearError'],
      on: Record<string, unknown>$1
  NEXT_STEP: Record<string, unknown>$1
  target: 'rendering',
          cond: 'canProceedToRender',
          actions: ['nextStep'] },
  PREVIOUS_STEP: Record<string, unknown>$1
  target: 'templateSelection',
          actions: ['previousStep'] },
  SET_ERROR: Record<string, unknown>$1
  actions: ['setError'] },
  CLEAR_ERROR: Record<string, unknown>$1
  actions: ['clearError']}}},
    
    rendering: Record<string, unknown>$1
  entry: ['clearError'],
      on: Record<string, unknown>$1
  PREVIOUS_STEP: Record<string, unknown>$1
  target: 'matrixBuild',
          actions: ['previousStep'] },
  RESET_WORKFLOW: Record<string, unknown>$1
  target: 'briefUpload',
          actions: ['resetWorkflow'] },
  SET_ERROR: Record<string, unknown>$1
  actions: ['setError'] },
  CLEAR_ERROR: Record<string, unknown>$1
  actions: ['clearError']}}}},
  
  // Global transitions
  on: Record<string, unknown>$1
  GO_TO_STEP: [
      {
        target: 'briefUpload',
        cond: (_, event) => event.step === 0,
        actions: ['goToStep'] }
      {
        target: 'motivationSelection',
        cond: (context, event) => event.step === 1 && guards.canProceedToMotivations(context),
        actions: ['goToStep'] }
      {
        target: 'copyGeneration',
        cond: (context, event) => event.step === 2 && guards.canProceedToCopy(context),
        actions: ['goToStep'] }
      {
        target: 'assetSelection',
        cond: (context, event) => event.step === 3 && guards.canProceedToAssets(context),
        actions: ['goToStep'] }
      {
        target: 'templateSelection',
        cond: (context, event) => event.step === 4 && guards.canProceedToTemplate(context),
        actions: ['goToStep'] }
      {
        target: 'matrixBuild',
        cond: (context, event) => event.step === 5 && guards.canProceedToMatrix(context),
        actions: ['goToStep'] }
      {
        target: 'rendering',
        cond: (context, event) => event.step === 6 && guards.canProceedToRender(context),
        actions: ['goToStep'] }
    ],
    RESET_WORKFLOW: Record<string, unknown>$1
  target: 'briefUpload',
      actions: ['resetWorkflow']}}}, {
  guards,
  actions});

// Export machine creator function
export const createWorkflowMachine = (clientId?: string) => {
  return workflowMachine.withContext({
    ...initialContext,
    clientId: clientId || null});
};
