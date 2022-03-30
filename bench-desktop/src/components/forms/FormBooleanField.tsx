import React from 'react';
import { Switch, FormControlLabel } from '@mui/material';
import type { FormFieldProps } from './common';

const FormBooleanField = ({
  label,
  field,
  disabled,
}: Omit<FormFieldProps, 'error'>) => {
  return (
    <FormControlLabel
      control={
        <Switch
          ref={field.ref}
          checked={field.value}
          onChange={field.onChange}
          name={field.name}
          onBlur={field.onBlur}
          disabled={disabled}
          color="currentUser"
        />
      }
      label={label}
    />
  );
};

FormBooleanField.defaultProps = {
  disabled: false,
};

export default FormBooleanField;
