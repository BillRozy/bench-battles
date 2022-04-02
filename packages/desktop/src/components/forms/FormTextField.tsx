import React from 'react';
import { TextField } from '@mui/material';
import type { FormFieldProps } from './common';

const FormTextField = ({ label, field, error, disabled }: FormFieldProps) => {
  return (
    <TextField
      disabled={disabled}
      fullWidth
      error={error != null}
      label={label}
      variant="outlined"
      helperText={error?.message}
      ref={field.ref}
      value={field.value}
      onChange={field.onChange}
      name={field.name}
      onBlur={field.onBlur}
      margin="normal"
    />
  );
};

FormTextField.defaultProps = {
  disabled: false,
};

export default FormTextField;
