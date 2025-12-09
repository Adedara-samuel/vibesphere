import { forwardRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasToggle?: boolean;
  toggleIcon?: React.ReactNode;
  onToggle?: () => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', hasToggle = false, toggleIcon, onToggle, ...props }, ref) => {
    const { config } = useTheme();

    const baseClasses = `w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 ${config.ring} focus:border-transparent shadow-sm text-gray-500 placeholder-gray-400`;

    const inputClasses = hasToggle ? `${baseClasses} pr-12` : baseClasses;

    return (
      <div className="relative">
        <input
          ref={ref}
          className={`${inputClasses} ${className}`}
          {...props}
        />
        {hasToggle && onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {toggleIcon}
          </button>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;