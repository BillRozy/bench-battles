import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import LinearProgress from '@mui/material/LinearProgress';

const NoInternetOverlay = () => {
  return (
    <Dialog
      open
      aria-labelledby="no-internet-dialog-title"
      aria-describedby="no-internet-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        Пытаемся подключить вас к серверу...
      </DialogTitle>
      <DialogContent>
        <LinearProgress color="primary" />

        <DialogContentText id="alert-dialog-description" />
      </DialogContent>
    </Dialog>
  );
};

export default NoInternetOverlay;
