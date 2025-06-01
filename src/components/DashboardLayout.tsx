import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Divider,
  Chip,
  InputAdornment,
  TextField,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Business as ClientsIcon,
  Campaign as CampaignIcon,
  Image as AssetsIcon,
  ViewModule as MatrixIcon,
  Description as TemplatesIcon,
  Psychology as StrategicIcon,
  PlayArrow as ExecuteIcon,
  Visibility as PreviewIcon,
  CheckCircle as SignOffIcon,
  AutoAwesome as GenerateIcon,
  Assignment as ApprovalsIcon,
  Analytics as AnalyticsIcon,
  Webhook as WebhookIcon,
  Share as SocialIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import ClientSelector from './ClientSelector';
import UserMenu from './UserMenu';
import NotificationCenter from './realtime/NotificationCenter';
import LiveCollaboration from './realtime/LiveCollaboration';
import { GlobalSearch } from './GlobalSearch';

const drawerWidth = 240;

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
  { name: 'Clients', href: '/clients', icon: ClientsIcon },
  { name: 'Campaigns', href: '/campaigns', icon: CampaignIcon },
  { divider: true },
  { name: 'Strategy', href: '/strategic-content', icon: StrategicIcon },
  { name: 'Generate', href: '/generate-enhanced', icon: GenerateIcon },
  { name: 'Assets', href: '/assets', icon: AssetsIcon },
  { name: 'Templates', href: '/templates', icon: TemplatesIcon },
  { name: 'Matrix', href: '/matrix', icon: MatrixIcon },
  { divider: true },
  { name: 'Execute', href: '/execute', icon: ExecuteIcon },
  { name: 'Approvals', href: '/approvals', icon: ApprovalsIcon },
  { name: 'Social Publishing', href: '/social-publishing', icon: SocialIcon },
  { name: 'Analytics', href: '/analytics', icon: AnalyticsIcon },
  { name: 'Webhooks', href: '/webhooks', icon: WebhookIcon },
  { name: 'Preview', href: '/preview', icon: PreviewIcon },
  { name: 'Sign Off', href: '/sign-off', icon: SignOffIcon },
];

export type DashboardLayoutProps = {
  title?: string;
  children: React.ReactNode;
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ title, children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Add Cmd+K / Ctrl+K keyboard shortcut for global search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const drawer = (
    <div>
      <Toolbar>
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          className="carbon-text-gradient"
          sx={{ 
            fontWeight: 600, 
            cursor: 'pointer',
            fontSize: '1.5rem',
          }}
          onClick={() => router.push('/dashboard')}
        >
          AIrWAVE
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {navigation.map((item, index) => {
          if (item.divider) {
            return <Divider key={`divider-${index}`} sx={{ my: 1 }} />;
          }
          
          const Icon = item.icon!;
          const isActive = router.pathname === item.href || 
                          (item.href === '/clients' && router.pathname.startsWith('/clients')) ||
                          (item.href === '/campaigns' && router.pathname.startsWith('/campaigns'));
          
          return (
            <ListItem key={item.name} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => {
                  router.push(item.href!);
                  if (isMobile) {
                    setMobileOpen(false);
                  }
                }}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <Icon color={isActive ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText 
                  primary={item.name}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'primary.main' : 'inherit',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600, flexGrow: 1 }}>
            {title || 'AIrWAVE Dashboard'}
          </Typography>
          
          {/* Global Search Button */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
            <TextField
              size="small"
              placeholder="Search... (⌘K)"
              onClick={() => setSearchOpen(true)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Chip 
                      label="⌘K" 
                      size="small" 
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </InputAdornment>
                ),
                readOnly: true,
              }}
              sx={{ 
                minWidth: 200,
                cursor: 'pointer',
                '& .MuiInputBase-input': {
                  cursor: 'pointer',
                },
                display: { xs: 'none', md: 'block' }
              }}
            />
            
            {/* Mobile search icon */}
            <IconButton 
              onClick={() => setSearchOpen(true)}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              <SearchIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ClientSelector variant="chip" />
            <LiveCollaboration compact />
            <NotificationCenter />
            <UserMenu />
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="navigation menu"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar />
        {children}
      </Box>
      
      {/* Global Search Modal */}
      <GlobalSearch 
        open={searchOpen} 
        onClose={() => setSearchOpen(false)} 
      />
    </Box>
  );
};

export default DashboardLayout;
