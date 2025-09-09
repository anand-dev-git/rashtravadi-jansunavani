"use client";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

interface BreadcrumbItem {
  label: string;
  href: string;
  isActive: boolean;
}

export default function Breadcrumb() {
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  useEffect(() => {
    const generateBreadcrumbs = (): BreadcrumbItem[] => {
      const pathSegments = pathname
        .split("/")
        .filter((segment) => segment !== "");
      const breadcrumbItems: BreadcrumbItem[] = [];

      // Always start with Home
      breadcrumbItems.push({
        label: "Home",
        href: "/",
        isActive: pathname === "/",
      });

      // Route name mapping for better UX
      const routeNames: { [key: string]: string } = {
        register: "Register",
        update: "Update",
        print: "Print",
        login: "Login",
        home: "Home",
        dashboard: "Dashboard",
      };

      // Add other segments
      let currentPath = "";
      pathSegments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const isLast = index === pathSegments.length - 1;

        // Use mapped name or convert segment to readable label
        const label =
          routeNames[segment] ||
          segment
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

        breadcrumbItems.push({
          label,
          href: currentPath,
          isActive: isLast,
        });
      });

      return breadcrumbItems;
    };

    setBreadcrumbs(generateBreadcrumbs());
  }, [pathname]);

  // Don't show breadcrumb on home page
  if (pathname === "/") {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-200 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((item, index) => (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <svg
                  className="h-4 w-4 text-gray-400 mx-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {item.isActive ? (
                <span className="font-medium text-gray-900">{item.label}</span>
              ) : (
                <a
                  href={item.href}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
