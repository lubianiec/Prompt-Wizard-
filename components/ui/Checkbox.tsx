import React from 'react';

interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({ id, checked, onChange, label, disabled = false }) => {
  return (
    <div className="flex items-center">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
        className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-teal-600 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-zinc-900 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      />
      <label htmlFor={id} className={`ml-3 block text-sm font-medium ${disabled ? 'text-gray-500' : 'text-gray-300 cursor-pointer'}`}>
        {label}
      </label>
    </div>
  );
};

export default Checkbox;