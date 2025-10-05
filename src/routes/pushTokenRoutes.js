import express from 'express';
import { pushTokenEmpfangen, sendNewsPushNotification, sendChatPushNotification } from '../controllers/pushTokenController.js';

const router = express.Router();

router.post('/', pushTokenEmpfangen);
router.post('/send-news', sendNewsPushNotification);
router.post('/send-chat', sendChatPushNotification);

export default router;
