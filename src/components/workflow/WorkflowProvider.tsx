import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { useCSRF } from '@/hooks/useCSRF';
import { useClient } from '@/contexts/ClientContext';
import {
  WorkflowState,
  WorkflowActions,
  WorkflowContext,
  BriefData,
  Motivation,
  CopyVariation,
  Asset,
  Template,
} from '@/lib/workflow/workflow-types';
import {
  estimateTokensForMotivations,
  estimateTokensForCopy,
} from '@/utils/ai-cost-estimation';

// Initial state
const initialState: WorkflowState = {
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
  clientId: null,
};

// Action types
type WorkflowAction =
  | { type: 'SET_STEP'; step: number }
  | { type: 'SET_PROCESSING'; processing: boolean }
  | { type: 'SET_BRIEF_DATA'; briefData: BriefData; originalBriefData: BriefData }
  | { type: 'SET_UPLOADED_FILE'; file: File | null }
  | { type: 'SET_SHOW_BRIEF_REVIEW'; show: boolean }
  | { type: 'SET_BRIEF_CONFIRMED'; confirmed: boolean }
  | { type: 'SET_MOTIVATIONS'; motivations: Motivation[] }
  | { type: 'TOGGLE_MOTIVATION'; id: string }
  | { type: 'SET_COPY_VARIATIONS'; copyVariations: CopyVariation[] }
  | { type: 'TOGGLE_COPY'; id: string }
  | { type: 'SET_SELECTED_ASSETS'; assets: Asset[] }
  | { type: 'ADD_ASSET'; asset: Asset }
  | { type: 'REMOVE_ASSET'; id: string }
  | { type: 'SET_SELECTED_TEMPLATE'; template: Template | null }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_CLIENT_ID'; clientId: string }
  | { type: 'RESET_WORKFLOW' };

// Reducer
function workflowReducer(state: WorkflowState, action: WorkflowAction): WorkflowState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step };
    
    case 'SET_PROCESSING':
      return { ...state, processing: action.processing };
    
    case 'SET_BRIEF_DATA':
      return {
        ...state,
        briefData: action.briefData,
        originalBriefData: action.originalBriefData,
      };
    
    case 'SET_UPLOADED_FILE':
      return { ...state, uploadedFile: action.file };
    
    case 'SET_SHOW_BRIEF_REVIEW':
      return { ...state, showBriefReview: action.show };
    
    case 'SET_BRIEF_CONFIRMED':
      return { ...state, briefConfirmed: action.confirmed };
    
    case 'SET_MOTIVATIONS':
      return { ...state, motivations: action.motivations };
    
    case 'TOGGLE_MOTIVATION':
      return {
        ...state,
        motivations: state.motivations.map(m =>
          m.id === action.id ? { ...m, selected: !m.selected } : m
        ),
      };
    
    case 'SET_COPY_VARIATIONS':
      return { ...state, copyVariations: action.copyVariations };
    
    case 'TOGGLE_COPY':
      return {
        ...state,
        copyVariations: state.copyVariations.map(c =>
          c.id === action.id ? { ...c, selected: !c.selected } : c
        ),
      };
    
    case 'SET_SELECTED_ASSETS':
      return { ...state, selectedAssets: action.assets };
    
    case 'ADD_ASSET':
      return {
        ...state,
        selectedAssets: [...state.selectedAssets, action.asset],
      };
    
    case 'REMOVE_ASSET':
      return {
        ...state,
        selectedAssets: state.selectedAssets.filter(a => a.id !== action.id),
      };
    
    case 'SET_SELECTED_TEMPLATE':
      return { ...state, selectedTemplate: action.template };
    
    case 'SET_ERROR':
      return { ...state, lastError: action.error };
    
    case 'SET_CLIENT_ID':
      return { ...state, clientId: action.clientId };
    
    case 'RESET_WORKFLOW':
      return { ...initialState, clientId: state.clientId };
    
    default:
      return state;
  }
}

// Context
const WorkflowContext = createContext<WorkflowContext | null>(null);

// Provider component
interface WorkflowProviderProps {
  children: ReactNode;
}

export const WorkflowProvider: React.FC<WorkflowProviderProps> = ({
  children,
}) => {
  const { activeClient } = useClient();
  const [state, dispatch] = useReducer(workflowReducer, {
    ...initialState,
    clientId: activeClient?.id || null,
  });

  const { showNotification } = useNotification();
  const { makeCSRFRequest } = useCSRF();

  // Navigation actions
  const nextStep = useCallback(() => {
    if (state.currentStep < 6) { // 7 steps total (0-6)
      dispatch({ type: 'SET_STEP', step: state.currentStep + 1 });
    }
  }, [state.currentStep]);

  const previousStep = useCallback(() => {
    if (state.currentStep > 0) {
      dispatch({ type: 'SET_STEP', step: state.currentStep - 1 });
    }
  }, [state.currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step <= 6) {
      dispatch({ type: 'SET_STEP', step });
    }
  }, []);

  // Brief handling actions
  const uploadBrief = useCallback(async (file: File) => {
    dispatch({ type: 'SET_PROCESSING', processing: true });
    dispatch({ type: 'SET_UPLOADED_FILE', file });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await makeCSRFRequest('/api/flow/parse-brief', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        dispatch({
          type: 'SET_BRIEF_DATA',
          briefData: result.data,
          originalBriefData: result.data,
        });
        dispatch({ type: 'SET_SHOW_BRIEF_REVIEW', show: true });
        showNotification('Brief processed successfully! Please review and edit the parsed content.', 'success');
      } else {
        throw new Error(result.message || 'Failed to parse brief');
      }
    } catch (error) {
      console.error('Error processing brief:', error);
      dispatch({ type: 'SET_UPLOADED_FILE', file: null });
      const errorMessage = error instanceof Error ? error.message : 'Failed to process brief';
      dispatch({ type: 'SET_ERROR', error: errorMessage });
      showNotification(errorMessage, 'error');
    } finally {
      dispatch({ type: 'SET_PROCESSING', processing: false });
    }
  }, [makeCSRFRequest, showNotification]);

  const confirmBrief = useCallback((briefData: BriefData) => {
    dispatch({ type: 'SET_BRIEF_DATA', briefData, originalBriefData: state.originalBriefData! });
    dispatch({ type: 'SET_BRIEF_CONFIRMED', confirmed: true });
    dispatch({ type: 'SET_SHOW_BRIEF_REVIEW', show: false });
    nextStep();
  }, [state.originalBriefData, nextStep]);

  const resetBrief = useCallback(() => {
    if (state.originalBriefData) {
      dispatch({
        type: 'SET_BRIEF_DATA',
        briefData: state.originalBriefData,
        originalBriefData: state.originalBriefData,
      });
    }
  }, [state.originalBriefData]);

  // Motivation actions
  const generateMotivations = useCallback(async () => {
    if (!state.briefData) {
      showNotification('Brief data is required to generate motivations', 'error');
      return;
    }

    dispatch({ type: 'SET_PROCESSING', processing: true });

    try {
      // Pre-flight cost check
      const estimatedTokens = estimateTokensForMotivations(state.briefData);
      const costCheck = await fetch('/api/ai/cost-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: 'openai',
          model: 'gpt-4o-mini',
          estimatedTokens,
          operation: 'generate-motivations'
        })
      });

      const { allowed, reason, fallbackModel, budgetRemaining } = await costCheck.json();

      if (!allowed) {
        throw new Error(`Budget limit reached: ${reason}`);
      }

      if (fallbackModel) {
        showNotification(`Using ${fallbackModel} to stay within budget ($${budgetRemaining?.toFixed(2)} remaining)`, 'info');
      }

      const response = await makeCSRFRequest('/api/flow/generate-motivations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          briefData: state.briefData,
          model: fallbackModel || 'gpt-4o-mini',
          budgetAware: true
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to generate motivations`);
      }

      const result = await response.json();

      if (result.success) {
        const motivationsWithSelection = result.data.map((motivation: any) => ({
          ...motivation,
          selected: false
        }));

        dispatch({ type: 'SET_MOTIVATIONS', motivations: motivationsWithSelection });
        showNotification(`Generated ${result.data.length} motivations!`, 'success');
      } else {
        throw new Error(result.message || 'Failed to generate motivations');
      }
    } catch (error) {
      console.error('Error generating motivations:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate motivations. Please try again.';
      dispatch({ type: 'SET_ERROR', error: errorMessage });
      showNotification(errorMessage, 'error');
    } finally {
      dispatch({ type: 'SET_PROCESSING', processing: false });
    }
  }, [state.briefData, makeCSRFRequest, showNotification]);

  const selectMotivation = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_MOTIVATION', id });
  }, []);

  // Copy generation actions
  const generateCopy = useCallback(async () => {
    if (!state.briefData) {
      showNotification('Brief data is required to generate copy', 'error');
      return;
    }

    const selectedMotivations = state.motivations.filter(m => m.selected);
    if (selectedMotivations.length < 1) {
      showNotification('Minimum 1 motivation required to generate copy', 'error');
      return;
    }

    dispatch({ type: 'SET_PROCESSING', processing: true });

    try {
      // Pre-flight cost check for copy generation
      const estimatedTokens = estimateTokensForCopy(selectedMotivations, state.briefData);
      const costCheck = await fetch('/api/ai/cost-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: 'openai',
          model: 'gpt-4o-mini',
          estimatedTokens,
          operation: 'generate-copy',
          operationData: {
            motivations: selectedMotivations,
            briefData: state.briefData,
            platforms: state.briefData.platforms
          }
        })
      });

      const { allowed, reason, fallbackModel, budgetRemaining, usageStats } = await costCheck.json();

      if (!allowed) {
        throw new Error(`Budget limit reached: ${reason}`);
      }

      if (fallbackModel) {
        showNotification(`Using ${fallbackModel} to stay within budget`, 'info');
      }

      // Show usage stats if approaching budget limit
      if (usageStats && usageStats.percentOfBudget > 80) {
        showNotification(`AI usage at ${usageStats.percentOfBudget.toFixed(1)}% of monthly budget`, 'warning');
      }

      const response = await makeCSRFRequest('/api/flow/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          motivations: selectedMotivations,
          briefData: state.briefData,
          model: fallbackModel || 'gpt-4o-mini',
          budgetAware: true
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to generate copy`);
      }

      const result = await response.json();

      if (result.success) {
        const copyWithSelection = result.data.map((copy: any) => ({
          ...copy,
          selected: false
        }));

        dispatch({ type: 'SET_COPY_VARIATIONS', copyVariations: copyWithSelection });
        showNotification(`Generated ${result.data.length} copy variations!`, 'success');
      } else {
        throw new Error(result.message || 'Failed to generate copy');
      }
    } catch (error) {
      console.error('Error generating copy:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate copy. Please try again.';
      dispatch({ type: 'SET_ERROR', error: errorMessage });
      showNotification(errorMessage, 'error');
    } finally {
      dispatch({ type: 'SET_PROCESSING', processing: false });
    }
  }, [state.briefData, state.motivations, makeCSRFRequest, showNotification]);

  const selectCopy = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_COPY', id });
  }, []);

  // Store selected copy variations
  const storeCopyVariations = useCallback(async (selectedCopy: CopyVariation[]) => {
    try {
      const response = await makeCSRFRequest('/api/flow/store-copy-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedCopy,
          briefTitle: state.briefData?.title || 'Untitled Brief',
          clientId: activeClient?.id || 'default-client'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to store copy assets');
      }

      const result = await response.json();

      if (result.success) {
        showNotification(`${result.data.count} copy variations stored in assets library!`, 'success');
        return result;
      } else {
        throw new Error(result.message || 'Failed to store copy assets');
      }
    } catch (error) {
      console.error('Error storing copy assets:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to store copy assets';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      throw error;
    }
  }, [makeCSRFRequest, state.briefData, activeClient, showNotification]);

  // Asset actions
  const selectAsset = useCallback((asset: Asset) => {
    dispatch({ type: 'ADD_ASSET', asset });
  }, []);

  const removeAsset = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ASSET', id });
  }, []);

  // Template actions
  const selectTemplate = useCallback((template: Template) => {
    dispatch({ type: 'SET_SELECTED_TEMPLATE', template });
  }, []);

  // Error handling
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', error: null });
  }, []);

  const setError = useCallback((error: string) => {
    dispatch({ type: 'SET_ERROR', error });
  }, []);

  // Reset workflow
  const resetWorkflow = useCallback(() => {
    dispatch({ type: 'RESET_WORKFLOW' });
  }, []);

  const actions: WorkflowActions = {
    nextStep,
    previousStep,
    goToStep,
    uploadBrief,
    confirmBrief,
    resetBrief,
    generateMotivations,
    selectMotivation,
    generateCopy,
    selectCopy,
    storeCopyVariations,
    selectAsset,
    removeAsset,
    selectTemplate,
    clearError,
    setError,
    resetWorkflow,
  };

  const contextValue: WorkflowContext = {
    state,
    actions,
  };

  return (
    <WorkflowContext.Provider value={contextValue}>
      {children}
    </WorkflowContext.Provider>
  );
};

// Hook to use workflow context
export const useWorkflow = (): WorkflowContext => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};
