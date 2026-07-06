const Project = require("../models/Project");

// Ensures the logged-in user is a member (or owner) of the project referenced
// either in req.params.projectId or resolvable via a task/comment lookup.
const requireProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.project;
    if (!projectId) {
      return res.status(400).json({ message: "Project id is required" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isMember =
      project.owner.toString() === req.user._id.toString() ||
      project.members.some((m) => m.user.toString() === req.user._id.toString());

    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this project" });
    }

    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error checking project access" });
  }
};

module.exports = { requireProjectMember };
