// abs

export enum CrudEntityEvent {
  ENTITY_CREATED = 'entity-created',
  ENTITY_REMOVED = 'entity-removed',
  ENTITY_UPDATED = 'entity-updated',
}

export enum EventType {
  INITIAL_BENCHES_STATE = 'benches-sub-info',
  HEARTBEAT = 'heartbeat',
  ENTITY_CACHE_UPDATE = 'entity-cache-update'
}


export enum CrudCommand {
  CREATE_ENTITY = 'create-entity',
  UPDATE_ENTITY = 'update-entity',
  DELETE_ENTITY = 'delete-entity',
}

export enum OtherCommand {
  REQUEST_BENCH = 'bench-request',
  CONFIRM_BENCH = 'bench-occupied-confirm',
  FREE_BENCH = 'bench-free',
  TOGGLE_MAINTENANCE_BENCH = 'bench-toggle-maintenance',
  RESET_CACHE = 'reset-cache'
}

export type CommandType = CrudCommand | OtherCommand;

export enum Entity {
  BENCH = 'bench',
  USER = 'user'
}

export enum BenchCacheFields {
  PENDING_TIME = 'pendingTimeLeft',
  PENDING = 'pending',
  MAINTENANCE = 'maintenance',
  OWNER = 'owner',
  OWNED_TIME = 'ownedTime',
  LINE = 'line',
}

export type Event = {
  event: EventType | CrudEntityEvent;
}

export type Command = {
  command: string;
  // userName: string;
}

// prisma

export interface WithID {
  id: number
}

/**
 * Model Bench
 */

 export type BenchPrisma = WithID & {
  name: string
  ip: string | null
  stid: string | null
  build: string | null
  swVer: string | null
  voiceControl: boolean | null
  gsimCredId: number | null
}

/**
 * Model GsimCredential
 */

export type GsimCredentialPrisma = WithID &  {
  username: string
  password: string
}

/**
 * Model User
 */

export type UserPrisma = WithID & {
  name: string
  color: string | null
}

export type UserPersistent = UserPrisma;


// objs


export type Bench = BenchPersistent & BenchCache;

export type BenchMSD = WithID;

export type BenchPersistent = (BenchPrisma &  {
  gsimCredentials?: GsimCredentialPrisma | null;
})

export type BenchCache = BenchMSD & {
  [BenchCacheFields.PENDING_TIME]: number;
  [BenchCacheFields.PENDING]: boolean;
  [BenchCacheFields.MAINTENANCE]: boolean;
  [BenchCacheFields.OWNER]: number|null;
  [BenchCacheFields.OWNED_TIME]: number;
  [BenchCacheFields.LINE]: number[];
};

export type BenchCacheUpdate = BenchMSD & {
  [BenchCacheFields.PENDING_TIME]?: number;
  [BenchCacheFields.PENDING]?: boolean;
  [BenchCacheFields.MAINTENANCE]?: boolean;
  [BenchCacheFields.OWNER]?: number|null;
  [BenchCacheFields.OWNED_TIME]?: number;
  [BenchCacheFields.LINE]?: number[];
};

export type User = UserPersistent & {
  color: string;
};

// events

export type EntityCacheUpdateEvent = Event & {
  event: EventType.ENTITY_CACHE_UPDATE,
  entity: Entity,
  cache: {}
}

export type BenchCacheUpdateEvent = EntityCacheUpdateEvent & {
  entity: Entity.BENCH,
  cache: BenchCacheUpdate
}

export type BenchesSubEvent = Event & {
  event: EventType.INITIAL_BENCHES_STATE;
  benches: Bench[];
  users: User[];
  version: number | null;
};

export type HeartbeatEvent = Event & {
  event: EventType.HEARTBEAT;
  timestamp: number;
};

// commands

export type BenchCommand = Command & {
  userId: number;
  benchId: number;
}

export type CommandResponse = Command & {
  success: boolean;
  data?: Error | {}
}

export type ConfirmBenchOccupiedCommand = Command & {
  command: CommandType;
  benchId: number;
  userId: number;
}

// CRUD related

export interface EntityCommand extends Command {
  command: CrudCommand;
  entity: Entity;
  data: WithID;
}

export interface CreateEntityCommand extends EntityCommand {
  command: CrudCommand.CREATE_ENTITY;
  data: BenchPersistent | UserPersistent;
}

export interface UpdateEntityCommand  extends EntityCommand {
  command: CrudCommand.UPDATE_ENTITY;
  data: BenchPersistent | UserPersistent;
}

export interface DeleteEntityCommand  extends EntityCommand {
  command: CrudCommand.DELETE_ENTITY;
  data: WithID;
}

export interface CrudEvent extends Event {
  event: CrudEntityEvent;
  entity: Entity;
  data: WithID
}

export interface EntityCreatedEvent extends CrudEvent {
  event: CrudEntityEvent.ENTITY_CREATED;
}

export interface EntityUpdatedEvent extends CrudEvent {
  event: CrudEntityEvent.ENTITY_UPDATED;
}

export interface EntityRemovedEvent extends CrudEvent {
  event: CrudEntityEvent.ENTITY_REMOVED;
  data: WithID
}
