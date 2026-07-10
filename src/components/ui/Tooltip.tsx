import { useId, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../lib/cn";

/**
 * Tooltip
 * ---------------------------------------------------------------------------
 * Short contextual hint attached to an icon-only button, truncated label, or
 * a data point that needs one line of explanation (e.g. "NDVI: Normalized
 * Difference Vegetation Index"). Not for anything requiring interaction —
 * use Dropdown or Modal for that.
 *
 * Usage:
 *   <Tooltip content="Normalized Difference Vegetation Index">
 *     <IconButton icon={<FiInfo />} aria-label="What is NDVI?" />
 *   </Tooltip>
 */

export type TooltipPosition = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: TooltipPosition;
  delay?: number;
}

const positionStyles: Record<TooltipPosition, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const motionOffset: Record<TooltipPosition, { x?: number; y?: number }> = {
  top: { y: 4 },
  bottom: { y: -4 },
  left: { x: 4 },
  right: { x: -4 },
};

export function Tooltip({ content, children, position = "top", delay = 200 }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useId();

  function show() {
    const t = setTimeout(() => setVisible(true), delay);
    setTimer(t);
  }

  function hide() {
    if (timer) clearTimeout(timer);
    setVisible(false);
  }

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {/* Cloning isn't used to avoid over-coupling to child element type; instead
          we wrap in a span and point aria-describedby at the tooltip id. */}
      <span aria-describedby={visible ? tooltipId : undefined}>{children}</span>

      <AnimatePresence>
        {visible && (
          <motion.span
            role="tooltip"
            id={tooltipId}
            initial={{ opacity: 0, ...motionOffset[position] }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, ...motionOffset[position] }}
            transition={{ duration: 0.12 }}
            className={cn(
              "pointer-events-none absolute z-50 whitespace-nowrap rounded-sm bg-neutral-900 px-2.5 py-1.5 font-body text-xs font-medium text-white shadow-md dark:bg-neutral-100 dark:text-neutral-900",
              positionStyles[position],
            )}
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
