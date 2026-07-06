import TaskCard from "./TaskCard";

export default function Column({
  title,
  tasks,
  onTaskClick,
  onDragStart,
  onDrop,
  draggingTaskId,
  onAddTask,
}) {
  const handleDragOver = (e) => e.preventDefault();

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={(e) => onDrop(e, title)}
      className="flex w-72 shrink-0 flex-col rounded-xl bg-black/[0.02] p-3"
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
          <span className="rounded-full bg-border px-2 py-0.5 text-xs font-medium text-muted">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(title)}
          className="rounded-md p-1 text-muted hover:bg-white hover:text-accent"
          aria-label={`Add task to ${title}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto pb-2">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onClick={() => onTaskClick(task)}
            onDragStart={onDragStart}
            dragging={draggingTaskId === task._id}
          />
        ))}
        {tasks.length === 0 && (
          <p className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted">
            Drop a task here
          </p>
        )}
      </div>
    </div>
  );
}
