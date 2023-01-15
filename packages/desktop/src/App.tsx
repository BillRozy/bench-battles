import React from 'react';
import { Box } from '@mui/material';
import { StyledEngineProvider } from '@mui/material/styles';
import { PersistGate } from 'redux-persist/integration/react';
import { HashRouter as Router } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import DynamicThemeProvider from './components/DynamicThemeProvider';
import SocketManager from './components/SocketManager';
import { persistor } from './redux/store';
import Commander from './components/Commander';
import DialogManager from './components/DialogManager';
import MainSwitch from './components/routing/MainSwitch';
import NotificationsFrame from './components/notifications/NotificationsFrame';

export default function App() {
  return (
    <StyledEngineProvider injectFirst>
      <PersistGate loading={null} persistor={persistor}>
        <SocketManager>
          <Commander />
          <Router>
            <DynamicThemeProvider>
              <CssBaseline />
              <Box
                width="100%"
                height="100%"
                minWidth="520px"
                minHeight="740px"
              >
                <Box height="100%" width="100%">
                  <NotificationsFrame>
                    <DialogManager />
                    <MainSwitch />
                  </NotificationsFrame>
                </Box>
              </Box>
            </DynamicThemeProvider>
          </Router>
        </SocketManager>
      </PersistGate>
    </StyledEngineProvider>
  );
}
