import React from 'react';
import { connect } from 'react-redux';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import { User } from 'common';

import type { RootState } from '../redux/store';

declare module '@mui/material/styles' {
  interface Palette {
    neutral: Palette['primary'];
    currentUser: Palette['primary'];
  }
  interface PaletteOptions {
    neutral: PaletteOptions['primary'];
    currentUser: PaletteOptions['primary'];
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    neutral: true;
    currentUser: true;
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    neutral: true;
    currentUser: true;
  }
}

declare module '@mui/material/Switch' {
  interface SwitchPropsColorOverrides {
    neutral: true;
    currentUser: true;
  }
}

const getDefaultThemeOpts = (user: User | null = null) => ({
  palette: {
    primary: {
      main: grey[800],
    },
    secondary: {
      main: grey[100],
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#eb9b37',
    },
    info: {
      main: '#575d67',
    },
    success: {
      main: '#6eab6f',
    },
    neutral: {
      main: grey[400],
    },
    currentUser: {
      main: user?.color || grey.A400,
    },
  },
});

let theme = createTheme(getDefaultThemeOpts());

type DynamicThemeProviderProps = {
  user: User | null;
  children: JSX.Element | JSX.Element[];
};

const DynamicThemeProvider = ({
  user,
  children,
}: DynamicThemeProviderProps) => {
  const customThemeOpts = getDefaultThemeOpts(user);
  theme = createTheme(customThemeOpts);
  theme.palette.neutral = theme.palette.augmentColor({
    color: customThemeOpts.palette.neutral,
  });
  theme.palette.currentUser = theme.palette.augmentColor({
    color: customThemeOpts.palette.currentUser,
  });
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

const mapStateToProps = (state: RootState) => {
  return {
    user: state.users.currentUser,
  };
};

export default connect(mapStateToProps)(DynamicThemeProvider);
