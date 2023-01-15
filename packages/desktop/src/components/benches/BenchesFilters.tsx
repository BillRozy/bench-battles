import React, { useState } from 'react';
import {
  Box,
  ListItem,
  Collapse,
  ListItemButton,
  ListItemText,
  List,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import FilterableTagsList from '../utility/FilterableTagsList';
import { useBenchFilters } from './hooks';

const DrawerListCollapseableItem = ({
  children,
  title,
  open = true,
}: {
  children: React.ReactNode;
  title: string;
  open?: boolean;
}) => {
  const [openInternal, setOpen] = useState(open);
  return (
    <ListItem disablePadding>
      <Box is-flex width="100%">
        <ListItemButton divider onClick={() => setOpen(!openInternal)}>
          <ListItemText
            secondary={title}
            sx={{
              background: 'transparent',
              '.MuiListItemText-secondary': {
                color: 'white',
              },
              width: '100%',
            }}
          />
          {openInternal ? (
            <ExpandLess sx={{ color: 'white' }} />
          ) : (
            <ExpandMore sx={{ color: 'white' }} />
          )}
        </ListItemButton>
        <Collapse in={openInternal} timeout="auto">
          {children}
        </Collapse>
      </Box>
    </ListItem>
  );
};

const BenchesFilter = () => {
  const {
    allCadences,
    allBuilds,
    cadences,
    builds,
    setCadencesFilter,
    setBuildsFilter,
  } = useBenchFilters();
  return (
    <List>
      <DrawerListCollapseableItem title="Каденс">
        <FilterableTagsList
          items={allCadences}
          selectedItems={cadences ?? []}
          onSelectedListUpdate={setCadencesFilter}
        />
      </DrawerListCollapseableItem>
      <ListItem />
      <DrawerListCollapseableItem title="Билд">
        <FilterableTagsList
          items={allBuilds}
          selectedItems={builds ?? []}
          onSelectedListUpdate={setBuildsFilter}
        />
      </DrawerListCollapseableItem>
    </List>
  );
};

export default BenchesFilter;
