import React, { useState, useContext } from 'react';
import { connect, useDispatch } from 'react-redux';
import {
  Grid,
  Box,
  Fade,
  Menu,
  MenuItem,
  Alert,
  AlertTitle,
} from '@mui/material';
import { User, CommandResponse } from 'common';
import type { RootState } from '@redux/store';
import { selectUser } from '@redux/slices/usersSlice';
import { selectors } from '@redux/slices/benchesSlice';
import useWithConfirmation from '@components/hooks/notification';
import { Context } from '@components/notifications/NotificationsProvider';
import UserCard from './UserCard';
import { useUsersNavigation, useUsersCRUD } from './hooks';

type UserSelectionProps = {
  users: User[];
  benchOwners: number[];
};

const UserSelectionFrame = ({ users, benchOwners }: UserSelectionProps) => {
  const { goToCreateUser } = useUsersNavigation();
  const [userToEdit, setUserToEdit] = useState<User | undefined>(undefined);
  const [response, setResponse] = useState<CommandResponse | undefined>(
    undefined
  );
  const [anchorForContextMenu, setAnchorForContextMenu] =
    useState<Element | null>(null);
  const dispatch = useDispatch();
  const withConfirmation = useWithConfirmation();
  const { deleteUser } = useUsersCRUD();
  const { showNotification } = useContext(Context);
  const wrappedDeleteUser = async (user: User) => {
    withConfirmation(
      `Вы точно хотите удалить пользователя ${user.name}?`,
      async () => {
        const resp = await deleteUser(user);
        if (!resp?.success) {
          showNotification({
            severity: 'error',
            content: `Пользователь с ID: ${user.id} не был удален успешно - ${resp}`,
          });
        } else {
          showNotification({
            severity: 'success',
            content: `Пользователь с ID: ${user.id} был удален успешно`,
          });
        }
        setAnchorForContextMenu(null);
      },
      () => setAnchorForContextMenu(null)
    );
  };
  const canDelete = () => {
    return userToEdit != null && !benchOwners.includes(userToEdit.id);
  };
  return (
    <Box
      height="100%"
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >
      <Fade in timeout={750}>
        <Grid
          container
          spacing={3}
          sx={{
            height: '100%',
            maxHeight: '600px',
          }}
          justifyContent="center"
        >
          {users.map((it) => {
            return (
              <Grid
                sx={{ minWidth: '240px' }}
                container
                item
                xs={3}
                key={it.name}
                alignItems="center"
                alignContent="center"
              >
                <UserCard
                  huge
                  fullwidth
                  clickable
                  user={it}
                  onContextMenu={(event) => {
                    setAnchorForContextMenu(event.currentTarget);
                    setUserToEdit(it);
                  }}
                  onClick={() => dispatch(selectUser(it))}
                />
              </Grid>
            );
          })}
          <Grid container item xs={3} alignItems="center" alignContent="center">
            <UserCard
              huge
              fullwidth
              clickable
              user={{ name: 'Создать Себя!', color: '#EEE', id: 0 }}
              onClick={() => goToCreateUser(true)}
            />
          </Grid>
          {response != null && (
            <Grid
              container
              item
              xs={3}
              alignItems="center"
              alignContent="center"
            >
              <Alert severity="error" onClose={() => setResponse(undefined)}>
                <AlertTitle>Error</AlertTitle>
                Can not remove user, check error here:
                <br />
                {response.data?.toString()}
              </Alert>
            </Grid>
          )}

          <Menu
            sx={{
              '& .MuiPaper-root': { backgroundColor: 'white' },
            }}
            id="user-menu"
            aria-labelledby="user-button"
            anchorEl={anchorForContextMenu}
            open={anchorForContextMenu != null}
            onClose={() => setAnchorForContextMenu(null)}
          >
            {userToEdit && (
              <MenuItem
                disabled={!canDelete()}
                onClick={() => {
                  wrappedDeleteUser(userToEdit);
                }}
              >
                Удалить
              </MenuItem>
            )}
          </Menu>
        </Grid>
      </Fade>
    </Box>
  );
};
const mapStateToProps = (state: RootState) => {
  return {
    users: state.users.all,
    benchOwners: selectors.getOwnersOfBenches(state.benches),
  };
};

export default connect(mapStateToProps)(UserSelectionFrame);
