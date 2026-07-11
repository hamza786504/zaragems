export default function MetricsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-lg">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm animate-pulse">
          <div className="flex justify-between items-start mb-md">
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-surface-container-high rounded w-20" />
              <div className="h-6 bg-surface-container-high rounded w-28" />
              <div className="h-3 bg-surface-container-high rounded w-36" />
            </div>
            <div className="p-sm rounded-lg bg-surface-container-high">
              <div className="w-5 h-5 bg-surface-container rounded" />
            </div>
          </div>
          <div className="h-12 bg-surface-container-high rounded" />
        </div>
      ))}
    </div>
  );
}
