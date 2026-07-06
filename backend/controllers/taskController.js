const Task = require("../models/Task");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const { emitToProject, emitToUser } = require("../socket/socket");

// @desc  Get all tasks for a project
// @route GET /api/projects/:projectId/tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate("assignees", "name email avatarColor")
      .populate("createdBy", "name email avatarColor")
      .sort({ order: 1, createdAt: 1 });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks", error: error.message });
  }
};

// @desc  Create a task within a project
// @route POST /api/projects/:projectId/tasks
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignees } = req.body;
    if (!title) return res.status(400).json({ message: "Task title is required" });

    const count = await Task.countDocuments({ project: req.params.projectId });

    let task = await Task.create({
      project: req.params.projectId,
      title,
      description,
      status: status || req.project.columns[0],
      priority,
      dueDate,
      assignees: assignees || [],
      createdBy: req.user._id,
      order: count,
    });

    task = await task.populate([
      { path: "assignees", select: "name email avatarColor" },
      { path: "createdBy", select: "name email avatarColor" },
    ]);

    // Notify each assignee
    for (const assigneeId of task.assignees) {
      if (assigneeId._id.toString() === req.user._id.toString()) continue;
      const notification = await Notification.create({
        recipient: assigneeId._id,
        sender: req.user._id,
        type: "TASK_ASSIGNED",
        message: `${req.user.name} assigned you to "${task.title}"`,
        project: req.project._id,
        task: task._id,
      });
      emitToUser(assigneeId._id.toString(), "notification:new", { notification });
    }

    emitToProject(req.params.projectId, "task:created", { task });
    res.status(201).json({ task });
  } catch (error) {
    res.status(500).json({ message: "Failed to create task", error: error.message });
  }
};

// @desc  Update a task (title, description, priority, due date, assignees, status/order for drag-drop)
// @route PUT /api/projects/:projectId/tasks/:taskId
const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignees, order } = req.body;
    const task = await Task.findOne({ _id: req.params.taskId, project: req.params.projectId });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const previousAssignees = task.assignees.map((a) => a.toString());
    const statusChanged = status !== undefined && status !== task.status;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (order !== undefined) task.order = order;
    if (assignees !== undefined) task.assignees = assignees;

    await task.save();
    await task.populate([
      { path: "assignees", select: "name email avatarColor" },
      { path: "createdBy", select: "name email avatarColor" },
    ]);

    // Notify newly-added assignees
    if (assignees !== undefined) {
      const newlyAdded = task.assignees.filter(
        (a) => !previousAssignees.includes(a._id.toString()) && a._id.toString() !== req.user._id.toString()
      );
      for (const assignee of newlyAdded) {
        const notification = await Notification.create({
          recipient: assignee._id,
          sender: req.user._id,
          type: "TASK_ASSIGNED",
          message: `${req.user.name} assigned you to "${task.title}"`,
          project: req.params.projectId,
          task: task._id,
        });
        emitToUser(assignee._id.toString(), "notification:new", { notification });
      }
    }

    // Notify assignees when status changes (e.g. moved to Done)
    if (statusChanged) {
      for (const assignee of task.assignees) {
        if (assignee._id.toString() === req.user._id.toString()) continue;
        const notification = await Notification.create({
          recipient: assignee._id,
          sender: req.user._id,
          type: "TASK_STATUS_CHANGED",
          message: `${req.user.name} moved "${task.title}" to ${task.status}`,
          project: req.params.projectId,
          task: task._id,
        });
        emitToUser(assignee._id.toString(), "notification:new", { notification });
      }
    }

    emitToProject(req.params.projectId, "task:updated", { task });
    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: "Failed to update task", error: error.message });
  }
};

// @desc  Reorder/move multiple tasks at once (used after a drag-and-drop drop event)
// @route PUT /api/projects/:projectId/tasks/reorder
const reorderTasks = async (req, res) => {
  try {
    // updates: [{ id, status, order }, ...]
    const { updates } = req.body;
    if (!Array.isArray(updates)) {
      return res.status(400).json({ message: "updates must be an array" });
    }

    await Promise.all(
      updates.map((u) =>
        Task.findOneAndUpdate(
          { _id: u.id, project: req.params.projectId },
          { status: u.status, order: u.order }
        )
      )
    );

    const tasks = await Task.find({ project: req.params.projectId })
      .populate("assignees", "name email avatarColor")
      .populate("createdBy", "name email avatarColor")
      .sort({ order: 1 });

    emitToProject(req.params.projectId, "task:reordered", { tasks });
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: "Failed to reorder tasks", error: error.message });
  }
};

// @desc  Delete a task and its comments
// @route DELETE /api/projects/:projectId/tasks/:taskId
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.taskId,
      project: req.params.projectId,
    });
    if (!task) return res.status(404).json({ message: "Task not found" });

    await Comment.deleteMany({ task: task._id });

    emitToProject(req.params.projectId, "task:deleted", { taskId: task._id });
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task", error: error.message });
  }
};

module.exports = { getTasks, createTask, updateTask, reorderTasks, deleteTask };
