import express from 'express';
import { handleForgotPassword } from '../controllers/passForgotController.js';

const router = express.Router();

router.post('/', handleForgotPassword);

export default router;
