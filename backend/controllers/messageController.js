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
// @route   GET /api/messages/inbox
// @access  Private
exports.getReceivedMessages = async (req, res) => {
  try {
    const messages = await Message.find({ 
      recipient: req.user,
      deletedByRecipient: false 
    })
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
    const messages = await Message.find({ 
      sender: req.user,
      deletedBySender: false 
    })
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

// @desc    Delete a message (for the clicking user only)
// @route   DELETE /api/messages/:id
// @access  Private
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found" });

    const isSender = message.sender.toString() === req.user.toString();
    const isRecipient = message.recipient.toString() === req.user.toString();

    if (!isSender && !isRecipient) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (isSender) message.deletedBySender = true;
    if (isRecipient) message.deletedByRecipient = true;

    // If both users deleted it, remove it from DB permanently
    if (message.deletedBySender && message.deletedByRecipient) {
      await Message.findByIdAndDelete(req.params.id);
      return res.json({ message: "Message permanently deleted" });
    }

    await message.save();
    res.json({ message: "Message deleted from your view" });
  } catch (err) {
    console.error("Delete message error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Clear all messages in a folder
// @route   DELETE /api/messages/clear/:folder
// @access  Private
exports.clearMessages = async (req, res) => {
  const { folder } = req.params;
  try {
    if (folder === 'inbox') {
      await Message.updateMany(
        { recipient: req.user, deletedByRecipient: false },
        { deletedByRecipient: true }
      );
    } else if (folder === 'sent') {
      await Message.updateMany(
        { sender: req.user, deletedBySender: false },
        { deletedBySender: true }
      );
    } else {
      return res.status(400).json({ message: "Invalid folder" });
    }

    // Optional: Cleanup messages deleted by both
    await Message.deleteMany({ deletedBySender: true, deletedByRecipient: true });

    res.json({ message: `All ${folder} messages cleared` });
  } catch (err) {
    console.error("Clear messages error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
