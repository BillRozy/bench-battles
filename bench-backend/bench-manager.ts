const benchConfig = require('./config/benches.json');
const userConfig = require('./config/users.json');
import BenchModel from './models/bench';
import UserModel from './models/user';
import { BenchEvent, BenchCommand, BenchesSubEvent,
         EventType, CommandType, Event, Bench, User } from '../common/types';

export default class BenchManager {
  private benches: Map<string, BenchModel>;
  private users: Map<string, UserModel>;
  private notify: (notification: Event) => void;
  constructor(notify: (notification: Event) => void) {
    this.benches = new Map();
    this.users = new Map();
    this.notify = notify;
    this.readBenchesConfig();
    this.readUsersConfig();
  }

  readBenchesConfig() {
    benchConfig.forEach(({ name, info }: Bench) => {
      const bench = new BenchModel(name, info)
        .on(EventType.NEW_OWNER, (ntf: BenchEvent) => {
          this.benches.forEach((b) => {
            if (b === bench) {
              return;
            }
            const user = this.users.get(ntf.userName);
            if (user != null) {
              b.freeBench(user);
            }
          });
          this.notify(ntf);
        })
        .on(EventType.NEW_USER_IN_LINE, this.notify)
        .on(EventType.REMOVED_USER_FROM_LINE, this.notify);
      this.benches.set(name, bench);
    });
  }

  readUsersConfig() {
    userConfig.forEach((name: string) => {
      this.users.set(name, new UserModel(name));
    });
  }

  getState() : BenchesSubEvent {
    return {
      benches: this.getBenchesState(),
      users: this.getUsersState(),
      event: EventType.INITIAL_BENCHES_STATE,
    };
  }

  getUsersState() : User[] {
    const users: User[] = [];
    this.users.forEach((user: UserModel) => {
      users.push(user.toJSON());
    });
    return users;
  }

  getBenchesState() : Bench[] {
    const benches: Bench[] = [];
    this.benches.forEach((bench) => {
      benches.push(bench.toJSON());
    });
    return benches;
  }

  handleBenchCommand(wsJson: BenchCommand) {
    const { command, benchName, userName } = wsJson;
    const bench = this.benches.get(benchName);
    const user = this.users.get(userName);
    if (bench == null) {
      console.log(`Unrecognized bench ${benchName}`);
      return;
    }
    if (user == null) {
      console.log(`Unrecognized user ${userName}`);
      return;
    }
    switch (command) {
      case CommandType.REQUEST_BENCH:
        bench.requestBench(user);
        break;
      case CommandType.FREE_BENCH:
        bench.freeBench(user);
        break;
      default:
        console.log(`Unrecognized command ${command}`);
    }
    console.log(`Handled command ${JSON.stringify(wsJson)}`);
  }
}
