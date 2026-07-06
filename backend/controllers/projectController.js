const Project = require("../models/Project");
const Task = require("../models/Task");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { emitToProject, emitToUser } = require("../socket/socket");

// @desc  Create a new project
// @route POST /api/projects
const createProject = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    if (!name) return res.status(400).json({ message: "Project name is required" });

    const project = await Project.create({
      name,
      description,
      color,
      owner: req.user._id,
      members: [{ user: req.user._id, role: "owner" }],
    });

    res.status(201).json({ project });
  } catch (error) {
    res.status(500).json({ message: "Failed to create project", error: error.message });
  }
};

// @desc  Get all projects the logged-in user owns or belongs to
// @route GET /api/projects
const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ "members.user": req.user._id })
      .populate("owner", "name email avatarColor")
      .populate("members.user", "name email avatarColor")
      .sort({ updatedAt: -1 });

    res.json({ projects });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch projects", error: error.message });
  }
};

// @desc  Get single project detail (must be a member, enforced by middleware)
// @route GET /api/projects/:projectId
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate("owner", "name email avatarColor")
      .populate("members.user", "name email avatarColor");

    res.json({ project });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch project", error: error.message });
  }
};

// @desc  Update project details (name, description, color, columns)
// @route PUT /api/projects/:projectId
const updateProject = async (req, res) => {
  try {
    const { name, description, color, columns } = req.body;
    const project = req.project;

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the project owner can edit project settings" });
    }

    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (color !== undefined) project.color = color;
    if (columns !== undefined) project.columns = columns;

    await project.save();
    emitToProject(project._id.toString(), "project:updated", { project });
    res.json({ project });
  } catch (error) {
    res.status(500).json({ message: "Failed to update project", error: error.message });
  }
};

// @desc  Delete a project and its tasks/comments
// @route DELETE /api/projects/:projectId
const deleteProject = async (req, res) => {
  try {
    const project = req.project;
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the project owner can delete this project" });
    }

    const tasks = await Task.find({ project: project._id }).select("_id");
    const taskIds = tasks.map((t) => t._id);

    await Comment.deleteMany({ task: { $in: taskIds } });
    await Task.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(project._id);

    emitToProject(project._id.toString(), "project:deleted", { projectId: project._id });
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete project", error: error.message });
  }
};

// @desc  Invite/add a member to the project by email
// @route POST /api/projects/:projectId/members
const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const project = req.project;

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the project owner can add members" });
    }

    const userToAdd = await User.findOne({ email: (email || "").toLowerCase() });
    if (!userToAdd) {
      return res.status(404).json({ message: "No user found with that email" });
    }

    const alreadyMember = project.members.some(
      (m) => m.user.toString() === userToAdd._id.toString()
    );
    if (alreadyMember) {
      return res.status(409).json({ message: "User is already a project member" });
    }

    project.members.push({ user: userToAdd._id, role: "member" });
    await project.save();
    await project.populate("members.user", "name email avatarColor");

    const notification = await Notification.create({
      recipient: userToAdd._id,
      sender: req.user._id,
      type: "PROJECT_INVITE",
      message: `${req.user.name} added you to the project "${project.name}"`,
      project: project._id,
    });

    emitToUser(userToAdd._id.toString(), "notification:new", { notification });
    emitToProject(project._id.toString(), "project:memberAdded", { project });

    res.status(201).json({ project });
  } catch (error) {
    res.status(500).json({ message: "Failed to add member", error: error.message });
  }
};

// @desc  Remove a member from a project
// @route DELETE /api/projects/:projectId/members/:userId
const removeMember = async (req, res) => {
  try {
    const project = req.project;
    const { userId } = req.params;

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the project owner can remove members" });
    }
    if (project.owner.toString() === userId) {
      return res.status(400).json({ message: "The project owner cannot be removed" });
    }

    project.members = project.members.filter((m) => m.user.toString() !== userId);
    await project.save();

    emitToProject(project._id.toString(), "project:memberRemoved", {
      projectId: project._id,
      userId,
    });
    res.json({ project });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove member", error: error.message });
  }
};

module.exports = {
  createProject,
  getMyProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
