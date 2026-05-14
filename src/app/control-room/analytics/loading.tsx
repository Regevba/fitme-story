export default function AnalyticsLoading() {
  return (
    <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
      <div className="mb-6">
        <div className="h-8 w-40 bg-[var(--color-neutral-200)] dark:bg-[var(--color-neutral-700)] rounded mb-3" />
        <div className="h-4 w-[480px] max-w-full bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)] rounded" />
      </div>

      <div className="h-12 bg-[var(--color-warning-100)] dark:bg-[var(--color-warning-900)] rounded-md" />

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-44 bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)] rounded-md" />
        ))}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-72 bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)] rounded-md" />
        ))}
      </section>
    </main>
  );
}
