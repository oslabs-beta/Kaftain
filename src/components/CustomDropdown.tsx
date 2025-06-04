import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
}

export default function CustomDropdown({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className = ''
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={dropdownRef} className={`relative z-[999] ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors flex items-center justify-between"
      >
        <span className={selectedOption ? 'text-white' : 'text-white/50'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-2xl z-[9999] py-1 max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left transition-colors ${
                option.value === value
                  ? 'bg-gray-200 text-gray-900 font-medium'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 