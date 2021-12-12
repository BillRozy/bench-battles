import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { alpha, useTheme, styled } from '@mui/material/styles';
import { Grid, Box, Slide, Paper, Badge, Typography } from '@mui/material';
import { filter, uniq, xor, intersection } from 'lodash';
import { grey } from '@mui/material/colors';
import { User, Bench } from '../../../common/types';
import type { RootState } from '../redux/store';
import BenchCard from './BenchCard';
import CrownIcon from '../img/Simple_gold_crown.png';
import MaintenanceIcon from '../img/maintenance-rotatable-icon.png';
import FilterableTagsList from './utility/FilterableTagsList';

interface IBenchesStateProps {
  benches: { [key: number]: Bench };
  benchesIds: number[];
}

type BenchCardGridWrapProps = {
  bench: Bench;
  currentUser: User | null;
};

const BenchCardGridWrap = connect((state: RootState) => ({
  currentUser: state.users.currentUser,
}))(
  styled(({ bench, currentUser }: BenchCardGridWrapProps) => {
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
  })(() => ({}))
);

const BenchesStateFrame = ({ benches, benchesIds }: IBenchesStateProps) => {
  const theme = useTheme();
  const [builds, setBuilds] = useState<string[]>(
    uniq(Object.values(benches).map((bench) => bench.build || 'unknown'))
  );
  const [swVers, setSwVers] = useState<string[]>(
    uniq(Object.values(benches).map((bench) => bench.swVer || 'unknown'))
  );
  const [selectedBuildsList, setSelectedBuilds] = useState<string[]>(builds);
  const [selectedSwVerList, setSelectedSwVer] = useState<string[]>(swVers);

  useEffect(() => {
    const newBuildsList = uniq(
      Object.values(benches).map((bench) => bench.build || 'unknown')
    );
    const newSwVersList = uniq(
      Object.values(benches).map((bench) => bench.swVer || 'unknown')
    );
    if (xor(builds, newBuildsList).length > 0) {
      setBuilds(newBuildsList);
    }
    if (xor(swVers, newSwVersList).length > 0) {
      setSwVers(newSwVersList);
    }
  }, [benches]);

  useEffect(() => {
    setSelectedSwVer(intersection(swVers, selectedSwVerList));
  }, [swVers]);

  useEffect(() => {
    setSelectedBuilds(intersection(builds, selectedBuildsList));
  }, [builds]);

  const filteredBenchCardsByBuild = filter(
    benches,
    (it) => it.build == null || selectedBuildsList.includes(it.build)
  );
  const filteredSwVers = uniq(
    filteredBenchCardsByBuild.map((it) => it.swVer || 'unknown')
  );
  const filteredBenchCardsBySwVer = filter(
    filteredBenchCardsByBuild,
    (it) =>
      it.swVer == null ||
      (selectedSwVerList.includes(it.swVer) &&
        filteredSwVers.includes(it.swVer))
  );

  const isBenchCardVisible = (bench: Bench) => {
    return filteredBenchCardsBySwVer.includes(bench);
  };

  const benchComponents = benchesIds.map((it) => {
    const bench = benches[it];
    return isBenchCardVisible(bench) ? (
      <BenchCardGridWrap bench={benches[it]} key={it} />
    ) : null;
  });

  return (
    <Grid
      container
      direction="column"
      sx={{
        height: '100%',
        justifyContent: 'flex-start',
      }}
    >
      {builds.length > 0 && (
        <Slide in direction="down" timeout={1000}>
          <Box>
            <Typography
              variant="subtitle1"
              align="center"
              gutterBottom
              color="white"
            >
              Отфильтруй по каденсу!
            </Typography>
            <FilterableTagsList
              items={builds}
              selectedItems={selectedBuildsList}
              onSelectedListUpdate={setSelectedBuilds}
            />
          </Box>
        </Slide>
      )}
      {filteredSwVers.length > 0 && (
        <Slide in direction="down" timeout={1000}>
          <Box>
            <Typography
              variant="subtitle1"
              align="center"
              gutterBottom
              color="white"
            >
              Отфильтруй по билду!
            </Typography>
            <FilterableTagsList
              items={filteredSwVers}
              selectedItems={selectedSwVerList}
              onSelectedListUpdate={setSelectedSwVer}
            />
          </Box>
        </Slide>
      )}
      <Slide in direction="down" timeout={1000}>
        <Typography
          sx={{ marginTop: theme.spacing(2) }}
          variant="subtitle1"
          align="center"
          color="white"
          gutterBottom
        >
          {' '}
          А теперь займи свободный бенч или встань в очередь!
        </Typography>
      </Slide>
      <Slide in direction="down" timeout={1000}>
        <Paper
          sx={{
            flex: '1 400px',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: theme.spacing(2),
            background: alpha(grey[50], 0.05),
            minHeight: '400px',
            overflow: 'auto',
          }}
        >
          <Grid
            container
            spacing={1}
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
const mapStateToProps = (state: RootState) => {
  return {
    users: state.users.all,
    benches: state.benches.benches,
    benchesIds: state.benches.benchesIds,
  };
};

export default connect(mapStateToProps)(BenchesStateFrame);
