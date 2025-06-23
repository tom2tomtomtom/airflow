
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('textarea', () => {
  it('renders correctly', () => {
    render(<textarea />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<textarea />);
    
    await user.click(screen.getByRole('button'));
    
    expect(screen.getByText('Expected Result')).toBeInTheDocument();
  });
});
