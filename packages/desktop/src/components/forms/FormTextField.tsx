import React from 'react';
import { Path } from 'react-hook-form';
import { TextField, TextFieldProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { FormFieldProps } from './common';

export const LightTextField = styled(TextField)(({ theme }) => {
  return {
    '& label': {
      color: theme.palette.secondary.main,
      '&.Mui-focused': {
        color: theme.palette.secondary.light,
      },
      '&.Mui-disabled': {
        color: theme.palette.secondary.dark,
      },
    },
    '& .MuiOutlinedInput-root': {
      '& input': {
        color: theme.palette.secondary.main,
        '&.Mui-disabled': {
          color: theme.palette.secondary.dark,
          '-webkit-text-fill-color': theme.palette.secondary.dark,
        },
      },
      '&.Mui-focused input': {
        color: theme.palette.secondary.light,
      },
      '& fieldset': {
        borderColor: theme.palette.secondary.main,
      },
      '&:hover fieldset': {
        borderColor: theme.palette.secondary.light,
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.secondary.light,
      },
      '&.Mui-disabled fieldset': {
        borderColor: theme.palette.secondary.dark,
      },
    },
  };
});

const FormTextField = <T extends unknown, P extends Path<T>>({
  label,
  field,
  error,
  isLight = true,
  variant = 'outlined',
  disabled = false,
  ...rest
}: Omit<TextFieldProps, 'error'> & FormFieldProps<T, P>) => {
  const Field = isLight ? LightTextField : TextField;
  return (
    <Field
      {...rest}
      error={error != null}
      variant={variant}
      helperText={error?.message}
      disabled={disabled}
      {...field}
      label={label}
      margin="normal"
    />
  );
};

export default FormTextField;
