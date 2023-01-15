import React, {
  useState,
  useMemo,
  createContext,
  Context,
  useEffect,
} from 'react';
import { useForm, DefaultValues, UseFormReturn } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

type FormContextType<T> = {
  form?: T | null;
  locked?: boolean;
  dirty?: boolean;
  setDirty: (newVal: boolean) => void;
  setLocked: (newVal: boolean) => void;
  useFormReturn: UseFormReturn<T> | null;
};

export function getFormContext<T>() {
  return createContext<FormContextType<T>>({
    form: null,
    locked: false,
    dirty: false,
    setDirty: () => null,
    setLocked: () => null,
    useFormReturn: null,
  });
}

export function getFormProvider<T>(
  context: Context<FormContextType<T>>,
  schema: Parameters<typeof yupResolver>[0],
  defaultValuesCb: (form: T | null) => DefaultValues<T> | undefined
) {
  const FormContext = context;
  return function FormProvider({
    form = null,
    locked = false,
    dirty = false,
    children,
  }: Pick<FormContextType<T>, 'form' | 'locked' | 'dirty'> & {
    children?: React.ReactNode;
  }) {
    const [lockedState, setLockedState] = useState(locked);
    const [dirtyState, setDirtyState] = useState(dirty);
    const defaultValues = useMemo(() => defaultValuesCb(form), [form]);
    const useFormReturn = useForm<T>({
      resolver: yupResolver(schema),
      defaultValues,
    });
    const {
      formState: { isDirty },
    } = useFormReturn;
    useEffect(() => {
      useFormReturn.reset(defaultValues);
    }, [form, useFormReturn, defaultValues]);
    return (
      <FormContext.Provider
        value={{
          form,
          locked: lockedState,
          setLocked: setLockedState,
          setDirty: setDirtyState,
          dirty: isDirty || dirtyState,
          useFormReturn,
        }}
      >
        {children}
      </FormContext.Provider>
    );
  };
}
