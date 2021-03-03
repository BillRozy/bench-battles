import React, { useEffect, useState } from 'react';
import Subscription from '../subscription';

type GeneralContext = {
  subscription: Subscription | null;
};

export const SocketContext = React.createContext<GeneralContext>({
  subscription: null,
});
// defining a useWebsocket hook for functional components
export const useWebsocket = () => React.useContext(SocketContext);

type SocketManagerProps = {
  URI: string;
  children: JSX.Element | JSX.Element[];
};

const CONNECTION_INTERVAL = 5000;
let connectionTimer: NodeJS.Timeout | null = null;

const SocketManager = ({ URI, children }: SocketManagerProps) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  useEffect(() => {
    if (connectionTimer != null) {
      clearTimeout(connectionTimer);
    }
    const s = new Subscription(URI);
    s.connect();
    s.on('close', () => {
      connectionTimer = setTimeout(() => {
        s.connect();
      }, CONNECTION_INTERVAL);
    });
    setSubscription(s);
  }, [URI]);
  return (
    <SocketContext.Provider
      value={{
        subscription,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketManager;
