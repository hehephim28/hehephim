import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'movie' | 'elevated' | 'outlined';
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = true, children, ...props }, ref) => {
    const baseStyles = [
      'rounded-lg overflow-hidden',
      'transition-all duration-300 ease-out',
    ];

    const variants = {
      default: [
        'bg-slate-800 border border-slate-700',
      ],
      movie: [
        'bg-slate-800/90 backdrop-blur-sm',
        'border border-slate-700/50',
        'shadow-lg',
      ],
      elevated: [
        'bg-slate-800 border border-slate-700',
        'shadow-2xl shadow-black/50',
      ],
      outlined: [
        'border-2 border-slate-600 bg-transparent',
      ],
    };

    const hoverStyles = hover && [
      'hover:scale-[1.02] hover:shadow-xl hover:shadow-black/25',
      'hover:border-slate-600 hover:bg-slate-700/50',
      'transform-gpu',
    ];

    return (
      <div
        className={cn(
          baseStyles,
          variants[variant],
          hoverStyles,
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card sub-components
const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-4 pb-2', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-4 pt-0', className)}
      {...props}
    />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-4 pt-2 flex items-center justify-between', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('font-semibold text-white leading-none tracking-tight', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-slate-400 leading-relaxed', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

export {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
};
