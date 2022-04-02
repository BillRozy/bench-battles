import React, { useState } from 'react';

import {
  useForm,
  Controller,
  SubmitHandler,
  SubmitErrorHandler,
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Card,
  Button,
  ButtonGroup,
  CardHeader,
  CardContent,
  CardActions,
  Stack,
  Box,
  Divider,
  DialogProps,
  Dialog,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { SliderPicker } from 'react-color';
import { styled, useTheme } from '@mui/material/styles';
import { Save } from '@mui/icons-material';
import { FormTextField, AlertResponseError } from './forms';
import { useWebsocket } from './SocketManager';
import {
  CreateEntityCommand,
  CommandResponse,
  CrudCommand,
  Entity,
  UserPersistent,
} from 'common';
import { NoMarginIconButton } from './utility/StyledIconButton';

const schema = yup
  .object({
    id: yup.number().integer(),
    name: yup.string().required(),
  })
  .required();

const StyledForm = styled('form')({
  padding: '1.5rem',
});

const ID = `UserEditForm${Date.now()}`;

type AllUserEditFormProps = {
  form: UserPersistent | null;
  onFinish: () => void;
  onErrorResponse?: (resp: CommandResponse | undefined) => void;
  formId?: string;
};

type UserEditHeaderProps = Pick<AllUserEditFormProps, 'form'>;

type UserEditContentProps = AllUserEditFormProps;

type UserEditActionsProps = Pick<AllUserEditFormProps, 'formId'>;

type UserEditFormProps = Omit<
  AllUserEditFormProps,
  'onErrorResponse' | 'formId'
>;

type UserEditDialogProps = DialogProps & UserEditFormProps;

const UserEditHeader = ({ form }: UserEditHeaderProps) => {
  const theme = useTheme();
  return (
    <CardHeader
      title={
        form ? `Редактировать ${form.name}` : 'Добавить нового пользователя'
      }
      sx={{ background: theme.palette.grey[200] }}
    />
  );
};

const UserEditContent = ({
  form,
  onFinish,
  onErrorResponse,
  formId,
}: UserEditContentProps) => {
  const [color, setColor] = useState(form?.color || '#0FF');
  const { subscription } = useWebsocket();
  const { handleSubmit, control } = useForm({
    resolver: yupResolver(schema),
  });
  const onSubmit: SubmitHandler<UserPersistent> = async (data) => {
    const command = form
      ? CrudCommand.UPDATE_ENTITY
      : CrudCommand.CREATE_ENTITY;
    const resp = await subscription?.request({
      command,
      entity: Entity.USER,
      data: {
        ...data,
        color,
      },
    } as CreateEntityCommand);
    console.info('resp: ', resp);
    if (resp?.success) {
      onFinish();
    } else if (onErrorResponse) {
      onErrorResponse(resp);
    }
  };
  const onSubmitError: SubmitErrorHandler<UserPersistent> = (errors) =>
    console.error(errors);
  return (
    <CardContent>
      <StyledForm id={formId} onSubmit={handleSubmit(onSubmit, onSubmitError)}>
        <Stack spacing={2}>
          <Controller
            name="id"
            control={control}
            defaultValue={form?.id}
            render={({ field, fieldState: { error } }) => (
              <FormTextField label="ID" field={field} error={error} disabled />
            )}
          />
          <Controller
            name="name"
            control={control}
            defaultValue={form?.name}
            render={({ field, fieldState: { error } }) => (
              <FormTextField label="Имя" field={field} error={error} />
            )}
          />
          <Box padding="1rem">
            <SliderPicker
              color={color}
              onChange={(clr: { hex: string }) => setColor(clr.hex)}
            />
          </Box>
        </Stack>
      </StyledForm>
    </CardContent>
  );
};

UserEditContent.defaultProps = {
  onErrorResponse: (resp: CommandResponse | undefined) => {},
  formId: ID,
};

const UserEditActions = ({ formId }: UserEditActionsProps) => {
  return (
    <CardActions>
      <ButtonGroup
        size="large"
        aria-label="large button group"
        disableElevation
        disableFocusRipple
        disableRipple
        color="primary"
      >
        <NoMarginIconButton form={formId} type="submit" endIcon={<Save />} />
      </ButtonGroup>
    </CardActions>
  );
};

const UserEditForm = ({
  form = null,
  onFinish = () => {},
}: UserEditFormProps) => {
  const [response, setResponse] = useState<CommandResponse | undefined>(
    undefined
  );
  const formId = `UserEditForm${Date.now()}`;
  return (
    <Card sx={{ maxWidth: 640 }} variant="outlined">
      <UserEditHeader form={form} />
      <UserEditContent
        form={form}
        onFinish={onFinish}
        onErrorResponse={setResponse}
        formId={formId}
      />
      <Divider />
      {response != null && (
        <>
          <AlertResponseError
            response={response}
            onClose={() => setResponse(undefined)}
          />
          <Divider />
        </>
      )}
      <CardActions>
        <Button
          variant="outlined"
          type="submit"
          form={ID}
          sx={{ margin: '0 auto' }}
        >
          Сохранить
        </Button>
      </CardActions>
    </Card>
  );
};

/* eslint-disable react/jsx-props-no-spreading */

export const UserEditFormDialog = ({
  open,
  maxWidth,
  form,
  onBackdropClick,
  onFinish,
  ...dialogProps
}: UserEditDialogProps) => {
  const [response, setResponse] = useState<CommandResponse | undefined>(
    undefined
  );
  const formId = `UserEditForm${Date.now()}`;
  return (
    <Dialog
      onBackdropClick={onBackdropClick}
      open={open}
      maxWidth={maxWidth}
      scroll="paper"
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      {...dialogProps}
    >
      <UserEditHeader form={form} />
      <DialogContent>
        <UserEditContent
          form={form}
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
        <UserEditActions formId={formId} />
      </DialogActions>
    </Dialog>
  );
};

export default UserEditForm;
