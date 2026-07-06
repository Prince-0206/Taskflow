import { useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import api from "../api/axios";
import Avatar from "./Avatar";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function CommentSection({ projectId, taskId }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.get(`/projects/${projectId}/tasks/${taskId}/comments`).then(({ data }) => {
      if (active) {
        setComments(data.comments);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [projectId, taskId]);

  useEffect(() => {
    if (!socket) return;
    const handleCreated = ({ taskId: tId, comment }) => {
      if (tId === taskId) setComments((prev) => [...prev, comment]);
    };
    const handleDeleted = ({ taskId: tId, commentId }) => {
      if (tId === taskId) setComments((prev) => prev.filter((c) => c._id !== commentId));
    };
    socket.on("comment:created", handleCreated);
    socket.on("comment:deleted", handleDeleted);
    return () => {
      socket.off("comment:created", handleCreated);
      socket.off("comment:deleted", handleDeleted);
    };
  }, [socket, taskId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    try {
      await api.post(`/projects/${projectId}/tasks/${taskId}/comments`, { text });
      setText("");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (commentId) => {
    await api.delete(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`);
  };

  return (
    <div className="flex h-full flex-col">
      <h4 className="mb-3 font-display text-sm font-semibold text-ink">Comments</h4>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {loading ? (
          <p className="text-sm text-muted">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted">No comments yet. Start the discussion below.</p>
        ) : (
          comments.map((c) => (
            <div key={c._id} className="group flex gap-2.5">
              <Avatar user={c.author} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-ink">{c.author?.name}</span>
                  <span className="text-[11px] text-muted">
                    {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                  </span>
                  {c.author?._id === user._id && (
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="ml-auto text-[11px] text-muted opacity-0 hover:text-danger group-hover:opacity-100"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="text-sm text-ink/90">{c.text}</p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="mt-3 flex gap-2 border-t border-border pt-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={posting || !text.trim()}
          className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-dark disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
