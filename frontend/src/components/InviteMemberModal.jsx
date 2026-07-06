import { useState } from "react";
import api from "../api/axios";

export default function InviteMemberModal({ project, onClose, onInvited }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.post(`/projects/${project._id}/members`, { email });
      onInvited(data.project);
    } catch (err) {
      setError(err.response?.data?.message || "Could not add that member.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-panel p-5 shadow-panel">
        <h3 className="font-display text-base font-bold">Add a member</h3>
        <p className="mt-1 text-sm text-muted">They must already have a TaskFlow account.</p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            autoFocus
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teammate@company.com"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
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
              Add member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
