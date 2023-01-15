import React, { Dispatch, SetStateAction } from 'react';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { BenchCommand, Bench, User } from 'common';
import { useWebsocket } from '../SocketManager';
import { WhiteDialog } from '../styling';

type Props = {
  user: User;
  occupiedBenches: Bench[];
  inlinedBenches: Bench[];
  setConflict: Dispatch<SetStateAction<boolean>>;
};

const ConflictDialog = ({
  occupiedBenches,
  user,
  inlinedBenches,
  setConflict,
}: Props) => {
  const { subscription } = useWebsocket();

  const getFreeBenchCmd = (benchId: number): BenchCommand =>
    ({
      command: 'bench-free',
      benchId,
      userId: user.id,
    } as BenchCommand);
  return (
    <WhiteDialog
      open
      // onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Конфликт интересов!</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Вы занимаете более чем один бенч или одновременно занимаете и стоите в
          очереди на бенч. Советуем подумать над свои поведением и освободить
          некоторые из них.
        </DialogContentText>
        <DialogContentText id="alert-dialog-description">
          Занятые
          {occupiedBenches.map((it) => (
            <Button
              key={it.name}
              onClick={() => subscription?.publish(getFreeBenchCmd(it.id))}
              color="primary"
            >
              Освободить {it.name}
            </Button>
          ))}
        </DialogContentText>
        <DialogContentText id="alert-dialog-description">
          В очереди
          {inlinedBenches.map((it) => (
            <Button
              key={it.name}
              onClick={() => subscription?.publish(getFreeBenchCmd(it.id))}
              color="primary"
            >
              Освободить {it.name}
            </Button>
          ))}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setConflict(false)}
          color="primary"
          variant="outlined"
        >
          Конфликт решен
        </Button>
      </DialogActions>
    </WhiteDialog>
  );
};

export default ConflictDialog;
