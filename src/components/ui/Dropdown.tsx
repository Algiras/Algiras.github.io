import { Select, SelectProps } from '@mantine/core';
import React from 'react';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps extends Omit<SelectProps, 'data' | 'onChange'> {
  options: DropdownOption[];
  onChange: (value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ options, onChange, ...props }) => {
  return (
    <Select
      data={options}
      onChange={value => onChange(value || '')}
      {...props}
    />
  );
};

export default Dropdown;
