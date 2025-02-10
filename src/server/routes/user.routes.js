import express from 'express';
import { UserService } from '../services/user.service.js';

// Create an Express router instance.
const router = express.Router();

// Get the singleton instance of the UserService.
const userService = UserService.getInstance();

/**
 * GET /api/users
 * 
 * Returns a JSON array of active users.
 */
router.get('/', (req, res) => {
  res.json(userService.getActiveUsers());
});

/**
 * GET /api/users/:id
 * 
 * Returns a JSON object for the user with the specified ID.
 * If the user is not found, responds with a 404 error.
 */
router.get('/:id', (req, res) => {
  const user = userService.getUser(req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).send('User not found');
  }
});

export default router;
