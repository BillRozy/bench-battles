import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../redux/store';
import { selectors } from '../redux/slices/benchesSlice';
import type { Confirmation } from '../redux/slices/interactionsSlice';
import { User, Bench } from '../../../common/types';
import PendingDialog from './dialogs/Pending';
import ConflictDialog from './dialogs/Conflict';
import NoInternetOverlay from './dialogs/NoInternet';
import ConfirmationDialog from './dialogs/Confirmation';
import { useWebsocket } from './SocketManager';

type Props = {
  currentUser: User | null;
  pendingBenches: Bench[];
  benches: { [key: number]: Bench };
  confirmation: Confirmation | null;
};

const DialogManager = ({
  currentUser,
  pendingBenches,
  benches,
  confirmation,
}: Props) => {
  const [hasConflict, setConflict] = useState(false);
  const { isConnected } = useWebsocket();

  const occupiedBenches = Object.values(benches).filter(
    (it) => it.owner === currentUser?.id
  );
  const inlinedBenches = Object.values(benches).filter((it) =>
    it.line.includes(currentUser?.id || 0)
  );
  useEffect(() => {
    setConflict(
      (occupiedBenches.length >= 1 && inlinedBenches.length > 0) ||
        occupiedBenches.length > 1
    );
  }, [occupiedBenches.length, inlinedBenches.length]);

  if (!isConnected) {
    return <NoInternetOverlay />;
  }
  if (confirmation != null) {
    return (
      <ConfirmationDialog
        title={confirmation.title}
        content={confirmation.content}
        onCancel={confirmation.onCancel}
        onConfirm={confirmation.onConfirm}
      />
    );
  }
  if (currentUser) {
    const pendingBench = pendingBenches.find(
      (it) => it.owner === currentUser.id
    );
    if (pendingBench) {
      return (
        <PendingDialog
          user={currentUser}
          bench={pendingBench}
          timeLeft={pendingBench.pendingTimeLeft}
        />
      );
    }
    if (hasConflict) {
      return (
        <ConflictDialog
          user={currentUser}
          occupiedBenches={occupiedBenches}
          inlinedBenches={inlinedBenches}
          setConflict={setConflict}
        />
      );
    }
  }

  return null;
};

const mapStateToProps = (state: RootState) => {
  return {
    currentUser: state.users.currentUser,
    benches: state.benches.benches,
    pendingBenches: selectors.getPendingBenches(state.benches),
    confirmation: state.interactions.confirmation,
  };
};

export default connect(mapStateToProps)(DialogManager);
