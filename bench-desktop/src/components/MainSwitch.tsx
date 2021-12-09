import React from 'react';
import {
  Switch,
  Route,
  useLocation,
  Redirect,
  useHistory,
  useParams,
} from 'react-router-dom';
import { connect } from 'react-redux';
import { Location } from 'history';
import Box from '@mui/material/Box';
import UserSelectionFrame from './UserSelectionFrame';
import BenchesStateFrame from './BenchesStateFrame';
import UserDashboard from './UserDashboard';
import { BenchEditFormDialogWrapper } from './BenchEdit';
import { UserEditFormDialog } from './UserEdit';
import type { RootState } from '../redux/store';
import { User, Bench } from '../../../common/types';

type Props = {
  currentUser: User | null;
  benchesIds: number[];
  benches: { [key: number]: Bench };
};

type ModalHistoryState = {
  background: Location;
};

const BenchEditFormDialogWrapperInRoute = ({
  benches,
}: {
  benches: { [key: number]: Bench };
}) => {
  const { benchId } = useParams<{ benchId: string | undefined }>();
  const history = useHistory();
  const bench = benchId != null ? benches[parseInt(benchId, 10)] : null;
  return (
    <BenchEditFormDialogWrapper
      open
      form={bench}
      locked={bench?.id != null}
      onBackdropClick={history.goBack}
      onFinish={history.goBack}
    />
  );
};

const ModalSwitch = ({ benches, currentUser }: Omit<Props, 'benchesIds'>) => {
  const history = useHistory();

  return (
    <Switch>
      <Route path="/:userName/users/edit/:userId">
        <UserEditFormDialog
          open
          form={currentUser}
          onFinish={history.goBack}
          onBackdropClick={history.goBack}
        />
      </Route>
      <Route path="/:userName/benches/edit/:benchId?">
        <BenchEditFormDialogWrapperInRoute benches={benches} />
      </Route>
    </Switch>
  );
};

const MainSwitch = ({ currentUser, benchesIds, benches }: Props) => {
  const location = useLocation<ModalHistoryState>();

  const background = location.state && location.state.background;
  return (
    <Box height="100%">
      <Switch>
        <Route exact path="/users">
          {currentUser != null ? (
            <Redirect to={`/${currentUser.name}/benches`} />
          ) : (
            <UserSelectionFrame />
          )}
        </Route>
        <Route path="/:userName">
          {currentUser == null ? (
            <Redirect to="/users" />
          ) : (
            <UserDashboard>
              <Switch location={background || location}>
                <Route exact path="/:userName/benches">
                  {benchesIds.length > 0 && <BenchesStateFrame />}
                </Route>
                <Route path="/:userName/benches/edit/:benchId?">
                  <Redirect to="/users" />
                </Route>
                <Route path="/:userName/users/edit/:userId?">
                  <Redirect to="/users" />
                </Route>
              </Switch>
              {background && (
                <ModalSwitch benches={benches} currentUser={currentUser} />
              )}
            </UserDashboard>
          )}
        </Route>
        <Route path="*">
          <Redirect to="/users" />
        </Route>
      </Switch>
    </Box>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    currentUser: state.users.currentUser,
    benchesIds: state.benches.benchesIds,
    benches: state.benches.benches,
  };
};

export default connect(mapStateToProps)(MainSwitch);
