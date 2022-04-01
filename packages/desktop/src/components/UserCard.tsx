import React, { MouseEventHandler } from 'react';
import { Chip, Badge } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { User } from 'common';

type UserCardProps = {
  size?: 'medium' | 'small';
  clickable?: boolean;
  user: User;
  fullwidth?: boolean;
  disabled?: boolean;
  huge?: boolean;
  currentUser?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
  onContextMenu?: MouseEventHandler<HTMLDivElement>;
};

const UserCard = ({
  user,
  size,
  clickable,
  fullwidth,
  currentUser,
  disabled,
  huge,
  onClick,
  onContextMenu,
}: UserCardProps) => {
  const theme = useTheme();
  return (
    <Badge
      component="div"
      badgeContent="You"
      invisible={!currentUser}
      sx={{
        width: fullwidth ? '100%' : undefined,
        height: huge ? '100%' : undefined,
        maxHeight: '100px',
        '& .MuiBadge-badge': {
          background: 'black',
          color: 'white',
        },
      }}
    >
      <Chip
        component={fullwidth ? 'div' : 'span'}
        variant="outlined"
        size={size}
        label={user.name}
        sx={{
          margin: theme.spacing(0.25),
          background: disabled ? theme.palette.grey[700] : user.color,
          color: theme.palette.getContrastText(
            disabled ? theme.palette.grey[700] : user.color
          ),
          width: fullwidth ? '100%' : undefined,
          height: huge ? '100%' : undefined,
          fontSize: huge ? '1.5em' : undefined,
          '& .MuiChip-clickable': {
            transition: '0.25s',
            '&:hover': {
              color: 'white',
            },
          },
        }}
        onClick={clickable ? onClick : undefined}
        onContextMenu={clickable ? onContextMenu : undefined}
      />
    </Badge>
  );
};

UserCard.defaultProps = {
  size: 'medium',
  clickable: false,
  fullwidth: true,
  disabled: false,
  huge: false,
  currentUser: false,
  onClick: null,
  onContextMenu: null,
};

export default UserCard;
