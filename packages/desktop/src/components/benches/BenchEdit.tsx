import React, { useContext } from 'react';

import { Controller, SubmitHandler, SubmitErrorHandler } from 'react-hook-form';
import * as yup from 'yup';
import { ButtonGroup, Grid, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Delete, Save } from '@mui/icons-material';
import { BenchPersistent, CommandResponse } from 'common';
import useWithConfirmation from '@components/hooks/notification';
import { Context as NotificationsContext } from '@components/notifications/NotificationsProvider';
import {
  getFormContext,
  getFormProvider,
} from '@components/forms/FormProvider';
import { FormTextField, FormBooleanField } from '../forms';
import { NoMarginIconButton } from '../utility/StyledIconButton';
import { appLogger as logger } from '../../log';
import { useBenches, useBenchesCRUD } from './hooks';

const StyledForm = styled('form')({});

const schema = yup
  .object({
    id: yup.number().integer().required(),
    name: yup.string().required(),
    ip: yup.string().nullable(),
    stid: yup.string().nullable(),
    build: yup.string().nullable(),
    swVer: yup.string().nullable(),
    voiceControl: yup.boolean().nullable(),
    gsimCredentials: yup
      .object({
        id: yup.number().integer().required(),
        username: yup.string(),
        password: yup.string(),
      })
      .nullable(),
  })
  .required();

type AllBenchEditFormProps = {
  onFinish?: () => void;
  onErrorResponse?: (resp: CommandResponse | undefined) => void;
  formId?: string;
};

type BenchEditContentProps = AllBenchEditFormProps;

type BenchEditActionsProps = AllBenchEditFormProps;

const ID = `BenchEditForm${Date.now()}`;

export const BenchEditContext = getFormContext<BenchPersistent>();
export const BenchEditProvider = getFormProvider<BenchPersistent>(
  BenchEditContext,
  schema,
  (form) => ({
    id: form?.id || 0,
    name: form?.name || '',
    ip: form?.ip || '',
    stid: form?.stid || '',
    build: form?.build || '',
    swVer: form?.swVer || '',
    voiceControl: !!form?.voiceControl,
    gsimCredId: form?.gsimCredId || 0,
    gsimCredentials: {
      id: form?.gsimCredentials?.id || 0,
      username: form?.gsimCredentials?.username || '',
      password: form?.gsimCredentials?.password || '',
    },
  })
);

const BenchEditForm = ({
  onFinish,
  onErrorResponse,
  formId = ID,
}: BenchEditContentProps) => {
  const { createBench, editBench } = useBenchesCRUD();
  const { showNotification } = useContext(NotificationsContext);
  const { form, useFormReturn, locked } = useContext(BenchEditContext);
  if (useFormReturn == null) {
    return null;
  }
  const { control, handleSubmit } = useFormReturn;
  const onSubmit: SubmitHandler<BenchPersistent> = async (data) => {
    const method = form ? editBench : createBench;
    const resp = await method({
      ...data,
    });
    if (resp?.success) {
      showNotification({
        severity: 'success',
        content: `Бенч с ID: ${data.id} был обновлен/создан успешно`,
      });
      onFinish?.();
    } else {
      onErrorResponse?.(resp);
      showNotification({
        severity: 'error',
        content: `Ошибка обновления/создания бенча с ID: ${
          data.id
        } - ${JSON.stringify(resp, null, 2)}`,
      });
    }
  };
  const onSubmitError: SubmitErrorHandler<BenchPersistent> = (errors) =>
    logger.warn(`onSubmitError: ${errors}`);
  return (
    <StyledForm id={formId} onSubmit={handleSubmit(onSubmit, onSubmitError)}>
      <Grid container direction="column">
        <Grid item container spacing={1}>
          <Grid xs={2} item>
            <Controller
              name="id"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormTextField
                  label="ID"
                  disabled
                  field={field}
                  error={error}
                />
              )}
            />
          </Grid>
          <Grid xs={10} item>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormTextField
                  fullWidth
                  label="Название *"
                  disabled={locked}
                  field={field}
                  error={error}
                />
              )}
            />
          </Grid>
        </Grid>
        <Grid item container spacing={1}>
          <Grid xs={6} item>
            <Controller
              name="ip"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormTextField
                  fullWidth
                  label="IP"
                  disabled={locked}
                  field={field}
                  error={error}
                />
              )}
            />
          </Grid>
          <Grid xs={6} item>
            <Controller
              name="stid"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormTextField
                  fullWidth
                  label="STID"
                  disabled={locked}
                  field={field}
                  error={error}
                />
              )}
            />
          </Grid>
        </Grid>
        <Grid item container spacing={1}>
          <Grid xs={6} item>
            <Controller
              name="build"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormTextField
                  label="Build"
                  disabled={locked}
                  field={field}
                  error={error}
                />
              )}
            />
          </Grid>
          <Grid xs={6} item>
            <Controller
              name="swVer"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormTextField
                  label="Soft Version"
                  disabled={locked}
                  field={field}
                  error={error}
                />
              )}
            />
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="voiceControl"
            control={control}
            render={({ field }) => (
              <FormBooleanField
                label="Voice Control"
                disabled={locked}
                field={field}
              />
            )}
          />
        </Grid>
        <Divider sx={{ margin: '1rem 0' }} />
        <Grid xs={12} spacing={1} item container>
          <Grid item xs={2}>
            <Controller
              name="gsimCredentials.id"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormTextField
                  label="ID"
                  disabled
                  field={field}
                  error={error}
                />
              )}
            />
          </Grid>
          <Grid item xs={10}>
            <Controller
              name="gsimCredentials.username"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormTextField
                  fullWidth
                  label="GSIM Username"
                  disabled={locked}
                  field={field}
                  error={error}
                />
              )}
            />
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="gsimCredentials.password"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormTextField
                fullWidth
                label="GSIM Password"
                disabled={locked}
                field={field}
                error={error}
              />
            )}
          />
        </Grid>
      </Grid>
    </StyledForm>
  );
};

export const BenchEditActions = ({
  formId = ID,
  onFinish,
  onErrorResponse,
}: BenchEditActionsProps) => {
  const { deleteBench } = useBenchesCRUD();
  const withConfirmation = useWithConfirmation();
  const { ownedBenches } = useBenches();
  const { showNotification } = useContext(NotificationsContext);
  const { form, useFormReturn, locked, dirty } = useContext(BenchEditContext);
  if (useFormReturn == null) {
    return null;
  }
  const cantDelete = ownedBenches?.some((it) => it.id === form?.id);
  const wrappedDeleteBench = async (bench: BenchPersistent) => {
    withConfirmation(
      `Пожалуйста, подтвердите, что вы точно хотите удалить бенч с именем ${bench.name}`,
      async () => {
        const resp = await deleteBench(bench);
        if (!resp?.success) {
          onErrorResponse?.(resp);
          showNotification({
            severity: 'error',
            content: `Бенч с ID: ${bench.id} не был удален успешно - ${resp}`,
          });
        } else {
          onFinish?.();
          showNotification({
            severity: 'success',
            content: `Бенч с ID: ${bench.id} был удален успешно`,
          });
        }
      }
    );
  };
  return (
    <ButtonGroup
      size="large"
      aria-label="large button group"
      disableElevation
      disableFocusRipple
      disableRipple
      color="secondary"
    >
      {form?.id != null && (
        <NoMarginIconButton
          onClick={() => wrappedDeleteBench(form)}
          endIcon={<Delete />}
          disabled={locked || cantDelete}
        />
      )}

      <NoMarginIconButton
        form={formId}
        type="submit"
        endIcon={<Save />}
        disabled={locked || !dirty}
      />
    </ButtonGroup>
  );
};

export default BenchEditForm;
