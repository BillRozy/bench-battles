import {
  addBenches,
  changeBenchOwner,
  addUserToBenchLine,
  removeUserFromBenchLine,
} from '../redux/slices/benchesSlice';
import { addUsers } from '../redux/slices/usersSlice';
import store from '../redux/store';
import type {
  BenchEvent,
  Event,
  BenchesSubEvent,
  User,
} from '../../../common/types';
import { appLogger } from '../log';

export default class MessageHandler {
  readonly ver: string;

  constructor(ver: string) {
    this.ver = ver;
  }

  handle(json: Event) {
    appLogger.debug(
      `${this.constructor.name} v${this.ver}: got message - ${JSON.stringify(
        json
      )}`
    );
    if (json.event === 'benches-sub-info') {
      const { benches, users } = json as BenchesSubEvent;
      store.dispatch(addUsers(users));
      store.dispatch(addBenches(benches));
    } else {
      const { event, userName, benchName } = json as BenchEvent;
      const user: User =
        store
          .getState()
          .users.all.find(({ name }: User) => name === userName) || null;
      // if (user == null) {
      //   appLogger.warn(`User with name == ${userName} doesn't exists!`);
      //   return;
      // }
      switch (event) {
        case 'bench-new-owner':
          store.dispatch(
            changeBenchOwner({
              user,
              benchName,
            })
          );
          break;
        case 'bench-new-user-in-line':
          store.dispatch(
            addUserToBenchLine({
              user,
              benchName,
            })
          );
          break;
        case 'bench-removed-user-from-line':
          store.dispatch(
            removeUserFromBenchLine({
              user,
              benchName,
            })
          );
          break;
        default:
          break;
      }
    }
  }
}
