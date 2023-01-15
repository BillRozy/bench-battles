import React, { useEffect, useState } from 'react';
import { Box, CssBaseline } from '@mui/material';

const ref = React.createRef<HTMLElement>();

type DrawerLayoutProps = {
  appBar: JSX.Element;
  drawer: JSX.Element;
  main: JSX.Element;
};

const DrawerLayout = ({ appBar, drawer, main }: DrawerLayoutProps) => {
  const [headerHeight, setHeaderHeight] = useState(0);
  useEffect(() => {
    if (ref?.current?.clientHeight != null) {
      setHeaderHeight(ref.current.clientHeight);
    }
  }, []);
  return (
    <Box height="100%" sx={{ display: 'flex', flexDirection: 'column' }}>
      <CssBaseline />
      {React.cloneElement(appBar, {
        ref,
      })}
      <Box height={`calc(100% - ${headerHeight}px)`} sx={{ display: 'flex' }}>
        {drawer}
        {main}
      </Box>
    </Box>
  );
};

export default DrawerLayout;
