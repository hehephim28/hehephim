import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'search' | 'outline';
  inputSize?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      variant = 'default',
      inputSize = 'md',
      leftIcon,
      rightIcon,
      error,
      label,
      id,
      ...props
    },
    ref
  ) => {
    const baseStyles = [
      'w-full rounded-lg transition-all duration-200',
      'bg-slate-800 border border-slate-600 text-white placeholder-slate-400',
      'focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent',
      'disabled:opacity-50 disabled:cursor-not-allowed',
    ];

    const variants = {
      default: [
        'hover:border-slate-500',
      ],
      search: [
        'bg-slate-800/80 backdrop-blur-sm',
        'border-slate-500 hover:border-slate-400',
        'focus:ring-red-400',
      ],
      outline: [
        'bg-transparent border-2 border-slate-600',
        'hover:border-slate-500',
      ],
    };

    const sizes = {
      sm: leftIcon || rightIcon ? 'py-2 pl-10 pr-4 text-sm' : 'py-2 px-3 text-sm',
      md: leftIcon || rightIcon ? 'py-3 pl-12 pr-4 text-base' : 'py-3 px-4 text-base',
      lg: leftIcon || rightIcon ? 'py-4 pl-14 pr-4 text-lg' : 'py-4 px-5 text-lg',
    };

    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    const iconPositions = {
      sm: { left: 'left-3', right: 'right-3' },
      md: { left: 'left-4', right: 'right-4' },
      lg: { left: 'left-5', right: 'right-5' },
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div
              className={cn(
                'absolute top-1/2 transform -translate-y-1/2 text-slate-400',
                iconPositions[inputSize].left
              )}
            >
              <div className={iconSizes[inputSize]}>{leftIcon}</div>
            </div>
          )}
          
          <input
            type={type}
            className={cn(
              baseStyles,
              variants[variant],
              sizes[inputSize],
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            ref={ref}
            id={id}
            {...props}
          />
          
          {rightIcon && (
            <div
              className={cn(
                'absolute top-1/2 transform -translate-y-1/2 text-slate-400',
                iconPositions[inputSize].right
              )}
            >
              <div className={iconSizes[inputSize]}>{rightIcon}</div>
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-2 text-sm text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
