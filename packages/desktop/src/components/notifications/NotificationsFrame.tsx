import React, { useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import NotificationsProvider, { Notification } from './NotificationsProvider';

export default function NotificationsFrame({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) {
  const [open, setOpen] = useState(false);
  const [notification, setNotification] = useState<Notification>({
    severity: 'info',
    content: 'default notification',
  });
  const showNotification = (ntf: Notification) => {
    setNotification(ntf);
    setOpen(true);
  };
  return (
    <>
      <NotificationsProvider showNotification={showNotification}>
        {children}
      </NotificationsProvider>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.content}
        </Alert>
      </Snackbar>
    </>
  );
}
