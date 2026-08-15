const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/chatbotController');

// POST /api/chatbot/chat
router.post('/chat', chat);

module.exports = router;
