import Logo from "@/components/logo";

export default function HomePage() {
  return (
    <div className="bg-gray-50 text-gray-900">
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* App title centered with logo space */}
        <div className="pt-12 sm:pt-16">
          <div className="mx-auto flex flex-col items-center text-center">
            <Logo width={128} height={128} />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              Rashtrawadi Jansunavani
            </h1>
            <p className="mt-2 text-sm text-gray-600 max-w-prose">
              Please choose an action to continue
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Register */}
          <a
            href="/register"
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">Register</h3>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Add a new entry and capture required details.
            </p>
            <div className="mt-4 inline-flex items-center text-indigo-600 font-medium group-hover:translate-x-0.5 transition-transform">
              Get started
              <svg
                className="ml-1 h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L13.586 10 10.293 6.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </a>

          {/* Update */}
          <a
            href="/update"
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">Update</h3>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Modify existing records and keep information current.
            </p>
            <div className="mt-4 inline-flex items-center text-indigo-600 font-medium group-hover:translate-x-0.5 transition-transform">
              Continue
              <svg
                className="ml-1 h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L13.586 10 10.293 6.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </a>

          {/* Print */}
          <a
            href="/print"
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">Print</h3>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Generate and print output for records.
            </p>
            <div className="mt-4 inline-flex items-center text-indigo-600 font-medium group-hover:translate-x-0.5 transition-transform">
              Open
              <svg
                className="ml-1 h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L13.586 10 10.293 6.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </a>

          {/* Dashboard - Only show for dbuser01 */}
          <a
            href="/dashboard"
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">Dashboard</h3>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              View ticket statistics and analytics.
            </p>
            <div className="mt-4 inline-flex items-center text-indigo-600 font-medium group-hover:translate-x-0.5 transition-transform">
              View analytics
              <svg
                className="ml-1 h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L13.586 10 10.293 6.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </a>
        </div>
      </section>
    </div>
  );
}
