const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { sendMessage, getReceivedMessages, getSentMessages, markAsRead } = require("../controllers/messageController");

router.post("/send", auth, sendMessage);
router.get("/inbox", auth, getReceivedMessages);
router.get("/sent", auth, getSentMessages);
router.patch("/read/:id", auth, markAsRead);

module.exports = router;
