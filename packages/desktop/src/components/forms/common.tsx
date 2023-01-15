import { ControllerRenderProps, FieldError, Path } from 'react-hook-form';

export type FormFieldProps<T, F extends Path<T>> = {
  field: ControllerRenderProps<T, F>;
  error: FieldError | undefined;
  label?: string;
  isLight?: boolean;
  disabled?: boolean;
};
