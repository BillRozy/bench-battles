import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ipcRenderer } from 'electron';
import Subscription from '../subscription';
import { RootState } from '../redux/store';

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

const SocketManager = ({ children }: SocketManagerProps) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const setInternetConnection = (val: boolean) => {
    setIsConnected(val);
    ipcRenderer.send('internet-available', JSON.stringify(val));
  };
  const serverUri = useSelector(
    (state: RootState) => state.preferences.serverURI
  );
  useEffect(() => {
    console.log(serverUri, 'changed');
    if (subscription) {
      subscription.disconnect();
    }
    const s = new Subscription(serverUri);
    s.connect();
    s.on('close', () => {
      setInternetConnection(false);
    });
    s.on('open', () => {
      setInternetConnection(true);
    });
    setSubscription(s);
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
