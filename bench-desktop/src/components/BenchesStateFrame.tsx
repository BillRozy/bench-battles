import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { Grid, Box, Slide, Paper } from '@material-ui/core';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { grey } from '@material-ui/core/colors';
import TopNavigationPanel from './TopNavigationPanel';
import { User, Bench } from '../../../common/types';
import type { RootState } from '../redux/store';
import UserCard from './UserCard';
import BenchCard from './BenchCard';
import CrownIcon from '../img/Simple_gold_crown.png';

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      height: '100%',
      justifyContent: 'space-between',
    },
    divider: {
      margin: 0,
    },
    growingGrid: {
      flexGrow: 11,
    },
    paper: {
      flexGrow: 11,
      marginTop: theme.spacing(2),
      background: fade(grey[50], 0.05),
    },
    paperGrid: {
      height: '100%',
    },
  })
);

interface IBenchesStateProps {
  currentUser: User | null;
  users: User[];
  benches: Bench[];
}

type BenchCardGridWrapProps = {
  bench: Bench;
  isCurrentUser: boolean;
};

const useInnerStyles = makeStyles(() =>
  createStyles({
    benchCard: {
      transition: '0.25s',
    },
  })
);

const BenchCardGridWrap = ({
  bench,
  isCurrentUser,
}: BenchCardGridWrapProps) => {
  const classes = useInnerStyles({ isCurrentUser, bench });
  return (
    <Grid item>
      <Box
        className={classes.benchCard}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        {isCurrentUser && (
          <Box clone height="64px" width="auto">
            <img src={CrownIcon} alt="crown" />
          </Box>
        )}
        <BenchCard bench={bench} />
      </Box>
    </Grid>
  );
};

const BenchesStateFrame = ({
  benches,
  users,
  currentUser,
}: IBenchesStateProps) => {
  const classes = useStyles();
  if (currentUser == null) {
    return (
      <section>
        <Link to="/">Back</Link>
      </section>
    );
  }

  let freeUsers: User[] = [...users];
  benches.forEach(({ line, owner }) => {
    freeUsers = freeUsers.filter(
      (it) => !line.includes(it.name) && it.name !== owner
    );
  });
  return (
    <Grid container direction="column" className={classes.root}>
      <Slide in direction="down" timeout={1000}>
        <Box>
          <TopNavigationPanel />
        </Box>
      </Slide>
      <Slide in direction="down" timeout={1000}>
        <Paper className={classes.paper}>
          <Grid
            container
            spacing={1}
            justify="space-evenly"
            alignItems="center"
            className={classes.paperGrid}
          >
            {benches.map((it) => {
              const isCurrentUser = currentUser.name === it.owner;
              return (
                <BenchCardGridWrap
                  bench={it}
                  isCurrentUser={isCurrentUser}
                  key={it.name}
                />
              );
            })}
          </Grid>
        </Paper>
      </Slide>
      {/* <Divider light classes={{ root: classes.divider }} /> */}
      <Box flexGrow={1} clone maxHeight="120px">
        <Slide direction="up" in timeout={500}>
          <Grid container spacing={1} justify="center" alignItems="center">
            {freeUsers.map((it) => {
              if (it.name === currentUser.name) return null;
              return (
                <Grid item key={it.name}>
                  <UserCard
                    user={it}
                    key={it.name}
                    currentUser={currentUser.name === it.name}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Slide>
      </Box>
    </Grid>
  );
};
const mapStateToProps = (state: RootState) => {
  return {
    users: state.users.all,
    currentUser: state.users.currentUser,
    benches: state.benches.benches,
  };
};

export default connect(mapStateToProps)(BenchesStateFrame);
