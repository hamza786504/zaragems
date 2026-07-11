export default function LowStockLoading() {
  return (
    <div className="bg-white rounded-xl border border-outline-variant p-3 md:p-lg shadow-sm animate-pulse">
      <div className="h-6 bg-surface-container-high rounded w-36 mb-4" />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-surface-container-high rounded" />
        ))}
      </div>
    </div>
  );
}
