const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const socketConfig = (io) => {
    const userSockets = new Map();

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                throw new Error('Authentication error');
            }
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', async (socket) => {
        console.log('User connected:', socket.userId);
        
        // Store user socket connection
        userSockets.set(socket.userId, socket);
        
        // Update user online status
        await User.findByIdAndUpdate(socket.userId, { 
            isOnline: true,
            lastSeen: new Date()
        });

        // Broadcast to all clients that this user is online
        io.emit('user_status', { 
            userId: socket.userId, 
            isOnline: true 
        });

        // Send current online users to the newly connected user
        const onlineUsers = Array.from(userSockets.keys());
        socket.emit('initial_online_users', onlineUsers);

        socket.on('disconnect', async () => {
            console.log('User disconnected:', socket.userId);
            userSockets.delete(socket.userId);
            
            // Update user status in database
            await User.findByIdAndUpdate(socket.userId, { 
                isOnline: false,
                lastSeen: new Date()
            });

            // Broadcast to all clients that this user is offline
            io.emit('user_status', { 
                userId: socket.userId, 
                isOnline: false 
            });
        });

        // Handle private messages
        socket.on('send_message', async (message) => {
            console.log('New message:', message);
            const receiverSocket = userSockets.get(message.receiver);
            if (receiverSocket) {
                receiverSocket.emit('receive_message', message);
            }
        });
    });
};

module.exports = socketConfig;