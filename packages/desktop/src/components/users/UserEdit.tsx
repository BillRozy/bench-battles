import React, { useState, useContext } from 'react';

import { Controller, SubmitHandler, SubmitErrorHandler } from 'react-hook-form';
import * as yup from 'yup';
import {
  Button,
  ButtonGroup,
  CardHeader,
  Stack,
  Box,
  Divider,
  DialogProps,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { SliderPicker } from 'react-color';
import { styled } from '@mui/material/styles';
import { Save } from '@mui/icons-material';
import { CommandResponse, UserPersistent, WithID } from 'common';
import { FormTextField, AlertResponseError } from '@components/forms';
import { NoMarginIconButton } from '@components/utility/StyledIconButton';
import { WhiteDialog } from '@components/styling';
import { LightTextField } from '@components/forms/FormTextField';
import { Context } from '@components/notifications/NotificationsProvider';
import {
  getFormContext,
  getFormProvider,
} from '@components/forms/FormProvider';
import { appLogger } from '../../log';
import { useUsersCRUD } from './hooks';

const schema = yup
  .object({
    id: yup.number().integer().required(),
    name: yup.string().required(),
  })
  .required();

const StyledForm = styled('form')({});

const ID = `UserEditForm${Date.now()}`;

type AllUserEditFormProps = {
  onFinish?: () => void;
  onErrorResponse?: (resp: CommandResponse | undefined) => void;
  formId?: string;
  isLight?: boolean;
};

type UserEditContentProps = AllUserEditFormProps;

type UserEditActionsProps = Pick<AllUserEditFormProps, 'formId'> & {
  textable?: boolean;
  color?: 'secondary' | 'primary';
};

type UserEditFormProps = Omit<
  AllUserEditFormProps,
  'onErrorResponse' | 'formId'
>;

type UserEditDialogProps = DialogProps & UserEditFormProps;

export const UserEditContext = getFormContext<UserPersistent>();
export const UserEditProvider = getFormProvider<UserPersistent>(
  UserEditContext,
  schema,
  (form) => ({
    id: form?.id || 0,
    name: form?.name || '',
  })
);

const UserEditHeader = () => {
  const { form } = useContext(UserEditContext);
  return (
    <CardHeader
      title={
        form ? `Редактировать ${form?.name}` : 'Добавить нового пользователя'
      }
    />
  );
};

export const UserEditForm = ({
  formId = ID,
  onFinish,
  isLight = true,
  onErrorResponse,
}: UserEditContentProps) => {
  const { editUser, createUser } = useUsersCRUD();
  const { showNotification } = useContext(Context);
  const { form, useFormReturn, setDirty } = useContext(UserEditContext);
  const [color, setColor] = useState(form?.color || '#0FF');
  const dirtySetColor = (c: string) => {
    setColor(c);
    setDirty(c !== form?.color);
  };
  if (useFormReturn == null) {
    return null;
  }
  const { handleSubmit, control } = useFormReturn;
  const onSubmit: SubmitHandler<WithID & { name: string }> = async (data) => {
    const method = form ? editUser : createUser;
    const resp = await method({
      ...data,
      color,
    });
    if (resp?.success) {
      showNotification({
        severity: 'success',
        content: `Пользователь с ID: ${data.id} был обновлен/создан успешно`,
      });
      onFinish?.();
    } else {
      showNotification({
        severity: 'error',
        content: `Не удалось обновить/создать пользователя с ID: ${data.id} - ${resp}`,
      });
      onErrorResponse?.(resp);
    }
  };
  const onSubmitError: SubmitErrorHandler<WithID & { name: string }> = (
    errors
  ) => {
    Object.entries(errors).forEach(([key, error]) => {
      appLogger.error(
        `onSubmitError for key = ${key}`,
        new Error(error.message)
      );
    });
  };
  const Field = isLight ? LightTextField : TextField;
  return (
    <StyledForm id={formId} onSubmit={handleSubmit(onSubmit, onSubmitError)}>
      <Stack spacing={2}>
        <Box gap="10px" display="flex" justifyContent="space-between">
          <Controller
            name="id"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormTextField
                isLight={isLight}
                label="ID"
                field={field}
                error={error}
                disabled
              />
            )}
          />
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormTextField
                isLight={isLight}
                fullWidth
                label="Имя *"
                field={field}
                error={error}
              />
            )}
          />
        </Box>
        <Box sx={{ position: 'relative' }}>
          <Field
            color={isLight ? 'secondary' : 'primary'}
            minRows={3}
            InputLabelProps={{
              shrink: true,
            }}
            multiline
            fullWidth
            disabled
            label="Цвет"
            focused
          />
          <Box
            width="100%"
            padding="1rem"
            sx={{
              position: 'absolute',
              top: '12px',
            }}
          >
            <SliderPicker
              color={color}
              onChange={(clr: { hex: string }) => dirtySetColor(clr.hex)}
            />
          </Box>
        </Box>
      </Stack>
    </StyledForm>
  );
};

export const UserEditActions = ({
  formId,
  textable = false,
  color = 'secondary',
}: UserEditActionsProps) => {
  const { dirty } = useContext(UserEditContext);
  return (
    <ButtonGroup
      size="large"
      aria-label="large button group"
      disableElevation
      disableFocusRipple
      disableRipple
      color={color}
    >
      {textable ? (
        <Button
          disabled={!dirty}
          variant="outlined"
          type="submit"
          form={formId}
          color={color}
        >
          Сохранить
        </Button>
      ) : (
        <NoMarginIconButton
          disabled={!dirty}
          color={color}
          form={formId}
          type="submit"
          endIcon={<Save />}
        />
      )}
    </ButtonGroup>
  );
};

/* eslint-disable react/jsx-props-no-spreading */

export const UserEditFormDialog = ({
  open,
  maxWidth,
  onBackdropClick,
  onFinish,
  ...dialogProps
}: UserEditDialogProps) => {
  const [response, setResponse] = useState<CommandResponse | undefined>(
    undefined
  );
  const formId = `UserEditForm${Date.now()}`;
  return (
    <WhiteDialog
      onBackdropClick={onBackdropClick}
      open={open}
      maxWidth={maxWidth}
      scroll="paper"
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      {...dialogProps}
    >
      <UserEditHeader />
      <DialogContent>
        <UserEditForm
          isLight={false}
          onFinish={onFinish}
          onErrorResponse={setResponse}
          formId={formId}
        />
        {response != null && (
          <>
            <AlertResponseError
              response={response}
              onClose={() => setResponse(undefined)}
            />
            <Divider />
          </>
        )}
      </DialogContent>
      <Divider />
      <DialogActions>
        <UserEditActions color="primary" formId={formId} />
      </DialogActions>
    </WhiteDialog>
  );
};
