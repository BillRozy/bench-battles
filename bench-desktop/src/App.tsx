import React from 'react';
import { Container, Box } from '@material-ui/core';
import { PersistGate } from 'redux-persist/integration/react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/styles';
import UserSelectionFrame from './components/UserSelectionFrame';
import BenchesStateFrame from './components/BenchesStateFrame';
import SocketManager from './components/SocketManager';
import UserRouteListener from './components/UserRouteListener';
import { persistor } from './redux/store';
import theme from './theme';

export default function App() {
  return (
    <SocketManager
      URI={
        process.env.NODE_ENV !== 'development'
          ? 'ws://bench-combat.herokuapp.com/eventbus'
          : 'ws://127.0.0.1:55555/eventbus'
      }
    >
      <CssBaseline />
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <ThemeProvider theme={theme}>
            <Box bgcolor="info.dark" width="100%" height="100%">
              <Container
                maxWidth="lg"
                disableGutters
                style={{ height: '100%' }}
              >
                <UserRouteListener />
                <Box height="100%" width="100%">
                  <Switch>
                    <Route path="/users" component={UserSelectionFrame} />
                    <Route
                      path="/benches/:userName"
                      component={BenchesStateFrame}
                    />
                  </Switch>
                </Box>
              </Container>
            </Box>
          </ThemeProvider>
        </Router>
      </PersistGate>
    </SocketManager>
  );
}
