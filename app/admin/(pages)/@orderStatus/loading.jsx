export default function OrderStatusLoading() {
  return (
    <div className="bg-white rounded-xl border border-outline-variant p-3 md:p-lg shadow-sm animate-pulse">
      <div className="h-6 bg-surface-container-high rounded w-32 mb-4" />
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-8 bg-surface-container-high rounded" />
        ))}
      </div>
    </div>
  );
}
