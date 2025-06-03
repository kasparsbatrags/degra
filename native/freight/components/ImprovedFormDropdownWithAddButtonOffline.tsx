import React from 'react';
import ImprovedFormDropdownOffline from './ImprovedFormDropdownOffline';

interface ImprovedFormDropdownWithAddButtonProps {
  label: string;
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  error?: string;
  endpoint?: string;
  filterValue?: string;
  disabled?: boolean;
  forceRefresh?: number;
  objectName?: string;
  externalOptions?: Array<{id: string, name: string}>;
  onAddPress?: () => void;
  addButtonLabel?: string;
}

const ImprovedFormDropdownWithAddButtonOffline: React.FC<ImprovedFormDropdownWithAddButtonProps> = React.memo((props) => {
  // Vienkārši nodod visus parametrus uz migrēto ImprovedFormDropdownOffline ar showAddButton=true
  return (
    <ImprovedFormDropdownOffline
      {...props}
      showAddButton={true}
    />
  );
});

export default ImprovedFormDropdownWithAddButtonOffline;
