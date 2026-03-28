export function Shimmer({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className}`}
      style={{ backgroundColor: 'var(--surface-variant)', ...style }}
    />
  );
}

export function ShimmerCard({ height = 150 }: { height?: number }) {
  return <Shimmer className="w-full rounded-xl" style={{ height }} />;
}

export function ShimmerText({ width = '100%' }: { width?: string | number }) {
  return <Shimmer className="h-4 rounded" style={{ width }} />;
}

export function ShimmerList({ count = 3, itemHeight = 80 }: { count?: number; itemHeight?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Shimmer className="shrink-0 rounded-lg" style={{ width: 60, height: itemHeight }} />
          <div className="flex-1 space-y-2 py-2">
            <ShimmerText width="70%" />
            <ShimmerText width="40%" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ShimmerTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Shimmer key={j} className="h-8 flex-1 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}
