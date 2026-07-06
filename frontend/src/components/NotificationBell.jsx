import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";

const typeIcon = {
  TASK_ASSIGNED: "📌",
  TASK_COMMENT: "💬",
  PROJECT_INVITE: "👋",
  TASK_STATUS_CHANGED: "🔄",
};

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead, markOneRead } = useSocket();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleClick = (n) => {
    if (!n.read) markOneRead(n._id);
    if (n.project?._id) navigate(`/projects/${n.project._id}`);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 hover:bg-surface"
        aria-label="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 max-h-[28rem] w-80 overflow-y-auto rounded-xl border border-border bg-panel shadow-panel">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="font-display text-sm font-semibold">Notifications</p>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs font-medium text-accent hover:underline">
                  Mark all read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted">
                Nothing here yet. Activity on your projects will show up in this list.
              </p>
            ) : (
              <ul>
                {notifications.map((n) => (
                  <li
                    key={n._id}
                    onClick={() => handleClick(n)}
                    className={`cursor-pointer border-b border-border px-4 py-3 text-sm hover:bg-surface ${
                      !n.read ? "bg-accent-light/40" : ""
                    }`}
                  >
                    <div className="flex gap-2">
                      <span>{typeIcon[n.type] || "🔔"}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-ink">{n.message}</p>
                        <p className="mt-0.5 text-xs text-muted">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
