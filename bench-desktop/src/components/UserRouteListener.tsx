import React from 'react';
import { useLocation } from 'react-router-dom';
import { useHistory } from 'react-router';
import { connect } from 'react-redux';
import store, { RootState } from '../redux/store';
import { selectUserByName, selectUser } from '../redux/slices/usersSlice';
import { User } from '../../../common/types';

type UserRouteListenerProps = {
  users: User[];
  currentUser: User;
};
let selectedUserCache: string | null = null;

function UserRouteListener({ users, currentUser }: UserRouteListenerProps) {
  const location = useLocation();
  const { push } = useHistory();
  React.useEffect(() => {
    console.log('Location changed', location);
    const [, mode, user] = location.pathname.split('/');
    if (!mode) {
      push(`/users`);
    } else if (mode === 'users') {
      if (user === 'remove') {
        store.dispatch(selectUser(null));
      } else if (currentUser != null) {
        push(`/benches/${currentUser.name}`);
      }
    } else if (mode === 'benches') {
      if (user) {
        if (currentUser == null) {
          selectedUserCache = user;
          store.dispatch(selectUserByName(selectedUserCache));
        }
      }
    }
  }, [location]);
  React.useEffect(() => {
    console.log('Users list changed', users, selectedUserCache);
    if (selectedUserCache != null) {
      store.dispatch(selectUserByName(selectedUserCache));
    }
  }, [users]);
  return null;
}

const mapStateToProps = (state: RootState) => {
  return {
    users: state.users.all,
    currentUser: state.users.currentUser,
  };
};

export default connect(mapStateToProps)(UserRouteListener);
