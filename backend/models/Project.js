const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    color: { type: String, default: "#6C5CE7" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["owner", "member"], default: "member" },
      },
    ],
    columns: {
      type: [String],
      default: ["To Do", "In Progress", "Done"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
