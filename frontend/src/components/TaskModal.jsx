import { useState } from "react";
import api from "../api/axios";
import Avatar from "./Avatar";
import CommentSection from "./CommentSection";

export default function TaskModal({ task, project, onClose, onUpdated, onDeleted }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority);
  const [status, setStatus] = useState(task.status);
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.substring(0, 10) : "");
  const [assignees, setAssignees] = useState(task.assignees.map((a) => a._id));
  const [saving, setSaving] = useState(false);
  const [assigneePickerOpen, setAssigneePickerOpen] = useState(false);

  const members = project.members.map((m) => m.user);

  const persist = async (patch) => {
    setSaving(true);
    try {
      const { data } = await api.put(`/projects/${project._id}/tasks/${task._id}`, patch);
      onUpdated(data.task);
    } finally {
      setSaving(false);
    }
  };

  const handleBlurSave = () => {
    persist({ title, description });
  };

  const toggleAssignee = (userId) => {
    const next = assignees.includes(userId)
      ? assignees.filter((id) => id !== userId)
      : [...assignees, userId];
    setAssignees(next);
    persist({ assignees: next });
  };

  const handleDelete = async () => {
    if (!confirm("Delete this task? This cannot be undone.")) return;
    await api.delete(`/projects/${project._id}/tasks/${task._id}`);
    onDeleted(task._id);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 p-4">
      <div className="grid max-h-[85vh] w-full max-w-3xl grid-cols-1 overflow-hidden rounded-xl bg-panel shadow-panel md:grid-cols-5">
        {/* Left: task details */}
        <div className="col-span-3 overflow-y-auto border-b border-border p-6 md:border-b-0 md:border-r">
          <div className="mb-4 flex items-start justify-between gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleBlurSave}
              className="w-full flex-1 border-none bg-transparent font-display text-lg font-bold text-ink outline-none"
            />
            <button onClick={onClose} className="rounded-md p-1 text-muted hover:bg-surface">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleBlurSave}
            rows={5}
            placeholder="Add more detail about this task..."
            className="w-full resize-none rounded-lg border border-border p-3 text-sm outline-none focus:border-accent"
          />

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  persist({ status: e.target.value });
                }}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
              >
                {project.columns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  persist({ priority: e.target.value });
                }}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
                Due date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  persist({ dueDate: e.target.value || null });
                }}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
                Assignees
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAssigneePickerOpen((v) => !v)}
                  className="flex w-full items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm hover:border-accent"
                >
                  <div className="flex -space-x-2">
                    {members
                      .filter((m) => assignees.includes(m._id))
                      .map((m) => (
                        <Avatar key={m._id} user={m} size="sm" ring />
                      ))}
                  </div>
                  <span className="ml-1 text-muted">
                    {assignees.length === 0 ? "Unassigned" : ""}
                  </span>
                </button>
                {assigneePickerOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setAssigneePickerOpen(false)} />
                    <div className="absolute z-20 mt-1 max-h-48 w-56 overflow-y-auto rounded-lg border border-border bg-panel p-1 shadow-panel">
                      {members.map((m) => (
                        <button
                          type="button"
                          key={m._id}
                          onClick={() => toggleAssignee(m._id)}
                          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-surface"
                        >
                          <Avatar user={m} size="sm" />
                          <span className="flex-1 truncate">{m.name}</span>
                          {assignees.includes(m._id) && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleDelete}
            className="mt-6 text-sm font-medium text-danger hover:underline"
          >
            Delete task
          </button>
          {saving && <span className="ml-3 text-xs text-muted">Saving...</span>}
        </div>

        {/* Right: comments */}
        <div className="col-span-2 flex flex-col p-6">
          <CommentSection projectId={project._id} taskId={task._id} />
        </div>
      </div>
    </div>
  );
}
