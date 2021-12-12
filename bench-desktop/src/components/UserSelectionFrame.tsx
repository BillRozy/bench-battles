import React, { useState } from 'react';
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
import { useLocation, useHistory } from 'react-router-dom';
import UserCard from './UserCard';
import {
  User,
  CrudCommand,
  CommandResponse,
  Entity,
  DeleteEntityCommand,
} from '../../../common/types';
import type { RootState } from '../redux/store';
import { selectUser } from '../redux/slices/usersSlice';
import { selectors } from '../redux/slices/benchesSlice';
import { requestConfirmation } from '../redux/slices/interactionsSlice';
import { useWebsocket } from './SocketManager';
import { appLogger as logger } from '../log';

type UserSelectionProps = {
  users: User[];
  benchOwners: number[];
};

const UserSelectionFrame = ({ users, benchOwners }: UserSelectionProps) => {
  const location = useLocation();
  const history = useHistory();
  const [userToEdit, setUserToEdit] = useState<User | undefined>(undefined);
  const [response, setResponse] = useState<CommandResponse | undefined>(
    undefined
  );
  const [
    anchorForContextMenu,
    setAnchorForContextMenu,
  ] = useState<Element | null>(null);
  const dispatch = useDispatch();
  const { subscription } = useWebsocket();
  const goToEditUser = (): boolean => {
    history.push({
      pathname: `/users/new/`,
      state: { background: location },
    });
    return true;
  };
  const deleteUser = async ({ id }: { id: number }) => {
    dispatch(
      requestConfirmation({
        content: `Вы точно хотите удалить пользователя ${
          users.find((it) => it.id === id)?.name
        }?`,
        onConfirm: async () => {
          const resp = await subscription?.request({
            command: CrudCommand.DELETE_ENTITY,
            entity: Entity.USER,
            data: {
              id,
            },
          } as DeleteEntityCommand);
          logger.info(`delete user response: ${resp}`);
          if (!resp?.success) {
            setResponse(resp);
          }
          setAnchorForContextMenu(null);
        },
        onCancel: () => {
          setAnchorForContextMenu(null);
        },
      })
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
          // alignItems="center"
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
              onClick={goToEditUser}
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
                  deleteUser({ id: userToEdit.id });
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
