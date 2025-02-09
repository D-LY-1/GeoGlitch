import express from 'express';
import { UserService } from '../services/user.service.js';

const router = express.Router();
const userService = UserService.getInstance();

router.get('/', (req, res) => {
  res.json(userService.getActiveUsers());
});

router.get('/:id', (req, res) => {
  const user = userService.getUser(req.params.id);
  user ? res.json(user) : res.status(404).send('User not found');
});

export default router;