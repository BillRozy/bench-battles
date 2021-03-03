import util from 'util';
import { exec } from 'child_process';
const execPromise = util.promisify(exec);

const REMOTE_DESK_EXE = 'mstsc';
const REMOTE_DESK_PARAM = '-v:';

export async function establishRDPConnection(ipAddress) {
  return execPromise([ REMOTE_DESK_EXE, `${REMOTE_DESK_PARAM}${ipAddress}` ].join(' '));
}
