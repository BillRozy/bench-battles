import React from 'react';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import LinearProgress from '@mui/material/LinearProgress';
import { WhiteDialog } from '../styling';

const NoInternetOverlay = () => {
  return (
    <WhiteDialog
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
    </WhiteDialog>
  );
};

export default NoInternetOverlay;
