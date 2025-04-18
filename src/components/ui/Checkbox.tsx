import React from 'react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  helpText?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ 
  label, 
  helpText, 
  className = '', 
  id,
  ...props 
}) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className="flex items-start mb-4">
      <div className="flex items-center h-5">
        <input
          id={checkboxId}
          type="checkbox"
          className="form-checkbox"
          {...props}
        />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor={checkboxId} className="checkbox-label">
          {label}
        </label>
        {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
      </div>
    </div>
  );
};

export default Checkbox;
