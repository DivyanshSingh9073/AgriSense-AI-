import { useId, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/utils';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: ReactNode;
  placement?: TooltipPlacement;
  /** Delay in ms before showing, so tooltips don't flash while pointer passes through. */
  delay?: number;
  /** A single focusable/hoverable element — the tooltip attaches its handlers to it directly. */
  children: ReactElement;
  className?: string;
}

const PLACEMENT_CLASSES: Record<TooltipPlacement, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}; 

const MOTION_OFFSET: Record<TooltipPlacement, { x?: number; y?: number }> = {
  top: { y: 4 },
  bottom: { y: -4 },
  left: { x: 4 },
  right: { x: -4 },
};

/**
 * Wraps a single child (must accept onMouseEnter/onFocus etc — a button,
 * link, or icon works well) and shows a small label on hover/focus. Works
 * with both mouse and keyboard navigation for accessibility.
 *
 * Usage: <Tooltip content="Delete field"><IconButton icon={<MdDelete/>} /></Tooltip>
 */
export function Tooltip({ content, placement = 'top', delay = 200, children, className }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useId();

  const show = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {/* Clone-free: pass aria-describedby via a wrapping span so the child
          component doesn't need to forward arbitrary props. */}
      <span aria-describedby={visible ? tooltipId : undefined}>{children}</span>

      <AnimatePresence>
        {visible && (
          <motion.span
            role="tooltip"
            id={tooltipId}
            initial={{ opacity: 0, ...MOTION_OFFSET[placement] }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, ...MOTION_OFFSET[placement] }}
            transition={{ duration: 0.12 }}
            className={cn(
              'pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-neutral-100 dark:text-neutral-900',
              PLACEMENT_CLASSES[placement],
              className,
            )}
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
