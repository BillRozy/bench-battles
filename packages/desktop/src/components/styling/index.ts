import { styled, darken } from '@mui/material/styles';
import { Paper, Dialog } from '@mui/material';
import { User } from 'common';

export function styledWithColorForCurrentUser<
  P extends Parameters<typeof styled>[0]
>(
  component: P,
  opts?: {
    backgroundStyler?: (color: string) => string;
    dontForwardUser?: boolean;
  }
) {
  const resOpts = {
    backgroundStyler: (color: string) => darken(color, 0.3),
    dontForwardUser: true,
    ...opts,
  };
  return styled<P>(component, {
    shouldForwardProp: (prop) =>
      prop !== 'currentUser' || !resOpts.dontForwardUser,
  })<P & { currentUser: User | null }>(({ theme, currentUser }) => ({
    backgroundColor:
      currentUser !== null
        ? resOpts.backgroundStyler(currentUser.color)
        : theme.palette.primary.main,
    color: theme.palette.currentUser.contrastText,
  }));
}

export const WhitePaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
}));

export const WhiteDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    backgroundColor: theme.palette.grey[100],
  },
}));

export const styledStub = () => {};
