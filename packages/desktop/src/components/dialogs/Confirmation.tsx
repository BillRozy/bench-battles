import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

const DEFAULT_TITLE = 'Требуется подтверждение';
const DEFAULT_CONTENT =
  'Пожалуйста подтвердите, что вы действительно хотите совершить это действие';

interface ConfirmationProps {
  title: string | undefined;
  content: string | undefined;
  onCancel: () => unknown;
  onConfirm: () => unknown;
}

const Confirmation = ({
  title = DEFAULT_TITLE,
  content = DEFAULT_CONTENT,
  onCancel,
  onConfirm,
}: ConfirmationProps) => {
  return (
    <Dialog
      open
      // onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={onCancel}>
          Отмена
        </Button>
        <Button color="warning" onClick={onConfirm} autoFocus>
          Подтверждаю
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Confirmation;
