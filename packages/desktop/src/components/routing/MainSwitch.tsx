import React from 'react';
import { Container, Skeleton, Box, Divider, Button } from '@mui/material';
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { connect } from 'react-redux';
import { Location } from 'history';
import { User, Bench } from 'common';
import UserSelectionFrame from '@components/users/UserSelectionFrame';
import BenchesStateFrame from '@components/benches/BenchesStateFrame';
import BenchesProvider from '@components/benches/BenchesProvider';
import UserDashboard from '@components/users/UserDashboard';
import {
  UserEditActions,
  UserEditFormDialog,
  UserEditForm,
  UserEditProvider,
} from '@components/users/UserEdit';
import type { RootState } from '@redux/store';
import type { PreferencesState } from '@redux/slices/preferencesSlice';
import BenchEditForm, {
  BenchEditProvider,
  BenchEditActions,
} from '@components/benches/BenchEdit';
import TabsNavigation from './TabsNavigation';
import BenchFilter from '../benches/BenchesFilters';
import { useBenchesNavigation } from './hooks';

type Props = {
  currentUser: User | null;
  benches: { [key: number]: Bench };
  preferences: PreferencesState;
};

const RequireUserState = ({
  currentUser,
  selected = true,
  redirectTo = '/users',
  children,
}: {
  currentUser: User | null;
  selected?: boolean;
  redirectTo?: string;
  children: JSX.Element;
}) => {
  if ((selected && !currentUser) || (!selected && currentUser)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

const BenchEditFormWrapperInRoute = ({
  benches,
}: {
  benches: { [key: number]: Bench };
}) => {
  const { benchId, goToCreateBench } = useBenchesNavigation();
  const bench = benchId != null ? benches[parseInt(benchId, 10)] : null;
  return (
    <Box display="flex" flexDirection="column" sx={{ alignItems: 'center' }}>
      <BenchEditProvider form={bench} locked={false}>
        <BenchEditForm formId="bench-edit-form" />
        <Divider sx={{ margin: '1rem 0', minHeight: '1px', width: '100%' }} />
        <BenchEditActions formId="bench-edit-form" />
        {bench != null && (
          <>
            <Divider
              sx={{ margin: '1rem 0', minHeight: '1px', width: '100%' }}
            />
            <Button
              color="secondary"
              variant="outlined"
              onClick={goToCreateBench}
            >
              Или создать новый бенч!
            </Button>
          </>
        )}
      </BenchEditProvider>
    </Box>
  );
};

const MainSwitch = ({ currentUser, benches, preferences }: Props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as { background: Location };
  const background = locationState && locationState.background;
  return (
    <Routes location={background || location}>
      <Route
        path="/users/*"
        element={
          <RequireUserState
            selected={false}
            currentUser={currentUser}
            redirectTo={`/${currentUser?.name}/benches`}
          >
            <Container maxWidth="lg" disableGutters sx={{ height: '100%' }}>
              <UserSelectionFrame />
              {background && (
                <Routes>
                  <Route
                    path="new"
                    element={
                      <UserEditProvider>
                        <UserEditFormDialog
                          open
                          onFinish={() => navigate(-1)}
                          onBackdropClick={() => navigate(-1)}
                        />
                      </UserEditProvider>
                    }
                  />
                </Routes>
              )}
            </Container>
          </RequireUserState>
        }
      />
      <Route
        path="/:userName/benches/*"
        element={
          <RequireUserState currentUser={currentUser} selected>
            <BenchesProvider>
              <UserDashboard
                currentUser={currentUser}
                preferences={preferences}
                navigationTabs={<TabsNavigation />}
                navigationContent={
                  <Routes>
                    <Route index element={<Navigate replace to="filters" />} />
                    <Route
                      path="filters"
                      element={
                        Object.keys(benches).length > 0 ? (
                          <BenchFilter />
                        ) : (
                          <Skeleton animation="wave" />
                        )
                      }
                    />
                    <Route
                      path="profile"
                      element={
                        <Box
                          sx={{
                            color: 'whitesmoke',
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                          }}
                        >
                          <UserEditProvider form={currentUser}>
                            <UserEditForm formId="profile-edit-form" />
                            <Divider
                              sx={{
                                margin: '1rem 0',
                                minHeight: '1px',
                                width: '100%',
                              }}
                            />
                            <UserEditActions formId="profile-edit-form" />
                          </UserEditProvider>
                        </Box>
                      }
                    />
                    <Route
                      path="edit"
                      element={
                        Object.keys(benches).length > 0 ? (
                          <BenchEditFormWrapperInRoute benches={benches} />
                        ) : (
                          <Skeleton animation="wave" />
                        )
                      }
                    />
                  </Routes>
                }
              >
                <BenchesStateFrame />
              </UserDashboard>
            </BenchesProvider>
          </RequireUserState>
        }
      />
      <Route path="/" element={<Navigate replace to="/users" />} />
      <Route path="*" element={<Navigate replace to="/users" />} />
    </Routes>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    currentUser: state.users.currentUser,
    preferences: state.preferences,
    benches: state.benches.benches,
  };
};

export default connect(mapStateToProps)(MainSwitch);
