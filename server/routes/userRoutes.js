import express from 'express';
import { getUsers, getUserById } from '../controllers/userController.js';

const router = express.Router();

// Get all users
router.get('/', getUsers);

// Get user by ID
router.get('/:id', getUserById);

export default router; 