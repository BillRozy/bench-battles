import React, { createContext } from 'react';
import { connect } from 'react-redux';
import { Bench } from 'common';
import type { RootState } from '../../redux/store';
import { selectors } from '../../redux/slices/benchesSlice';

export type BenchesContext = {
  benches: Bench[];
  ownedBenches: Bench[];
};

type BenchesProviderType = BenchesContext & {
  children: JSX.Element | JSX.Element[];
};

export const Context = createContext<BenchesContext>({
  benches: [],
  ownedBenches: [],
});

function BenchesProvider({
  children,
  benches,
  ownedBenches,
}: BenchesProviderType) {
  return (
    <Context.Provider
      value={{
        benches,
        ownedBenches,
      }}
    >
      {children}
    </Context.Provider>
  );
}

const mapStateToProps = (state: RootState) => {
  return {
    benches: Object.values(state.benches.benches),
    ownedBenches: selectors.getOwnedBenches(state.benches),
  };
};

export default connect(mapStateToProps)(BenchesProvider);
