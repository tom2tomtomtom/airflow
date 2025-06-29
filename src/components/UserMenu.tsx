import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography} from '@mui/material';
import {
  AccountCircle as AccountIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { useThemeMode } from '@/contexts/ThemeContext';

const UserMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const router = useRouter();
  const { mode, toggleMode } = useThemeMode();
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClose();
    await logout();
  };

  const handleProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClose();
    router.push('/profile');
  };

  const handleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClose();
    router.push('/settings');
  };

  const handleThemeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMode();
    handleClose();
  };

  return (
    <Box>
      <IconButton
        data-testid="user-menu"
        onClick={handleClick}
        size="small"
        sx={{ ml: 2 }}
        aria-controls={open ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        aria-label="User menu"
      >
        <Avatar sx={{ width: 32, height: 32 }}>
          {user?.name?.charAt(0).toUpperCase() || <PersonIcon />}
        </Avatar>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        id="user-menu"
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1 },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0 },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <AccountIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2">
              {user?.name || 'User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleSettings}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        
        <MenuItem onClick={handleThemeToggle}>
          <ListItemIcon>
            {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
          </ListItemIcon>
          {mode === 'light' ? 'Dark Mode' : 'Light Mode'}
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleLogout} data-testid="logout-button">
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserMenu;