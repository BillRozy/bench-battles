import { styled } from '@mui/material/styles';
import TopNavigationPanel, {
  TopNavigationPanelProps,
} from '../TopNavigationPanel';

const DRAWER_DEFAULT_WIDTH = 240;

export default function createDrawerStyledElements(
  drawerWidth = DRAWER_DEFAULT_WIDTH
) {
  return {
    AppBar: styled(TopNavigationPanel)<
      TopNavigationPanelProps & { open?: boolean }
    >(({ theme, open }) => ({
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      ...(open && {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }),
    })),
    DrawerHeader: styled('div')(({ theme }) => ({
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0, 1),
      // necessary for content to be below app bar
      ...theme.mixins.toolbar,
      justifyContent: 'space-between',
    })),
    Main: styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
      open?: boolean;
    }>(({ theme, open }) => ({
      flexGrow: 1,
      overflow: 'auto',
      padding: theme.spacing(2),
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginLeft: `-${drawerWidth}px`,
      ...(open && {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
      }),
    })),
  };
}
