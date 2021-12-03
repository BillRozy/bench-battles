import React, { useState } from 'react';

import {
  useForm,
  Controller,
  ControllerRenderProps,
  FieldError,
  SubmitHandler,
  SubmitErrorHandler,
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Card,
  TextField,
  Button,
  CardHeader,
  CardContent,
  CardActions,
  Stack,
  Box,
  Divider,
} from '@mui/material';
import { SliderPicker } from 'react-color';
import { styled, useTheme } from '@mui/material/styles';
import { useWebsocket } from './SocketManager';
import {
  CreateEntityCommand,
  CrudCommand,
  Entity,
  UserPersistent,
} from '../../../common/types';

const schema = yup
  .object({
    id: yup.number().integer(),
    name: yup.string().required(),
  })
  .required();

const renderTextField = (
  label: string,
  field: ControllerRenderProps,
  error: FieldError | undefined,
  disabled = false
) => {
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

type UserEditFormProps = {
  form: UserPersistent | undefined;
  onPositiveResult: () => void | undefined;
};

const StyledForm = styled('form')({
  padding: '1.5rem',
});

const ID = `UserEditForm${Date.now()}`;

const UserEditForm = ({
  form = undefined,
  onPositiveResult = () => {},
}: UserEditFormProps) => {
  const theme = useTheme();
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
    if (resp?.success && onPositiveResult) {
      onPositiveResult();
    }
  };
  const onSubmitError: SubmitErrorHandler<UserPersistent> = (errors) =>
    console.error(errors);
  return (
    <Card sx={{ maxWidth: 640 }} variant="outlined">
      <CardHeader
        title={
          form ? `Редактировать ${form.name}` : 'Добавить нового пользователя'
        }
        sx={{ background: theme.palette.grey[200] }}
      />
      <CardContent>
        <StyledForm id={ID} onSubmit={handleSubmit(onSubmit, onSubmitError)}>
          <Stack spacing={2}>
            <Controller
              name="id"
              control={control}
              defaultValue={form?.id}
              render={({ field, fieldState: { error } }) =>
                renderTextField('ID', field, error, true)
              }
            />
            <Controller
              name="name"
              control={control}
              defaultValue={form?.name}
              render={({ field, fieldState: { error } }) =>
                renderTextField('Имя', field, error)
              }
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
      <Divider />
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

export default UserEditForm;
