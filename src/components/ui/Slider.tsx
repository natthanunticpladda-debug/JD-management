import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
  colorCoded?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  onChange,
  min = 1,
  max = 5,
  step = 1,
  showValue = true,
  colorCoded = false,
}) => {
  const getTextColor = (val: number) => {
    if (!colorCoded) return 'text-accent-600';

    if (val <= 2) return 'text-red-600';
    if (val === 3) return 'text-yellow-600';
    return 'text-green-600';
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <label className="text-body-sm font-medium text-primary-600">
          {label}
        </label>
        {showValue && (
          <span className={`text-body font-semibold ${getTextColor(value)} px-3 py-1 rounded-lg bg-primary-50`}>
            {value}
          </span>
        )}
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-3 rounded-full appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, ${
              colorCoded
                ? value <= 2
                  ? '#ef4444'
                  : value === 3
                  ? '#eab308'
                  : '#22c55e'
                : '#007AFF'
            } 0%, ${
              colorCoded
                ? value <= 2
                  ? '#ef4444'
                  : value === 3
                  ? '#eab308'
                  : '#22c55e'
                : '#007AFF'
            } ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
          }}
        />
        <div className="flex justify-between mt-2 text-caption text-primary-400">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 3px solid ${colorCoded
            ? value <= 2
              ? '#ef4444'
              : value === 3
              ? '#eab308'
              : '#22c55e'
            : '#007AFF'};
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          transition: all 0.2s ease;
        }
        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        .slider-thumb::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 3px solid ${colorCoded
            ? value <= 2
              ? '#ef4444'
              : value === 3
              ? '#eab308'
              : '#22c55e'
            : '#007AFF'};
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          transition: all 0.2s ease;
        }
        .slider-thumb::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};
