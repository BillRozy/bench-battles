import React, { MouseEventHandler } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import { alpha, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import {
  Button,
  ButtonGroup,
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  Box,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import { Info, Build, Clear } from '@mui/icons-material';
import { StyledIconButton } from './utility/StyledIconButton';
import { useWebsocket } from './SocketManager';
import { BenchCommand, User, Bench, OtherCommand } from '../../../common/types';
import UserCard from './UserCard';
import type { RootState } from '../redux/store';
import { establishRDPConnection, fancySecondsFormat } from '../helpers/index';

type BenchCardProps = {
  bench: Bench;
  currentUser: User | null;
  users: User[];
};

const benchActionBtnLabelForOwner = 'Освободить';
const benchActionBtnLabelForPendingOwner = 'Подтвердить';
const benchActionBtnLabelForInLine = 'Покинуть очередь';
const benchActionBtnLabelForFreeBench = 'Занять';
const benchActionBtnLabelForOwnedBench = 'В Очередь';

const BenchCard = ({ bench, currentUser, users }: BenchCardProps) => {
  const { subscription } = useWebsocket();
  const history = useHistory();
  const location = useLocation();
  const theme = useTheme();
  if (currentUser == null) return null;
  const handleClickMaintenance = () => {
    subscription?.publish({
      command: OtherCommand.TOGGLE_MAINTENANCE_BENCH,
      benchId: bench.id,
      userId: currentUser?.id,
    });
  };
  const isUserInLine = bench.line.includes(currentUser?.id);
  const isUserOwner = bench.owner === currentUser?.id;
  const {
    pending: isBenchPending,
    pendingTimeLeft,
    owner: ownerId,
    ownedTime,
  } = bench;
  const benchIsFree = ownerId === null;
  const takeBenchCmd: BenchCommand = {
    command: OtherCommand.REQUEST_BENCH,
    benchId: bench.id,
    userId: currentUser?.id,
  };
  const freeBenchCmd: BenchCommand = {
    command: OtherCommand.FREE_BENCH,
    benchId: bench.id,
    userId: currentUser?.id,
  };
  const benchLine = bench.line.map((id) => users.find((it) => it.id === id));
  const benchOwner = users.find((it) => it.id === ownerId);
  const requestRDPConnection = bench.ip
    ? () => {
        establishRDPConnection(bench.ip || '');
      }
    : null;

  let headerButtonTitle = 'Занять';
  let headerButtonAction = takeBenchCmd;
  if (isUserOwner) {
    headerButtonAction = isBenchPending ? takeBenchCmd : freeBenchCmd;
    headerButtonTitle = isBenchPending
      ? benchActionBtnLabelForPendingOwner
      : benchActionBtnLabelForOwner;
  } else if (benchIsFree) {
    headerButtonTitle = benchActionBtnLabelForFreeBench;
  } else {
    headerButtonTitle = isUserInLine
      ? benchActionBtnLabelForInLine
      : benchActionBtnLabelForOwnedBench;
  }
  const benchOwnerColor =
    isBenchPending || bench.maintenance
      ? theme.palette.neutral.dark
      : benchOwner?.color || theme.palette.neutral.main;
  const contrastColor = theme.palette.getContrastText(benchOwnerColor);
  const editBench = () => {
    history.push({
      pathname: `/${currentUser?.name}/benches/edit/${bench.id}`,
      state: { background: location },
    });
  };
  return (
    <Card
      square
      elevation={12}
      sx={{
        background: 'transparent',
      }}
    >
      <CardHeader
        sx={{
          backgroundColor: benchOwnerColor,
          color: theme.palette.getContrastText(benchOwnerColor),
          padding: theme.spacing(2),
          alignContent: 'center',
          '& .MuiCardHeader-action': {
            margin: 0,
            marginLeft: theme.spacing(2),
            height: '100%',
          },
          '& .MuiCardHeader-avatar': {
            maxWidth: '6em',
          },
        }}
        avatar={
          <Typography variant="h6" noWrap title={bench.name}>
            {bench.name}
          </Typography>
        }
        action={
          <ButtonGroup
            sx={{ minHeight: '32px' }}
            disableElevation
            disableFocusRipple
            size="small"
            variant="outlined"
            aria-label="small outlined button group"
          >
            {isUserOwner && (
              <StyledIconButton
                contrastColor={contrastColor}
                color={isUserOwner ? 'currentUser' : 'neutral'}
                onClick={
                  requestRDPConnection as MouseEventHandler<HTMLButtonElement>
                }
                endIcon={<DesktopWindowsIcon />}
              />
            )}
            <StyledIconButton
              contrastColor={contrastColor}
              color={isUserOwner ? 'currentUser' : 'neutral'}
              onClick={editBench}
              endIcon={<Info />}
            />
            <StyledIconButton
              title={
                bench.maintenance
                  ? 'Закончить обслуживание бенчи'
                  : 'Начать обслуживание бенчи'
              }
              contrastColor={contrastColor}
              color={isUserOwner ? 'currentUser' : 'neutral'}
              onClick={handleClickMaintenance}
              endIcon={bench.maintenance ? <Clear /> : <Build />}
            />
          </ButtonGroup>
        }
      />
      <CardContent
        sx={{
          background: alpha(grey[50], 0.9),
          minWidth: '200px',
          padding: '0 !important',
        }}
      >
        <List component="nav" aria-label="bench users" disablePadding>
          <ListItem
            divider
            sx={{
              justifyContent: 'center',
              minHeight: '50px',
            }}
          >
            {isUserOwner || benchIsFree ? (
              <Button
                size="small"
                aria-label="take bench or free bench"
                color="primary"
                variant="outlined"
                disabled={
                  benchIsFree
                    ? bench.maintenance
                    : !isUserOwner && bench.maintenance
                }
                onClick={() => subscription?.publish(headerButtonAction)}
              >
                {headerButtonTitle}
              </Button>
            ) : (
              benchOwner && (
                <UserCard
                  user={benchOwner}
                  disabled={isBenchPending}
                  fullwidth
                  currentUser={benchOwner.name === currentUser?.name}
                />
              )
            )}
          </ListItem>
          {bench.owner && (
            <ListItem divider dense>
              <Box mx="auto">
                {fancySecondsFormat(
                  isBenchPending ? pendingTimeLeft : ownedTime
                )}
              </Box>
            </ListItem>
          )}
          <ListItem selected divider dense>
            <Box mx="auto">Очередь</Box>
          </ListItem>
          {benchLine.length === 0 && (benchIsFree || isUserOwner) && (
            <ListItem
              divider
              sx={{
                justifyContent: 'center',
                minHeight: '50px',
              }}
            >
              Пусто
            </ListItem>
          )}
          {benchLine.map((it) => {
            if (it == null) {
              return null;
            }
            return (
              <ListItem
                divider
                sx={{
                  justifyContent: 'center',
                  minHeight: '50px',
                }}
                key={it.name}
              >
                <UserCard
                  user={it}
                  fullwidth
                  currentUser={it.name === currentUser?.name}
                />
              </ListItem>
            );
          })}
          {!benchIsFree && !isUserOwner && (
            <ListItem
              sx={{
                justifyContent: 'center',
                minHeight: '50px',
              }}
            >
              <Button
                size="small"
                aria-label="go in line"
                color="primary"
                variant="outlined"
                disabled={isUserInLine ? false : bench.maintenance}
                onClick={() =>
                  subscription?.publish(
                    isUserInLine ? freeBenchCmd : takeBenchCmd
                  )
                }
              >
                {isUserInLine
                  ? benchActionBtnLabelForInLine
                  : benchActionBtnLabelForOwnedBench}
              </Button>
            </ListItem>
          )}
        </List>
      </CardContent>
    </Card>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    users: state.users.all,
    currentUser: state.users.currentUser,
  };
};

export default connect(mapStateToProps)(BenchCard);
