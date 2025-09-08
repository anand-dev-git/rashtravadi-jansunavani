"use client";
import { usePathname } from "next/navigation";
import Logo from "./logo";
export default function Navbar(props: {
  showLoginButton?: boolean;
  username?: string;
}) {
  const pathname = usePathname();
  const isLoginRoute = pathname === "/login";
  return (
    <header className="w-full border-b border-gray-200 bg-pink-600/70 backdrop-blur sticky top-0 z-10">
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo placeholder */}
          <Logo width={64} height={64} />
          <span className="font-semibold tracking-tight">
            Rashtrawadi Jansunavani
          </span>
        </div>
        <div className="flex items-center gap-2">
          {props.username ? (
            <span className="text-sm font-medium text-gray-700">
              {props.username}
            </span>
          ) : props.showLoginButton && !isLoginRoute ? (
            <a
              href="/login"
              className="inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Login
            </a>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
