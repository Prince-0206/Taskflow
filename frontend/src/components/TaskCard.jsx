import { format } from "date-fns";
import Avatar from "./Avatar";

const priorityStyles = {
  Low: "bg-success-light text-success",
  Medium: "bg-warning-light text-warning",
  High: "bg-danger-light text-danger",
};

export default function TaskCard({ task, onClick, onDragStart, dragging }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done";

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={onClick}
      className={`cursor-pointer rounded-xl border border-border bg-panel p-3.5 shadow-card transition hover:border-accent/40 ${
        dragging ? "opacity-40" : ""
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${priorityStyles[task.priority]}`}>
          {task.priority}
        </span>
        {task.dueDate && (
          <span className={`text-[11px] font-medium ${isOverdue ? "text-danger" : "text-muted"}`}>
            {format(new Date(task.dueDate), "MMM d")}
          </span>
        )}
      </div>

      <p className="text-sm font-medium leading-snug text-ink">{task.title}</p>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex -space-x-2">
          {task.assignees?.slice(0, 3).map((a) => (
            <Avatar key={a._id} user={a} size="sm" ring />
          ))}
        </div>
        {task.commentCount > 0 && (
          <span className="flex items-center gap-1 text-[11px] text-muted">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
            </svg>
            {task.commentCount}
          </span>
        )}
      </div>
    </div>
  );
}
