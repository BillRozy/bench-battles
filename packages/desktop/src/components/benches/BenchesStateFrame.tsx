import React from 'react';
import { connect } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { Grid, Box, Slide, Paper, Badge } from '@mui/material';
import { User, Bench } from 'common';
import { orderBy } from 'lodash';
import CrownIcon from '@img/Simple_gold_crown.png';
import MaintenanceIcon from '@img/maintenance-rotatable-icon.png';
import type { RootState } from '@redux/store';
import BenchCard from './BenchCard';
import { useBenchFilters } from './hooks';

type BenchCardGridWrapProps = {
  bench: Bench;
  currentUser: User | null;
};

const BenchCardGridWrap = connect((state: RootState) => ({
  currentUser: state.users.currentUser,
}))(({ bench, currentUser }: BenchCardGridWrapProps) => {
  return (
    <Grid item>
      <Box
        sx={{
          transition: '0.25s',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {currentUser?.id === bench.owner && (
          <Box
            padding="0.5em"
            component="img"
            height="4em"
            width="auto"
            src={CrownIcon}
            alt="crown"
          />
        )}
        {bench.maintenance && (
          <Box
            padding="0.5em"
            component="img"
            height="4em"
            width="auto"
            src={MaintenanceIcon}
            alt="maintenance"
          />
        )}
        <Badge badgeContent={bench.build} max={1000} color="error">
          <BenchCard bench={bench} />
        </Badge>
      </Box>
    </Grid>
  );
});

const BenchesStateFrame = () => {
  const { filteredBenches } = useBenchFilters();
  const theme = useTheme();
  const benchComponents = orderBy(filteredBenches, 'name', ['asc']).map(
    (it) => {
      return <BenchCardGridWrap bench={it} key={it.id} />;
    }
  );

  return (
    <Grid
      container
      direction="column"
      sx={{
        minHeight: '100%',
        justifyContent: 'flex-start',
      }}
    >
      <Slide in direction="down" timeout={1000}>
        <Paper
          sx={{
            flex: '1 400px',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: theme.spacing(4),
          }}
        >
          <Grid
            container
            spacing={4}
            justifyContent="space-evenly"
            alignItems="center"
            sx={{
              flexBasis: '400px',
              flexGrow: 1,
              minHeight: '100%',
            }}
          >
            {benchComponents}
          </Grid>
        </Paper>
      </Slide>
    </Grid>
  );
};

export default BenchesStateFrame;
