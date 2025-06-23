
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OptimizedImage from '@/components/OptimizedImage';

describe('OptimizedImage', () => {
  it('renders correctly', () => {
    render(<OptimizedImage />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<OptimizedImage />);
    
    await user.click(screen.getByRole('button'));
    
    expect(screen.getByText('Expected Result')).toBeInTheDocument();
  });
});
