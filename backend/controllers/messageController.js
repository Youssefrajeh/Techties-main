const Message = require("../models/Message");
const User = require("../models/User");

// @desc    Send a message to a match
// @route   POST /api/messages/send
// @access  Private
exports.sendMessage = async (req, res) => {
  const { recipientId, subject, content } = req.body;

  try {
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    const newMessage = new Message({
      sender: req.user,
      recipient: recipientId,
      subject,
      content,
    });

    await newMessage.save();

    res.status(201).json({ message: "Message sent successfully", data: newMessage });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// @desc    Get all received messages for the current user
// @route   GET /api/messages/my-messages
// @access  Private
exports.getMyMessages = async (req, res) => {
  try {
    const messages = await Message.find({ recipient: req.user.id })
      .populate("sender", "name email")
      .sort("-createdAt");

    res.json(messages);
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};
