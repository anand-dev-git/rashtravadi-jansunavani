import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-gray-50 text-gray-900">
      <section className="mx-auto max-w-3xl w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center">
          <p className="text-sm font-semibold text-pink-600">404</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Page not found
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sorry, we couldn’t find the page you’re looking for.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center rounded-md bg-pink-600 px-4 py-2 text-white text-sm font-medium hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Go back home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
