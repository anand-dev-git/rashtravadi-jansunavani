export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white/70">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-center text-xs text-gray-500">
        © {new Date().getFullYear()} Rashtrawadi Jansunavani
      </div>
    </footer>
  );
}
