import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import StatusIndicator from '../StatusIndicator';

describe('StatusIndicator', () => {
  it('renders with success status', () => {
    render(<StatusIndicator status="success" />);
    const indicator = screen.getByTestId('status-indicator');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('success');
  });

  it('renders with error status', () => {
    render(<StatusIndicator status="error" />);
    const indicator = screen.getByTestId('status-indicator');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('error');
  });

  it('renders with warning status', () => {
    render(<StatusIndicator status="warning" />);
    const indicator = screen.getByTestId('status-indicator');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('warning');
  });

  it('renders with custom message', () => {
    const message = 'Custom status message';
    render(<StatusIndicator status="success" message={message} />);
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('handles undefined status gracefully', () => {
    render(<StatusIndicator status={undefined} />);
    const indicator = screen.getByTestId('status-indicator');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('default');
  });
});
