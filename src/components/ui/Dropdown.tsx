import React, { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ 
  options, 
  value, 
  onChange, 
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Find the selected option label
  const selectedOption = options.find(option => option.value === value);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="px-3 py-1 border border-white rounded-md text-sm hover:bg-indigo-600 flex items-center justify-between w-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption?.label || value}</span>
        <svg 
          className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10">
          <ul className="py-1">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-indigo-600 ${option.value === value ? 'bg-indigo-700' : ''}`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;