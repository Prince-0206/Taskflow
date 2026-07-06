const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: [
        "TASK_ASSIGNED",
        "TASK_COMMENT",
        "PROJECT_INVITE",
        "TASK_STATUS_CHANGED",
      ],
      required: true,
    },
    message: { type: String, required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
