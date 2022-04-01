import { BenchPersistent, Entity, CrudCommand, UserPersistent, WithID } from 'common'
import { PrismaClient } from '@prisma/client';
import { omit } from 'lodash';
import logger from '../logger';

export type EntityCRUD = {
    [CrudCommand.CREATE_ENTITY]: (data: {}) => Promise<WithID>;
    [CrudCommand.UPDATE_ENTITY]: (data: WithID) => Promise<WithID>;
    [CrudCommand.DELETE_ENTITY]: (data: WithID) => Promise<WithID>;
}

export type CRUD = {
    [key: string]: EntityCRUD
}

export default (prisma: PrismaClient) => ({
    [Entity.BENCH]: {
        async [CrudCommand.CREATE_ENTITY](data: {}) {
            const benchData = data as BenchPersistent
            const gsimCreds = benchData.gsimCredentials?.username && benchData.gsimCredentials?.password ? await prisma.gsimCredential.create({
              data: benchData.gsimCredentials
            }) : null;
            const result = await prisma.bench.create({
              data: {
                ...omit(benchData, 'id', 'gsimCredentials', 'gsimCredId'),
                gsimCredId: gsimCreds?.id
              },
              include: {
                gsimCredentials: true
              }
            });
            logger.info('Created persistent bench entity');
            logger.info(result);
            logger.info('Need to create cache');
            return result;
        },
        async [CrudCommand.UPDATE_ENTITY](data: WithID) {
            const benchData = data as BenchPersistent;
            let gsimCreds = null;
            if (benchData.gsimCredentials?.id != null) {
              gsimCreds = await prisma.gsimCredential.update({
                data: benchData.gsimCredentials,
                where: {
                    id: benchData.gsimCredentials.id
                }
              });
            } else {
              gsimCreds = benchData.gsimCredentials?.username && benchData.gsimCredentials?.password ? await prisma.gsimCredential.create({
                data: benchData.gsimCredentials
              }) : null;
            }
            const result = await prisma.bench.update({
              data: {
                ...omit(benchData, 'id', 'gsimCredentials', 'gsimCredId'),
                gsimCredId: gsimCreds?.id
              },
              where: {
                  id: benchData.id
              },
              include: {
                gsimCredentials: true
              }
            });
            logger.info('Updated persistent bench entity');
            logger.info(result);
            return result;
        },
        async [CrudCommand.DELETE_ENTITY](data: WithID) {
            const deleteData = data;
            const deletedBench = await prisma.bench.delete({
                where: { id: deleteData.id },
            })
            console.log(deletedBench);
            return deletedBench;
        }
    } as EntityCRUD,
    [Entity.USER]: {
        async [CrudCommand.CREATE_ENTITY](data: {}) {
            const userData = data as UserPersistent
            const result = await prisma.user.create({
              data: {
                ...omit(userData, 'id'),
              }
            });
            logger.info('Created persistent user entity');
            logger.info(result);
            return result;
        },
        async [CrudCommand.UPDATE_ENTITY](data: WithID) {
            const userData = data as UserPersistent
            const result = await prisma.user.update({
              data: {
                ...omit(userData, 'id'),
              },
              where: {
                  id: userData.id
              }
            });
            logger.info('Updated persistent user entity');
            logger.info(result);
            return result;
        },
        async [CrudCommand.DELETE_ENTITY](data: WithID) {
            const deleteData = data as { id: number };
            const result = await prisma.user.delete({
                where: { id: deleteData.id },
            })
            logger.info('Removed persistent user entity');
            logger.info(result);
            return result;
        }
    } as EntityCRUD
}) as CRUD;