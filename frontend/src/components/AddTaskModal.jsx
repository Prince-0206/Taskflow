import { useState } from "react";
import api from "../api/axios";

export default function AddTaskModal({ project, status, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/projects/${project._id}/tasks`, {
        title,
        status,
        priority,
      });
      onCreated(data.task);
      setTitle("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-panel p-5 shadow-panel">
        <h3 className="font-display text-base font-bold">Add task to {status}</h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <div className="flex justify-end gap-2 pt-1">
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
              Add task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
