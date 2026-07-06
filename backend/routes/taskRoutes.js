const express = require("express");
const {
  getTasks,
  createTask,
  updateTask,
  reorderTasks,
  deleteTask,
} = require("../controllers/taskController");
const commentRoutes = require("./commentRoutes");

// mergeParams lets us access :projectId from the parent router
const router = express.Router({ mergeParams: true });

router.get("/", getTasks);
router.post("/", createTask);
router.put("/reorder", reorderTasks);
router.put("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);

// Nested comments: /api/projects/:projectId/tasks/:taskId/comments
router.use("/:taskId/comments", commentRoutes);

module.exports = router;
