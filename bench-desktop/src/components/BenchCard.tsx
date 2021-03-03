import React from 'react';
import { connect } from 'react-redux';
import { fade } from '@material-ui/core/styles/colorManipulator';
import Typography from '@material-ui/core/Typography';
import {
  Button,
  ButtonGroup,
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  Box,
} from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import DesktopWindowsIcon from '@material-ui/icons/DesktopWindows';
import InfoIcon from '@material-ui/icons/Info';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { useWebsocket } from './SocketManager';
import { BenchCommand, User, Bench } from '../../../common/types';
import UserCard from './UserCard';
import type { RootState } from '../redux/store';
import { establishRDPConnection } from '../helpers/index';

type BenchCardProps = {
  bench: Bench;
  currentUser: User;
  users: User[];
};

type OwnerBasedStylesProps = {
  benchOwner: User | undefined;
};

const useStyles = makeStyles((theme) =>
  createStyles({
    root: ({ benchOwner }: OwnerBasedStylesProps) => ({
      backgroundColor: benchOwner != null ? benchOwner.color : '#EEE',
      color: benchOwner != null ? '#FFF' : 'inherit',
      padding: theme.spacing(2),
    }),
    action: {
      margin: 0,
    },
    listItem: {
      justifyContent: 'center',
      minHeight: '50px',
    },
    cardContent: {
      background: fade(grey[50], 0.9),
      minWidth: '200px',
      padding: '0 !important',
    },
    paper: {
      background: 'transparent',
    },
    endIcon: {
      margin: 0,
    },
    buttonRoot: ({ benchOwner }: OwnerBasedStylesProps) => ({
      borderColor: benchOwner ? '#FFF' : 'transparent',
      color: benchOwner ? '#FFF' : 'inherit',
    }),
  })
);

const BenchCard = ({ bench, currentUser, users }: BenchCardProps) => {
  const { subscription } = useWebsocket();
  const isUserInLine = bench.line.includes(currentUser.name);
  const isUserOwner = bench.owner === currentUser.name;
  const benchIsFree = bench.owner === null;
  const takeBenchCmd: BenchCommand = {
    command: 'bench-request',
    benchName: bench.name,
    userName: currentUser.name,
  };
  const freeBenchCmd: BenchCommand = {
    command: 'bench-free',
    benchName: bench.name,
    userName: currentUser.name,
  };
  const benchLine = users.filter((it) => bench.line.includes(it.name));
  const benchOwner = users.find((it) => it.name === bench.owner);
  const requestRDPConnection = () => {
    establishRDPConnection('10.38.159.3');
  };

  const classes = useStyles({ benchOwner });
  const benchActionBtnLabelForOwner = 'Освободить';
  const benchActionBtnLabelForInLine = 'Покинуть очередь';
  const benchActionBtnLabelForFreeBench = 'Занять';
  const benchActionBtnLabelForOwnedBench = 'В Очередь';
  return (
    <Card square elevation={12} className={classes.paper}>
      <CardHeader
        classes={{
          root: classes.root,
          action: classes.action,
        }}
        avatar={<Typography variant="subtitle2">{bench.name}</Typography>}
        action={
          <ButtonGroup
            disableElevation
            disableFocusRipple
            size="small"
            variant="outlined"
            aria-label="small outlined button group"
          >
            {bench.owner === currentUser.name && (
              <Button
                classes={{
                  root: classes.buttonRoot,
                  endIcon: classes.endIcon,
                }}
                onClick={requestRDPConnection}
                endIcon={<DesktopWindowsIcon />}
              />
            )}
            <Button
              classes={{
                root: classes.buttonRoot,
                endIcon: classes.endIcon,
              }}
              endIcon={<InfoIcon />}
            />
          </ButtonGroup>
        }
      />
      <CardContent
        classes={{
          root: classes.cardContent,
        }}
      >
        <List component="nav" aria-label="bench users" disablePadding>
          <ListItem divider classes={{ root: classes.listItem }}>
            {isUserOwner || benchIsFree ? (
              <Button
                size="small"
                aria-label="take bench or free bench"
                color="secondary"
                variant="outlined"
                onClick={() =>
                  subscription?.send(isUserOwner ? freeBenchCmd : takeBenchCmd)
                }
              >
                {isUserOwner
                  ? benchActionBtnLabelForOwner
                  : benchActionBtnLabelForFreeBench}
              </Button>
            ) : (
              benchOwner && (
                <UserCard
                  user={benchOwner}
                  fullwidth
                  currentUser={benchOwner.name === currentUser.name}
                />
              )
            )}
          </ListItem>
          <ListItem selected divider dense>
            <Box mx="auto">Очередь</Box>
          </ListItem>
          {benchLine.length === 0 && (benchIsFree || isUserOwner) && (
            <ListItem divider classes={{ root: classes.listItem }}>
              Пусто
            </ListItem>
          )}
          {benchLine.map((it) => {
            return (
              <ListItem
                divider
                classes={{ root: classes.listItem }}
                key={it.name}
              >
                <UserCard
                  user={it}
                  fullwidth
                  currentUser={it.name === currentUser.name}
                />
              </ListItem>
            );
          })}
          {!benchIsFree && !isUserOwner && (
            <ListItem classes={{ root: classes.listItem }}>
              <Button
                size="small"
                aria-label="go in line"
                color="secondary"
                variant="outlined"
                onClick={() =>
                  subscription?.send(isUserInLine ? freeBenchCmd : takeBenchCmd)
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
