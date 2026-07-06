const express = require("express");
const {
  createProject,
  getMyProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require("../controllers/projectController");
const { requireProjectMember } = require("../middleware/projectAccess");
const taskRoutes = require("./taskRoutes");

const router = express.Router();

router.post("/", createProject);
router.get("/", getMyProjects);

router.get("/:projectId", requireProjectMember, getProject);
router.put("/:projectId", requireProjectMember, updateProject);
router.delete("/:projectId", requireProjectMember, deleteProject);

router.post("/:projectId/members", requireProjectMember, addMember);
router.delete("/:projectId/members/:userId", requireProjectMember, removeMember);

// Nested tasks: /api/projects/:projectId/tasks
router.use("/:projectId/tasks", requireProjectMember, taskRoutes);

module.exports = router;
