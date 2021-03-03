import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Box from '@material-ui/core/Box';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { grey } from '@material-ui/core/colors';
import { User } from '../../../common/types';
import type { RootState } from '../redux/store';

type Props = {
  currentUser: User;
};

const useStyles = makeStyles((theme) => ({
  appBar: (props: Props) => ({
    background: fade(props.currentUser.color, 0.5),
  }),
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 10,
  },
  fullwidth: {
    width: '100%',
  },
}));

const TopNavigationPanel = ({ currentUser }: Props) => {
  const classes = useStyles({ currentUser });
  const [anchorEl, setAnchorEl] = React.useState<EventTarget | null>(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault();
    }
  }

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <AppBar position="static" className={classes.appBar}>
      <Toolbar variant="dense">
        <Box flexGrow={1} color={grey[50]}>
          <Typography variant="h6">Попробуй занять себе бенч!</Typography>
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
              <AccountCircle className={classes.menuButton} />
              <Typography variant="subtitle1">{currentUser.name}</Typography>
            </IconButton>
            <Popper
              open={open}
              anchorEl={anchorEl}
              role={undefined}
              transition
              disablePortal
              className={classes.fullwidth}
            >
              {({ TransitionProps, placement }) => (
                <Grow
                  {...TransitionProps}
                  style={{
                    transformOrigin:
                      placement === 'bottom' ? 'center top' : 'center bottom',
                  }}
                >
                  <Paper>
                    <ClickAwayListener onClickAway={handleClose}>
                      <MenuList
                        autoFocusItem={open}
                        id="menu-list-grow"
                        onKeyDown={handleListKeyDown}
                      >
                        <Link to="/users/remove">
                          <MenuItem onClick={handleClose}>Выйти</MenuItem>
                        </Link>
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    currentUser: state.users.currentUser,
  };
};

export default connect(mapStateToProps)(TopNavigationPanel);
