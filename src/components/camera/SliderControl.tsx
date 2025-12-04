import type React from "react"

interface SliderControlProps {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

const SliderControl: React.FC<SliderControlProps> = ({ 
  label, 
  description, 
  value, 
  onChange, 
  min = 0, 
  max = 100 
}) => {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <label className="text-white font-medium text-sm">{label}</label>
          <p className="text-gray-400 text-xs mt-1">{description}</p>
        </div>
        <span className="text-red-500 font-semibold text-lg ml-4">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
        style={{
          background: `linear-gradient(to right, #DC2626 0%, #DC2626 ${((value - min) / (max - min)) * 100}%, #374151 ${((value - min) / (max - min)) * 100}%, #374151 100%)`
        }}
      />
    </div>
  );
};

export default SliderControl;
