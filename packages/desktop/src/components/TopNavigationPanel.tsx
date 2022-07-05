import React, { HTMLAttributes, MouseEvent } from 'react';
import { useTheme } from '@mui/material/styles';
import { useDispatch } from 'react-redux';
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
import { User } from 'common';
import { selectUser } from '../redux/slices/usersSlice';
import { WhitePaper } from './styling';

export type TopNavigationPanelProps = {
  currentUser: User | null;
  appVersion: string | number;
  dbVersion: string | number;
  serverURI: string;
  openDrawerComponent: JSX.Element | undefined;
} & HTMLAttributes<Element>;

const TopNavigationPanel = React.forwardRef(function TopNavigationPanelInner(
  {
    currentUser,
    appVersion,
    dbVersion,
    serverURI,
    openDrawerComponent,
    ...htmls
  }: TopNavigationPanelProps,
  ref
) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const openContext = Boolean(anchorEl);

  const handleMenu = (event: MouseEvent<Element>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleListKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Tab') {
      event.preventDefault();
    }
  };

  const signOut = (): boolean => {
    dispatch(selectUser({ id: 0 } as User));
    return true;
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <AppBar
      ref={ref as React.MutableRefObject<HTMLDivElement>}
      className={htmls.className}
      position="relative"
    >
      <Toolbar>
        {openDrawerComponent}
        <Box flexGrow={1}>
          <Typography variant="h6">Попробуй занять себе бенч!</Typography>
        </Box>
        {currentUser && (
          <Box position="relative">
            <IconButton
              disableRipple
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              color="inherit"
              onClick={handleMenu}
            >
              <AccountCircle sx={{ marginRight: theme.spacing(2) }} />
              <Typography variant="subtitle1">{currentUser.name}</Typography>
            </IconButton>
            <Popover
              open={openContext}
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
                <WhitePaper>
                  <MenuList
                    autoFocusItem={openContext}
                    id="menu-list-grow"
                    onKeyDown={handleListKeyDown}
                  >
                    <MenuItem
                      divider
                      onClick={() => signOut() && handleClose()}
                    >
                      Выйти
                    </MenuItem>
                  </MenuList>
                </WhitePaper>
              </ClickAwayListener>
            </Popover>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
});

export default TopNavigationPanel;
