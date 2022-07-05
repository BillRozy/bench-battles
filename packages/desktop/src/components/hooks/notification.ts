import { useDispatch } from 'react-redux';
import { requestConfirmation } from '@redux/slices/interactionsSlice';

export default function useWithConfirmation() {
  const dispatch = useDispatch();
  const withConfirmation = async (
    content: string,
    onConfirm: () => unknown,
    onCancel?: () => unknown
  ) => {
    await dispatch(
      requestConfirmation({
        content,
        onConfirm,
        onCancel,
      })
    );
  };
  return withConfirmation;
}
