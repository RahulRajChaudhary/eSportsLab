import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center text-zinc-900">
      <p className="text-sm font-semibold text-blue-600">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-sm text-sm text-zinc-500">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Back to home
        </Link>
        <Link
          href="/tournament"
          className="rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-blue-200 hover:text-blue-700"
        >
          Browse tournaments
        </Link>
      </div>
    </div>
  );
}
