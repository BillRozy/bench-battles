import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ipcRenderer } from 'electron';
import { ErrorType } from 'typescript-logging';
import Subscription, { wsEventHandler } from '../subscription';
import { RootState } from '../redux/store';
import { appLogger } from '../log';

type GeneralContext = {
  subscription: Subscription | null;
  isConnected: boolean;
};

export const SocketContext = React.createContext<GeneralContext>({
  subscription: null,
  isConnected: false,
});
// defining a useWebsocket hook for functional components
export const useWebsocket = () => React.useContext(SocketContext);

type SocketManagerProps = {
  children: JSX.Element | JSX.Element[];
};

const subscription = new Subscription();

const SocketManager = ({ children }: SocketManagerProps) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const setInternetConnection = (val: boolean) => {
    setIsConnected(val);
    ipcRenderer.send('internet-available', JSON.stringify(val));
  };
  const serverUri = useSelector(
    (state: RootState) => state.preferences.serverURI
  );
  useEffect(() => {
    appLogger.info(`Changed server URI to ${serverUri}`);
    const { stateObservable, eventObservable } =
      subscription.connect(serverUri);
    const disposeState = stateObservable.subscribe({
      next: setInternetConnection,
      error: () => setInternetConnection(false),
    });
    const disposeEvent = eventObservable.subscribe({
      next: (event) => {
        try {
          wsEventHandler(event);
        } catch (err) {
          appLogger.error(
            `Message from websocket is not JSON: ${event}`,
            err as ErrorType
          );
        }
      },
    });
    return () => {
      subscription?.disconnect();
      disposeState.unsubscribe();
      disposeEvent.unsubscribe();
    };
  }, [serverUri]);
  return (
    <SocketContext.Provider
      value={{
        subscription,
        isConnected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketManager;
