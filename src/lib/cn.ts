/**
 * cn — combines conditional class names into a single string.
 *
 * Deliberately dependency-free (no clsx/tailwind-merge) to keep the design
 * system's footprint limited to the stack the project already uses. Accepts
 * strings, numbers, `false`/`null`/`undefined` (ignored), and objects whose
 * truthy keys are included — e.g. cn("btn", isActive && "btn-active", { hidden }).
 */
type ClassValue = string | number | null | undefined | false | Record<string, boolean | undefined>;

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === "string" || typeof input === "number") {
      classes.push(String(input));
      continue;
    }

    if (typeof input === "object") {
      for (const key in input) {
        if (input[key]) classes.push(key);
      }
    }
  }

  return classes.join(" ");
}
