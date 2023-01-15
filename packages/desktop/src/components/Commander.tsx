import React from 'react';
import { ipcRenderer } from 'electron';
import { useDispatch } from 'react-redux';
import { BenchCommand, OtherCommand } from 'common';
import { useWebsocket } from './SocketManager';
import { setServerURI } from '../redux/slices/preferencesSlice';

const Commander = () => {
  const dispatch = useDispatch();
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
    })
    .on('switch-to-beta', (_, should_switch) => {
      dispatch(
        setServerURI(
          should_switch
            ? 'https://bench-batles-backend-beta.onrender.com/'
            : 'https://bench-batles-backend.onrender.com/'
        )
      );
    })
    .on('switch-to-localhost', () => {
      dispatch(setServerURI('http://127.0.0.1:55555'));
    });

  return null;
};

export default Commander;
