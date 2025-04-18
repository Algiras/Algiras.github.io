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
  const [menuPosition, setMenuPosition] = useState<'bottom' | 'top'>('bottom');
  
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

  // Calculate position when dropdown opens
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = Math.min(options.length * 36, 200); // Approximate menu height
      
      if (spaceBelow < menuHeight && rect.top > menuHeight) {
        setMenuPosition('top');
      } else {
        setMenuPosition('bottom');
      }
    }
  }, [isOpen, options.length]);
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="px-3 py-2 border border-white rounded-md text-sm hover:bg-indigo-600 flex items-center justify-between w-full min-h-[40px]"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="truncate">{selectedOption?.label || value}</span>
        <svg 
          className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      {isOpen && (
        <div 
          className={`absolute ${menuPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'} left-0 right-0 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10 max-h-[200px] overflow-y-auto`}
          role="listbox"
        >
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
                  role="option"
                  aria-selected={option.value === value}
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