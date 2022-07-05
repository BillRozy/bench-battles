import {
  useSearchParams,
  useNavigate,
  useLocation,
  useResolvedPath,
} from 'react-router-dom';
import { Bench, User } from 'common';

export enum MenuPath {
  FILTERS = 'filters',
  PROFILE = 'profile',
  EDIT_BENCHES = 'edit',
}

export function useBenchesNavigation(currentUser?: User | null) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const benchId = searchParams.get('benchId');
  const goToEditBench = (bench: Bench) => {
    searchParams.set('benchId', `${bench.id}`);
    navigate(`/${currentUser?.name}/benches/edit?${searchParams}`, {
      state: {
        drawerOpen: true,
      },
    });
  };
  const goToCreateBench = () => {
    searchParams.delete('benchId');
    navigate(`/${currentUser?.name}/benches/edit?${searchParams}`, {
      state: {
        drawerOpen: true,
      },
    });
  };
  return {
    benchId,
    goToEditBench,
    goToCreateBench,
  };
}

export function useMenuNavigation(currentUser?: User | null) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isFilters = location.pathname.startsWith(
    useResolvedPath(MenuPath.FILTERS).pathname
  );
  const isProfile = location.pathname.startsWith(
    useResolvedPath(MenuPath.PROFILE).pathname
  );
  const isEditBenches = location.pathname.startsWith(
    useResolvedPath(MenuPath.EDIT_BENCHES).pathname
  );
  const wrapPath = (path: string) => {
    return currentUser
      ? `/${currentUser?.name}/benches/${path}?${searchParams}`
      : `${path}?${searchParams}`;
  };
  return {
    isProfile,
    isFilters,
    isEditBenches,
    goToProfile() {
      navigate(wrapPath(MenuPath.PROFILE), {
        state: {
          drawerOpen: true,
        },
      });
    },
    goToFilters() {
      navigate(wrapPath(MenuPath.FILTERS), {
        state: {
          drawerOpen: true,
        },
      });
    },
    goToBenches() {
      navigate(wrapPath(MenuPath.EDIT_BENCHES), {
        state: {
          drawerOpen: true,
        },
      });
    },
  };
}

export function useDrawer() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    drawerOpen?: boolean;
  };
  return {
    isDrawerOpen: state ? state.drawerOpen : true,
    openDrawer() {
      navigate(`${location.pathname}?${location.search}`, {
        state: {
          drawerOpen: true,
        },
      });
    },
    closeDrawer() {
      navigate(`${location.pathname}?${location.search}`, {
        state: {
          drawerOpen: false,
        },
      });
    },
  };
}

export function useUsersNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const goToCreateUser = (modal = false) => {
    navigate(`/users/new`, {
      state: modal ? { background: location } : {},
    });
  };
  return {
    goToCreateUser,
  };
}
