"use client";
import { useState, useEffect } from "react";
import AuthGuard from "@/components/auth-guard";

interface DashboardStats {
  statusCounts: {
    [key: string]: number;
  };
  ageCounts: {
    [key: string]: number;
  };
  departmentCounts: {
    [key: string]: number;
  };
  totalTickets: number;
  recentTickets: number;
  resolvedTickets: number;
  resolutionRate: string;
}

function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard/stats");

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const statusCategories = [
    // { name: "Closed", color: "bg-gray-500" },
    { name: "Under Review", color: "bg-blue-500" },
    { name: "Work in Progress", color: "bg-yellow-500" },
    { name: "Rejected", color: "bg-red-500" },
    { name: "Wrong Department", color: "bg-orange-500" },
    { name: "Problem Solved", color: "bg-green-500" },
  ];

  const ageGroups = [
    { name: "18-25", color: "bg-purple-500" },
    { name: "26-35", color: "bg-indigo-500" },
    { name: "36-50", color: "bg-blue-500" },
    { name: "51-65", color: "bg-green-500" },
    { name: "65+", color: "bg-yellow-500" },
    { name: "Other", color: "bg-gray-500" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-lg font-medium">Error</div>
          <p className="mt-2 text-sm text-gray-600">{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 text-gray-900">
      <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Overview of ticket statistics and age group distribution
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-pink-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">
                  Total Tickets
                </h3>
                <p className="text-2xl font-bold text-pink-600">
                  {stats?.totalTickets || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Resolved</h3>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.resolvedTickets || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">
                  Recent (7 days)
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  {stats?.recentTickets || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">
                  Resolution Rate
                </h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats?.resolutionRate || "0.0"}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Tickets by Status
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {statusCategories.map((category) => (
              <div
                key={category.name}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center">
                  <div
                    className={`w-4 h-4 rounded-full ${category.color} mr-3`}
                  ></div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      {category.name}
                    </h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.statusCounts[category.name] || 0}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Age Group Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Tickets by Age Group
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ageGroups.map((group) => (
              <div key={group.name} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div
                    className={`w-4 h-4 rounded-full ${group.color} mr-3`}
                  ></div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      {group.name}
                    </h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.ageCounts[group.name] || 0}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Tickets by Department
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats?.departmentCounts &&
              Object.entries(stats.departmentCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 12)
                .map(([department, count], index) => {
                  const colors = [
                    "bg-blue-500",
                    "bg-green-500",
                    "bg-yellow-500",
                    "bg-red-500",
                    "bg-purple-500",
                    "bg-indigo-500",
                    "bg-pink-500",
                    "bg-orange-500",
                    "bg-teal-500",
                    "bg-cyan-500",
                    "bg-lime-500",
                    "bg-amber-500",
                  ];
                  const color = colors[index % colors.length];

                  return (
                    <div
                      key={department}
                      className="bg-white rounded-lg shadow p-6"
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-4 h-4 rounded-full ${color} mr-3`}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className="text-sm font-medium text-gray-500 truncate"
                            title={department}
                          >
                            {department}
                          </h3>
                          <p className="text-2xl font-bold text-gray-900">
                            {count}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>

        {/* Department Chart */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Department Distribution Chart
          </h2>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              {stats?.departmentCounts &&
                Object.entries(stats.departmentCounts)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([department, count], index) => {
                    const maxCount = Math.max(
                      ...Object.values(stats.departmentCounts)
                    );
                    const percentage =
                      maxCount > 0 ? (count / maxCount) * 100 : 0;
                    const colors = [
                      "bg-blue-500",
                      "bg-green-500",
                      "bg-yellow-500",
                      "bg-red-500",
                      "bg-purple-500",
                      "bg-indigo-500",
                      "bg-pink-500",
                      "bg-orange-500",
                      "bg-teal-500",
                      "bg-cyan-500",
                    ];
                    const color = colors[index % colors.length];

                    return (
                      <div key={department} className="flex items-center">
                        <div
                          className="w-48 text-sm text-gray-600 truncate mr-4"
                          title={department}
                        >
                          {department}
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                          <div
                            className={`h-6 rounded-full ${color} flex items-center justify-end pr-2`}
                            style={{ width: `${percentage}%` }}
                          >
                            <span className="text-xs font-medium text-white">
                              {count}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>
        </div>

        {/* Status vs Department Matrix */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Status vs Department Matrix
          </h2>
          <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
            <div className="text-sm text-gray-500 mb-4">
              This shows the distribution of ticket statuses across different
              departments
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Status Distribution
                </h3>
                <div className="space-y-2">
                  {statusCategories.map((category) => {
                    const count = stats?.statusCounts[category.name] || 0;
                    const percentage = stats?.totalTickets
                      ? ((count / stats.totalTickets) * 100).toFixed(1)
                      : "0.0";

                    return (
                      <div
                        key={category.name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full ${category.color} mr-2`}
                          ></div>
                          <span className="text-sm text-gray-600">
                            {category.name}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {count} ({percentage}%)
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Departments */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Top Departments
                </h3>
                <div className="space-y-2">
                  {stats?.departmentCounts &&
                    Object.entries(stats.departmentCounts)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 8)
                      .map(([department, count], index) => {
                        const percentage = stats?.totalTickets
                          ? ((count / stats.totalTickets) * 100).toFixed(1)
                          : "0.0";
                        const colors = [
                          "bg-blue-500",
                          "bg-green-500",
                          "bg-yellow-500",
                          "bg-red-500",
                          "bg-purple-500",
                          "bg-indigo-500",
                          "bg-pink-500",
                          "bg-orange-500",
                        ];
                        const color = colors[index % colors.length];

                        return (
                          <div
                            key={department}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center flex-1 min-w-0">
                              <div
                                className={`w-3 h-3 rounded-full ${color} mr-2 flex-shrink-0`}
                              ></div>
                              <span
                                className="text-sm text-gray-600 truncate"
                                title={department}
                              >
                                {department}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-gray-900 ml-2">
                              {count} ({percentage}%)
                            </div>
                          </div>
                        );
                      })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
