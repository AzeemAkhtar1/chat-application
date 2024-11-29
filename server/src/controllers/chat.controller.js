const Message = require('../models/message.model');
const User = require('../models/user.model');

const chatController = {
    // Get all users except current user
    async getUsers(req, res) {
        try {
            console.log('Getting users for:', req.user.id);
            const users = await User.find({ _id: { $ne: req.user.id } })
                .select('-password');
            console.log('Found users:', users);
            res.json(users);
        } catch (error) {
            console.error('Error getting users:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get conversation between two users
    async getConversation(req, res) {
        try {
            const messages = await Message.find({
                $or: [
                    { sender: req.user.id, receiver: req.params.userId },
                    { sender: req.params.userId, receiver: req.user.id }
                ]
            })
            .sort({ createdAt: 1 })
            .populate('sender receiver', 'username');
            
            res.json(messages);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Send a message
    async sendMessage(req, res) {
        try {
            const { content, receiver } = req.body;
            const newMessage = new Message({
                content,
                sender: req.user.id,
                receiver
            });

            await newMessage.save();
            
            // Populate sender and receiver details
            const populatedMessage = await Message.findById(newMessage._id)
                .populate('sender receiver', 'username');

            res.status(201).json(populatedMessage);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = chatController;