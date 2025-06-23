
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import slider from '@/components/slider';

describe('slider', () => {
  it('renders correctly', () => {
    render(<slider />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<slider />);
    
    await user.click(screen.getByRole('button'));
    
    expect(screen.getByText('Expected Result')).toBeInTheDocument();
  });
});
