import { useState } from "react";
import { Menu, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../../hooks/useAuth";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="min-w-0 flex-1 flex flex-col">
        <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-4 sm:px-5 lg:px-8 sticky top-0 z-10">
          <button
            className="lg:hidden p-2 text-ink-muted"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="ml-auto flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="text-right min-w-0">
              <div className="text-sm font-medium truncate">{user?.name || "Team member"}</div>
              <div className="text-xs text-ink-muted capitalize truncate">
                {user?.role?.replaceAll("_", " ")}
              </div>
            </div>
            <button
              className="btn-secondary !p-2"
              title="Log out"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>
        <main className="p-4 sm:p-5 lg:p-8 w-full max-w-[1440px]">{children}</main>
      </div>
      {open && (
        <button
          className="fixed inset-0 bg-ink/40 z-20 lg:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
