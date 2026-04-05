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

// @desc    Get all received messages for the current user (Inbox)
// @route   GET /api/messages/my-messages
// @access  Private
exports.getReceivedMessages = async (req, res) => {
  try {
    const messages = await Message.find({ recipient: req.user })
      .populate("sender", "name email")
      .sort("-createdAt");

    res.json(messages);
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// @desc    Get all sent messages for the current user
// @route   GET /api/messages/sent
// @access  Private
exports.getSentMessages = async (req, res) => {
  try {
    const messages = await Message.find({ sender: req.user })
      .populate("recipient", "name email")
      .sort("-createdAt");

    res.json(messages);
  } catch (err) {
    console.error("Get sent messages error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// @desc    Mark a message as read
// @route   PATCH /api/messages/read/:id
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only recipient can mark as read
    if (message.recipient.toString() !== req.user.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    message.isRead = true;
    await message.save();

    res.json({ message: "Message marked as read", data: message });
  } catch (err) {
    console.error("Mark read error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};
