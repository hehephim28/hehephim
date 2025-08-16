import { useEffect, forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      size = 'md',
      closeOnOverlayClick = true,
      closeOnEscape = true,
      showCloseButton = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Handle escape key
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (closeOnEscape && event.key === 'Escape') {
          onClose();
        }
      };

      if (isOpen) {
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }, [isOpen, closeOnEscape, onClose]);

    const sizes = {
      sm: 'max-w-md',
      md: 'max-w-2xl',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
      full: 'max-w-[95vw] max-h-[95vh]',
    };

    const overlayVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 },
    };

    // Modal animations disabled for build compatibility
    // Can be re-enabled with proper framer-motion type handling

    const handleOverlayClick = (e: React.MouseEvent) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose();
      }
    };

    if (!isOpen) return null;

    const modalContent = (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleOverlayClick}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal */}
            <div
              ref={ref as any}
              className={cn(
                'relative w-full bg-slate-800 rounded-lg shadow-2xl border border-slate-700',
                'max-h-[90vh] overflow-hidden',
                sizes[size],
                className
              )}
              {...(props as any)}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                  {title && (
                    <h2 className="text-xl font-semibold text-white">
                      {title}
                    </h2>
                  )}
                  {showCloseButton && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      className="ml-auto"
                      leftIcon={<X className="w-4 h-4" />}
                    >
                      Close
                    </Button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
  }
);

Modal.displayName = 'Modal';

// Modal sub-components
const ModalContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-6', className)}
      {...props}
    />
  )
);
ModalContent.displayName = 'ModalContent';

const ModalFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-end space-x-3 p-6 border-t border-slate-700',
        className
      )}
      {...props}
    />
  )
);
ModalFooter.displayName = 'ModalFooter';

export { Modal, ModalContent, ModalFooter };
