import { createTheme } from '@mui/material/styles';

// Carbon Black Color Palette
const carbonColors = {
  // Primary amber accent
  amber: {
    main: '#FBBF24',
    hover: '#F59E0B',
    border: 'rgba(251, 191, 36, 0.2)',
    glow: 'rgba(251, 191, 36, 0.3)',
  },
  // Background hierarchy
  background: {
    primary: '#030712',    // Near black
    secondary: '#111827',  // Dark charcoal
    card: '#1F2937',      // Lighter charcoal
  },
  // Text contrast
  text: {
    primary: '#FFFFFF',
    secondary: '#9CA3AF',  // Cool gray
  },
  // Status colors
  success: '#10B981',     // Emerald green
  error: '#EF4444',       // Red
};

// Create Carbon Black theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: carbonColors.amber.main,
      dark: carbonColors.amber.hover,
      light: carbonColors.amber.main,
      contrastText: '#000000', // Black text on amber
    },
    secondary: {
      main: carbonColors.text.secondary,
      dark: '#6B7280',
      light: '#D1D5DB',
      contrastText: carbonColors.text.primary,
    },
    background: {
      default: carbonColors.background.primary,
      paper: carbonColors.background.card,
    },
    text: {
      primary: carbonColors.text.primary,
      secondary: carbonColors.text.secondary,
    },
    success: {
      main: carbonColors.success,
      contrastText: carbonColors.text.primary,
    },
    error: {
      main: carbonColors.error,
      contrastText: carbonColors.text.primary,
    },
    divider: carbonColors.amber.border,
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
    fontWeightBold: 600,
    h1: {
      fontWeight: 600,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      color: carbonColors.text.primary,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.2,
      color: carbonColors.text.primary,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.2,
      color: carbonColors.text.primary,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.2,
      color: carbonColors.text.primary,
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.2,
      color: carbonColors.text.primary,
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.125rem',
      lineHeight: 1.2,
      color: carbonColors.text.primary,
    },
    body1: {
      color: carbonColors.text.primary,
      lineHeight: 1.5,
    },
    body2: {
      color: carbonColors.text.secondary,
      lineHeight: 1.5,
    },
  },
  components: {
    // Carbon Black Button styles
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 4, // Sharp corners - 4px max
          fontWeight: 500,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        contained: {
          backgroundColor: carbonColors.amber.main,
          color: '#000000', // Black text on amber
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: carbonColors.amber.hover,
            boxShadow: `0 0 0 2px ${carbonColors.amber.glow}`,
          },
          '&:active': {
            backgroundColor: carbonColors.amber.hover,
          },
          '&:focus': {
            outline: `2px solid ${carbonColors.amber.main}`,
            outlineOffset: '2px',
          },
        },
        outlined: {
          borderColor: carbonColors.amber.border,
          color: carbonColors.amber.main,
          '&:hover': {
            borderColor: carbonColors.amber.main,
            backgroundColor: 'rgba(251, 191, 36, 0.08)',
            boxShadow: `0 0 0 1px ${carbonColors.amber.glow}`,
          },
        },
        text: {
          color: carbonColors.text.secondary,
          '&:hover': {
            backgroundColor: 'rgba(251, 191, 36, 0.08)',
            color: carbonColors.amber.main,
          },
        },
      },
    },
    // Carbon Black Card styles
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: carbonColors.background.card,
          borderRadius: 4, // Sharp corners
          border: `1px solid ${carbonColors.amber.border}`,
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: carbonColors.amber.main,
            boxShadow: `0 0 0 1px ${carbonColors.amber.glow}`,
          },
        },
      },
    },
    // Carbon Black Paper styles
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: carbonColors.background.card,
          borderRadius: 4,
          border: `1px solid ${carbonColors.amber.border}`,
          boxShadow: 'none',
        },
        outlined: {
          borderColor: carbonColors.amber.border,
        },
      },
    },
    // Carbon Black TextField styles
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: carbonColors.background.secondary,
          borderRadius: 4,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: carbonColors.amber.border,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: carbonColors.amber.main,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: carbonColors.amber.main,
            borderWidth: '2px',
            boxShadow: `0 0 0 2px ${carbonColors.amber.glow}`,
          },
        },
        input: {
          color: carbonColors.text.primary,
          '&::placeholder': {
            color: carbonColors.text.secondary,
            opacity: 1,
          },
        },
      },
    },
    // Carbon Black Drawer styles
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: carbonColors.background.primary,
          borderRight: `1px solid ${carbonColors.amber.border}`,
        },
      },
    },
    // Carbon Black AppBar styles
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: carbonColors.background.secondary,
          borderBottom: `1px solid ${carbonColors.amber.border}`,
          boxShadow: 'none',
        },
      },
    },
    // Carbon Black IconButton styles
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: carbonColors.text.secondary,
          borderRadius: 4,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: 'rgba(251, 191, 36, 0.08)',
            color: carbonColors.amber.main,
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(251, 191, 36, 0.12)',
            color: carbonColors.amber.main,
          },
        },
      },
    },
    // Carbon Black List styles
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          margin: '2px 8px',
          '&:hover': {
            backgroundColor: 'rgba(251, 191, 36, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(251, 191, 36, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(251, 191, 36, 0.16)',
            },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: carbonColors.text.secondary,
          minWidth: '40px',
          '.Mui-selected &': {
            color: carbonColors.amber.main,
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: carbonColors.text.primary,
          fontWeight: 400,
          '.Mui-selected &': {
            fontWeight: 500,
            color: carbonColors.amber.main,
          },
        },
      },
    },
    // Carbon Black Chip styles
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: carbonColors.background.secondary,
          color: carbonColors.text.secondary,
          border: `1px solid ${carbonColors.amber.border}`,
        },
        filled: {
          '&.MuiChip-colorPrimary': {
            backgroundColor: carbonColors.amber.main,
            color: '#000000',
          },
        },
      },
    },
    // Carbon Black Menu styles
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: carbonColors.background.card,
          border: `1px solid ${carbonColors.amber.border}`,
          borderRadius: 4,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: carbonColors.text.primary,
          '&:hover': {
            backgroundColor: 'rgba(251, 191, 36, 0.08)',
          },
        },
      },
    },
    // Carbon Black Dialog styles
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: carbonColors.background.card,
          border: `1px solid ${carbonColors.amber.border}`,
          borderRadius: 4,
        },
      },
    },
    // Carbon Black Table styles
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: carbonColors.background.secondary,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: carbonColors.amber.border,
          color: carbonColors.text.primary,
        },
        head: {
          fontWeight: 500,
          color: carbonColors.text.primary,
        },
      },
    },
  },
});

// Export carbon colors for use in custom components
export { carbonColors };
export default theme;