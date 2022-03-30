import React from 'react';
import { grey } from '@mui/material/colors';
import { alpha, useTheme, styled } from '@mui/material/styles';
import { Paper, Chip, ChipProps, Button, ButtonGroup } from '@mui/material';
import { xor } from 'lodash';

const ChipWithMargin = styled(Chip)<ChipProps>(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

type FilterableTagsListProps = {
  items: string[];
  selectedItems: string[];
  onSelectedListUpdate: (newSelectedItems: string[]) => void | undefined;
};

const FilterableTagsList = ({
  items,
  selectedItems,
  onSelectedListUpdate,
}: FilterableTagsListProps) => {
  const theme = useTheme();
  const toggleSelected = (item: string) => {
    onSelectedListUpdate(
      selectedItems.includes(item)
        ? selectedItems.filter((it) => it !== item)
        : [...selectedItems, item]
    );
  };
  const selectAll = () => {
    onSelectedListUpdate([...items]);
  };
  const clearAll = () => {
    onSelectedListUpdate([]);
  };
  const isAllSelected = xor(selectedItems, items).length === 0;
  return (
    <Paper
      component="ul"
      sx={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        listStyle: 'none',
        padding: theme.spacing(0.5),
        background: alpha(grey[50], 0.05),
        margin: 0,
        flexGrow: 0,
        maxHeight: '55px',
      }}
    >
      {items.map((it) => {
        return (
          <li key={it}>
            <ChipWithMargin
              label={it}
              variant={selectedItems.includes(it) ? 'filled' : 'outlined'}
              color="currentUser"
              onClick={() => toggleSelected(it)}
            />
          </li>
        );
      })}
      <ButtonGroup
        size="small"
        variant="outlined"
        color="secondary"
        sx={{
          position: 'absolute',
          right: theme.spacing(2),
          height: '32px',
          top: 'calc(50% - 16px)',
        }}
      >
        <Button
          variant={isAllSelected ? 'contained' : 'outlined'}
          onClick={() => selectAll()}
        >
          Все
        </Button>
        <Button
          variant={selectedItems.length === 0 ? 'contained' : 'outlined'}
          onClick={() => clearAll()}
        >
          Ничего
        </Button>
      </ButtonGroup>
    </Paper>
  );
};

export default FilterableTagsList;
