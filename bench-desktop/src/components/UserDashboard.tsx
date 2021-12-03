import React from 'react';
import { connect } from 'react-redux';
import { Grid, Box, Slide } from '@mui/material';
import TopNavigationPanel from './TopNavigationPanel';
import type { RootState } from '../redux/store';

type UserDashboardProps = {
  children: JSX.Element | JSX.Element[];
};

const UserDashboard = ({ children }: UserDashboardProps) => {
  return (
    <Grid
      container
      direction="column"
      sx={{
        height: '100%',
        justifyContent: 'space-between',
      }}
    >
      <Slide in direction="down" timeout={1000}>
        <Box>
          <TopNavigationPanel />
        </Box>
      </Slide>
      <Box
        display="flex"
        flex="0 1 auto"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="calc(100% - 52px)"
      >
        {children}
      </Box>
    </Grid>
  );
};
const mapStateToProps = (state: RootState) => {
  return {
    currentUser: state.users.currentUser,
  };
};

export default connect(mapStateToProps)(UserDashboard);
