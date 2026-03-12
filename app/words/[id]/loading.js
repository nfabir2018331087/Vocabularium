export default function Loading() {
  return (
    <div className="flex flex-col gap-6 pb-8 animate-fade-in">
      <div>
        <div className="h-4 w-12 bg-surface-alt rounded skeleton" />
        <div className="h-9 w-40 bg-surface-alt rounded-lg skeleton mt-2" />
        <div className="h-4 w-20 bg-surface-alt rounded skeleton mt-1" />
      </div>

      {/* Meaning skeletons */}
      <div className="p-4 rounded-xl bg-surface-alt border border-border">
        <div className="h-3 w-24 bg-border rounded skeleton" />
        <div className="h-5 w-full bg-border rounded skeleton mt-2" />
        <div className="h-5 w-3/4 bg-border rounded skeleton mt-1" />
      </div>

      <div className="p-4 rounded-xl bg-surface-alt border border-border">
        <div className="h-3 w-16 bg-border rounded skeleton" />
        <div className="h-5 w-full bg-border rounded skeleton mt-2" />
      </div>

      {/* Examples skeleton */}
      <div className="p-4 rounded-xl bg-surface-alt border border-border">
        <div className="h-3 w-20 bg-border rounded skeleton" />
        <div className="h-4 w-full bg-border rounded skeleton mt-2" />
        <div className="h-4 w-5/6 bg-border rounded skeleton mt-1.5" />
      </div>

      {/* Tags skeleton */}
      <div className="flex gap-1.5">
        <div className="h-6 w-16 bg-surface-alt rounded-full skeleton" />
        <div className="h-6 w-24 bg-surface-alt rounded-full skeleton" />
      </div>
    </div>
  );
}
