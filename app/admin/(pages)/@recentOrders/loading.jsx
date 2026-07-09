export default function RecentOrdersLoading() {
  return (
    <div className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden animate-pulse">
      <div className="p-lg border-b border-outline-variant">
        <div className="h-6 bg-surface-container-high rounded w-32 mb-2" />
        <div className="h-4 bg-surface-container-high rounded w-48" />
      </div>
      <div className="p-lg space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-surface-container-high rounded" />
        ))}
      </div>
    </div>
  );
}
