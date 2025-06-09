import React, { useState, useCallback } from 'react';
import {
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { useNotification } from '@/contexts/NotificationContext';
import { briefWorkflowSteps } from './SmartProgressIndicator';
import { MobileOptimizedWorkflow } from './MobileOptimizedWorkflow';

// Tailwind CSS Icon Components
const CloudUploadIcon = ({ className = "w-12 h-12 text-blue-500 mb-2" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
  </svg>
);

const AutoAwesomeGenIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L14 12l-2.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z" />
  </svg>
);

const CheckCircleTailwindIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

const ArrowForwardTailwindIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
  </svg>
);

const AddIconSvg = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);

const ClearIconSvg = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

const CloseIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

const SendIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

const VideoLibraryIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" />
  </svg>
);

const AutoAwesomeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L14 12l-2.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z" />
  </svg>
);


interface WorkflowStep {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

interface BriefData {
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

interface Motivation {
  id: string;
  title: string;
  description: string;
  score: number;
  selected: boolean;
}

interface CopyVariation {
  id: string;
  text: string;
  platform: string;
  selected: boolean;
}

interface UnifiedBriefWorkflowProps {
  open: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
}

export const UnifiedBriefWorkflow: React.FC<UnifiedBriefWorkflowProps> = ({
  open,
  onClose,
  onComplete,
}) => {
  // For mobile detection, we'll use a simple window width check
  const [isMobile, setIsMobile] = useState(false);
  
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // State management with better error handling
  const [activeStep, setActiveStep] = useState(0);
  const [briefData, setBriefData] = useState<BriefData | null>(null);
  const [originalBriefData, setOriginalBriefData] = useState<BriefData | null>(null);
  const [motivations, setMotivations] = useState<Motivation[]>([]);
  const [copyVariations, setCopyVariations] = useState<CopyVariation[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showBriefReview, setShowBriefReview] = useState(false);
  const [briefConfirmed, setBriefConfirmed] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const { showNotification } = useNotification();

  // Define handleProcessBrief first
  const handleProcessBrief = useCallback(async (file: File) => {
            setProcessing(true);
    
    // Helper function to make API call with retry
    const makeAPICall = async (retryCount = 0): Promise<any> => {
      try {
        // Create FormData to send file to API
        const formData = new FormData();
        formData.append('file', file);

        console.log(`Sending file to API... (attempt ${retryCount + 1})`);
        console.log('FormData contents:', formData.get('file'));
        
        const response = await fetch('/api/flow/parse-brief', {
          method: 'POST',
          body: formData,
          credentials: 'include',
          headers: {
            // Don't set Content-Type header - let browser set it for FormData
          }
        });
        
                if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
                return result;
        
      } catch (error) {
        console.error(`API call failed (attempt ${retryCount + 1}):`, error);
        
        // Retry up to 2 times for network errors
        if (retryCount < 2 && (error instanceof TypeError || error.message.includes('Failed to fetch'))) {
          console.log(`Retrying in 1 second... (attempt ${retryCount + 2})`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return makeAPICall(retryCount + 1);
        }
        
        throw error;
      }
    };
    
    try {
      const result = await makeAPICall();
      
      if (result.success) {
                setBriefData(result.data);
        setOriginalBriefData(result.data);
        setProcessing(false);
        setShowBriefReview(true);
        showNotification('Brief processed successfully! Please review and edit the parsed content.', 'success');
                // Don't change activeStep until user confirms the brief
      } else {
        throw new Error(result.message || 'Failed to parse brief');
      }
    } catch (error) {
      console.error('Error processing brief:', error);
      setProcessing(false);
      // Reset upload state on error so user can try again
      setUploadedFile(null);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process brief';
      setLastError(errorMessage);
      showNotification(errorMessage, 'error');
    }
  }, [showNotification]); // activeStep removed from dependency array

  // Dropzone configuration - defined after handleProcessBrief
  const onDrop = useCallback((acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
            setUploadedFile(file);
      setProcessing(true); // Set processing immediately to prevent UI flash
      handleProcessBrief(file);
    }
  }, [activeStep, open, handleProcessBrief]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024,
  });

  // Reset workflow state when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      // Only reset state when dialog closes, and add a delay to prevent race conditions
      setTimeout(() => {
                setActiveStep(0);
        setBriefData(null);
        setOriginalBriefData(null);
        setMotivations([]);
        setCopyVariations([]);
        setSelectedAssets([]);
        setSelectedTemplate(null);
        setProcessing(false);
        setUploadedFile(null);
        setShowBriefReview(false);
        setBriefConfirmed(false);
      }, 100);
    } else {
          }
  }, [open]);

  // Debug effect to track activeStep changes
  React.useEffect(() => {
      }, [activeStep]);

  // Debug effect to track open state changes
  React.useEffect(() => {
      }, [open]);

  // Return mobile version for mobile devices
  if (isMobile) {
    return (
      <MobileOptimizedWorkflow
        open={open}
        onClose={onClose}
        onComplete={onComplete}
      />
    );
  }
  


  // Step 2: Generate Motivations
  const handleGenerateMotivations = async () => {
    if (!briefData) {
      showNotification('Brief data is required to generate motivations', 'error');
      return;
    }

        setProcessing(true);
    
    try {
      const response = await fetch('/api/flow/generate-motivations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ briefData }),
        credentials: 'include',
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
        
                setMotivations(motivationsWithSelection);
        setProcessing(false);
        showNotification(`Generated ${result.data.length} motivations!`, 'success');
      } else {
        throw new Error(result.message || 'Failed to generate motivations');
      }
    } catch (error) {
      console.error('Error generating motivations:', error);
      setProcessing(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate motivations. Please try again.';
      setLastError(errorMessage);
      showNotification(errorMessage, 'error');
      // Don't reset the step on error, keep user where they are
    }
  };

  const handleSelectMotivation = (id: string) => {
    setMotivations(motivations.map(m => 
      m.id === id ? { ...m, selected: !m.selected } : m
    ));
  };

  const handleNextFromMotivations = () => {
    const selectedCount = motivations.filter(m => m.selected).length;
    if (selectedCount < 1) {
      showNotification('Please select at least 1 motivation to continue', 'warning');
      return;
    }
        // Ensure we're not in a processing state when transitioning
    if (!processing) {
      setActiveStep(2);
      // Add a small delay to ensure state is updated before generating copy
      setTimeout(() => {
        if (!processing) {
          handleGenerateCopy();
        }
      }, 100);
    }
  };

  // Step 3: Generate Copy
  const handleGenerateCopy = async () => {
    if (!briefData) {
      showNotification('Brief data is required to generate copy', 'error');
      return;
    }

    const selectedMotivations = motivations.filter(m => m.selected);
    if (selectedMotivations.length < 1) { // Changed from 6 to 1 for easier testing
      showNotification('Minimum 1 motivation required to generate copy', 'error');
      return;
    }

        setProcessing(true);
    
    try {
      const response = await fetch('/api/flow/generate-copy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          motivations: selectedMotivations, 
          briefData 
        }),
        credentials: 'include',
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
        
                setCopyVariations(copyWithSelection);
        setProcessing(false);
        showNotification(`Generated ${result.data.length} copy variations!`, 'success');
      } else {
        throw new Error(result.message || 'Failed to generate copy');
      }
    } catch (error) {
      console.error('Error generating copy:', error);
      setProcessing(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate copy. Please try again.';
      setLastError(errorMessage);
      showNotification(errorMessage, 'error');
      // Don't reset the step on error, keep user where they are
    }
  };

  const handleSelectCopy = (id: string) => {
    setCopyVariations(copyVariations.map(c => 
      c.id === id ? { ...c, selected: !c.selected } : c
    ));
  };

  const handleNextFromCopy = async () => {
    const selectedCopy = copyVariations.filter(c => c.selected);
    if (selectedCopy.length === 0) {
      showNotification('Please select at least one copy variation', 'warning');
      return;
    }

    setProcessing(true);

    try {
      // Store selected copy variations in assets library
      const response = await fetch('/api/flow/store-copy-assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedCopy,
          briefTitle: briefData?.title || 'Untitled Brief',
          clientId: 'default-client' // TODO: Get actual client ID from context
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to store copy assets');
      }

      const result = await response.json();
      
      if (result.success) {
        setProcessing(false);
        showNotification(`${result.data.count} copy variations stored in assets library!`, 'success');
        setActiveStep(3);
      } else {
        throw new Error(result.message || 'Failed to store copy assets');
      }
    } catch (error) {
      console.error('Error storing copy assets:', error);
      setProcessing(false);
      showNotification(error instanceof Error ? error.message : 'Failed to store copy assets', 'error');
    }
  };

  // Navigation helpers
  const handleNext = () => {
    if (activeStep < briefWorkflowSteps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      // If we're going back to step 0 and brief is confirmed, 
      // show the brief review instead of upload interface
      if (activeStep === 1 && briefConfirmed) {
        setShowBriefReview(true);
        setBriefConfirmed(false);
      }
      setActiveStep(activeStep - 1);
    }
  };

  const handleComplete = () => {
    const workflowData = {
      brief: briefData,
      motivations: motivations.filter(m => m.selected),
      copy: copyVariations.filter(c => c.selected),
      assets: selectedAssets,
      template: selectedTemplate,
    };
    
    onComplete(workflowData);
    showNotification('Workflow completed! Ready for rendering.', 'success');
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Upload Brief
        return (
          <div className="w-full">
            {!uploadedFile && !briefConfirmed && !processing && !briefData ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed ${isDragActive ? 'border-blue-500' : 'border-gray-300'} 
                  rounded-lg p-8 text-center cursor-pointer 
                  ${isDragActive ? 'bg-blue-50' : 'bg-white'} 
                  transition-all duration-200 hover:border-blue-500 hover:bg-blue-50`}
              >
                <input {...getInputProps()} />
                <CloudUploadIcon className="w-16 h-16 text-blue-500 mb-4 mx-auto" />
                <h3 className="text-xl font-semibold mb-2">
                  {isDragActive ? 'Drop your brief here' : 'Drag & drop your brief document'}
                </h3>
                <p className="text-sm text-gray-500">
                  Supports: PDF, Word (.docx), Text (.txt) • Max 10MB
                </p>
              </div>
            ) : briefConfirmed ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
                <CheckCircleTailwindIcon className="w-6 h-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Brief Confirmed!</h3>
                  <p className="text-sm text-green-700">
                    {briefData?.title} - Brief has been confirmed and you can proceed to motivations step.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                {processing ? (
                  <div className="text-center py-6">
                    <div className="h-1 w-full bg-gray-200 rounded overflow-hidden mb-4">
                      <div className="h-full bg-blue-500 animate-pulse" style={{ width: '100%' }}></div>
                    </div>
                    <p className="text-gray-700">Processing brief with AI...</p>
                  </div>
                ) : briefData && showBriefReview ? (
                  <BriefReviewEditor
                    briefData={briefData}
                    onUpdate={setBriefData}
                    onProceed={() => {
                                                                                        // Ensure brief data is valid before proceeding
                      if (!briefData || !briefData.title) {
                        showNotification('Brief data is invalid. Please try uploading again.', 'error');
                        return;
                      }
                      
                      // Set brief as confirmed and hide review editor
                      setBriefConfirmed(true);
                      setShowBriefReview(false);
                      
                      // Force state update before proceeding
                      setTimeout(() => {
                                                setActiveStep(1);
                        showNotification('Brief confirmed! Ready to generate motivations.', 'success');
                        
                        // Auto-trigger motivation generation after state update
                        setTimeout(() => {
                          if (motivations.length === 0 && !processing) {
                                                        handleGenerateMotivations();
                          }
                        }, 300);
                      }, 50);
                    }}
                    onReset={() => {
                      if (originalBriefData) {
                        setBriefData(originalBriefData);
                        showNotification('Brief data reset to original parsed values', 'info');
                      }
                    }}
                  />
                ) : briefData ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
                    <CheckCircleTailwindIcon className="w-6 h-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-green-800">Brief Ready!</h3>
                      <p className="text-sm text-green-700">
                        {briefData.title} - Click "Generate Strategic Motivations" to continue
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        );

      case 1: // Generate Motivations
        return (
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-2">Step 2: Generate Strategic Motivations</h2>
            <p className="text-gray-600 mb-4">
              Generate AI-powered strategic motivations based on your brief content.
            </p>
            {motivations.length === 0 ? (
              <div className="text-center py-6">
                <button
                  className={`flex items-center justify-center mx-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm transition-colors ${processing ? 'opacity-70 cursor-not-allowed' : ''}`}
                  onClick={handleGenerateMotivations}
                  disabled={processing}
                >
                  <AutoAwesomeGenIcon className="mr-2" />
                  <span>{processing ? 'Generating...' : 'Generate Strategic Motivations'}</span>
                </button>
                {processing && <div className="mt-4 w-full h-1 bg-gray-200 rounded overflow-hidden"><div className="h-full bg-blue-600 animate-pulse" style={{width: '100%'}}></div></div>}
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold mb-3">Select Strategic Motivations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {motivations.map((motivation) => (
                    <div key={motivation.id} 
                      className={`border rounded-lg cursor-pointer transition-all hover:shadow-md ${motivation.selected ? 'border-2 border-blue-500' : 'border-gray-200'}`}
                      onClick={() => handleSelectMotivation(motivation.id)}
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-lg font-medium">{motivation.title}</h4>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{motivation.score}%</span>
                        </div>
                        <p className="text-gray-600 mb-3">
                          {motivation.description}
                        </p>
                        <div className="flex items-center mt-2">
                          <input 
                            type="checkbox" 
                            checked={motivation.selected} 
                            onChange={() => handleSelectMotivation(motivation.id)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label className="ml-2 text-sm font-medium text-gray-700">Select this motivation</label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <button
                    className="inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm transition-colors"
                    onClick={handleNextFromMotivations}
                  >
                    <span>Generate Copy from Selected Motivations</span>
                    <ArrowForwardTailwindIcon className="ml-2" />
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 2: // Generate Copy
        return (
          <div className="w-full">
            {copyVariations.length === 0 && processing ? (
              <div className="text-center py-6">
                <div className="mb-4 w-full h-1 bg-gray-200 rounded overflow-hidden"><div className="h-full bg-blue-600 animate-pulse" style={{width: '100%'}}></div></div>
                <p className="text-gray-700">Generating copy variations...</p>
              </div>
            ) : copyVariations.length > 0 ? (
              <div>
                <h2 className="text-xl font-semibold mb-4">Select Copy Variations</h2>
                <div className="space-y-4">
                  {copyVariations.map((copy) => (
                    <div 
                      key={copy.id}
                      className={`border rounded-lg cursor-pointer transition-all hover:shadow-md ${copy.selected ? 'border-2 border-blue-500' : 'border-gray-200'}`}
                      onClick={() => handleSelectCopy(copy.id)}
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{copy.platform}</span>
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              checked={copy.selected} 
                              onChange={() => handleSelectCopy(copy.id)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label className="ml-2 text-sm font-medium text-gray-700">Select</label>
                          </div>
                        </div>
                        <p className="text-gray-800">{copy.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <button
                    className={`inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm transition-colors ${processing ? 'opacity-70 cursor-not-allowed' : ''}`}
                    onClick={handleNextFromCopy}
                    disabled={processing}
                  >
                    <span>{processing ? 'Storing in Assets Library...' : 'Store Copy & Continue'}</span>
                    <ArrowForwardTailwindIcon className="ml-2" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        );

      case 3: // Select Assets
        return (
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-4">Choose Your Assets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Use Existing Assets</h3>
                  <p className="text-gray-600 mb-4">
                    Select from your asset library
                  </p>
                  <button className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    Browse Asset Library
                  </button>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Generate New Assets</h3>
                  <p className="text-gray-600 mb-4">
                    Create AI-generated images and videos
                  </p>
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    <AutoAwesomeIcon className="w-5 h-5 mr-2" />
                    Generate Assets
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <button
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-lg rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={handleNext}
              >
                <span>Continue to Template Selection</span>
                <ArrowForwardTailwindIcon className="ml-2" />
              </button>
            </div>
          </div>
        );

      case 4: // Pick Template
        return (
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-4">Select Video Template</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Modern Slideshow', 'Dynamic Promo', 'Social Story', 'Product Showcase'].map((template, index) => (
                <div
                  key={template}
                  className={`bg-white border rounded-lg shadow-sm cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate === template 
                      ? 'border-2 border-blue-500' 
                      : 'border border-gray-200'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <VideoLibraryIcon className="w-8 h-8 text-blue-600" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{template}</h3>
                        <p className="text-sm text-gray-600">
                          Perfect for {briefData?.platforms.join(', ')} campaigns
                        </p>
                      </div>
                      {selectedTemplate === template && (
                        <CheckCircleTailwindIcon className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <button
                className={`inline-flex items-center px-6 py-3 bg-blue-600 text-white text-lg rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  !selectedTemplate ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={handleNext}
                disabled={!selectedTemplate}
              >
                <span>Configure Content Matrix</span>
                <ArrowForwardTailwindIcon className="ml-2" />
              </button>
            </div>
          </div>
        );

      case 5: // Populate Matrix
        return (
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-4">Content Matrix Configuration</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800">
                Your content matrix will be populated with the selected motivations, copy, and assets.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">Motivations</h3>
                  <p className="text-gray-600">
                    {motivations.filter(m => m.selected).length} selected
                  </p>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">Copy Variations</h3>
                  <p className="text-gray-600">
                    {copyVariations.filter(c => c.selected).length} selected
                  </p>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">Template</h3>
                  <p className="text-gray-600">
                    {selectedTemplate || 'None selected'}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <button
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-lg rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={handleNext}
              >
                <span>Ready for Rendering</span>
                <ArrowForwardTailwindIcon className="ml-2" />
              </button>
            </div>
          </div>
        );

      case 6: // Ready to Render
        return (
          <div className="w-full text-center py-8">
            <CheckCircleTailwindIcon className="w-16 h-16 text-green-500 mb-4 mx-auto" />
            <h1 className="text-3xl font-bold mb-4">Ready to Render!</h1>
            <p className="text-gray-600 mb-6">
              Your content is configured and ready to be sent to Creatomate for rendering.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 text-left max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-3">Summary:</h3>
              <div className="text-sm space-y-1">
                <p>• Brief: {briefData?.title}</p>
                <p>• Motivations: {motivations.filter(m => m.selected).length} selected</p>
                <p>• Copy: {copyVariations.filter(c => c.selected).length} variations</p>
                <p>• Template: {selectedTemplate}</p>
                <p>• Platforms: {briefData?.platforms.join(', ')}</p>
              </div>
            </div>
            <button
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-lg rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={handleComplete}
            >
              <SendIcon className="w-5 h-5 mr-2" />
              Send to Creatomate for Rendering
            </button>
          </div>
        );

      default:
        return (
          <div className="w-full text-center py-8">
            <h2 className="text-xl font-semibold mb-2">
              {briefWorkflowSteps[step]?.label}
            </h2>
            <p className="text-gray-600 mb-4">
              {briefWorkflowSteps[step]?.description}
            </p>
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={handleNext}
            >
              Continue to Next Step
            </button>
          </div>
        );
    }
  };

  const handleDialogClose = (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => {
    // Prevent closing during processing to avoid losing state
    if (processing) {
            return;
    }
    
    // Prevent accidental closure during brief editing or motivation generation
    if (reason === 'backdropClick' && (showBriefReview || motivations.length > 0 || copyVariations.length > 0)) {
            return;
    }
    
        onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleDialogClose} 
      maxWidth={false}
      fullWidth
      disableEscapeKeyDown={processing}
      PaperProps={{
        sx: {
          width: '95vw',
          maxWidth: '1400px',
          height: '90vh',
          maxHeight: '900px',
          margin: '2.5vh auto'
        }
      }}
    >
      <DialogTitle>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Brief to Execution Workflow</h1>
          <button
            onClick={() => {
              if (processing) {
                                return;
              }
              onClose();
            }}
            aria-label="Close dialog"
            disabled={processing}
            className={`p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 ${
              processing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
      </DialogTitle>
      
      <DialogContent sx={{ pb: 2 }}>
        <div className="mb-6">
          <Stepper activeStep={activeStep} orientation="horizontal">
            {briefWorkflowSteps.map((step, index) => (
              <Step key={step.id}>
                <StepLabel icon={step.icon}>
                  <span className="text-xs">{step.label}</span>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </div>

        <div className="min-h-96 w-full overflow-auto max-h-[70vh]">
          {lastError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-3 flex-shrink-0"></div>
                <div>
                  <h4 className="font-medium text-red-800">Error occurred</h4>
                  <p className="text-red-700 text-sm">{lastError}</p>
                  <button 
                    onClick={() => setLastError(null)}
                    className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}
          {renderStepContent(activeStep)}
        </div>
      </DialogContent>

      <DialogActions>
        <button
          onClick={handleBack}
          disabled={activeStep === 0}
          className={`px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            activeStep === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Back
        </button>
        {activeStep === briefWorkflowSteps.length - 1 ? (
          <button
            onClick={handleComplete}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Complete & Send to Render
          </button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
};

// Brief Review Editor Component
interface BriefReviewEditorProps {
  briefData: BriefData;
  onUpdate: (data: BriefData) => void;
  onProceed: () => void;
  onReset: () => void;
}

const BriefReviewEditor: React.FC<BriefReviewEditorProps> = ({
  briefData,
  onUpdate,
  onProceed,
  onReset,
}) => {
  const [editedData, setEditedData] = useState<BriefData>(briefData);

  // Sync state when briefData changes
  React.useEffect(() => {
    setEditedData(briefData);
  }, [briefData]);

  const handleFieldChange = (field: keyof BriefData, value: any) => {
    // Ensure value is properly formatted and not an object
    let cleanValue = value;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Convert object to string representation
      cleanValue = JSON.stringify(value);
      console.warn(`Field ${field} received object value, converting to string:`, cleanValue);
    }
    
    const updated = { ...editedData, [field]: cleanValue };
    setEditedData(updated);
    onUpdate(updated);
  };

  const handleArrayFieldChange = (field: keyof BriefData, index: number, value: string) => {
    const currentArray = editedData[field] as string[];
    const updated = [...currentArray];
    updated[index] = value;
    handleFieldChange(field, updated);
  };

  const handleAddArrayItem = (field: keyof BriefData) => {
    const currentArray = (editedData[field] as string[]) || [];
    handleFieldChange(field, [...currentArray, '']);
  };

  const handleRemoveArrayItem = (field: keyof BriefData, index: number) => {
    const currentArray = editedData[field] as string[];
    const updated = currentArray.filter((_, i) => i !== index);
    handleFieldChange(field, updated);
  };

  return (
    <div className="w-full p-6 bg-white">
      <div className="border-l-4 border-blue-500 pl-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Review & Edit Brief Content
        </h2>
        <p className="text-gray-600 text-lg">
          Please review the parsed content below and make any necessary adjustments before proceeding to generate motivations.
        </p>
      </div>
      
      <div className="space-y-8">
        {/* Basic Information Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            Basic Information
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Brief Title</label>
              <input
                type="text"
                className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                value={typeof editedData.title === 'string' ? editedData.title : String(editedData.title || '')}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="Enter your brief title..."
              />
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Industry</label>
                <input
                  type="text"
                  className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                  value={editedData.industry || ''}
                  onChange={(e) => handleFieldChange('industry', e.target.value)}
                  placeholder="e.g., Technology, Healthcare, Retail"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Product/Service</label>
                <input
                  type="text"
                  className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                  value={editedData.product || editedData.service || ''}
                  onChange={(e) => handleFieldChange('product', e.target.value)}
                  placeholder="Describe your product or service"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Objective</label>
              <textarea
                className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 resize-none"
                rows={6}
                value={typeof editedData.objective === 'string' ? editedData.objective : String(editedData.objective || '')}
                onChange={(e) => handleFieldChange('objective', e.target.value)}
                placeholder="Describe the main objective of your campaign..."
              />
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Target Audience</label>
                <textarea
                  className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 resize-none"
                  rows={6}
                  value={typeof editedData.targetAudience === 'string' ? editedData.targetAudience : String(editedData.targetAudience || '')}
                  onChange={(e) => handleFieldChange('targetAudience', e.target.value)}
                  placeholder="Describe your target audience in detail..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Value Proposition</label>
                <textarea
                  className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 resize-none"
                  rows={6}
                  value={typeof editedData.valueProposition === 'string' ? editedData.valueProposition || '' : String(editedData.valueProposition || '')}
                  onChange={(e) => handleFieldChange('valueProposition', e.target.value)}
                  placeholder="What unique value does your product/service offer?"
                />
              </div>
            </div>
          </div>
        </div>
          
        {/* Product & Service Details Section */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            Product & Service Details
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">Key Messages</label>
              <div className="space-y-3">
                {editedData.keyMessages.map((message, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <textarea
                      className="flex-1 px-4 py-3 text-base border-2 border-gray-200 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 resize-none"
                      placeholder={`Key Message ${index + 1}`}
                      value={message}
                      rows={3}
                      onChange={(e) => handleArrayFieldChange('keyMessages', index, e.target.value)}
                    />
                    <button
                      onClick={() => handleRemoveArrayItem('keyMessages', index)}
                      className="mt-2 p-2 rounded-lg text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      type="button"
                    >
                      <ClearIconSvg className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleAddArrayItem('keyMessages')}
                className="mt-4 flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
                type="button"
              >
                <AddIconSvg className="w-4 h-4 mr-2" />
                Add Key Message
              </button>
            </div>
            
            {/* Platforms */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">Platforms</label>
              <div className="space-y-3">
                {editedData.platforms.map((platform, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      className="flex-1 px-4 py-3 text-base border-2 border-gray-200 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                      placeholder={`Platform ${index + 1}`}
                      value={platform}
                      onChange={(e) => handleArrayFieldChange('platforms', index, e.target.value)}
                    />
                    <button
                      onClick={() => handleRemoveArrayItem('platforms', index)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      type="button"
                    >
                      <ClearIconSvg className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleAddArrayItem('platforms')}
                className="mt-4 flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
                type="button"
              >
                <AddIconSvg className="w-4 h-4 mr-2" />
                Add Platform
              </button>
            </div>
          </div>
        </div>
          
        {/* Competitors Section */}
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
            Competitive Landscape
          </h3>
          
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">Competitors</label>
            <div className="space-y-3">
              {(editedData.competitors || []).map((competitor, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    className="flex-1 px-4 py-3 text-base border-2 border-gray-200 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                    placeholder={`Competitor ${index + 1}`}
                    value={competitor}
                    onChange={(e) => {
                      const competitors = editedData.competitors || [];
                      const updated = [...competitors];
                      updated[index] = e.target.value;
                      handleFieldChange('competitors', updated);
                    }}
                  />
                  <button
                    onClick={() => {
                      const competitors = editedData.competitors || [];
                      const updated = competitors.filter((_, i) => i !== index);
                      handleFieldChange('competitors', updated);
                    }}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                    type="button"
                  >
                    <ClearIconSvg className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                const competitors = editedData.competitors || [];
                handleFieldChange('competitors', [...competitors, '']);
              }}
              className="mt-4 flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
              type="button"
            >
              <AddIconSvg className="w-4 h-4 mr-2" />
              Add Competitor
            </button>
          </div>
        </div>
          
        {/* Budget & Timeline Section */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
            Budget & Timeline
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Budget</label>
              <input
                type="text"
                className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                placeholder="e.g., $50,000 or TBD"
                value={editedData.budget || ''}
                onChange={(e) => handleFieldChange('budget', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Timeline</label>
              <input
                type="text"
                className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                placeholder="e.g., 3 months or Q1 2024"
                value={editedData.timeline || ''}
                onChange={(e) => handleFieldChange('timeline', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-end bg-gray-50 rounded-xl p-6">
        <button
          className="flex items-center justify-center px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          onClick={onReset}
          type="button"
        >
          <ClearIconSvg className="w-5 h-5 mr-2" />
          Reset to Original
        </button>
        <button
          className="flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          onClick={onProceed}
          type="button"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
          </svg>
          Confirm & Generate Motivations
        </button>
      </div>
    </div>
  );
};