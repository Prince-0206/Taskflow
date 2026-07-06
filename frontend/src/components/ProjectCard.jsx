import { Link } from "react-router-dom";
import Avatar from "./Avatar";

export default function ProjectCard({ project }) {
  return (
    <Link
      to={`/projects/${project._id}`}
      className="group flex flex-col rounded-xl border border-border bg-panel p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-panel"
    >
      <div className="mb-4 flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-display font-bold text-white"
          style={{ backgroundColor: project.color || "#5B4FE9" }}
        >
          {project.name?.[0]?.toUpperCase()}
        </div>
        <svg
          className="text-muted opacity-0 transition group-hover:opacity-100"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M7 17L17 7M17 7H9M17 7V15" />
        </svg>
      </div>

      <h3 className="font-display text-base font-semibold text-ink">{project.name}</h3>
      <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-muted">
        {project.description || "No description yet."}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <div className="flex -space-x-2">
          {project.members?.slice(0, 4).map((m) => (
            <Avatar key={m.user._id} user={m.user} size="sm" ring />
          ))}
          {project.members?.length > 4 && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface text-[10px] font-semibold text-muted ring-2 ring-white">
              +{project.members.length - 4}
            </div>
          )}
        </div>
        <span className="text-xs text-muted">
          {project.members?.length || 1} member{project.members?.length === 1 ? "" : "s"}
        </span>
      </div>
    </Link>
  );
}
