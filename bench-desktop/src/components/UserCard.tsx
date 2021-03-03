import React from 'react';
import { useHistory } from 'react-router';
import { Chip, Badge } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { User } from '../../../common/types';

type UserCardProps = {
  size?: 'medium' | 'small';
  clickable?: boolean;
  user: User;
  fullwidth?: boolean;
  huge?: boolean;
  currentUser?: boolean;
  onClick?: (event: any) => void | null;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    chip: ({ user, fullwidth, huge }: UserCardProps) => ({
      margin: theme.spacing(0.25),
      background: user.color,
      color: theme.palette.getContrastText(user.color),
      width: fullwidth ? '100%' : undefined,
      height: huge ? '100%' : undefined,
      fontSize: huge ? '1.5em' : undefined,
    }),
    chipClickable: {
      transition: '0.25s',
      '&:hover': {
        color: 'white',
      },
    },
    badge: {
      background: 'black',
      color: 'white',
    },
    badgeRoot: ({ fullwidth, huge }: UserCardProps) => ({
      width: fullwidth ? '100%' : undefined,
      height: huge ? '100%' : undefined,
      maxHeight: '100px',
    }),
  })
);

const UserCard = ({
  user,
  size,
  clickable,
  fullwidth,
  currentUser,
  huge,
  onClick,
}: UserCardProps) => {
  const { push } = useHistory();
  const classes = useStyles({ user, clickable, fullwidth, huge });
  return (
    <Badge
      component="div"
      badgeContent="You"
      invisible={!currentUser}
      classes={{ badge: classes.badge, root: classes.badgeRoot }}
    >
      <Chip
        component={fullwidth ? 'div' : 'span'}
        variant="outlined"
        size={size}
        label={user.name}
        classes={{ root: classes.chip, clickable: classes.chipClickable }}
        onClick={
          clickable
            ? onClick || (() => push(`/benches/${user.name}`))
            : undefined
        }
      />
    </Badge>
  );
};

UserCard.defaultProps = {
  size: 'medium',
  clickable: false,
  fullwidth: true,
  huge: false,
  currentUser: false,
  onClick: null,
};

export default UserCard;
