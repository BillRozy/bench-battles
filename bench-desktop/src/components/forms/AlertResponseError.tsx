import React from 'react';
import { Alert, AlertTitle, AlertProps } from '@mui/material';
import { CommandResponse } from '../../../../common/types';
/* eslint-disable react/jsx-props-no-spreading */
type AlertResponseErrorProps = AlertProps & {
  response: CommandResponse | undefined;
};

const AlertResponseError = ({
  response,
  onClose,
  ...restAlertProps
}: AlertResponseErrorProps) => {
  return (
    <Alert severity="error" onClose={onClose} {...restAlertProps}>
      <AlertTitle>Error</AlertTitle>
      Async operation failed, check error here:
      <br />
      {response?.data?.toString()}
    </Alert>
  );
};

export default AlertResponseError;
