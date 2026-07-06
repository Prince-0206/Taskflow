import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-panel/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="8" height="8" rx="2" fill="#5B4FE9" />
            <rect x="13" y="3" width="8" height="14" rx="2" fill="#12A594" />
            <rect x="3" y="13" width="8" height="8" rx="2" fill="#F5A623" />
          </svg>
          <span className="font-display text-lg font-bold tracking-tight">TaskFlow</span>
        </Link>

        {user && (
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full p-1 hover:bg-surface"
              >
                <Avatar user={user} size="md" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-border bg-panel p-1.5 shadow-panel">
                    <div className="px-3 py-2">
                      <p className="truncate font-display text-sm font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-muted">{user.email}</p>
                    </div>
                    <hr className="my-1 border-border" />
                    <button
                      onClick={() => {
                        logout();
                        navigate("/login");
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-danger-light"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
