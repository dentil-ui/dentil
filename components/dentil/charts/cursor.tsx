/** Props Recharts injects into a custom tooltip cursor on a line chart. */
export interface ChartCursorProps {
  points?: ReadonlyArray<{ x: number; y: number }>;
  height?: number;
  /** Band and rule color. */
  fill?: string;
  /** Band width in pixels. Recharts injects its own `width` (the plot width), so this has a different name. */
  bandWidth?: number;
}

/** A soft band behind the hovered point with a 1px rule through its center. Pass it to `ChartTooltip`'s `cursor`. */
export function ChartCursor({ points, height, fill = 'var(--chart-1)', bandWidth = 24 }: ChartCursorProps) {
  const top = points?.[0];
  if (!top) return null;

  const bottom = points?.[1];
  const bandHeight = height ?? (bottom ? bottom.y - top.y : 0);
  if (bandHeight <= 0) return null;

  return (
    <g data-slot="chart-cursor" pointerEvents="none">
      <rect x={top.x - bandWidth / 2} y={top.y} width={bandWidth} height={bandHeight} fill={fill} fillOpacity={0.12} />
      <rect x={top.x - 0.5} y={top.y} width={1} height={bandHeight} fill={fill} fillOpacity={0.5} />
    </g>
  );
}
