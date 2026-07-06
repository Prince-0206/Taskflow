const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// @desc  Register a new user
// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const colors = ["#6C5CE7", "#00B894", "#FD9644", "#0984E3", "#E17055", "#00CEC9"];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const user = await User.create({ name, email, password, avatarColor });

    res.status(201).json({
      user: user.toSafeObject(),
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// @desc  Login existing user
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      user: user.toSafeObject(),
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// @desc  Get logged-in user's profile
// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
};

// @desc  Search users by name/email (for adding project members / assignees)
// @route GET /api/auth/search?q=
const searchUsers = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json({ users: [] });

    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
      _id: { $ne: req.user._id },
    })
      .limit(10)
      .select("name email avatarColor");

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Search failed", error: error.message });
  }
};

module.exports = { register, login, getMe, searchUsers };
