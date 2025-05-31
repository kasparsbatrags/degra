import React from 'react';
// NEW: Import migrēto ImprovedFormDropdown
import ImprovedFormDropdown from './ImprovedFormDropdown-migrated';

interface Option {
  id: string;
  name: string;
}

interface ImprovedFormDropdownWithAddButtonProps {
  label: string;
  value: string;
  onSelect: (value: string) => void;
  onAddPress: () => void;
  placeholder?: string;
  error?: string;
  endpoint?: string;
  filterValue?: string;
  disabled?: boolean;
  forceRefresh?: number;
  objectName?: string;
  externalOptions?: Option[];
  addButtonLabel?: string;
}

const ImprovedFormDropdownWithAddButton: React.FC<ImprovedFormDropdownWithAddButtonProps> = React.memo((props) => {
  // Vienkārši nodod visus parametrus uz migrēto ImprovedFormDropdown ar showAddButton=true
  return (
    <ImprovedFormDropdown
      {...props}
      showAddButton={true}
      onAddPress={props.onAddPress}
      addButtonLabel={props.addButtonLabel}
    />
  );
});

export default ImprovedFormDropdownWithAddButton;
