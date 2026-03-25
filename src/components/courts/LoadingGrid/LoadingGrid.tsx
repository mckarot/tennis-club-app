export function LoadingGrid() {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-48 bg-surface-container-highest rounded animate-pulse" />
        <div className="flex items-center gap-4">
          <div className="h-4 w-24 bg-surface-container-highest rounded animate-pulse" />
          <div className="h-4 w-24 bg-surface-container-highest rounded animate-pulse" />
          <div className="h-4 w-24 bg-surface-container-highest rounded animate-pulse" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-7 gap-2">
        {hours.map((hour) => (
          <div
            key={hour}
            className="h-16 rounded-md bg-surface-container-highest animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
