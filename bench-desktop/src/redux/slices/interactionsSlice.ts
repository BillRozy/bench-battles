import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

type EasyConfirmation = {
  title?: string;
  content?: string;
  onCancel?: () => unknown;
  onConfirm: () => unknown;
};

export type Confirmation = EasyConfirmation & {
  onCancel: () => unknown;
};

export type InteractionsState = {
  confirmation: Confirmation | null;
};

export const initialState: InteractionsState = {
  confirmation: null,
};

const helperThunk = createAsyncThunk<Confirmation, Confirmation>(
  'interactions/helperThunkResult',
  async (confirmation) => {
    return confirmation;
  }
);

export const requestConfirmation = createAsyncThunk<null, EasyConfirmation>(
  'interactions/requestConfirmationResult',
  async (easyConfirmation, { dispatch }) => {
    const { onCancel, onConfirm, ...rest } = easyConfirmation;
    return new Promise((resolve) => {
      const fullConfirmation = {
        onCancel: async () => {
          if (onCancel) await onCancel();
          resolve(null);
        },
        onConfirm: async () => {
          await onConfirm();
          resolve(null);
        },
        ...rest,
      };
      dispatch(helperThunk(fullConfirmation));
    });
  }
);

export const interactionsSlice = createSlice({
  name: 'interactions',
  initialState,
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(requestConfirmation.fulfilled, (state, action) => {
      state.confirmation = action.payload;
    });
    builder.addCase(helperThunk.fulfilled, (state, action) => {
      state.confirmation = action.payload;
    });
  },
  reducers: {
    setCurrentConfirmation(
      state: InteractionsState,
      action: PayloadAction<EasyConfirmation | null>
    ) {
      if (action.payload == null) {
        state.confirmation = action.payload;
      } else {
        const confirmation = action.payload;
        const { onCancel, onConfirm } = confirmation;
        confirmation.onCancel = async () => {
          if (onCancel) await onCancel();
          state.confirmation = null;
        };
        confirmation.onConfirm = async () => {
          await onConfirm();
          state.confirmation = null;
        };
        state.confirmation = confirmation as Confirmation;
      }
    },
  },
});

export const { setCurrentConfirmation } = interactionsSlice.actions;

export default interactionsSlice.reducer;
