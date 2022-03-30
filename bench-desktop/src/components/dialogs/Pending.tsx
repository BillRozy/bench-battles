import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { BenchCommand, User, Bench } from '../../../../common/types';
import { useWebsocket } from '../SocketManager';
import { fancySecondsFormat } from '../../helpers';

type Props = {
  user: User;
  bench: Bench;
  timeLeft: number;
};

const PendingDialog = ({ bench, user, timeLeft }: Props) => {
  const { subscription } = useWebsocket();

  const takeBenchCmd: BenchCommand = {
    command: 'bench-request',
    benchId: bench.id,
    userId: user.id,
  };
  const freeBenchCmd: BenchCommand = {
    command: 'bench-free',
    benchId: bench.id,
    userId: user.id,
  };
  return (
    <Dialog
      open
      // onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {' '}
        Подтвердите, что занимаете бенч!{' '}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {`Пришла ваша очередь занять бенч ${bench.name}, пожалуйста подтвердите или отклоните приглашение.
              `}
        </DialogContentText>
        <DialogContentText id="alert-dialog-description">
          {`Осталось времени: ${fancySecondsFormat(timeLeft)}`}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => subscription?.publish(freeBenchCmd)}
          color="primary"
          variant="outlined"
        >
          Отклонить
        </Button>
        <Button
          onClick={() => subscription?.publish(takeBenchCmd)}
          color="primary"
          variant="outlined"
        >
          Подтвердить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PendingDialog;
