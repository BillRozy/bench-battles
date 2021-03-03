import { User } from '../../common/types';

export default class UserModel {
  public name: string;
  public color: string;

  constructor(name: string, color: string = '#FFF') {
    this.name = name;
    this.color = color;
  }

  toJSON() : User {
    return {
      name: this.name,
      color: this.color,
    };
  }

  serialize() : string {
    return this.name;
  }
}