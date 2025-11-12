import React, { useState, useEffect } from 'react';

interface CampoNotaProps {
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  disabled?: boolean;
}

const CampoNota: React.FC<CampoNotaProps> = ({
  value,
  onChange,
  min = 0,
  max = 10,
  step = 0.1,
  placeholder = '0.0',
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState<string>(value === null ? '' : String(value));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInputValue(value === null ? '' : String(value));
  }, [value]);

  const validateAndCommit = (val: string) => {
    if (val === '') {
      setError(null);
      if (value !== null) onChange(null);
      return;
    }
    
    const num = parseFloat(val.replace(',', '.'));

    if (isNaN(num)) {
      setError('No es un número');
      return;
    }

    if (num < min || num > max) {
      setError(`Nota fuera de rango (${min}-${max})`);
      return;
    }

    setError(null);
    if (num !== value) {
      onChange(num);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Allow only numbers and a single comma/dot
    if (/^[0-9]*[,.]?[0-9]*$/.test(newValue)) {
       setInputValue(newValue);
    }
  };

  const handleBlur = () => {
    validateAndCommit(inputValue);
    // Format to one decimal place on blur if valid
    const num = parseFloat(inputValue.replace(',', '.'));
    if (!isNaN(num) && num >= min && num <= max) {
      setInputValue(num.toFixed(1));
    }
  };

  const getBorderColor = () => {
    if (error) return 'border-red-500 focus:ring-red-500 focus:border-red-500';
    if (value !== null) {
      if (value >= 5) return 'border-green-500 focus:ring-green-500 focus:border-green-500';
      if (value < 5) return 'border-red-500 focus:ring-red-500 focus:border-red-500';
    }
    return 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
  };
  
  return (
    <input
      type="text" // Use text to allow comma and better control
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-16 p-1 text-center bg-transparent outline-none border-2 rounded-md transition-colors ${getBorderColor()}`}
      min={min}
      max={max}
      step={step}
      title={error || ''}
    />
  );
};

export default CampoNota;
