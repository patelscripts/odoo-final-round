import { useState } from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { LogOut, Menu } from "lucide-react";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col">
      <header className="h-16 shrink-0 border-b border-border flex items-center gap-3 px-4 sm:px-6 bg-surface z-40">
        <button
          className="lg:hidden p-2 text-ink-muted"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
        <span className="font-heading text-lg font-semibold text-ink">
          PeoplePay<span className="text-primary">360</span>
        </span>
        <div className="ml-auto flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="text-sm text-right min-w-0">
            <p className="text-ink font-medium truncate">{user?.name}</p>
            <p className="text-ink-muted text-xs capitalize">{user?.role?.replace(/_/g, " ")}</p>
          </div>
          <button
            onClick={logout}
            className="shrink-0 p-2 text-ink-muted hover:text-warning transition-colors"
            aria-label="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>
      <div className="relative min-h-0 flex-1 flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="min-w-0 min-h-0 flex-1 overflow-y-auto pt-4">{children}</main>
      </div>
      {sidebarOpen && (
        <button
          className="fixed inset-x-0 top-16 bottom-0 z-20 bg-ink/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}
    </div>
  );
}