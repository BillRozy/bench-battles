import { useWebsocket } from '@components/SocketManager';
import {
  User,
  CrudCommand,
  Entity,
  DeleteEntityCommand,
  UpdateEntityCommand,
  CommandResponse,
  CreateEntityCommand,
  BenchPersistent,
} from 'common';
import { appLogger as logger } from '../../log';

export function useUsersCRUD() {
  const { subscription } = useWebsocket();
  const createUser = async (user: User) => {
    return new Promise<CommandResponse>((resolve, reject) => {
      (async () => {
        try {
          const resp = await subscription?.request({
            command: CrudCommand.CREATE_ENTITY,
            entity: Entity.USER,
            data: user,
          } as CreateEntityCommand);
          logger.info(`create user response: ${resp}`);
          if (resp) {
            resolve(resp);
          } else {
            reject(new Error("Didn't get any response"));
          }
        } catch (err) {
          reject(err);
        }
      })();
    });
  };
  const deleteUser = async (user: User) => {
    return new Promise<CommandResponse>((resolve, reject) => {
      (async () => {
        try {
          const resp = await subscription?.request({
            command: CrudCommand.DELETE_ENTITY,
            entity: Entity.USER,
            data: {
              id: user.id,
            },
          } as DeleteEntityCommand);
          logger.info(`delete user response: ${resp}`);
          if (resp) {
            resolve(resp);
          } else {
            reject(new Error("Didn't get any response"));
          }
        } catch (err) {
          reject(err);
        }
      })();
    });
  };
  const editUser = async (user: User) => {
    return new Promise<CommandResponse>((resolve, reject) => {
      (async () => {
        try {
          const resp = await subscription?.request({
            command: CrudCommand.UPDATE_ENTITY,
            entity: Entity.USER,
            data: user,
          } as UpdateEntityCommand);
          logger.info(`edit user response: ${resp}`);
          if (resp) {
            resolve(resp);
          } else {
            reject(new Error("Didn't get any response"));
          }
        } catch (err) {
          reject(err);
        }
      })();
    });
  };
  return {
    createUser,
    deleteUser,
    editUser,
  };
}

export function useBenchesCRUD() {
  const { subscription } = useWebsocket();
  const createBench = async (bench: BenchPersistent) => {
    return new Promise<CommandResponse>((resolve, reject) => {
      (async () => {
        try {
          const resp = await subscription?.request({
            command: CrudCommand.CREATE_ENTITY,
            entity: Entity.BENCH,
            data: bench,
          } as CreateEntityCommand);
          logger.info(`create bench response: ${resp}`);
          if (resp) {
            resolve(resp);
          } else {
            reject(new Error("Didn't get any response"));
          }
        } catch (err) {
          reject(err);
        }
      })();
    });
  };
  const editBench = async (bench: BenchPersistent) => {
    return new Promise<CommandResponse>((resolve, reject) => {
      (async () => {
        try {
          const resp = await subscription?.request({
            command: CrudCommand.UPDATE_ENTITY,
            entity: Entity.BENCH,
            data: bench,
          } as UpdateEntityCommand);
          logger.info(`update bench response: ${resp}`);
          if (resp) {
            resolve(resp);
          } else {
            reject(new Error("Didn't get any response"));
          }
        } catch (err) {
          reject(err);
        }
      })();
    });
  };
  const deleteBench = async (bench: BenchPersistent) => {
    return new Promise<CommandResponse>((resolve, reject) => {
      (async () => {
        try {
          const resp = await subscription?.request({
            command: CrudCommand.DELETE_ENTITY,
            entity: Entity.BENCH,
            data: {
              id: bench.id,
            },
          } as DeleteEntityCommand);
          logger.info(`delete bench response: ${resp}`);
          if (resp) {
            resolve(resp);
          } else {
            reject(new Error("Didn't get any response"));
          }
        } catch (err) {
          reject(err);
        }
      })();
    });
  };
  return {
    createBench,
    editBench,
    deleteBench,
  };
}
