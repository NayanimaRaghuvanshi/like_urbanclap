import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x py-20 text-center">
      <p className="text-6xl">🔧</p>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-ink-muted">This page seems to need a repair. Let's get you back home.</p>
      <Link href="/" className="btn-primary mt-6">Go to Homepage</Link>
    </div>
  );
}
