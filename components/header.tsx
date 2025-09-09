"use client";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Logo from "./logo";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; role: string } | null>(
    null
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isLoginRoute = pathname === "/login";

  useEffect(() => {
    // Check if user is logged in by looking at localStorage
    const checkUser = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error("Error parsing user data:", error);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    // Check on mount
    checkUser();

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user" || e.key === "token") {
        checkUser();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Call logout API
      await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Clear localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      // Clear cookies
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      // Reset user state
      setUser(null);

      // Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if API call fails, clear local data
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      setUser(null);
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="w-full border-b border-gray-200 bg-pink-600/70 backdrop-blur sticky top-0 z-10">
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo placeholder */}
          <Logo width={64} height={64} />
          <span className="font-semibold tracking-tight text-white">
            Rashtrawadi Jansunavani
          </span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">
                  Welcome, {user.username}
                </span>
                <span className="text-xs text-pink-100">({user.role})</span>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </>
          ) : !isLoginRoute ? (
            <a
              href="/login"
              className="inline-flex items-center rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20"
            >
              Login
            </a>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
