import React from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { connect, useDispatch } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Popover from '@mui/material/Popover';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import { grey } from '@mui/material/colors';
import { OtherCommand, User } from '../../../common/types';
import { useWebsocket } from './SocketManager';
import type { RootState } from '../redux/store';
import { selectUser } from '../redux/slices/usersSlice';

type Props = {
  currentUser: User | null;
  appVersion: string | number;
  dbVersion: string | number;
  serverURI: string;
};

const TopNavigationPanel = ({
  currentUser,
  appVersion,
  dbVersion,
  serverURI,
}: Props) => {
  const { subscription } = useWebsocket();
  const location = useLocation();
  const history = useHistory();
  const theme = useTheme();
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const open = Boolean(anchorEl);

  const handleMenu = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault();
    }
  }

  const signOut = (): boolean => {
    dispatch(selectUser({ id: 0 } as User));
    return true;
  };

  const goToEditBench = (): boolean => {
    history.push({
      pathname: `/${currentUser?.name}/benches/edit/`,
      state: { background: location },
    });
    return true;
  };

  const goToEditUser = (): boolean => {
    history.push({
      pathname: `/${currentUser?.name}/users/edit/${currentUser?.id}`,
      state: { background: location },
    });
    return true;
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleBDClick = async (event: React.MouseEvent) => {
    if (event.detail === 3) {
      const resp = await subscription?.request({
        command: OtherCommand.RESET_CACHE,
      });
      console.log(resp);
    }
  };
  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor:
          currentUser !== null
            ? alpha(currentUser.color, 0.5)
            : theme.palette.primary.main,
      }}
    >
      <Toolbar variant="dense">
        <Box flexGrow={1} color={grey[50]}>
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.currentUser.contrastText,
            }}
          >
            Попробуй занять себе бенч!
          </Typography>
        </Box>
        {currentUser && (
          <Box position="relative" color={grey[50]}>
            <IconButton
              disableRipple
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              color="inherit"
              onClick={handleMenu}
            >
              <AccountCircle sx={{ marginRight: theme.spacing(2) }} />
              <Typography
                variant="subtitle1"
                sx={{
                  color: theme.palette.currentUser.contrastText,
                }}
              >
                {currentUser.name}
              </Typography>
            </IconButton>
            <Popover
              open={open}
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  autoFocusItem={open}
                  id="menu-list-grow"
                  onKeyDown={handleListKeyDown}
                >
                  <MenuItem
                    divider
                    onClick={() => goToEditBench() && handleClose()}
                  >
                    Добавить Бенч...
                  </MenuItem>
                  <MenuItem
                    divider
                    onClick={() => goToEditUser() && handleClose()}
                  >
                    Профиль
                  </MenuItem>
                  <MenuItem divider onClick={() => signOut() && handleClose()}>
                    Выйти
                  </MenuItem>
                  <MenuItem disabled divider>
                    <br />
                  </MenuItem>
                  <MenuItem divider disabled selected>
                    Версии:
                  </MenuItem>
                  <MenuItem dense divider>
                    <ListItemIcon>ПО: </ListItemIcon>
                    <ListItemText inset>{appVersion}</ListItemText>
                  </MenuItem>
                  <MenuItem dense onClick={handleBDClick}>
                    <ListItemIcon>БД: </ListItemIcon>
                    <ListItemText inset>{dbVersion}</ListItemText>{' '}
                  </MenuItem>
                  <MenuItem divider disabled selected>
                    Сервер:
                  </MenuItem>
                  <MenuItem dense>
                    <ListItemText>
                      {serverURI.includes('beta') ? 'Бета' : 'Основной'}
                    </ListItemText>{' '}
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Popover>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    currentUser: state.users.currentUser,
    appVersion: state.preferences.appVersion,
    dbVersion: state.preferences.dbVersion,
    serverURI: state.preferences.serverURI,
  };
};

export default connect(mapStateToProps)(TopNavigationPanel);
