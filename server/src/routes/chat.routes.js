const router = require('express').Router();
const chatController = require('../controllers/chat.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/users', chatController.getUsers);
router.get('/messages/:userId', chatController.getConversation);
router.post('/messages', chatController.sendMessage);

module.exports = router;