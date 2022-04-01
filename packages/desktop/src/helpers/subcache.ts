import { EventEmitter } from 'events';
import { BenchesState } from '../redux/slices/benchesSlice';
import { UsersState } from '../redux/slices/usersSlice';

type CacheType = {
  benchesState?: BenchesState;
  usersState?: UsersState;
  internetAvailable?: boolean;
};

export default class SubscriptionCache extends EventEmitter {
  public benchesState: BenchesState = {
    benchesIds: [],
    benches: {},
  };

  public usersState: UsersState = {
    all: [],
    currentUser: null,
  };

  public internetAvailable = false;

  reset(): void {
    this.benchesState = { benchesIds: [], benches: {} };
    this.usersState = { all: [], currentUser: null };
    this.internetAvailable = false;
  }

  update(cacheUpdate: CacheType): void {
    const { benchesState, usersState, internetAvailable } = cacheUpdate;
    if (benchesState) this.benchesState = benchesState;
    if (usersState) this.usersState = usersState;
    if (internetAvailable != null) this.internetAvailable = internetAvailable;
    this.emit('cache-updated');
  }
}
