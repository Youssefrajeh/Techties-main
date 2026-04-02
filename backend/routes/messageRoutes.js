const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { sendMessage, getMyMessages } = require("../controllers/messageController");

router.post("/send", auth, sendMessage);
router.get("/my-messages", auth, getMyMessages);

module.exports = router;
