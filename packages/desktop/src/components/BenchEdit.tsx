import React, { useState } from 'react';

import {
  useForm,
  Controller,
  SubmitHandler,
  SubmitErrorHandler,
} from 'react-hook-form';
import { connect, useDispatch } from 'react-redux';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Card,
  ButtonGroup,
  CardHeader,
  CardContent,
  CardActions,
  Grid,
  Stack,
  Divider,
  Dialog,
  DialogProps,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { Edit, Close, Delete, Save } from '@mui/icons-material';
import { FormTextField, FormBooleanField, AlertResponseError } from './forms';
import {
  StyledIconButton,
  NoMarginIconButton,
} from './utility/StyledIconButton';
import { appLogger as logger } from '../log';
import { useWebsocket } from './SocketManager';
import {
  BenchPersistent,
  CreateEntityCommand,
  DeleteEntityCommand,
  CrudCommand,
  CommandResponse,
  Entity,
  Bench,
} from 'common';
import { selectors } from '../redux/slices/benchesSlice';
import type { RootState } from '../redux/store';
import { requestConfirmation } from '../redux/slices/interactionsSlice';

const StyledForm = styled('form')({
  padding: '1.5rem',
});

const schema = yup
  .object({
    id: yup.number().integer(),
    name: yup.string().required(),
    ip: yup.string().nullable(),
    stid: yup.string().nullable(),
    build: yup.string().nullable(),
    swVer: yup.string().nullable(),
    voiceControl: yup.boolean().nullable(),
    gsimCredentials: yup
      .object({
        id: yup.number().integer(),
        username: yup.string(),
        password: yup.string(),
      })
      .nullable(),
  })
  .required();

type AllBenchEditFormProps = {
  form: BenchPersistent | null;
  locked: boolean;
  onFinish: () => void;
  onErrorResponse?: (resp: CommandResponse | undefined) => void;
  formId?: string;
};

type BenchEditStateProps = {
  ownedBenches: Bench[];
};

type BenchEditHeaderProps = Omit<
  BenchEditFormProps,
  'onFinish' | 'formId' | 'onError'
> & {
  onLockChange: (lock: boolean) => void;
};

type BenchEditContentProps = AllBenchEditFormProps;

type BenchEditActionsProps = AllBenchEditFormProps;

type BenchEditFormProps = Omit<
  AllBenchEditFormProps,
  'onErrorResponse' | 'formId'
>;

type BenchEditDialogProps = DialogProps & BenchEditFormProps;

const ID = `BenchEditForm${Date.now()}`;

const BenchEditHeader = ({
  form = null,
  locked,
  onLockChange,
}: BenchEditHeaderProps) => {
  const theme = useTheme();
  return (
    <CardHeader
      title={form?.id != null ? `${form?.name}` : 'Добавить новый бенч'}
      sx={{
        background: theme.palette.neutral.main,
        color: theme.palette.neutral.contrastText,
      }}
      action={
        form?.id != null && (
          <StyledIconButton
            onClick={() => onLockChange(!locked)}
            endIcon={locked ? <Edit /> : <Close />}
          />
        )
      }
    />
  );
};

const BenchEditContent = ({
  form = null,
  locked,
  onFinish,
  onErrorResponse,
  formId,
}: BenchEditContentProps) => {
  const { handleSubmit, control } = useForm({
    resolver: yupResolver(schema),
  });
  const { subscription } = useWebsocket();
  const onSubmit: SubmitHandler<BenchPersistent> = async (data) => {
    const command =
      form?.id != null ? CrudCommand.UPDATE_ENTITY : CrudCommand.CREATE_ENTITY;
    const resp = await subscription?.request({
      command,
      entity: Entity.BENCH,
      data,
    } as CreateEntityCommand);
    if (resp?.success) {
      onFinish();
    } else if (onErrorResponse) {
      onErrorResponse(resp);
    }
    logger.info(`update bench response: ${resp}`);
  };
  const onSubmitError: SubmitErrorHandler<BenchPersistent> = (errors) =>
    logger.warn(`onSubmitError: ${errors}`);
  return (
    <CardContent>
      <StyledForm id={formId} onSubmit={handleSubmit(onSubmit, onSubmitError)}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Stack spacing={2}>
              <Controller
                name="id"
                control={control}
                defaultValue={form?.id}
                render={({ field, fieldState: { error } }) => (
                  <FormTextField
                    label="ID"
                    disabled
                    field={field}
                    error={error}
                  />
                )}
              />
              <Controller
                name="name"
                control={control}
                defaultValue={form?.name}
                render={({ field, fieldState: { error } }) => (
                  <FormTextField
                    label="Название"
                    disabled={locked}
                    field={field}
                    error={error}
                  />
                )}
              />
              <Controller
                name="ip"
                control={control}
                defaultValue={form?.ip}
                render={({ field, fieldState: { error } }) => (
                  <FormTextField
                    label="IP"
                    disabled={locked}
                    field={field}
                    error={error}
                  />
                )}
              />
              <Controller
                name="stid"
                control={control}
                defaultValue={form?.stid}
                render={({ field, fieldState: { error } }) => (
                  <FormTextField
                    label="STID"
                    disabled={locked}
                    field={field}
                    error={error}
                  />
                )}
              />

              <Controller
                name="build"
                control={control}
                defaultValue={form?.build}
                render={({ field, fieldState: { error } }) => (
                  <FormTextField
                    label="Build"
                    disabled={locked}
                    field={field}
                    error={error}
                  />
                )}
              />

              <Controller
                name="swVer"
                control={control}
                defaultValue={form?.swVer}
                render={({ field, fieldState: { error } }) => (
                  <FormTextField
                    label="Soft Version"
                    disabled={locked}
                    field={field}
                    error={error}
                  />
                )}
              />

              <Controller
                name="voiceControl"
                control={control}
                defaultValue={form?.voiceControl}
                render={({ field }) => (
                  <FormBooleanField
                    label="Voice Control"
                    disabled={locked}
                    field={field}
                  />
                )}
              />
            </Stack>
          </Grid>
          <Grid item xs={6}>
            <Stack spacing={2}>
              <Controller
                name="gsimCredentials.id"
                control={control}
                defaultValue={form?.gsimCredentials?.id}
                render={({ field, fieldState: { error } }) => (
                  <FormTextField
                    label="GSIM Creds ID"
                    disabled
                    field={field}
                    error={error}
                  />
                )}
              />
              <Controller
                name="gsimCredentials.username"
                control={control}
                defaultValue={form?.gsimCredentials?.username}
                render={({ field, fieldState: { error } }) => (
                  <FormTextField
                    label="GSIM Username"
                    disabled={locked}
                    field={field}
                    error={error}
                  />
                )}
              />

              <Controller
                name="gsimCredentials.password"
                control={control}
                defaultValue={form?.gsimCredentials?.password}
                render={({ field, fieldState: { error } }) => (
                  <FormTextField
                    label="GSIM Password"
                    disabled={locked}
                    field={field}
                    error={error}
                  />
                )}
              />
            </Stack>
          </Grid>
        </Grid>
      </StyledForm>
    </CardContent>
  );
};

BenchEditContent.defaultProps = {
  onErrorResponse: () => {},
  formId: ID,
};

const BenchEditActionsInternal = ({
  form = null,
  locked,
  formId,
  ownedBenches,
  onFinish,
  onErrorResponse,
}: BenchEditActionsProps & BenchEditStateProps) => {
  const dispatch = useDispatch();
  const { subscription } = useWebsocket();
  const cantDelete = ownedBenches?.some((it) => it.id === form?.id);
  const deleteBench = async ({ id }: { id: number }) => {
    dispatch(
      requestConfirmation({
        title: `Подтверждение удаления бенча`,
        content: `Пожалуйста, подтвердите, что вы точно хотите удалить бенч с именем ${form?.name}`,
        onConfirm: async () => {
          const resp = await subscription?.request({
            command: CrudCommand.DELETE_ENTITY,
            entity: Entity.BENCH,
            data: {
              id,
            },
          } as DeleteEntityCommand);
          logger.info(`remove bench ${form?.name} response: ${resp}`);
          if (resp?.success) {
            onFinish();
          } else if (onErrorResponse) {
            onErrorResponse(resp);
          }
        },
      })
    );
  };
  return (
    <CardActions sx={{ justifyContent: 'flex-end' }}>
      <ButtonGroup
        size="large"
        aria-label="large button group"
        disableElevation
        disableFocusRipple
        disableRipple
        color="primary"
      >
        {form?.id != null && (
          <NoMarginIconButton
            onClick={() => deleteBench({ id: form.id })}
            endIcon={<Delete />}
            disabled={locked || cantDelete}
          />
        )}

        <NoMarginIconButton
          form={formId}
          type="submit"
          endIcon={<Save />}
          disabled={locked}
        />
      </ButtonGroup>
    </CardActions>
  );
};

BenchEditActionsInternal.defaultProps = {
  onErrorResponse: () => {},
  formId: ID,
};

const BenchEditActions = connect((state: RootState) => {
  return {
    ownedBenches: selectors.getOwnedBenches(state.benches),
  };
})(BenchEditActionsInternal);

const BenchEditForm = ({
  form = null,
  locked = false,
  onFinish,
}: Omit<BenchEditFormProps, 'onErrorResponse' | 'formId'>) => {
  const [lockedInternally, setLockedInternally] = useState(locked);
  const [response, setResponse] = useState<CommandResponse | undefined>(
    undefined
  );
  const formId = `BenchEditForm${Date.now()}`;

  return (
    <Card sx={{ maxWidth: 640 }} variant="outlined">
      <BenchEditHeader
        form={form}
        locked={lockedInternally}
        onLockChange={setLockedInternally}
      />
      <BenchEditContent
        form={form}
        locked={lockedInternally}
        formId={formId}
        onFinish={onFinish}
        onErrorResponse={setResponse}
      />
      <Divider />
      {response != null && (
        <AlertResponseError
          response={response}
          onClose={() => setResponse(undefined)}
        />
      )}
      {response != null && <Divider />}
      <BenchEditActions
        form={form}
        locked={lockedInternally}
        onFinish={onFinish}
        formId={formId}
        onErrorResponse={setResponse}
      />
    </Card>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    ownedBenches: selectors.getOwnedBenches(state.benches),
  };
};

const BenchEditFormWithStore = connect(mapStateToProps)(BenchEditForm);

export const BenchEditFormDialogWrapper = ({
  open,
  maxWidth,
  form,
  onBackdropClick,
  onFinish,
  locked,
}: BenchEditDialogProps) => {
  const [lockedInternally, setLockedInternally] = useState(locked);
  const [response, setResponse] = useState<CommandResponse | undefined>(
    undefined
  );
  const formId = `BenchEditForm${Date.now()}`;
  return (
    <Dialog
      onBackdropClick={onBackdropClick}
      open={open}
      maxWidth={maxWidth}
      scroll="paper"
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <BenchEditHeader
        form={form}
        locked={lockedInternally}
        onLockChange={setLockedInternally}
      />
      <DialogContent>
        <BenchEditContent
          form={form}
          locked={lockedInternally}
          formId={formId}
          onFinish={onFinish}
          onErrorResponse={setResponse}
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
        <BenchEditActions
          form={form}
          locked={lockedInternally}
          onFinish={onFinish}
          onErrorResponse={setResponse}
          formId={formId}
        />
      </DialogActions>
    </Dialog>
  );
};

export default BenchEditFormWithStore;
