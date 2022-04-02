import { PrismaClient, Bench, User, GsimCredential } from '@prisma/client'
import { Entity } from 'common';

export type PersistentState = {
    [Entity.USER]: User[],
    version: number,
    [Entity.BENCH]: (Bench & {
        gsimCredentials: GsimCredential | null;
    })[]
}

export default class PersistentStateManager {

    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma
    }

    async load () : Promise<PersistentState> {
        const version = await this.prisma.version.findFirst({
            orderBy: {
                version: 'desc',
            },
        });
        if (version == null) {
            throw new Error('Cannot retrieve db version!');
        }
        const users = await this.prisma.user.findMany();
        const benches = await this.prisma.bench.findMany({
            include: {
                gsimCredentials: true
            },
        });
        return {
            [Entity.USER]: users,
            [Entity.BENCH]: benches,
            version: version.version
        }
    }
}