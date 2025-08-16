import { clsx, type ClassValue } from 'clsx';

/**
 * Utility function to combine class names
 * Combines clsx for conditional classes with proper TypeScript support
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
