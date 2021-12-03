const userConfig = require('./dbconfig/users.json');
const benchConfig = require('./dbconfig/benches.json');
import { Bench, User } from '../../common/types';
import { PrismaClient } from '@prisma/client'
import { readFile } from 'fs/promises';
const prisma = new PrismaClient()

async function readBenchesConfig(benches: Bench[]) {
    benches.forEach(async (bench: Bench) => {
        await prisma.bench.create({
            data: {
                name: bench.name,
                ip: bench.ip,
                stid: bench.stid,
                build: bench.build,
                swVer: bench.swVer,
                voiceControl: bench.voiceControl,
                gsimCredentials: {
                    create: {
                        username: bench?.gsimCredentials?.username || '',
                        password: bench?.gsimCredentials?.password || '',
                    }
                }
            }
        });
    });
}

async function readUsersConfig(users: User[]) {
    users.forEach(async ({ name, color } : User) => {
        await prisma.user.create({
            data: {
                name,
                color
            }
        });
    });
}

async function addVersion() {
    const version = parseInt(await readFile(__dirname + '/dbconfig/VERSION', 'utf-8'));
    const inDbVersion = await prisma.version.findFirst({
        orderBy: {
            version: 'desc',
        },
    });
    if (version > (inDbVersion != null ? inDbVersion.version : 0)) {
        await prisma.version.create({
            data: {
                version
            }
        })
    }

}

async function main() {
    await addVersion();
    await readUsersConfig(userConfig);
    await readBenchesConfig(benchConfig);
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })