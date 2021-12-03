import React from 'react';
import { ipcRenderer } from 'electron';
import { useWebsocket } from './SocketManager';
import { BenchCommand, OtherCommand } from '../../../common/types';

const Commander = () => {
  const { subscription } = useWebsocket();
  ipcRenderer
    .on('tray-request-bench-message', (_, benchId, userId) => {
      subscription?.publish({
        command: OtherCommand.REQUEST_BENCH,
        benchId,
        userId,
      } as BenchCommand);
    })
    .on('tray-free-bench-message', (_, benchId, userId) => {
      subscription?.publish({
        command: OtherCommand.FREE_BENCH,
        benchId,
        userId,
      } as BenchCommand);
    });

  return null;
};

export default Commander;
