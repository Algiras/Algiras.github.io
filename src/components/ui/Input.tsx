import React from 'react';
import { TextInput, TextInputProps } from '@mantine/core';

interface InputProps extends TextInputProps {
  helpText?: string;
}

const Input: React.FC<InputProps> = ({ helpText, error, ...props }) => {
  return <TextInput error={error} description={helpText} {...props} />;
};

export default Input;
