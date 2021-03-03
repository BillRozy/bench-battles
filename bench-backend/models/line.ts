import UserModel from './user';
import { User } from '../../common/types';

export default class Line {
  private users: UserModel[];
  constructor() {
    this.users = [];
  }

  get size() {
    return this.users.length;
  }

  addUser(user: UserModel) {
    this.users.push(user);
  }

  hasUser(user: UserModel) : boolean{
    return this.users.includes(user);
  }

  removeUser(user: UserModel) {
    this.users = this.users.filter(it => user != it);
  }

  nextUser() : UserModel | null | undefined {
    if (this.users.length > 0) {
      return this.users.shift();
    }
    return null;
  }

  toJSON() : User[] {
    return this.users.map(user => user.toJSON());
  }

  serialize() : string[] {
    return this.users.map(user => user.serialize());
  }
}