import express from 'express';
import { getAllChats, createChatMessage, deleteChat } from '../controllers/chatController.js';

const router = express.Router();

router.get('/', getAllChats);
router.post('/', createChatMessage);
router.delete("/:chatId", deleteChat); 

export default router;