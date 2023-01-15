import React from 'react';
import {
  Box,
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { User, OtherCommand } from 'common';
import DrawerLayout from '@components/drawer/DrawerLayout';
import drawerStyledCreator from '@components/drawer/styled';
import type { PreferencesState } from '@redux/slices/preferencesSlice';
import { useWebsocket } from '@components/SocketManager';
import { styledWithColorForCurrentUser } from '@components/styling';
import { useDrawer } from '@components/routing/hooks';
import { appLogger } from '../../log';

const DRAWER_WIDTH = 330;
const { AppBar, DrawerHeader, Main } = drawerStyledCreator(DRAWER_WIDTH);
const StyledAppBar = styledWithColorForCurrentUser<AppBar>(AppBar, {
  dontForwardUser: false,
});
const StyledMenuIcon = styledWithColorForCurrentUser(MenuIcon);
const StyledCloseIcon = styledWithColorForCurrentUser(CloseIcon);

type UserDashboardProps = {
  currentUser: User | null;
  preferences: PreferencesState;
  children: JSX.Element | JSX.Element[];
  navigationTabs: JSX.Element;
  navigationContent: JSX.Element;
};

const UserDashboard = ({
  currentUser,
  preferences,
  children,
  navigationTabs,
  navigationContent,
}: UserDashboardProps) => {
  const { subscription } = useWebsocket();
  const { isDrawerOpen, openDrawer, closeDrawer } = useDrawer();
  const handleBDClick = async (event: React.MouseEvent) => {
    if (event.detail === 3) {
      const resp = await subscription?.request({
        command: OtherCommand.RESET_CACHE,
      });
      appLogger.debug(`${resp}`);
    }
  };
  return (
    <DrawerLayout
      appBar={
        <StyledAppBar
          open={isDrawerOpen}
          openDrawerComponent={
            <IconButton
              aria-label="open drawer"
              onClick={isDrawerOpen ? closeDrawer : openDrawer}
              edge="start"
              sx={{ mr: 2 }}
            >
              {isDrawerOpen ? (
                <StyledCloseIcon currentUser={currentUser} />
              ) : (
                <StyledMenuIcon currentUser={currentUser} />
              )}
            </IconButton>
          }
          currentUser={currentUser}
          appVersion={preferences.appVersion}
          dbVersion={preferences.dbVersion}
          serverURI={preferences.serverURI}
        />
      }
      drawer={
        <Drawer
          variant="persistent"
          anchor="left"
          open={isDrawerOpen}
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              background: 'inherit',
            },
          }}
        >
          <DrawerHeader>{navigationTabs}</DrawerHeader>
          <Divider />
          <Box height="100%" display="flex" flexDirection="column">
            <List
              sx={{
                width: '100%',
              }}
              component="nav"
            >
              <ListItem>{navigationContent}</ListItem>
            </List>
            <Box flexGrow={1} is-flex />
            <List sx={{ marginTop: 'auto', color: 'white' }}>
              <ListItem dense divider>
                <ListItemIcon sx={{ color: 'lightgray' }}>
                  Версия ПО:
                </ListItemIcon>
                <ListItemText inset>{preferences.appVersion}</ListItemText>
              </ListItem>
              <ListItem dense onClick={handleBDClick} divider>
                <ListItemIcon sx={{ color: 'lightgray' }}>
                  Версия БД:
                </ListItemIcon>
                <ListItemText inset>{preferences.dbVersion}</ListItemText>
              </ListItem>
              <ListItem dense divider sx={{ color: 'lightgray' }}>
                <span>Сервер:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                <ListItemText inset sx={{ color: 'white' }}>
                  {preferences.serverURI.includes('beta') ? 'Бета' : 'Основной'}
                </ListItemText>
              </ListItem>
            </List>
          </Box>
        </Drawer>
      }
      main={<Main open={isDrawerOpen}>{children}</Main>}
    />
  );
};

export default UserDashboard;
