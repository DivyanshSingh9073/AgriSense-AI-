import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../lib/cn";

/**
 * Dropdown
 * ---------------------------------------------------------------------------
 * Reusable menu attached to a trigger — user menu, "..." row actions, sort
 * controls, filter pickers. Handles open/close, outside-click, Escape, and
 * arrow-key navigation between items internally so call sites only supply
 * a trigger and a list of items.
 *
 * Usage:
 *   <Dropdown
 *     trigger={<Button variant="outline">Sort by</Button>}
 *     items={[
 *       { label: "Newest first", onSelect: () => …},
 *       { label: "Yield (high to low)", onSelect: () => … },
 *       { label: "Remove field", onSelect: () => …, destructive: true },
 *     ]}
 *   />
 */

export interface DropdownItem {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
}

export function Dropdown({ trigger, items, align = "left" }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && activeIndex >= 0) itemRefs.current[activeIndex]?.focus();
  }, [open, activeIndex]);

  function handleTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex(0);
    }
  }

  function handleMenuKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % items.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + items.length) % items.length);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  return (
    <div className="relative inline-block" ref={containerRef}>
      <div
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {trigger}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            onKeyDown={handleMenuKeyDown}
            className={cn(
              "absolute z-40 mt-2 min-w-[12rem] overflow-hidden rounded-md border border-border bg-surface-raised py-1.5 shadow-lg",
              align === "right" ? "right-0" : "left-0",
            )}
          >
            {items.map((item, index) => (
              <button
                key={item.label}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                role="menuitem"
                type="button"
                disabled={item.disabled}
                onClick={() => {
                  item.onSelect();
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3.5 py-2 text-left font-body text-sm transition-colors",
                  "focus-visible:outline-none focus-visible:bg-neutral-100",
                  item.disabled
                    ? "cursor-not-allowed text-text-muted"
                    : item.destructive
                    ? "text-danger hover:bg-danger-bg"
                    : "text-text-primary hover:bg-neutral-100",
                )}
              >
                {item.icon && (
                  <span className="shrink-0 text-base" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
