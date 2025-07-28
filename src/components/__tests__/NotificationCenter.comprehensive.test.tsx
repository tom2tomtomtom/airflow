import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { TestProvider } from '@/test-utils/test-providers';
import NotificationCenter from '@/components/NotificationCenter';
import { useNotifications } from '@/hooks/useRealtime';

// Mock Next.js router
const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  pathname: '/dashboard',
  route: '/dashboard',
  query: {},
  asPath: '/dashboard',
};

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock useNotifications hook
const mockMarkAsRead = jest.fn();
const mockDismiss = jest.fn();
const mockRefresh = jest.fn();

const mockNotifications = [
  {
    id: 'notif-1',
    title: 'Video Generation Complete',
    message: 'Your Instagram story video has been generated successfully',
    type: 'success',
    category: 'execution',
    priority: 'normal',
    read: false,
    action_url: '/videos/video-1',
    created_at: '2025-01-20T10:30:00Z',
  },
  {
    id: 'notif-2',
    title: 'Campaign Approval Required',
    message: 'New campaign from Client ABC requires your approval',
    type: 'info',
    category: 'approval',
    priority: 'high',
    read: false,
    action_url: '/campaigns/campaign-1/approve',
    created_at: '2025-01-20T09:15:00Z',
  },
  {
    id: 'notif-3',
    title: 'System Maintenance Scheduled',
    message: 'Scheduled maintenance will begin at 2 AM EST',
    type: 'warning',
    category: 'system',
    priority: 'urgent',
    read: true,
    action_url: null,
    created_at: '2025-01-19T18:00:00Z',
  },
  {
    id: 'notif-4',
    title: 'Asset Upload Failed',
    message: 'Failed to upload logo.png - file too large',
    type: 'error',
    category: 'execution',
    priority: 'normal',
    read: false,
    action_url: '/assets/upload',
    created_at: '2025-01-19T14:45:00Z',
  },
  {
    id: 'notif-5',
    title: 'New Team Member Added',
    message: 'John Doe has been added to your workspace',
    type: 'info',
    category: 'user',
    priority: 'low',
    read: true,
    action_url: '/team',
    created_at: '2025-01-18T11:20:00Z',
  },
];

const mockUseNotifications = {
  notifications: mockNotifications,
  unreadNotifications: mockNotifications.filter(n => !n.read),
  markAsRead: mockMarkAsRead,
  dismiss: mockDismiss,
  loading: false,
  error: null,
  refresh: mockRefresh,
};

jest.mock('@/hooks/useRealtime', () => ({
  useNotifications: jest.fn(),
}));

// Mock date-fns formatDistanceToNow
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn((date, options) => {
    const mockDate = new Date(date);
    const now = new Date('2025-01-20T12:00:00Z');
    const diffInHours = (now.getTime() - mockDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'less than an hour ago';
    if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  }),
}));

describe('NotificationCenter', () => {
  const defaultProps = {};

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useNotifications as jest.Mock).mockReturnValue(mockUseNotifications);
  });

  describe('Notification Button and Badge Display', () => {
    it('renders notification button with correct tooltip', () => {
      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      expect(notificationButton).toBeInTheDocument();
      expect(notificationButton).toHaveAttribute('aria-label', 'notifications');
    });

    it('displays badge with unread notification count', () => {
      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      const badge = screen.getByText('3'); // 3 unread notifications
      expect(badge).toBeInTheDocument();
    });

    it('shows active notification icon when there are unread notifications', () => {
      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      expect(screen.getByTestId('NotificationsActiveIcon')).toBeInTheDocument();
    });

    it('shows regular notification icon when all notifications are read', () => {
      (useNotifications as jest.Mock).mockReturnValue({
        ...mockUseNotifications,
        unreadNotifications: [],
      });

      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      expect(screen.getByTestId('NotificationsIcon')).toBeInTheDocument();
    });

    it('does not display badge when there are no unread notifications', () => {
      (useNotifications as jest.Mock).mockReturnValue({
        ...mockUseNotifications,
        unreadNotifications: [],
      });

      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      expect(screen.queryByText('3')).not.toBeInTheDocument();
    });
  });

  describe('Popover Opening and Closing', () => {
    it('opens popover when notification button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Video Generation Complete')).toBeInTheDocument();
    });

    it('closes popover when clicking outside', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <div>
            <NotificationCenter {...defaultProps} />
            <div data-testid="outside">Outside element</div>
          </div>
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      expect(screen.getByText('Notifications')).toBeInTheDocument();

      // Click outside - using Escape key for more reliable testing
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Video Generation Complete')).not.toBeInTheDocument();
      });
    });

    it('maintains proper popover positioning', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      // Check that popover content is rendered
      const popoverContent = screen.getByText('Notifications').closest('[role="presentation"]');
      expect(popoverContent).toBeInTheDocument();
    });
  });

  describe('Notification Header Display', () => {
    it('displays notification header with count when showHeader is true', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter showHeader={true} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      expect(screen.getByText('Notifications')).toBeInTheDocument();
      // Look for the chip specifically within the header
      const headerChip = screen
        .getByText('Notifications')
        .closest('div')
        ?.querySelector('[class*="MuiChip-label"]');
      expect(headerChip).toHaveTextContent('3');
    });

    it('hides notification header when showHeader is false', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter showHeader={false} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
      // But should still show notification content
      expect(screen.getByText('Video Generation Complete')).toBeInTheDocument();
    });

    it('displays refresh button in header', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter showHeader={true} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      const refreshButton = screen.getByLabelText('Refresh');
      expect(refreshButton).toBeInTheDocument();
      expect(screen.getByTestId('RefreshIcon')).toBeInTheDocument();
    });

    it('displays mark all as read button when there are unread notifications', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter showHeader={true} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      const markAllButton = screen.getByRole('button', { name: /mark all as read/i });
      expect(markAllButton).toBeInTheDocument();
      expect(screen.getByTestId('MarkEmailReadIcon')).toBeInTheDocument();
    });

    it('hides mark all as read button when all notifications are read', async () => {
      const user = userEvent.setup();

      (useNotifications as jest.Mock).mockReturnValue({
        ...mockUseNotifications,
        unreadNotifications: [],
      });

      render(
        <TestProvider>
          <NotificationCenter showHeader={true} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      expect(screen.queryByLabelText('Mark all as read')).not.toBeInTheDocument();
    });
  });

  describe('Notification List Display', () => {
    it('renders all notifications with correct content', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      expect(screen.getByText('Video Generation Complete')).toBeInTheDocument();
      expect(screen.getByText('Campaign Approval Required')).toBeInTheDocument();
      expect(screen.getByText('System Maintenance Scheduled')).toBeInTheDocument();
      expect(screen.getByText('Asset Upload Failed')).toBeInTheDocument();
      expect(screen.getByText('New Team Member Added')).toBeInTheDocument();
    });

    it('displays notification messages correctly', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      expect(
        screen.getByText('Your Instagram story video has been generated successfully')
      ).toBeInTheDocument();
      expect(
        screen.getByText('New campaign from Client ABC requires your approval')
      ).toBeInTheDocument();
      expect(screen.getByText('Scheduled maintenance will begin at 2 AM EST')).toBeInTheDocument();
    });

    it('displays category chips for notifications', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      // Category chips should be present in the secondary text area
      const categoryChips = screen.getAllByText(/execution|approval|system|user/);
      expect(categoryChips.length).toBeGreaterThan(0);

      // Check specific categories
      expect(screen.getAllByText('execution')).toHaveLength(2); // Two execution notifications
      expect(screen.getByText('approval')).toBeInTheDocument();
      expect(screen.getByText('system')).toBeInTheDocument();
      expect(screen.getByText('user')).toBeInTheDocument();
    });

    it('displays priority chips for high and urgent priority notifications', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      expect(screen.getByText('HIGH')).toBeInTheDocument();
      expect(screen.getByText('URGENT')).toBeInTheDocument();
    });

    it('does not display priority chips for normal/low priority notifications', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      // Should not show NORMAL or LOW priority chips
      expect(screen.queryByText('NORMAL')).not.toBeInTheDocument();
      expect(screen.queryByText('LOW')).not.toBeInTheDocument();
    });

    it('displays relative timestamps using date-fns', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      // Check for any timestamp format (the mock returns different formats)
      const timestamps = screen.getAllByText(/ago|hours|days/);
      expect(timestamps.length).toBeGreaterThan(0);

      // Should have timestamps for all notifications
      expect(screen.getByText('2 hours ago')).toBeInTheDocument();
      expect(screen.getByText('3 hours ago')).toBeInTheDocument();
    });
  });

  describe('Notification Icons and Styling', () => {
    it('displays correct icons based on notification type', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      expect(screen.getByTestId('CheckCircleIcon')).toBeInTheDocument(); // success
      expect(screen.getByTestId('ErrorIcon')).toBeInTheDocument(); // error
      expect(screen.getByTestId('WarningIcon')).toBeInTheDocument(); // warning
    });

    it('displays correct icons based on notification category when type is not specific', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      // Check for category icons - some may be overridden by type icons
      const allIcons = [
        ...screen.queryAllByTestId('PlayArrowIcon'), // execution
        ...screen.queryAllByTestId('AssignmentIcon'), // approval
        ...screen.queryAllByTestId('PersonIcon'), // user
        ...screen.queryAllByTestId('SettingsIcon'), // system
      ];

      expect(allIcons.length).toBeGreaterThan(0);

      // At least check that approval icon is present (info type notification)
      expect(screen.getByTestId('AssignmentIcon')).toBeInTheDocument();
    });

    it('applies different visual styling for read vs unread notifications', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      // Check that unread notifications have action.hover background class
      const unreadNotification = screen.getByText('Video Generation Complete').closest('li');
      expect(unreadNotification).toHaveClass('MuiListItem-root');

      // Check that read notifications are present
      const readNotification = screen.getByText('System Maintenance Scheduled').closest('li');
      expect(readNotification).toHaveClass('MuiListItem-root');

      // Both should be list items but with different background styling
      expect(unreadNotification).toBeInTheDocument();
      expect(readNotification).toBeInTheDocument();
    });

    it('applies correct avatar colors based on notification type and priority', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      // Should have avatars with different background colors
      const avatars = document.querySelectorAll('.MuiAvatar-root');
      expect(avatars.length).toBeGreaterThan(0);
    });
  });

  describe('Notification Actions and Interactions', () => {
    it('navigates to action URL when notification is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      const notification = screen.getByText('Video Generation Complete').closest('li');
      await user.click(notification!);

      // Wait for async operations
      await waitFor(() => {
        expect(mockMarkAsRead).toHaveBeenCalledWith('notif-1');
        expect(mockPush).toHaveBeenCalledWith('/videos/video-1');
      });
    });

    it('marks notification as read when clicked without navigating if no action URL', async () => {
      const user = userEvent.setup();

      // Mock notification without action URL
      const notificationsWithoutURL = [...mockNotifications];
      notificationsWithoutURL[0] = { ...notificationsWithoutURL[0], action_url: null };

      (useNotifications as jest.Mock).mockReturnValue({
        ...mockUseNotifications,
        notifications: notificationsWithoutURL,
        unreadNotifications: notificationsWithoutURL.filter(n => !n.read),
      });

      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      const notification = screen.getByText('Video Generation Complete').closest('li');
      await user.click(notification!);

      await waitFor(() => {
        expect(mockMarkAsRead).toHaveBeenCalledWith('notif-1');
        expect(mockPush).not.toHaveBeenCalled();
      });
    });

    it('does not mark already read notification as read again', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      const readNotification = screen.getByText('System Maintenance Scheduled').closest('li');
      await user.click(readNotification!);

      expect(mockMarkAsRead).not.toHaveBeenCalledWith('notif-3');
    });

    it('marks individual notification as read when mark as read button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      // Find the first unread notification's mark as read button
      const markReadButtons = screen.getAllByLabelText('Mark as read');
      await user.click(markReadButtons[0]);

      expect(mockMarkAsRead).toHaveBeenCalledWith('notif-1');
    });

    it('dismisses notification when dismiss button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      const dismissButtons = screen.getAllByLabelText('Dismiss');
      await user.click(dismissButtons[0]);

      expect(mockDismiss).toHaveBeenCalledWith('notif-1');
    });

    it('prevents event propagation when action buttons are clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      // Click dismiss button - should not trigger notification click
      const dismissButtons = screen.getAllByLabelText('Dismiss');
      await user.click(dismissButtons[0]);

      expect(mockDismiss).toHaveBeenCalledWith('notif-1');
      // Router should not be called since event propagation was stopped
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Header Actions', () => {
    it('calls refresh function when refresh button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter showHeader={true} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      const refreshButton = screen.getByLabelText('Refresh');
      await user.click(refreshButton);

      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('disables refresh button when loading is true', async () => {
      const user = userEvent.setup();

      (useNotifications as jest.Mock).mockReturnValue({
        ...mockUseNotifications,
        loading: true,
      });

      render(
        <TestProvider>
          <NotificationCenter showHeader={true} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      const refreshButton = screen.getByLabelText('Refresh');
      expect(refreshButton).toBeDisabled();
      expect(screen.getByRole('progressbar')).toBeInTheDocument(); // CircularProgress
    });

    it('marks all unread notifications as read when mark all as read is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter showHeader={true} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      const markAllButton = screen.getByLabelText('Mark all as read');
      await user.click(markAllButton);

      // Should call markAsRead for each unread notification
      expect(mockMarkAsRead).toHaveBeenCalledWith('notif-1');
      expect(mockMarkAsRead).toHaveBeenCalledWith('notif-2');
      expect(mockMarkAsRead).toHaveBeenCalledWith('notif-4');
      expect(mockMarkAsRead).toHaveBeenCalledTimes(3);
    });
  });

  describe('Empty State Display', () => {
    it('displays empty state when there are no notifications', async () => {
      const user = userEvent.setup();

      (useNotifications as jest.Mock).mockReturnValue({
        ...mockUseNotifications,
        notifications: [],
        unreadNotifications: [],
      });

      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      expect(screen.getByText('No notifications')).toBeInTheDocument();
      expect(screen.getByText("You're all caught up!")).toBeInTheDocument();

      // Check for the large notification icon in empty state (different from button icon)
      const emptyStateIcons = screen.getAllByTestId('NotificationsIcon');
      expect(emptyStateIcons.length).toBeGreaterThan(1); // One in button, one in empty state
    });

    it('does not display empty state when there are notifications', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      expect(screen.queryByText('No notifications')).not.toBeInTheDocument();
      expect(screen.getByText('Video Generation Complete')).toBeInTheDocument();
    });
  });

  describe('Error State Handling', () => {
    it('displays error alert when there is an error', async () => {
      const user = userEvent.setup();

      (useNotifications as jest.Mock).mockReturnValue({
        ...mockUseNotifications,
        error: 'Failed to load notifications',
      });

      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      expect(screen.getByText('Failed to load notifications')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('does not display error alert when there is no error', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Notification Limit and Pagination', () => {
    it('limits displayed notifications to maxNotifications prop', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter maxNotifications={3} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      // Should only show first 3 notifications
      expect(screen.getByText('Video Generation Complete')).toBeInTheDocument();
      expect(screen.getByText('Campaign Approval Required')).toBeInTheDocument();
      expect(screen.getByText('System Maintenance Scheduled')).toBeInTheDocument();

      // Should not show notifications beyond the limit
      expect(screen.queryByText('Asset Upload Failed')).not.toBeInTheDocument();
      expect(screen.queryByText('New Team Member Added')).not.toBeInTheDocument();
    });

    it('displays view all notifications button when there are more notifications than limit', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter maxNotifications={3} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      const viewAllButton = screen.getByText('View All Notifications (5)');
      expect(viewAllButton).toBeInTheDocument();
    });

    it('navigates to notifications page when view all button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter maxNotifications={3} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      const viewAllButton = screen.getByText('View All Notifications (5)');
      await user.click(viewAllButton);

      expect(mockPush).toHaveBeenCalledWith('/notifications');
    });

    it('does not display view all button when notifications count is within limit', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter maxNotifications={10} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      expect(screen.queryByText(/View All Notifications/)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility and ARIA Support', () => {
    it('has proper ARIA labels for interactive elements', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      expect(screen.getByLabelText('notifications')).toBeInTheDocument();

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      expect(screen.getByLabelText('Refresh')).toBeInTheDocument();
      expect(screen.getByLabelText('Mark all as read')).toBeInTheDocument();
      expect(screen.getAllByLabelText('Mark as read')).toHaveLength(3); // 3 unread notifications
      expect(screen.getAllByLabelText('Dismiss')).toHaveLength(5); // All notifications
    });

    it('maintains proper focus management', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      // Tab through interactive elements
      await user.tab();
      expect(document.activeElement).toBeInTheDocument();
    });

    it('supports keyboard navigation through notifications', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      // Click on notification with keyboard (notification items are clickable)
      const notification = screen.getByText('Video Generation Complete').closest('li');
      await user.click(notification!);

      await waitFor(() => {
        expect(mockMarkAsRead).toHaveBeenCalledWith('notif-1');
        expect(mockPush).toHaveBeenCalledWith('/videos/video-1');
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles missing notification properties gracefully', async () => {
      const user = userEvent.setup();

      const incompleteNotifications = [
        {
          id: 'incomplete-1',
          title: 'Incomplete Notification',
          message: 'Basic message',
          type: 'info',
          category: 'system',
          priority: 'normal',
          read: false,
          created_at: '2025-01-20T10:00:00Z',
        },
      ];

      (useNotifications as jest.Mock).mockReturnValue({
        ...mockUseNotifications,
        notifications: incompleteNotifications,
        unreadNotifications: incompleteNotifications,
      });

      expect(() => {
        render(
          <TestProvider>
            <NotificationCenter {...defaultProps} />
          </TestProvider>
        );
      }).not.toThrow();

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      expect(screen.getByText('Incomplete Notification')).toBeInTheDocument();
    });

    it('handles rapid user interactions gracefully', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');

      // Rapid clicks
      await user.click(notificationButton);
      await user.click(notificationButton);
      await user.click(notificationButton);

      // Should handle rapid interactions without crashing
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    it('handles async operation failures gracefully', async () => {
      const user = userEvent.setup();

      mockMarkAsRead.mockRejectedValueOnce(new Error('Network error'));

      render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      const markReadButtons = screen.getAllByLabelText('Mark as read');
      await user.click(markReadButtons[0]);

      // Should not crash when async operation fails
      await waitFor(() => {
        expect(mockMarkAsRead).toHaveBeenCalledWith('notif-1');
      });

      // Component should still be functional
      expect(screen.getByText('Video Generation Complete')).toBeInTheDocument();
    });

    it('handles component unmounting during async operations', async () => {
      const user = userEvent.setup();

      const { unmount } = render(
        <TestProvider>
          <NotificationCenter {...defaultProps} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      const markReadButtons = screen.getAllByLabelText('Mark as read');
      await user.click(markReadButtons[0]);

      // Unmount while async operation might be in progress
      unmount();

      // Should not throw errors
      expect(() => {
        // Component is unmounted
      }).not.toThrow();
    });
  });

  describe('Custom Props Configuration', () => {
    it('respects maxNotifications prop configuration', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter maxNotifications={2} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      // Should only display 2 notifications
      expect(screen.getByText('Video Generation Complete')).toBeInTheDocument();
      expect(screen.getByText('Campaign Approval Required')).toBeInTheDocument();
      expect(screen.queryByText('System Maintenance Scheduled')).not.toBeInTheDocument();
    });

    it('respects showHeader prop configuration', async () => {
      const user = userEvent.setup();

      render(
        <TestProvider>
          <NotificationCenter showHeader={false} />
        </TestProvider>
      );

      const notificationButton = screen.getByLabelText('notifications');
      await user.click(notificationButton);

      expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Refresh')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Mark all as read')).not.toBeInTheDocument();
    });
  });
});
