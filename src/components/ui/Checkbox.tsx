import React from 'react';
import {
  Checkbox as MantineCheckbox,
  CheckboxProps as MantineCheckboxProps,
} from '@mantine/core';

interface CheckboxProps extends MantineCheckboxProps {
  helpText?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ helpText, ...props }) => {
  return <MantineCheckbox description={helpText} {...props} />;
};

export default Checkbox;
