export default function FrameworkHealthLoading() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-10">
        <div className="h-8 w-72 bg-[var(--color-neutral-200)] dark:bg-[var(--color-neutral-700)] rounded mb-3" />
        <div className="h-4 w-96 bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)] rounded" />
      </div>

      {/* Section skeletons */}
      {[1, 2, 3, 4, 5].map((i) => (
        <section key={i} className="mb-12">
          <div className="h-5 w-48 bg-[var(--color-neutral-200)] dark:bg-[var(--color-neutral-700)] rounded mb-4" />
          <div className="h-48 bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)] rounded-lg" />
        </section>
      ))}
    </div>
  );
}
