import React, { createContext, useContext, useReducer, useCallback, useMemo, ReactNode } from 'react';
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
import { WorkflowErrorBoundary } from './ErrorBoundary';
import { performanceTracker } from '@/lib/performance/performance-tracker';
import {
  validateFile,
  validateBriefData,
  validateMotivations,
  validateCopyVariations,
  sanitizeApiResponse
} from '@/lib/validation/workflow-validation';
import { aiRateLimiter } from '@/lib/rate-limiting/ai-rate-limiter';
import { aiResponseCache } from '@/lib/caching/ai-response-cache';
import { aiCircuitBreaker } from '@/lib/circuit-breaker/ai-circuit-breaker';
import { workflowMetrics } from '@/lib/monitoring/workflow-metrics';

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
        motivations: state?.motivations?.map(m =>
          m.id === action.id ? { ...m, selected: !m.selected } : m
        ),
      };
    
    case 'SET_COPY_VARIATIONS':
      return { ...state, copyVariations: action.copyVariations };
    
    case 'TOGGLE_COPY':
      return {
        ...state,
        copyVariations: state?.copyVariations?.map(c =>
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
        selectedAssets: state?.selectedAssets?.filter(a => a.id !== action.id),
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
const WorkflowContextProvider = createContext<WorkflowContext | null>(null);

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

  // Use centralized performance tracker

  // Generate session ID for metrics tracking
  const sessionId = useMemo(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Get client info for metrics
  const { activeClient } = useClient();
  const userId = activeClient?.id || 'anonymous';

  // Navigation actions
  const nextStep = useCallback(() => {
    if (state.currentStep < 6) { // 7 steps total (0-6)
      const currentStepName = workflowSteps[state.currentStep]?.id || 'unknown';
      const nextStepName = workflowSteps[state.currentStep + 1]?.id || 'unknown';

      // Track step completion
      workflowMetrics.trackStepCompletion(userId, sessionId, currentStepName, true);

      dispatch({ type: 'SET_STEP', step: state.currentStep + 1 });

      // Track next step start
      workflowMetrics.trackStepStart(userId, sessionId, nextStepName);
    }
  }, [state.currentStep, sessionId, userId]);

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

  // Enhanced error handling wrapper
  const withErrorHandling = useCallback(
    <T,>(
      operation: () => Promise<T>,
      context: string,
      fallback?: () => void
    ) => {
      return async (): Promise<T | null> => {
      try {
        dispatch({ type: 'SET_ERROR', error: null }); // Clear previous errors
        const result = await operation();
        return result;
      } catch (error) {
        console.error(`[Workflow Error] ${context}:`, error);

        // Categorize and handle error
        let errorMessage = 'An unexpected error occurred';
        let recoverable = true;

        if (error instanceof Error) {
          if (error.message.includes('budget') || error.message.includes('cost')) {
            errorMessage = 'AI operation blocked due to budget limits. Please try with a smaller request or upgrade your plan.';
            recoverable = false;
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = 'Network error. Please check your connection and try again.';
            recoverable = true;
          } else if (error.message.includes('validation') || error.message.includes('invalid')) {
            errorMessage = 'Invalid input data. Please check your entries and try again.';
            recoverable = false;
          } else {
            errorMessage = error.message;
          }
        }

        dispatch({ type: 'SET_ERROR', error: errorMessage });
        showNotification(errorMessage, 'error');

        // Execute fallback if provided and error is not recoverable
        if (!recoverable && fallback) {
          fallback();
        }

        return null;
      }
    };
  }, [showNotification]);

  // Brief handling actions with enhanced error handling and performance tracking
  const uploadBrief = useCallback(async (file: File) => {
    performanceTracker.start('workflow_upload_brief');

    try {
      // Validate file before processing
      const fileValidation = validateFile(file);
      if (!fileValidation.valid) {
        throw new Error(`File validation failed: ${fileValidation.errors.join(', ')}`);
      }

      dispatch({ type: 'SET_PROCESSING', processing: true });
      dispatch({ type: 'SET_UPLOADED_FILE', file });

      const briefOperation = async () => {
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
          // Validate and sanitize the parsed brief data
          const briefValidation = validateBriefData(result.data);
          if (!briefValidation.valid) {
            throw new Error(`Brief data validation failed: ${briefValidation.errors.join(', ')}`);
          }

          dispatch({
            type: 'SET_BRIEF_DATA',
            briefData: briefValidation.data,
            originalBriefData: briefValidation.data,
          });
          dispatch({ type: 'SET_SHOW_BRIEF_REVIEW', show: true });
          showNotification('Brief processed successfully! Please review and edit the parsed content.', 'success');

          // Track successful brief upload
          console.log('✅ Brief upload successful');

          return result.data;
        } else {
          throw new Error(result.message || 'Failed to parse brief');
        }
      };

      const fallback = () => {
        dispatch({ type: 'SET_UPLOADED_FILE', file: null });
        console.log('⚠️ Brief upload fallback triggered');
      };

      const result = await withErrorHandling(briefOperation, 'Brief Upload', fallback)();
      return result;
    } finally {
      dispatch({ type: 'SET_PROCESSING', processing: false });
      performanceTracker.end('workflow_upload_brief');
    }
  }, [makeCSRFRequest, showNotification, withErrorHandling, performanceTracker]);

  const confirmBrief = useCallback((briefData: BriefData) => {
    // Validate brief data before confirming
    const briefValidation = validateBriefData(briefData);
    if (!briefValidation.valid) {
      showNotification(`Brief validation failed: ${briefValidation.errors.join(', ')}`, 'error');
      return;
    }

    dispatch({ type: 'SET_BRIEF_DATA', briefData: briefValidation.data, originalBriefData: state.originalBriefData! });
    dispatch({ type: 'SET_BRIEF_CONFIRMED', confirmed: true });
    dispatch({ type: 'SET_SHOW_BRIEF_REVIEW', show: false });
    nextStep();
  }, [state.originalBriefData, nextStep, showNotification]);

  const resetBrief = useCallback(() => {
    if (state.originalBriefData) {
      dispatch({
        type: 'SET_BRIEF_DATA',
        briefData: state.originalBriefData,
        originalBriefData: state.originalBriefData,
      });
    }
  }, [state.originalBriefData]);

  // Motivation actions with enhanced error handling and performance tracking
  const generateMotivations = useCallback(async () => {
    if (!state.briefData) {
      showNotification('Brief data is required to generate motivations', 'error');
      return;
    }

    // Check rate limit before proceeding
    const rateLimitCheck = await aiRateLimiter.checkLimit(userId, 'generate-motivations');

    if (!rateLimitCheck.allowed) {
      showNotification(
        `Rate limit exceeded. Please wait ${Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000)} seconds before trying again.`,
        'warning'
      );
      return;
    }

    performanceTracker.start('workflow_generate_motivations');

    try {
      dispatch({ type: 'SET_PROCESSING', processing: true });

      const motivationOperation = async () => {
        const operationStartTime = Date.now();

        // Check cache first
        const cacheKey = { briefData: state.briefData, operation: 'generate-motivations' };
        const cachedMotivations = await aiResponseCache.get('generate-motivations', cacheKey);

        if (cachedMotivations) {
          console.log('🎯 Using cached motivations');
          return cachedMotivations;
        }

        // Pre-flight cost check
        const estimatedTokens = estimateTokensForMotivations(state.briefData!);
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
          console.warn('🚫 Motivation generation blocked by budget');
          throw new Error(`Budget limit reached: ${reason}`);
        }

        if (fallbackModel) {
          showNotification(`Using ${fallbackModel} to stay within budget ($${budgetRemaining?.toFixed(2)} remaining)`, 'info');
          console.log(`🔄 Using fallback model: ${fallbackModel}`);
        }

        // Execute with circuit breaker protection
        const response = await aiCircuitBreaker.execute(
          'openai',
          'generate-motivations',
          async () => {
            return await makeCSRFRequest('/api/flow/generate-motivations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                briefData: state.briefData,
                model: fallbackModel || 'gpt-4o-mini',
                budgetAware: true
              }),
            });
          },
          async () => {
            // Fallback: provide generic motivations
            console.log('🔄 Using fallback motivations due to service unavailability');
            return new Response(JSON.stringify({
              success: true,
              data: [
                {
                  id: 'fallback-1',
                  title: 'Brand Awareness',
                  description: 'Increase brand recognition and visibility in the target market',
                  score: 0.8
                },
                {
                  id: 'fallback-2',
                  title: 'Customer Engagement',
                  description: 'Drive meaningful interactions with potential customers',
                  score: 0.7
                }
              ]
            }), { status: 200 });
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to generate motivations`);
        }

        const result = await response.json();

        if (result.success) {
          const motivationsWithSelection = result.data.map((motivation: any) => ({
            ...motivation,
            selected: false
          }));

          // Validate motivations before storing
          const motivationValidation = validateMotivations(motivationsWithSelection);
          if (!motivationValidation.valid) {
            throw new Error(`Motivation validation failed: ${motivationValidation.errors.join(', ')}`);
          }

          dispatch({ type: 'SET_MOTIVATIONS', motivations: motivationValidation.data });
          showNotification(`Generated ${result.data.length} motivations!`, 'success');

          // Cache the result for future use
          await aiResponseCache.set('generate-motivations', cacheKey, result.data);

          // Track AI operation metrics
          await workflowMetrics.trackAIOperation(
            userId,
            sessionId,
            'generate-motivations',
            'openai',
            fallbackModel || 'gpt-4o-mini',
            estimatedTokens,
            0, // Cost would be calculated from actual usage
            Date.now() - operationStartTime,
            true
          );

          // Track successful motivation generation
          console.log(`✅ Generated ${result.data.length} motivations`);

          return result.data;
        } else {
          throw new Error(result.message || 'Failed to generate motivations');
        }
      };

      const fallback = () => {
        // Provide manual motivation entry option
        showNotification('You can manually enter motivations or try again later', 'info');
        console.log('⚠️ Motivation generation fallback triggered');
      };

      const result = await withErrorHandling(motivationOperation, 'Motivation Generation', fallback)();
      return result;
    } finally {
      dispatch({ type: 'SET_PROCESSING', processing: false });
      performanceTracker.end('workflow_generate_motivations');
    }
  }, [state.briefData, makeCSRFRequest, showNotification, withErrorHandling, sessionId, userId]);

  const selectMotivation = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_MOTIVATION', id });
  }, []);

  // Copy generation actions
  const generateCopy = useCallback(async () => {
    if (!state.briefData) {
      showNotification('Brief data is required to generate copy', 'error');
      return;
    }

    const selectedMotivations = state?.motivations?.filter(m => m.selected);
    if (selectedMotivations.length < 1) {
      showNotification('Minimum 1 motivation required to generate copy', 'error');
      return;
    }

    // Check rate limit before proceeding
    const rateLimitCheck = await aiRateLimiter.checkLimit(userId, 'generate-copy');

    if (!rateLimitCheck.allowed) {
      showNotification(
        `Rate limit exceeded. Please wait ${Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000)} seconds before trying again.`,
        'warning'
      );
      return;
    }

    dispatch({ type: 'SET_PROCESSING', processing: true });

    try {
      // Check cache first
      const cacheKey = {
        motivations: selectedMotivations,
        briefData: state.briefData,
        operation: 'generate-copy'
      };
      const cachedCopy = await aiResponseCache.get('generate-copy', cacheKey);

      if (cachedCopy) {
        console.log('🎯 Using cached copy variations');
        const copyWithSelection = cachedCopy.map((copy: any) => ({
          ...copy,
          selected: false
        }));

        const copyValidation = validateCopyVariations(copyWithSelection);
        if (copyValidation.valid) {
          dispatch({ type: 'SET_COPY_VARIATIONS', copyVariations: copyValidation.data });
          showNotification(`Loaded ${cachedCopy.length} cached copy variations!`, 'success');
          return;
        }
      }

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
            platforms: state?.briefData?.platforms
          }
        })
      });

      const { allowed, reason, fallbackModel, usageStats } = await costCheck.json();

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

      // Execute with circuit breaker protection
      const response = await aiCircuitBreaker.execute(
        'openai',
        'generate-copy',
        async () => {
          return await makeCSRFRequest('/api/flow/generate-copy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              motivations: selectedMotivations,
              briefData: state.briefData,
              model: fallbackModel || 'gpt-4o-mini',
              budgetAware: true
            }),
          });
        },
        async () => {
          // Fallback: provide generic copy variations
          console.log('🔄 Using fallback copy due to service unavailability');
          return new Response(JSON.stringify({
            success: true,
            data: [
              {
                id: 'fallback-copy-1',
                text: 'Discover the difference with our innovative solution',
                platform: 'general',
                motivation: selectedMotivations[0]?.title || 'Brand Awareness'
              },
              {
                id: 'fallback-copy-2',
                text: 'Transform your experience today',
                platform: 'general',
                motivation: selectedMotivations[0]?.title || 'Customer Engagement'
              }
            ]
          }), { status: 200 });
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to generate copy`);
      }

      const result = await response.json();

      if (result.success) {
        const copyWithSelection = result.data.map((copy: any) => ({
          ...copy,
          selected: false
        }));

        // Validate copy variations before storing
        const copyValidation = validateCopyVariations(copyWithSelection);
        if (!copyValidation.valid) {
          throw new Error(`Copy validation failed: ${copyValidation.errors.join(', ')}`);
        }

        dispatch({ type: 'SET_COPY_VARIATIONS', copyVariations: copyValidation.data });
        showNotification(`Generated ${result.data.length} copy variations!`, 'success');

        // Cache the result for future use
        await aiResponseCache.set('generate-copy', cacheKey, result.data);
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
  }, [state.briefData, state.motivations, makeCSRFRequest, showNotification, userId]);

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
  }, [makeCSRFRequest, state.briefData, activeClient, showNotification, setError]);

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

  // Memoize actions object to prevent unnecessary re-renders
  const actions: WorkflowActions = useMemo(() => ({
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
  }), [
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
  ]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue: WorkflowContext = useMemo(() => ({
    state,
    actions,
  }), [state, actions]);

  return (
    <WorkflowErrorBoundary context="WorkflowProvider" showDetails={process.env.NODE_ENV === 'development'}>
      <WorkflowContextProvider.Provider value={contextValue}>
        {children}
      </WorkflowContextProvider.Provider>
    </WorkflowErrorBoundary>
  );
};

// Hook to use workflow context
export const useWorkflow = (): WorkflowContext => {
  const context = useContext(WorkflowContextProvider);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};
