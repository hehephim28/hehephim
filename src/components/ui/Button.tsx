import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = [
      'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'hover:transform hover:scale-[1.02]',
    ];

    const variants = {
      primary: [
        'bg-red-600 text-white hover:bg-red-700',
        'focus:ring-red-500',
        'shadow-lg shadow-red-600/25',
      ],
      secondary: [
        'bg-slate-700 text-white hover:bg-slate-600',
        'focus:ring-slate-500',
      ],
      outline: [
        'border-2 border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white',
        'focus:ring-slate-500',
      ],
      ghost: [
        'text-slate-300 hover:text-white hover:bg-slate-800',
        'focus:ring-slate-500',
      ],
      destructive: [
        'bg-red-700 text-white hover:bg-red-800',
        'focus:ring-red-500',
      ],
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-xl',
    };

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          isLoading && 'cursor-wait',
          className
        )}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </div>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
