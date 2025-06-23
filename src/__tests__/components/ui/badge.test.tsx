
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import badge from '@/components/badge';

describe('badge', () => {
  it('renders correctly', () => {
    render(<badge />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<badge />);
    
    await user.click(screen.getByRole('button'));
    
    expect(screen.getByText('Expected Result')).toBeInTheDocument();
  });
});
