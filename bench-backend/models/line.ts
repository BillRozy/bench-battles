export default class Line {
  private users: number[];
  constructor(usersIds: number[] = []) {
    this.users = usersIds;
  }

  get size() {
    return this.users.length;
  }

  addUser(id: number) : number[] {
    if (!this.users.includes(id)) {
      this.users.push(id);
    }
    return this.users;
  }

  hasUser(userId: number) : boolean{
    return this.users.includes(userId);
  }

  removeUser(userId: number) : number[] {
    this.users = this.users.filter(it => userId != it);
    return this.users;
  }

  hasNextUser() : boolean {
    return this.users.length > 0;
  }

  popNextUser() : [ number | null, number[] ] {
    const user = this.users.shift() || null;
    return [ user, this.users ];
  }

  serialize() : number[] {
    return this.users;
  }
}