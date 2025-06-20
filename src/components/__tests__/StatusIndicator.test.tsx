import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import StatusIndicator, { CompletionStatus } from '../StatusIndicator';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Wrap component with theme provider for Material-UI
const theme = createTheme();
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('StatusIndicator', () => {
  describe('chip variant', () => {
    it('should render completed status correctly', () => {
      renderWithTheme(<StatusIndicator status="completed" />);
      
      const chip = screen.getByText('Completed');
      expect(chip).toBeInTheDocument();
      expect(chip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorSuccess');
    });

    it('should render in-progress status correctly', () => {
      renderWithTheme(<StatusIndicator status="in-progress" />);
      
      const chip = screen.getByText('In Progress');
      expect(chip).toBeInTheDocument();
      expect(chip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorPrimary');
    });

    it('should render error status correctly', () => {
      renderWithTheme(<StatusIndicator status="error" />);
      
      const chip = screen.getByText('Error');
      expect(chip).toBeInTheDocument();
      expect(chip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorError');
    });

    it('should render warning status correctly', () => {
      renderWithTheme(<StatusIndicator status="warning" />);
      
      const chip = screen.getByText('Warning');
      expect(chip).toBeInTheDocument();
      expect(chip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorWarning');
    });

    it('should render empty status correctly', () => {
      renderWithTheme(<StatusIndicator status="empty" />);
      
      const chip = screen.getByText('Empty');
      expect(chip).toBeInTheDocument();
      expect(chip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorDefault');
    });

    it('should use custom label when provided', () => {
      renderWithTheme(<StatusIndicator status="completed" label="Custom Label" />);
      
      expect(screen.getByText('Custom Label')).toBeInTheDocument();
    });

    it('should respect size prop', () => {
      renderWithTheme(<StatusIndicator status="completed" size="medium" />);
      
      const chip = screen.getByText('Completed').closest('.MuiChip-root');
      expect(chip).toHaveClass('MuiChip-sizeMedium');
    });

    it('should not show icon when showIcon is false', () => {
      renderWithTheme(<StatusIndicator status="completed" showIcon={false} />);
      
      const chip = screen.getByText('Completed').closest('.MuiChip-root');
      expect(chip?.querySelector('svg')).not.toBeInTheDocument();
    });
  });

  describe('badge variant', () => {
    it('should render badge variant correctly', () => {
      renderWithTheme(<StatusIndicator status="completed" variant="badge" />);
      
      const badge = screen.getByText('Completed');
      expect(badge).toBeInTheDocument();
      
      // Check for badge-specific styling
      const container = badge.closest('div');
      expect(container).toHaveStyle({ display: 'inline-flex' });
    });

    it('should show icon in badge variant', () => {
      renderWithTheme(<StatusIndicator status="completed" variant="badge" />);
      
      expect(screen.getByTestId('CheckIcon')).toBeInTheDocument();
    });

    it('should hide icon in badge variant when showIcon is false', () => {
      renderWithTheme(<StatusIndicator status="completed" variant="badge" showIcon={false} />);
      
      expect(screen.queryByTestId('CheckIcon')).not.toBeInTheDocument();
    });
  });

  describe('text variant', () => {
    it('should render text variant correctly', () => {
      renderWithTheme(<StatusIndicator status="completed" variant="text" />);
      
      const text = screen.getByText('Completed');
      expect(text).toBeInTheDocument();
      expect(text.tagName).toBe('P'); // Typography renders as p tag
    });

    it('should show progress bar for in-progress status with progress prop', () => {
      renderWithTheme(
        <StatusIndicator 
          status="in-progress" 
          variant="text" 
          progress={50} 
        />
      );
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    });

    it('should not show progress bar for non in-progress status', () => {
      renderWithTheme(
        <StatusIndicator 
          status="completed" 
          variant="text" 
          progress={50} 
        />
      );
      
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });
});

describe('CompletionStatus', () => {
  it('should calculate percentage correctly', () => {
    renderWithTheme(<CompletionStatus completed={5} total={10} />);
    
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('5/10')).toBeInTheDocument();
  });

  it('should show completed status at 100%', () => {
    renderWithTheme(<CompletionStatus completed={10} total={10} />);
    
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should show empty status at 0%', () => {
    renderWithTheme(<CompletionStatus completed={0} total={10} />);
    
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should handle division by zero', () => {
    renderWithTheme(<CompletionStatus completed={0} total={0} />);
    
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('0/0')).toBeInTheDocument();
  });

  it('should hide percentage when showPercentage is false', () => {
    renderWithTheme(
      <CompletionStatus 
        completed={5} 
        total={10} 
        showPercentage={false} 
      />
    );
    
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
    expect(screen.getByText('5/10')).toBeInTheDocument();
  });

  it('should hide progress bar when showProgress is false', () => {
    renderWithTheme(
      <CompletionStatus 
        completed={5} 
        total={10} 
        showProgress={false} 
      />
    );
    
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByText('5/10')).not.toBeInTheDocument();
  });

  it('should respect size prop', () => {
    const { container } = renderWithTheme(
      <CompletionStatus 
        completed={5} 
        total={10} 
        size="medium" 
      />
    );
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ height: '6px' });
  });
});