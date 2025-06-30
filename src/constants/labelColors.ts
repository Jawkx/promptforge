export const LABEL_COLORS = [
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#84cc16", // Lime
  "#22c55e", // Green
  "#14b8a6", // Teal
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#a855f7", // Purple
  "#d946ef", // Fuchsia
];

export const getLabelColorClass = (color: string) => {
  // This is a simple way to use the hex color directly.
  // For more complex styling (e.g., hover states, text color),
  // you might map these to specific Tailwind CSS classes.
  return { backgroundColor: color };
};
