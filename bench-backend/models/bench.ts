import EventEmitter from 'events';
import Line from './line';
import UserModel from './user';
import { BenchEvent, BenchInfo, EventType, Bench } from '../../common/types';

export default class BenchModel extends EventEmitter {
  private name: string;
  private info: BenchInfo;
  private line: Line;
  private _owner: UserModel | null;
  constructor(name: string, info: BenchInfo) {
    super();
    this.name = name;
    this.info = info;
    this.line = new Line();
    this._owner = null;
  }

  get owner() : UserModel | null {
    return this._owner;
  }

  set owner(user: UserModel | null) {
    if (user == null) {
      this._owner = this.line.nextUser() || null;
    } else {
      this._owner = user;
    }
    console.log(`Bench ${this.name} is taken by: ${this._owner && this._owner.name}`);
    this.emitEvent(EventType.NEW_OWNER, this._owner);
  }

  emitEvent(eventType: EventType, user: UserModel | null = null) {
    this.emit(eventType, {
      event: eventType,
      benchName: this.name,
      userName: user != null ? user.name : null,
    } as BenchEvent);
  }

  requestBench(user : UserModel) {
    if (user === this.owner) {
      console.log(`Bench ${this.name} is already taken by: ${user.name}`);
      return;
    }
    if (this.line.hasUser(user)) {
      console.log(`User ${user.name} is already in line for bench ${this.name}`);
      return;
    }
    if (this.owner == null) {
      this.owner = this.line.size === 0 ? user : this.line.nextUser() || null;
    } else {
      this.line.addUser(user);
      this.emitEvent(EventType.NEW_USER_IN_LINE, user);
    }
  }

  freeBench(user : UserModel) {
    if (user === this.owner) {
      console.log(`Bench ${this.name} was leaved by: ${user.name}`);
      this.owner = null;
    }
    if (this.line.hasUser(user)) {
      console.log(`User ${user.name} leaved line for bench ${this.name}`);
      this.line.removeUser(user);
      this.emitEvent(EventType.REMOVED_USER_FROM_LINE, user);
    }
  }

  toJSON() : Bench {
    return {
      name: this.name,
      line: this.line.serialize(),
      info: this.info,
      owner: this._owner != null ? this._owner.serialize() : null,
    } as Bench;
  }
}