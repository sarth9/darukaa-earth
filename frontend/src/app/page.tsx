import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-8 px-6 py-16">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
            Darukaa.Earth
          </p>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-6xl">
            Carbon and biodiversity project monitoring with geospatial intelligence
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
            Create environmental projects, draw site polygons on an interactive map,
            and track performance over time through clean analytics dashboards.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/login"
            className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:opacity-90"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-xl border border-slate-700 px-6 py-3 font-semibold transition hover:bg-slate-900"
          >
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}