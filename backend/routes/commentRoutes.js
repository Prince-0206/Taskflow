const express = require("express");
const { getComments, addComment, deleteComment } = require("../controllers/commentController");

const router = express.Router({ mergeParams: true });

router.get("/", getComments);
router.post("/", addComment);
router.delete("/:commentId", deleteComment);

module.exports = router;
