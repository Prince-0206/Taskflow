const Comment = require("../models/Comment");
const Task = require("../models/Task");
const Notification = require("../models/Notification");
const { emitToProject, emitToUser } = require("../socket/socket");

// @desc  Get all comments for a task
// @route GET /api/projects/:projectId/tasks/:taskId/comments
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate("author", "name email avatarColor")
      .sort({ createdAt: 1 });

    res.json({ comments });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch comments", error: error.message });
  }
};

// @desc  Add a comment to a task
// @route POST /api/projects/:projectId/tasks/:taskId/comments
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    let comment = await Comment.create({
      task: task._id,
      author: req.user._id,
      text: text.trim(),
    });
    comment = await comment.populate("author", "name email avatarColor");

    // Notify assignees and task creator (excluding the comment author)
    const notifyIds = new Set(
      [...task.assignees.map((a) => a.toString()), task.createdBy.toString()].filter(
        (id) => id !== req.user._id.toString()
      )
    );

    for (const userId of notifyIds) {
      const notification = await Notification.create({
        recipient: userId,
        sender: req.user._id,
        type: "TASK_COMMENT",
        message: `${req.user.name} commented on "${task.title}"`,
        project: req.params.projectId,
        task: task._id,
      });
      emitToUser(userId, "notification:new", { notification });
    }

    emitToProject(req.params.projectId, "comment:created", {
      taskId: task._id,
      comment,
    });

    res.status(201).json({ comment });
  } catch (error) {
    res.status(500).json({ message: "Failed to add comment", error: error.message });
  }
};

// @desc  Delete a comment (author only)
// @route DELETE /api/projects/:projectId/tasks/:taskId/comments/:commentId
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own comments" });
    }

    await comment.deleteOne();

    emitToProject(req.params.projectId, "comment:deleted", {
      taskId: req.params.taskId,
      commentId: req.params.commentId,
    });

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete comment", error: error.message });
  }
};

module.exports = { getComments, addComment, deleteComment };
