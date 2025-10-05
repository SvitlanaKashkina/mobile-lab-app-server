import express from 'express';
import { getUserById, updateUserPhoto, deleteUser } from '../controllers/accountController.js';

const router = express.Router();

// Get route for user account
router.get('/account/:userId', getUserById);

// Update route for user photo
router.put('/account/photo/:userId', updateUserPhoto);

// Route for deleting a user
router.delete('/account/delete/:userId', deleteUser);

export default router;
