import React from 'react';
import { styled } from '@mui/material/styles';
import { Button, ButtonProps } from '@mui/material';

interface StyledButtonProps extends ButtonProps {
  contrastColor?: string;
}

export const NoMarginIconButton = styled(Button)(() => {
  return {
    '& .MuiButton-endIcon': {
      margin: 0,
    },
  };
});

export const StyledIconButton = styled(NoMarginIconButton, {
  shouldForwardProp: (prop) => !['contrastColor'].includes(prop.toString()),
})<StyledButtonProps>(({ theme, color, contrastColor }) => {
  const refinedContrastColor =
    contrastColor ||
    theme.palette.getContrastText(theme.palette[color || 'neutral'].main);
  return {
    borderColor: refinedContrastColor,
    // backgroundColor: color,
    color: refinedContrastColor,
  };
});
