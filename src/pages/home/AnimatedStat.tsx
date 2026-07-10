import { useEffect, useRef } from 'react';
import { animate, motion, useInView, useMotionValue, useTransform } from 'framer-motion';

export interface AnimatedStatProps {
  value: number;
  suffix?: string;
  label: string;
}

/** Counts up from 0 to `value` once it scrolls into view. Used in the hero stats row. */
export function AnimatedStat({ value, suffix = '', label }: AnimatedStatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(count, value, { duration: 1.4, ease: 'easeOut' });
    return controls.stop;
  }, [isInView, value, count]);

  return (
    <div ref={ref}>
      <p className="font-display text-3xl font-semibold text-white sm:text-4xl">
        <motion.span>{rounded}</motion.span>
        {suffix}
      </p>
      <p className="mt-1 text-sm text-white/70">{label}</p>
    </div>
  );
}
