import { useState } from "react";
import api from "../api/axios";

const COLORS = ["#5B4FE9", "#12A594", "#F5A623", "#E8555A", "#0984E3", "#00B894"];

export default function CreateProjectModal({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError("Give your project a name to continue.");
    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.post("/projects", { name, description, color });
      onCreated(data.project);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create the project. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-panel p-6 shadow-panel">
        <h2 className="font-display text-lg font-bold">New project</h2>
        <p className="mt-1 text-sm text-muted">Give your team a board to organize work around.</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Project name</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Website Redesign"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
              rows={3}
              className="w-full resize-none rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full transition ${
                    color === c ? "ring-2 ring-offset-2 ring-ink" : ""
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Choose color ${c}`}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted hover:bg-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
