import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Column from "../components/Column";
import TaskModal from "../components/TaskModal";
import AddTaskModal from "../components/AddTaskModal";
import InviteMemberModal from "../components/InviteMemberModal";
import Avatar from "../components/Avatar";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";

export default function ProjectBoard() {
  const { projectId } = useParams();
  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [addingToColumn, setAddingToColumn] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/projects/${projectId}`),
      api.get(`/projects/${projectId}/tasks`),
    ])
      .then(([projectRes, tasksRes]) => {
        setProject(projectRes.data.project);
        setTasks(tasksRes.data.tasks);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [projectId]);

  // Join the project's socket room and react to live events
  useEffect(() => {
    if (!socket) return;
    socket.emit("joinProject", projectId);

    const handleCreated = ({ task }) => {
      if (task.project === projectId || task.project?._id === projectId) {
        setTasks((prev) => (prev.some((t) => t._id === task._id) ? prev : [...prev, task]));
      }
    };
    const handleUpdated = ({ task }) => {
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
      setSelectedTask((prev) => (prev && prev._id === task._id ? task : prev));
    };
    const handleDeleted = ({ taskId }) => {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    };
    const handleReordered = ({ tasks: updated }) => setTasks(updated);
    const handleProjectUpdated = ({ project: p }) => setProject(p);
    const handleMemberAdded = ({ project: p }) => setProject(p);

    socket.on("task:created", handleCreated);
    socket.on("task:updated", handleUpdated);
    socket.on("task:deleted", handleDeleted);
    socket.on("task:reordered", handleReordered);
    socket.on("project:updated", handleProjectUpdated);
    socket.on("project:memberAdded", handleMemberAdded);

    return () => {
      socket.emit("leaveProject", projectId);
      socket.off("task:created", handleCreated);
      socket.off("task:updated", handleUpdated);
      socket.off("task:deleted", handleDeleted);
      socket.off("task:reordered", handleReordered);
      socket.off("project:updated", handleProjectUpdated);
      socket.off("project:memberAdded", handleMemberAdded);
    };
  }, [socket, projectId]);

  const handleDragStart = (e, task) => {
    setDraggingTaskId(task._id);
    e.dataTransfer.setData("text/plain", task._id);
  };

  const handleDrop = async (e, columnTitle) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    setDraggingTaskId(null);
    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === columnTitle) return;

    // Optimistic update
    setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status: columnTitle } : t)));

    try {
      await api.put(`/projects/${projectId}/tasks/${taskId}`, { status: columnTitle });
    } catch {
      // revert on failure
      setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status: task.status } : t)));
    }
  };

  const handleTaskCreated = (task) => {
    setTasks((prev) => [...prev, task]);
    setAddingToColumn(null);
  };

  const handleTaskUpdated = (task) => {
    setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
    setSelectedTask(task);
  };

  const handleTaskDeleted = (taskId) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    setSelectedTask(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-surface">
        <p className="font-display text-lg font-semibold">Project not found</p>
        <button onClick={() => navigate("/")} className="text-sm font-medium text-accent hover:underline">
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-surface">
      <Navbar />

      <div className="border-b border-border bg-panel px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg font-display font-bold text-white"
              style={{ backgroundColor: project.color }}
            >
              {project.name[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-lg font-bold leading-tight text-ink">{project.name}</h1>
              {project.description && <p className="text-xs text-muted">{project.description}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {project.members.map((m) => (
                <Avatar key={m.user._id} user={m.user} size="md" ring />
              ))}
            </div>
            <button
              onClick={() => setInviteOpen(true)}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface"
            >
              + Invite
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-7xl gap-4">
          {project.columns.map((col) => (
            <Column
              key={col}
              title={col}
              tasks={tasks.filter((t) => t.status === col)}
              onTaskClick={setSelectedTask}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              draggingTaskId={draggingTaskId}
              onAddTask={setAddingToColumn}
            />
          ))}
        </div>
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          project={project}
          onClose={() => setSelectedTask(null)}
          onUpdated={handleTaskUpdated}
          onDeleted={handleTaskDeleted}
        />
      )}

      {addingToColumn && (
        <AddTaskModal
          project={project}
          status={addingToColumn}
          onClose={() => setAddingToColumn(null)}
          onCreated={handleTaskCreated}
        />
      )}

      {inviteOpen && (
        <InviteMemberModal
          project={project}
          onClose={() => setInviteOpen(false)}
          onInvited={(p) => {
            setProject(p);
            setInviteOpen(false);
          }}
        />
      )}
    </div>
  );
}
