import React from 'react';
import { Switch, FormControlLabel } from '@mui/material';
import { Path } from 'react-hook-form';
import { styled } from '@mui/material/styles';
import type { FormFieldProps } from './common';

const LightFormControlLabel = styled(FormControlLabel)(({ theme }) => {
  return {
    color: theme.palette.secondary.main,
    '&.Mui-focused': {
      color: theme.palette.secondary.light,
    },
    '&.Mui-disabled': {
      color: theme.palette.secondary.dark,
    },
  };
});

const FormBooleanField = <T extends unknown, P extends Path<T>>({
  label,
  field,
  disabled = false,
}: Omit<FormFieldProps<T, P>, 'error'>) => {
  return (
    <LightFormControlLabel
      control={<Switch {...field} disabled={disabled} color="currentUser" />}
      label={label}
    />
  );
};

export default FormBooleanField;
