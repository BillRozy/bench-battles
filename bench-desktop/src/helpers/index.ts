import util from 'util';
import { exec } from 'child_process';

const execPromise = util.promisify(exec);

const REMOTE_DESK_EXE = 'mstsc';
const REMOTE_DESK_PARAM = '-v:';

export async function establishRDPConnection(ipAddress: string) {
  return execPromise(
    [REMOTE_DESK_EXE, `${REMOTE_DESK_PARAM}${ipAddress}`].join(' ')
  );
}

export const fancySecondsFormat = (ms: number) => {
  const secondsTotal = ms / 1000;
  const h = Math.floor((secondsTotal % 216000) / 3600)
    .toString()
    .padStart(2, '0');
  const m = Math.floor((secondsTotal % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.floor(secondsTotal % 60)
    .toString()
    .padStart(2, '0');
  return `${h}:${m}:${s}`;
};
