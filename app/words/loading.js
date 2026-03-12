export default function Loading() {
  return (
    <div className="flex flex-col gap-4 pb-8 animate-fade-in">
      <div className="h-8 w-32 bg-surface-alt rounded-lg skeleton" />

      {/* Search skeleton */}
      <div className="h-10 w-full bg-surface-alt rounded-xl skeleton" />

      {/* Sort pills skeleton */}
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-7 w-16 bg-surface-alt rounded-lg skeleton" />
        ))}
      </div>

      <div className="h-4 w-20 bg-surface-alt rounded skeleton" />

      {/* Card skeletons */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-4 rounded-xl bg-surface-alt border border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="h-5 w-28 bg-border rounded skeleton" />
              <div className="h-4 w-48 bg-border rounded skeleton mt-2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
