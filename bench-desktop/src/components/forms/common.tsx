import { ControllerRenderProps, FieldError } from 'react-hook-form';

export type FormFieldProps = {
  label: string;
  field: ControllerRenderProps;
  error: FieldError | undefined;
  disabled?: boolean;
};
