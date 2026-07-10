import { useEffect, type HTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MdClose } from 'react-icons/md';
import { cn } from '@/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

/**
 * Portal-rendered dialog with backdrop click-to-close, Escape-to-close, and
 * `role="dialog"` / `aria-modal` for screen readers. Body scroll is locked
 * while open.
 *
 * Composition: the built-in `title` prop renders the header (with close
 * button) automatically. Use <ModalBody> / <ModalFooter> as children for
 * consistent internal spacing — e.g.:
 *
 *   <Modal isOpen={isOpen} onClose={close} title="Delete field?">
 *     <ModalBody>This can't be undone.</ModalBody>
 *     <ModalFooter>
 *       <Button variant="ghost" onClick={close}>Cancel</Button>
 *       <Button variant="danger" onClick={confirm}>Delete</Button>
 *     </ModalFooter>
 *   </Modal>
 */
export function Modal({ isOpen, onClose, title, children, size = 'md', className }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-primary-900/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={cn(
              'card-surface relative z-10 w-full p-6 shadow-elevated',
              SIZE_CLASSES[size],
              className,
            )}
          >
            {title && (
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-display font-semibold">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="rounded-lg p-1.5 text-foreground-muted hover:bg-surface-muted focus-ring"
                >
                  <MdClose className="h-5 w-5" />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** Scrollable content region of a Modal. Use for the main message/form. */
export function ModalBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('py-1 text-sm text-foreground-muted', className)} {...rest} />;
}

/** Right-aligned action row, separated from the body by a top border. */
export function ModalFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mt-6 flex items-center justify-end gap-3 border-t border-border pt-4', className)}
      {...rest}
    />
  );
}
