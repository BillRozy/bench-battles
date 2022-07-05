import React from 'react';
import { Tabs, Tab } from '@mui/material';
import { FilterAlt, Face, Edit } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useMenuNavigation } from './hooks';

const TabsNavigation = () => {
  const {
    isProfile,
    isEditBenches,
    isFilters,
    goToProfile,
    goToBenches,
    goToFilters,
  } = useMenuNavigation();
  const TABS = [
    {
      label: 'Фильтры',
      value: 'filters',
      icon: <FilterAlt />,
      active: isFilters,
      navigate: goToFilters,
    },
    {
      label: 'Профиль',
      value: 'profile',
      icon: <Face />,
      active: isProfile,
      navigate: goToProfile,
    },
    {
      label: 'Редактор',
      value: 'edit',
      icon: <Edit />,
      active: isEditBenches,
      navigate: goToBenches,
    },
  ];
  const theme = useTheme();
  const tabSelected = TABS.find((t) => t.active) ?? TABS[0];
  const handleChange = (_: unknown, value: string) => {
    const tab = TABS.find((t) => t.value === value);
    if (tab) {
      tab.navigate();
    }
  };
  return (
    <Tabs
      value={tabSelected.value}
      onChange={handleChange}
      textColor="secondary"
      indicatorColor="secondary"
      variant="fullWidth"
      aria-label="tabs user-dashboard-current-selection"
    >
      {TABS.map((t) => (
        <Tab
          sx={
            tabSelected.value !== t.value
              ? {
                  color: theme.palette.grey[500],
                }
              : {}
          }
          icon={t.icon}
          label={t.label}
          value={t.value}
          key={t.value}
        />
      ))}
    </Tabs>
  );
};

export default TabsNavigation;
