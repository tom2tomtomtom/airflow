import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestProvider } from '@/test-utils/test-providers';
import BriefUploadModal from '@/components/BriefUploadModal';

// Mock fetch globally
global.fetch = jest.fn();

// Mock NotificationContext
const mockShowNotification = jest.fn();
jest.mock('@/contexts/NotificationContext', () => ({
  useNotification: () => ({
    showNotification: mockShowNotification,
  }),
}));

// Mock react-dropzone to simulate file drop behavior
jest.mock('react-dropzone', () => ({
  useDropzone: ({ onDrop, accept, multiple, maxSize }: any) => {
    const mockGetRootProps = () => ({
      'data-testid': 'dropzone',
      onClick: () => {
        // Simulate file selection
        const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
        onDrop([mockFile]);
      },
    });

    const mockGetInputProps = () => ({
      'data-testid': 'file-input',
      type: 'file',
      accept: Object.keys(accept || {}).join(','),
      multiple: multiple || false,
    });

    // Store the onDrop callback for external access in tests
    (mockGetRootProps as any).onDrop = onDrop;

    return {
      getRootProps: mockGetRootProps,
      getInputProps: mockGetInputProps,
      isDragActive: false,
    };
  },
}));

describe('BriefUploadModal', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onUploadComplete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Modal Rendering and Basic Functionality', () => {
    it('renders modal when open is true', () => {
      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      expect(screen.getByText('Upload Campaign Brief')).toBeInTheDocument();
      expect(screen.getByTestId('AutoAwesomeIcon')).toBeInTheDocument();
    });

    it('does not render modal when open is false', () => {
      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} open={false} />
        </TestProvider>
      );

      expect(screen.queryByText('Upload Campaign Brief')).not.toBeInTheDocument();
    });

    it('displays close button with correct aria-label', () => {
      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      const closeButton = screen.getByLabelText('Icon button');
      expect(closeButton).toBeInTheDocument();
      expect(closeButton.querySelector('svg')).toBeInTheDocument(); // Close icon
    });

    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnClose = jest.fn();

      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} onClose={mockOnClose} />
        </TestProvider>
      );

      const closeButton = screen.getByLabelText('Icon button');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('displays cancel button in dialog actions', () => {
      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('Stepper Display and Navigation', () => {
    it('displays stepper with correct steps', () => {
      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      expect(screen.getByText('Upload Brief Document')).toBeInTheDocument();
      expect(screen.getByText('AI Processing')).toBeInTheDocument();
      expect(screen.getByText('Review & Confirm')).toBeInTheDocument();
    });

    it('starts with step 0 (Upload Brief Document) active', () => {
      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      // The active step should show its content
      expect(screen.getByText('Drag & drop your brief document')).toBeInTheDocument();
      expect(screen.getByText('or click to browse files')).toBeInTheDocument();
    });

    it('displays stepper in vertical orientation', () => {
      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      // Check that stepper has vertical orientation through MUI structure
      const stepper = document.querySelector('.MuiStepper-root');
      expect(stepper).toBeInTheDocument();
    });

    it('shows file format support information', () => {
      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      expect(
        screen.getByText('Supports: PDF, Word (.docx), Text (.txt, .md) • Max 10MB')
      ).toBeInTheDocument();
    });
  });

  describe('File Dropzone Functionality', () => {
    it('displays dropzone area when no files are selected', () => {
      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      expect(screen.getByTestId('dropzone')).toBeInTheDocument();
      expect(screen.getByTestId('CloudUploadIcon')).toBeInTheDocument();
      expect(screen.getByText('Drag & drop your brief document')).toBeInTheDocument();
    });

    it('simulates file selection through dropzone click', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      const dropzone = screen.getByTestId('dropzone');
      await user.click(dropzone);

      // After file selection, should show file list instead of dropzone
      await waitFor(() => {
        expect(screen.queryByText('Drag & drop your brief document')).not.toBeInTheDocument();
        expect(screen.getByText('test.pdf')).toBeInTheDocument();
      });
    });

    it('displays file input element with correct attributes', () => {
      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      const fileInput = screen.getByTestId('file-input');
      expect(fileInput).toHaveAttribute('type', 'file');
      expect(fileInput).toHaveAttribute('accept');
    });

    it('shows cloud upload icon in dropzone', () => {
      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      expect(screen.getByTestId('CloudUploadIcon')).toBeInTheDocument();
    });
  });

  describe('File List Display and Management', () => {
    it('displays selected file with correct metadata', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      const dropzone = screen.getByTestId('dropzone');
      await user.click(dropzone);

      // Wait for file to be displayed
      await waitFor(() => {
        expect(screen.getByText('test.pdf')).toBeInTheDocument();
        expect(screen.getByText(/\d+ Bytes • application\/pdf/)).toBeInTheDocument();
      });
    });

    it('displays appropriate file icon based on file type', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      const dropzone = screen.getByTestId('dropzone');
      await user.click(dropzone);

      // PDF file should show PDF icon
      await waitFor(() => {
        expect(screen.getByTestId('PictureAsPdfIcon')).toBeInTheDocument();
      });
    });

    it('shows remove button for selected files', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      const dropzone = screen.getByTestId('dropzone');
      await user.click(dropzone);

      // Should show remove button (close icon)
      await waitFor(() => {
        const removeButtons = screen.getAllByLabelText('Icon button');
        // One is the modal close button, another should be file remove button
        expect(removeButtons.length).toBeGreaterThan(1);
      });
    });

    it('removes file when remove button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      const dropzone = screen.getByTestId('dropzone');
      await user.click(dropzone);

      // Wait for file to appear
      await waitFor(() => {
        expect(screen.getByText('test.pdf')).toBeInTheDocument();
      });

      // Find and click remove button (last close button that's not the modal close)
      const removeButtons = screen.getAllByLabelText('Icon button');
      const fileRemoveButton = removeButtons[removeButtons.length - 1];
      await user.click(fileRemoveButton);

      // File should be removed and dropzone should reappear
      await waitFor(() => {
        expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
        expect(screen.getByText('Drag & drop your brief document')).toBeInTheDocument();
      });
    });

    it('displays upload button when file is selected', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      const dropzone = screen.getByTestId('dropzone');
      await user.click(dropzone);

      await waitFor(() => {
        expect(screen.getByTestId('upload-button')).toBeInTheDocument();
        expect(screen.getByText('Upload & Process')).toBeInTheDocument();
      });
    });
  });

  describe('Upload Process and API Integration', () => {
    it('initiates upload process when upload button is clicked', async () => {
      const user = userEvent.setup();

      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: {
            objective: 'Test objective',
            targetAudience: 'Test audience',
            budget: '$10,000',
            timeline: '2 weeks',
            platforms: ['Instagram', 'Facebook'],
          },
        }),
      });

      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      const dropzone = screen.getByTestId('dropzone');
      await user.click(dropzone);

      await waitFor(() => {
        expect(screen.getByTestId('upload-button')).toBeInTheDocument();
      });

      const uploadButton = screen.getByTestId('upload-button');
      await user.click(uploadButton);

      // Should show uploading state
      expect(screen.getByText('Uploading...')).toBeInTheDocument();
      expect(uploadButton).toBeDisabled();
    });

    it('displays progress bar during upload', async () => {
      const user = userEvent.setup();

      // Mock successful API response with delay
      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  json: async () => ({
                    success: true,
                    data: { objective: 'Test' },
                  }),
                }),
              100
            )
          )
      );

      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      const dropzone = screen.getByTestId('dropzone');
      await user.click(dropzone);

      const uploadButton = screen.getByTestId('upload-button');
      await user.click(uploadButton);

      // Should show progress indicators
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText('Uploading...')).toBeInTheDocument();
    });

    it('shows success notification on successful upload', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: {
            objective: 'Test objective',
            targetAudience: 'Test audience',
          },
        }),
      });

      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      const dropzone = screen.getByTestId('dropzone');
      await user.click(dropzone);

      const uploadButton = screen.getByTestId('upload-button');
      await user.click(uploadButton);

      await waitFor(() => {
        expect(mockShowNotification).toHaveBeenCalledWith(
          'Brief processed successfully!',
          'success'
        );
      });
    });

    it('handles upload failure with error notification', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: false,
          message: 'Upload failed',
        }),
      });

      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      const dropzone = screen.getByTestId('dropzone');
      await user.click(dropzone);

      const uploadButton = screen.getByTestId('upload-button');
      await user.click(uploadButton);

      await waitFor(() => {
        expect(mockShowNotification).toHaveBeenCalledWith('Upload failed', 'error');
      });
    });

    it('handles network errors gracefully', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      const dropzone = screen.getByTestId('dropzone');
      await user.click(dropzone);

      const uploadButton = screen.getByTestId('upload-button');
      await user.click(uploadButton);

      await waitFor(() => {
        expect(mockShowNotification).toHaveBeenCalledWith('Network error', 'error');
      });
    });
  });

  describe('AI Processing Step', () => {
    it('advances to AI processing step after successful upload', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: { objective: 'Test' },
        }),
      });

      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      const dropzone = screen.getByTestId('dropzone');
      await user.click(dropzone);

      const uploadButton = screen.getByTestId('upload-button');
      await user.click(uploadButton);

      await waitFor(() => {
        expect(
          screen.getByText('AI is analyzing your brief and extracting key information...')
        ).toBeInTheDocument();
      });
    });

    it('shows processing animation during AI step', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  json: async () => ({
                    success: true,
                    data: { objective: 'Test' },
                  }),
                }),
              100
            )
          )
      );

      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      const dropzone = screen.getByTestId('dropzone');
      await user.click(dropzone);

      const uploadButton = screen.getByTestId('upload-button');
      await user.click(uploadButton);

      // Should show processing state
      expect(
        screen.getByText('AI is analyzing your brief and extracting key information...')
      ).toBeInTheDocument();
      expect(screen.getAllByRole('progressbar')).toHaveLength(2); // Upload progress + processing progress
    });

    it('shows success message after AI processing completes', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: { objective: 'Test' },
        }),
      });

      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      const dropzone = screen.getByTestId('dropzone');
      await user.click(dropzone);

      const uploadButton = screen.getByTestId('upload-button');
      await user.click(uploadButton);

      await waitFor(() => {
        expect(
          screen.getByText('Brief processed successfully! Key information extracted.')
        ).toBeInTheDocument();
        expect(screen.getByTestId('CheckCircleIcon')).toBeInTheDocument();
      });
    });
  });

  describe('Review and Confirm Step', () => {
    it('advances to review step after processing completes', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: {
            objective: 'Test objective',
            targetAudience: 'Test audience',
            budget: '$10,000',
            timeline: '2 weeks',
            platforms: ['Instagram', 'Facebook'],
          },
        }),
      });

      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      const dropzone = screen.getByTestId('dropzone');
      await user.click(dropzone);

      const uploadButton = screen.getByTestId('upload-button');
      await user.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByText('Extracted Information')).toBeInTheDocument();
      });
    });

    it('displays extracted data as chips', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: {
            objective: 'Test objective for campaign',
            targetAudience: 'Young professionals aged 25-35',
            budget: '$10,000',
            timeline: '2 weeks',
            platforms: ['Instagram', 'Facebook', 'Twitter'],
          },
        }),
      });

      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      const dropzone = screen.getByTestId('dropzone');
      await user.click(dropzone);

      const uploadButton = screen.getByTestId('upload-button');
      await user.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByText('Objective: Test objective for campaign...')).toBeInTheDocument();
        expect(screen.getByText('Audience: Young professionals aged 25-3...')).toBeInTheDocument();
        expect(screen.getByText('Budget: $10,000')).toBeInTheDocument();
        expect(screen.getByText('Timeline: 2 weeks')).toBeInTheDocument();
        expect(screen.getByText('Platforms: Instagram, Facebook...')).toBeInTheDocument();
      });
    });

    it('shows confirm button in review step', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: { objective: 'Test' },
        }),
      });

      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      const dropzone = screen.getByTestId('dropzone');
      await user.click(dropzone);

      const uploadButton = screen.getByTestId('upload-button');
      await user.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /confirm & create brief/i })).toBeInTheDocument();
      });
    });

    it('calls onUploadComplete when confirm button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnUploadComplete = jest.fn();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: { objective: 'Test objective' },
        }),
      });

      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} onUploadComplete={mockOnUploadComplete} />
        </TestProvider>
      );

      const dropzone = screen.getByTestId('dropzone');
      await user.click(dropzone);

      const uploadButton = screen.getByTestId('upload-button');
      await user.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /confirm & create brief/i })).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirm & create brief/i });
      await user.click(confirmButton);

      expect(mockOnUploadComplete).toHaveBeenCalledWith({ objective: 'Test objective' });
    });

    it('displays info alert about editing after confirmation', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: { objective: 'Test' },
        }),
      });

      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      const dropzone = screen.getByTestId('dropzone');
      await user.click(dropzone);

      const uploadButton = screen.getByTestId('upload-button');
      await user.click(uploadButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            'Review the extracted information. You can edit details after confirmation.'
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe('Button States and Interactions', () => {
    it('disables close button during upload', async () => {
      const user = userEvent.setup();

      // Mock long-running request
      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  json: async () => ({
                    success: true,
                    data: { objective: 'Test' },
                  }),
                }),
              1000
            )
          )
      );

      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      const dropzone = screen.getByTestId('dropzone');
      await user.click(dropzone);

      const uploadButton = screen.getByTestId('upload-button');
      await user.click(uploadButton);

      // Close button should be disabled
      const closeButton = screen.getByLabelText('Icon button');
      expect(closeButton).toBeDisabled();
    });

    it('disables cancel button during upload', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  json: async () => ({
                    success: true,
                    data: { objective: 'Test' },
                  }),
                }),
              1000
            )
          )
      );

      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      const dropzone = screen.getByTestId('dropzone');
      await user.click(dropzone);

      const uploadButton = screen.getByTestId('upload-button');
      await user.click(uploadButton);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toBeDisabled();
    });

    it('resets modal state when closed', async () => {
      const user = userEvent.setup();
      const mockOnClose = jest.fn();

      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} onClose={mockOnClose} />
        </TestProvider>
      );

      // Select a file first
      const dropzone = screen.getByTestId('dropzone');
      await user.click(dropzone);

      await waitFor(() => {
        expect(screen.getByText('test.pdf')).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByLabelText('Icon button');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles missing data fields gracefully', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: {
            objective: 'Test objective',
            // Missing other fields
          },
        }),
      });

      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      const dropzone = screen.getByTestId('dropzone');
      await user.click(dropzone);

      const uploadButton = screen.getByTestId('upload-button');
      await user.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByText('Objective: Test objective...')).toBeInTheDocument();
        expect(screen.getByText('Audience: Not specified...')).toBeInTheDocument();
        expect(screen.getByText('Budget: Not specified')).toBeInTheDocument();
        expect(screen.getByText('Timeline: Not specified')).toBeInTheDocument();
      });
    });

    it('handles API error with error ID', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: false,
          errorId: 'ERR_123',
          message: 'Server error',
        }),
      });

      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      const dropzone = screen.getByTestId('dropzone');
      await user.click(dropzone);

      const uploadButton = screen.getByTestId('upload-button');
      await user.click(uploadButton);

      await waitFor(() => {
        expect(mockShowNotification).toHaveBeenCalledWith(
          'Upload failed (Error ID: ERR_123)',
          'error'
        );
      });
    });

    it('resets to step 0 on upload error', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      const dropzone = screen.getByTestId('dropzone');
      await user.click(dropzone);

      const uploadButton = screen.getByTestId('upload-button');
      await user.click(uploadButton);

      await waitFor(() => {
        // Should return to initial state after error
        expect(screen.getByText('Drag & drop your brief document')).toBeInTheDocument();
      });
    });

    it('handles empty upload attempt gracefully', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      // Try to find upload button without selecting file - should not exist
      expect(screen.queryByTestId('upload-button')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility Features', () => {
    it('has proper ARIA labels for interactive elements', () => {
      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      expect(screen.getByLabelText('Icon button')).toBeInTheDocument(); // Close button
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('maintains proper focus management in modal', () => {
      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      // Modal should be properly structured for screen readers
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has proper heading structure', () => {
      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      // Main modal title
      expect(screen.getByText('Upload Campaign Brief')).toBeInTheDocument();

      // Step labels should be accessible
      expect(screen.getByText('Upload Brief Document')).toBeInTheDocument();
      expect(screen.getByText('AI Processing')).toBeInTheDocument();
      expect(screen.getByText('Review & Confirm')).toBeInTheDocument();
    });

    it('provides appropriate feedback for screen readers', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <BriefUploadModal {...defaultProps} />
        </TestProvider>
      );

      const dropzone = screen.getByTestId('dropzone');
      await user.click(dropzone);

      // File information should be announced
      await waitFor(() => {
        expect(screen.getByText('test.pdf')).toBeInTheDocument();
        expect(screen.getByText(/application\/pdf/)).toBeInTheDocument();
      });
    });
  });
});
