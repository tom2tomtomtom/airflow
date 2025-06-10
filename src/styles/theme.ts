import { createTheme, PaletteMode } from '@mui/material/styles';

// Premium Gradient Color Palette
const premiumColors = {
  // Light Mode
  light: {
    // Primary accent - Electric Violet
    primary: {
      main: '#7C3AED',
      light: '#8B5CF6',
      dark: '#6D28D9',
      glow: 'rgba(124, 58, 237, 0.3)',
      gradient: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
    },
    // Background gradients
    background: {
      default: '#FAFBFC',
      paper: '#FFFFFF',
      gradient: 'linear-gradient(135deg, #F8FAFF 0%, #FEF3FF 100%)',
      mesh: 'radial-gradient(at 40% 20%, hsla(280, 75%, 96%, 1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(340, 75%, 96%, 1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(220, 75%, 96%, 1) 0px, transparent 50%)',
    },
    // Text hierarchy
    text: {
      primary: '#0F172A',
      secondary: '#64748B',
      disabled: '#94A3B8',
    },
    // Floating panel styles
    panel: {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
      border: 'rgba(124, 58, 237, 0.1)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
      hoverShadow: '0 12px 48px rgba(124, 58, 237, 0.15), 0 4px 12px rgba(0, 0, 0, 0.05)',
    },
    // Glass morphism
    glass: {
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      border: 'rgba(255, 255, 255, 0.18)',
    },
  },
  // Dark Mode
  dark: {
    // Primary accent - Electric Purple
    primary: {
      main: '#A78BFA',
      light: '#C4B5FD',
      dark: '#8B5CF6',
      glow: 'rgba(167, 139, 250, 0.4)',
      gradient: 'linear-gradient(135deg, #A78BFA 0%, #F472B6 100%)',
    },
    // Background gradients
    background: {
      default: '#0A0E1A',
      paper: '#0F1629',
      gradient: 'linear-gradient(135deg, #0A0E1A 0%, #1A0F29 100%)',
      mesh: 'radial-gradient(at 40% 20%, hsla(280, 100%, 15%, 1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(340, 100%, 15%, 1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(220, 100%, 15%, 1) 0px, transparent 50%)',
    },
    // Text hierarchy
    text: {
      primary: '#F1F5F9',
      secondary: '#94A3B8',
      disabled: '#64748B',
    },
    // Floating panel styles
    panel: {
      background: 'rgba(15, 22, 41, 0.8)',
      backdropFilter: 'blur(20px)',
      border: 'rgba(167, 139, 250, 0.15)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.25)',
      hoverShadow: '0 12px 48px rgba(167, 139, 250, 0.25), 0 4px 12px rgba(0, 0, 0, 0.3)',
    },
    // Glass morphism
    glass: {
      background: 'rgba(15, 22, 41, 0.6)',
      backdropFilter: 'blur(10px)',
      border: 'rgba(167, 139, 250, 0.2)',
    },
  },
  // Shared colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

// Create theme factory
const createAirwaveTheme = (mode: PaletteMode = 'light') => {
  const colors = mode === 'light' ? premiumColors.light : premiumColors.dark;
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: colors.primary.main,
        light: colors.primary.light,
        dark: colors.primary.dark,
        contrastText: mode === 'light' ? '#FFFFFF' : '#000000',
      },
      secondary: {
        main: mode === 'light' ? '#EC4899' : '#F472B6',
        light: mode === 'light' ? '#F472B6' : '#F9A8D4',
        dark: mode === 'light' ? '#DB2777' : '#EC4899',
        contrastText: '#FFFFFF',
      },
      background: {
        default: colors.background.default,
        paper: colors.background.paper,
      },
      text: {
        primary: colors.text.primary,
        secondary: colors.text.secondary,
        disabled: colors.text.disabled,
      },
      success: {
        main: premiumColors.success,
        contrastText: '#FFFFFF',
      },
      error: {
        main: premiumColors.error,
        contrastText: '#FFFFFF',
      },
      warning: {
        main: premiumColors.warning,
        contrastText: '#FFFFFF',
      },
      info: {
        main: premiumColors.info,
        contrastText: '#FFFFFF',
      },
      divider: colors.panel.border,
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"SF Pro Display"',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700,
      h1: {
        fontWeight: 700,
        fontSize: '3rem',
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontWeight: 700,
        fontSize: '2.25rem',
        lineHeight: 1.2,
        letterSpacing: '-0.01em',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.875rem',
        lineHeight: 1.3,
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.3,
      },
      h5: {
        fontWeight: 500,
        fontSize: '1.25rem',
        lineHeight: 1.4,
      },
      h6: {
        fontWeight: 500,
        fontSize: '1.125rem',
        lineHeight: 1.4,
      },
      body1: {
        lineHeight: 1.6,
        letterSpacing: '0.01em',
      },
      body2: {
        lineHeight: 1.6,
        letterSpacing: '0.01em',
      },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      // Premium Button styles with elevation
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 12,
            fontWeight: 500,
            padding: '10px 24px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
          },
          contained: {
            background: colors.primary.gradient,
            color: '#FFFFFF',
            boxShadow: '0 4px 16px rgba(124, 58, 237, 0.25)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(124, 58, 237, 0.35)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(255, 255, 255, 0.2)',
              opacity: 0,
              transition: 'opacity 0.3s',
            },
            '&:hover::before': {
              opacity: 1,
            },
          },
          outlined: {
            borderColor: colors.primary.main,
            color: colors.primary.main,
            borderWidth: 2,
            '&:hover': {
              borderColor: colors.primary.dark,
              backgroundColor: `${colors.primary.main}10`,
              transform: 'translateY(-1px)',
              borderWidth: 2,
            },
          },
          text: {
            color: colors.primary.main,
            '&:hover': {
              backgroundColor: `${colors.primary.main}08`,
            },
          },
        },
      },
      // Floating Card styles with multi-layered shadows
      MuiCard: {
        styleOverrides: {
          root: {
            background: colors.panel.background,
            backdropFilter: colors.panel.backdropFilter,
            borderRadius: 24,
            border: `1px solid ${colors.panel.border}`,
            boxShadow: colors.panel.shadow,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: colors.panel.hoverShadow,
            },
          },
        },
      },
      // Floating Paper styles
      MuiPaper: {
        styleOverrides: {
          root: {
            background: colors.panel.background,
            backdropFilter: colors.panel.backdropFilter,
            borderRadius: 20,
            border: `1px solid ${colors.panel.border}`,
            boxShadow: colors.panel.shadow,
          },
          outlined: {
            borderColor: colors.panel.border,
          },
          elevation1: {
            boxShadow: colors.panel.shadow,
          },
          elevation2: {
            boxShadow: colors.panel.hoverShadow,
          },
        },
      },
      // Premium TextField styles
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
          size: 'medium',
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: `${colors.background.paper}CC`,
            backdropFilter: 'blur(8px)',
            borderRadius: 12,
            transition: 'all 0.3s ease',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.panel.border,
              borderWidth: 2,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary.main,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary.main,
              borderWidth: 2,
            },
            '&.Mui-focused': {
              backgroundColor: colors.background.paper,
              boxShadow: `0 0 0 4px ${colors.primary.glow}`,
            },
          },
          input: {
            padding: '14px 16px',
            '&::placeholder': {
              opacity: 0.7,
            },
          },
        },
      },
      // Glass morphism Drawer styles
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: colors.glass.background,
            backdropFilter: colors.glass.backdropFilter,
            borderRight: `1px solid ${colors.glass.border}`,
          },
        },
      },
      // Glass morphism AppBar styles
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: colors.glass.background,
            backdropFilter: colors.glass.backdropFilter,
            borderBottom: `1px solid ${colors.glass.border}`,
            boxShadow: 'none',
          },
        },
      },
      // Premium IconButton styles
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: `${colors.primary.main}15`,
              transform: 'scale(1.1)',
            },
            '&.Mui-selected': {
              backgroundColor: `${colors.primary.main}20`,
              color: colors.primary.main,
            },
          },
        },
      },
      // Premium List styles
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            margin: '4px 8px',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: `${colors.primary.main}08`,
              paddingLeft: '20px',
            },
            '&.Mui-selected': {
              background: colors.primary.gradient,
              color: '#FFFFFF',
              '&:hover': {
                background: colors.primary.gradient,
                opacity: 0.9,
              },
              '& .MuiListItemIcon-root': {
                color: '#FFFFFF',
              },
              '& .MuiListItemText-primary': {
                color: '#FFFFFF',
                fontWeight: 600,
              },
            },
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: '40px',
            transition: 'color 0.3s ease',
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          primary: {
            fontWeight: 500,
            transition: 'all 0.3s ease',
          },
        },
      },
      // Premium Chip styles
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            fontWeight: 500,
            transition: 'all 0.3s ease',
          },
          filled: {
            '&.MuiChip-colorPrimary': {
              background: colors.primary.gradient,
              color: '#FFFFFF',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            },
          },
          outlined: {
            borderWidth: 2,
            '&:hover': {
              backgroundColor: `${colors.primary.main}08`,
            },
          },
        },
      },
      // Glass morphism Menu styles
      MuiMenu: {
        styleOverrides: {
          paper: {
            background: colors.glass.background,
            backdropFilter: colors.glass.backdropFilter,
            border: `1px solid ${colors.glass.border}`,
            borderRadius: 16,
            boxShadow: colors.panel.shadow,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '2px 6px',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: `${colors.primary.main}10`,
              paddingLeft: '20px',
            },
          },
        },
      },
      // Premium Dialog styles
      MuiDialog: {
        styleOverrides: {
          paper: {
            background: colors.panel.background,
            backdropFilter: colors.panel.backdropFilter,
            border: `1px solid ${colors.panel.border}`,
            borderRadius: 24,
            boxShadow: colors.panel.hoverShadow,
          },
        },
      },
      // Premium Table styles
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              background: colors.glass.background,
              backdropFilter: colors.glass.backdropFilter,
              fontWeight: 600,
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: colors.panel.border,
          },
        },
      },
      // Add CssBaseline overrides
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background: colors.background.gradient,
            '&::before': {
              content: '""',
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: colors.background.mesh,
              opacity: mode === 'light' ? 0.4 : 0.2,
              pointerEvents: 'none',
              zIndex: -1,
            },
          },
        },
      },
    },
  });
};

// Create default themes
const lightTheme = createAirwaveTheme('light');
const darkTheme = createAirwaveTheme('dark');

// Export for use in custom components
export { premiumColors, createAirwaveTheme, lightTheme, darkTheme };
export default lightTheme;