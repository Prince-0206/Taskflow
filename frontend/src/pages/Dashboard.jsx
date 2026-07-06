import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";
import CreateProjectModal from "../components/CreateProjectModal";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    api.get("/projects").then(({ data }) => {
      setProjects(data.projects);
      setLoading(false);
    });
  }, []);

  const handleCreated = (project) => {
    setProjects((prev) => [project, ...prev]);
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">
              Hey {user?.name?.split(" ")[0]}, here's what's happening
            </h1>
            <p className="mt-1 text-sm text-muted">
              {projects.length === 0
                ? "Create your first project to get your team moving."
                : `You're part of ${projects.length} project${projects.length === 1 ? "" : "s"}.`}
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New project
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-panel py-20 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-accent-light">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5B4FE9" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </div>
            <p className="font-display text-base font-semibold text-ink">No projects yet</p>
            <p className="mt-1 max-w-xs text-sm text-muted">
              Boards, tasks, and comments all live inside a project. Create one to begin.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
            >
              Create a project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}
      </main>

      {modalOpen && (
        <CreateProjectModal onClose={() => setModalOpen(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}
