// abs

export enum EventType {
  NEW_OWNER = 'bench-new-owner',
  NEW_USER_IN_LINE = 'bench-new-user-in-line',
  REMOVED_USER_FROM_LINE = 'bench-removed-user-from-line',
  INITIAL_BENCHES_STATE = 'benches-sub-info',
  HEARTBEAT = 'heartbeat',
}

export enum CommandType {
  REQUEST_BENCH = 'bench-request',
  FREE_BENCH = 'bench-free',
}

export type Event = {
  event: EventType;
}

export type Command = {
  command: string;
}

// objs


export type BenchInfo = {
  ip: string;
  build: string;
  stid: string;
  voiceControl: boolean;
};

export type Bench = {
  name: string;
  info: BenchInfo;
  owner: string|null;
  line: string[];
};

export type User = {
  name: string;
  color: string;
};

// events


export type BenchEvent = Event & {
  benchName: string;
  userName: string;
};

export type BenchesSubEvent = Event & {
  event: EventType.INITIAL_BENCHES_STATE;
  benches: Bench[];
  users: User[];
};

export type HeartbeatEvent = Event & {
  event: EventType.HEARTBEAT;
  timestamp: number;
};

// commands

export type BenchCommand = Command & {
  benchName: string;
  userName: string
}