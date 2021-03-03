import React from 'react';
import { connect } from 'react-redux';
import { Grid, Box, Fade } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import UserCard from './UserCard';
import { User } from '../../../common/types';
import type { RootState } from '../redux/store';

type UserSelectionProps = {
  users: User[];
};

const useStyles = makeStyles(() =>
  createStyles({
    gridContainer: {
      height: '100%',
      maxHeight: '600px',
    },
  })
);

const UserSelectionFrame = ({ users }: UserSelectionProps) => {
  const classes = useStyles();
  return (
    <Box
      height="100%"
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >
      <Fade in timeout={750}>
        <Grid container spacing={3} className={classes.gridContainer}>
          {users.map((it) => {
            return (
              <Grid
                container
                item
                xs={3}
                key={it.name}
                alignItems="center"
                alignContent="center"
              >
                <UserCard huge fullwidth clickable user={it} />
              </Grid>
            );
          })}
        </Grid>
      </Fade>
    </Box>
  );
};
const mapStateToProps = (state: RootState) => {
  return {
    users: state.users.all,
  };
};

export default connect(mapStateToProps)(UserSelectionFrame);
