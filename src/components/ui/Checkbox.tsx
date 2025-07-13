import {
    Checkbox as MantineCheckbox,
    CheckboxProps as MantineCheckboxProps
} from '@mantine/core';
import React from 'react';

interface CheckboxProps extends MantineCheckboxProps {
  helpText?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ helpText, ...props }) => {
  return <MantineCheckbox description={helpText} {...props} />;
};

export default Checkbox;
