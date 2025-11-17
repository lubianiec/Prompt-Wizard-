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
        className="appearance-none h-5 w-5 rounded-md bg-[#2B273A] border border-[#F0F0F0]/30 shadow-[inset_2px_2px_4px_#1b1825,inset_-2px_-2px_4px_#3b364f] checked:bg-[#F0C38E] checked:border-transparent checked:shadow-[inset_2px_2px_4px_#1b1825] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#2B273A] focus:ring-[#F0C38E] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      />
      <label htmlFor={id} className={`ml-3 block text-sm font-medium ${disabled ? 'text-[#F0F0F0]/40' : 'text-[#F0F0F0] cursor-pointer'}`}>
        {label}
      </label>
    </div>
  );
};

export default Checkbox;