import React from 'react';
import { useTheme, styled } from '@mui/material/styles';
import {
  Box,
  Chip,
  ChipProps,
  Button,
  ButtonGroup,
  Slide,
} from '@mui/material';

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
  const clearAll = () => {
    onSelectedListUpdate([]);
  };
  const isAnySelected = selectedItems.length > 0;
  return (
    <Box>
      <Slide direction="right" in={isAnySelected} mountOnEnter unmountOnExit>
        <ButtonGroup
          variant="text"
          size="small"
          disableElevation
          sx={{
            padding: '0.5em 1em',
            '& > *': {
              fontSize: '0.75em',
            },
          }}
        >
          <Button color="secondary" onClick={clearAll}>
            Убрать фильтр
          </Button>
        </ButtonGroup>
      </Slide>

      <Box
        component="ul"
        sx={{
          display: 'flex',
          listStyle: 'none',
          justifyContent: 'center',
          flexWrap: 'wrap',
          margin: 0,
          padding: theme.spacing(0.5),
          '& > *': {
            margin: theme.spacing(0.5),
          },
        }}
      >
        {items.map((it) => {
          return (
            <li key={it}>
              <ChipWithMargin
                label={it}
                variant={selectedItems.includes(it) ? 'filled' : 'outlined'}
                color="secondary"
                onClick={() => toggleSelected(it)}
              />
            </li>
          );
        })}
      </Box>
    </Box>
  );
};

export default FilterableTagsList;
