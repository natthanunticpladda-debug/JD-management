import { useState, useRef, useEffect } from 'react';
import { useJobPositions } from '../../hooks/useJobPositions';

interface PositionAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  excludeValue?: string; // Value to exclude from suggestions
}

export const PositionAutocomplete = ({
  value,
  onChange,
  label = 'Position (ตำแหน่งงาน)',
  placeholder = 'พิมพ์เพื่อค้นหาตำแหน่งงาน...',
  required = false,
  excludeValue,
}: PositionAutocompleteProps) => {
  const { positions } = useJobPositions();
  const [isOpen, setIsOpen] = useState(false);
  const [filteredPositions, setFilteredPositions] = useState<typeof positions>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter positions based on input and exclude value
  useEffect(() => {
    if (value.trim()) {
      let filtered = positions.filter(pos =>
        pos.name.toLowerCase().includes(value.toLowerCase())
      );
      
      // Exclude the specified value (e.g., the selected Position)
      if (excludeValue) {
        filtered = filtered.filter(pos => 
          pos.name.toLowerCase() !== excludeValue.toLowerCase()
        );
      }
      
      setFilteredPositions(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setFilteredPositions([]);
      setIsOpen(false);
    }
  }, [value, positions, excludeValue]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (positionName: string) => {
    onChange(positionName);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-primary-600 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (value.trim() && filteredPositions.length > 0) {
            setIsOpen(true);
          }
        }}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-white border border-primary-200 rounded-xl text-primary-700 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
        required={required}
      />
      
      {/* Dropdown */}
      {isOpen && filteredPositions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-primary-200 rounded-xl shadow-lg max-h-60 overflow-auto">
          {filteredPositions.map((pos) => (
            <button
              key={pos.id}
              type="button"
              onClick={() => handleSelect(pos.name)}
              className="w-full px-4 py-3 text-left hover:bg-accent-50 focus:bg-accent-50 focus:outline-none transition-colors border-b border-primary-100 last:border-b-0"
            >
              <div className="font-medium text-primary-700">{pos.name}</div>
              {pos.description && (
                <div className="text-sm text-primary-400 mt-0.5">{pos.description}</div>
              )}
            </button>
          ))}
        </div>
      )}
      
      {/* Helper text */}
      {positions.length > 0 && (
        <p className="mt-1 text-xs text-primary-400">
          พิมพ์เพื่อค้นหาจากรายการตำแหน่งงาน หรือกรอกตำแหน่งใหม่ได้
        </p>
      )}
    </div>
  );
};
