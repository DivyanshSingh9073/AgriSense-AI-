import {
  cloneElement,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/utils';

export interface DropdownItem {
  /** Unique within the menu — used as the React key and for keyboard indexing. */
  id: string;
  label: string;
  icon?: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  /** Styles the item in the danger color, e.g. "Delete field". */
  destructive?: boolean;
}

export type DropdownEntry = DropdownItem | { divider: true };

export interface DropdownProps {
  /** Trigger element — typically a Button or icon button. Receives no injected props. */
  trigger: ReactElement<any, any>;
  items: DropdownEntry[];
  align?: 'left' | 'right';
  className?: string;
}

function isDivider(entry: DropdownEntry): entry is { divider: true } {
  return 'divider' in entry;
}

/**
 * Menu attached to a trigger element. Supports mouse and full keyboard
 * interaction (ArrowUp/Down to move, Enter/Space to select, Escape to
 * close) and closes on outside click. Used for row actions (⋯ menus),
 * user account menus, and filter/sort selectors.
 */
export function Dropdown({ trigger, items, align = 'left', className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectableIndexes = items
    .map((entry, index) => (!isDivider(entry) && !entry.disabled ? index : null))
    .filter((i): i is number => i !== null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const closeAndFocus = () => {
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeAndFocus();
      return;
    }
    if (!open) return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const currentPos = selectableIndexes.indexOf(activeIndex);
      const nextPos =
        e.key === 'ArrowDown'
          ? (currentPos + 1) % selectableIndexes.length
          : (currentPos - 1 + selectableIndexes.length) % selectableIndexes.length;
      setActiveIndex(selectableIndexes[nextPos]);
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const entry = items[activeIndex];
      if (entry && !isDivider(entry) && !entry.disabled) {
        entry.onSelect?.();
        closeAndFocus();
      }
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block" onKeyDown={handleKeyDown}>
      {cloneElement(trigger, {
        onClick: () => setOpen((o) => !o),
        'aria-haspopup': 'menu',
        'aria-expanded': open,
      })}

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className={cn(
              'absolute z-40 mt-2 min-w-[180px] rounded-xl border border-border bg-surface p-1.5 shadow-lg',
              align === 'right' ? 'right-0' : 'left-0',
              className,
            )}
          >
            {items.map((entry, index) => {
              if (isDivider(entry)) {
                return <div key={`divider-${index}`} role="separator" className="my-1.5 h-px bg-border" />;
              }

              const isActive = index === activeIndex;

              return (
                <button
                  key={entry.id}
                  type="button"
                  role="menuitem"
                  disabled={entry.disabled}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    entry.onSelect?.();
                    closeAndFocus();
                  }}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    'disabled:cursor-not-allowed disabled:opacity-40',
                    entry.destructive ? 'text-danger' : 'text-foreground',
                    isActive && !entry.disabled && 'bg-surface-muted',
                  )}
                >
                  {entry.icon && <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{entry.icon}</span>}
                  {entry.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
