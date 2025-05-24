import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatusIndicator, { StatusType } from '../StatusIndicator';

describe('StatusIndicator', () => {
  it('renders with completed status', () => {
    render(<StatusIndicator status="completed" />);
    const chip = screen.getByText('Completed');
    expect(chip).toBeInTheDocument();
  });

  it('renders with error status', () => {
    render(<StatusIndicator status="error" />);
    const chip = screen.getByText('Error');
    expect(chip).toBeInTheDocument();
  });

  it('renders with warning status', () => {
    render(<StatusIndicator status="warning" />);
    const chip = screen.getByText('Warning');
    expect(chip).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    const customLabel = 'Custom status message';
    render(<StatusIndicator status="completed" label={customLabel} />);
    expect(screen.getByText(customLabel)).toBeInTheDocument();
  });

  it('handles empty status', () => {
    render(<StatusIndicator status="empty" />);
    const chip = screen.getByText('Empty');
    expect(chip).toBeInTheDocument();
  });

  it('renders with text variant', () => {
    render(<StatusIndicator status="completed" variant="text" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders with badge variant', () => {
    render(<StatusIndicator status="in-progress" variant="badge" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('renders without icon when showIcon is false', () => {
    render(<StatusIndicator status="completed" showIcon={false} />);
    const chip = screen.getByText('Completed');
    expect(chip).toBeInTheDocument();
  });
});
