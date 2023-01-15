import { useContext, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bench } from 'common';
import { filter as lodashFilter, uniq } from 'lodash';
import { Context, BenchesContext } from './BenchesProvider';

export { useBenchesNavigation } from '../routing/hooks';
export { useBenchesCRUD } from '../hooks/api';

export function useBenches() {
  const { benches, ownedBenches } = useContext<BenchesContext>(Context);
  return {
    benches,
    ownedBenches,
  };
}

export function useBenchFilters() {
  const { benches } = useBenches();
  const allCadences = useMemo(
    () => uniq(benches.map((bench) => bench.build ?? 'unknown')),
    [benches]
  );
  const allBuilds = useMemo(
    () => uniq(benches.map((bench) => bench.swVer ?? 'unknown')),
    [benches]
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const cadences = searchParams.get('cadences')?.split(',');
  const builds = searchParams.get('builds')?.split(',');
  const setCadencesFilter = (filteredCadences: string[]) => {
    if (filteredCadences.length > 0) {
      searchParams.set('cadences', filteredCadences.join(','));
    } else {
      searchParams.delete('cadences');
    }
    setSearchParams(searchParams);
  };
  const setBuildsFilter = (filteredBuilds: string[]) => {
    if (filteredBuilds.length > 0) {
      searchParams.set('builds', filteredBuilds.join(','));
    } else {
      searchParams.delete('builds');
    }
    setSearchParams(searchParams);
  };
  const filter = (b: { [key: number]: Bench } | Bench[]) => {
    return lodashFilter(
      b,
      (it) =>
        (!cadences || cadences.includes(it.build || 'unknown')) &&
        (!builds || builds?.includes(it.swVer || 'unknown'))
    );
  };
  const filteredBenches = filter(benches);
  return {
    allCadences,
    allBuilds,
    cadences,
    builds,
    setCadencesFilter,
    setBuildsFilter,
    filter,
    filteredBenches,
  };
}
