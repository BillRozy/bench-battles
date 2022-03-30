import { User, UserPersistent } from '../../common/types';
import { IModel } from './index'

export default class UserModel implements IModel<UserPersistent, User> {
  public name: string;
  public color: string;
  public id: number;

  constructor(name: string, id: number, color: string = '#FFF') {
    this.name = name;
    this.color = color;
    this.id = id;
  }

  update({ name, color }: UserPersistent) : UserModel {
    this.name = name;
    if (color) {
      this.color = color;
    }
    return this;
  }

  getId() : number {
    return this.id;
  }

  toJSON() : User {
    return {
      name: this.name,
      color: this.color,
      id: this.id
    };
  }

  serialize() : string {
    return this.name;
  }
  stopAllActions() {}
}