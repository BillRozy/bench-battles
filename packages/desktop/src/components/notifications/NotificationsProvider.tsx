import React, { createContext } from 'react';

export type Notification = {
  severity: 'error' | 'info' | 'success' | 'warning';
  content: string;
};

export type NotificationsContext = {
  showNotification: (notification: Notification) => void;
};

type NotificationsProviderType = NotificationsContext & {
  children: JSX.Element | JSX.Element[];
};

export const Context = createContext<NotificationsContext>({
  showNotification: () => null,
});

export default function NotificationsProvider({
  children,
  showNotification,
}: NotificationsProviderType) {
  return (
    <Context.Provider
      value={{
        showNotification,
      }}
    >
      {children}
    </Context.Provider>
  );
}
