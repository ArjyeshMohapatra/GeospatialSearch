import { Router } from 'express';
import { signup, signin, refresh, logout } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/signup', signup, requireAuth);
router.post('/signin', signin, requireAuth);
router.post('/refresh', refresh, requireAuth);
router.post('/logout', logout, requireAuth);

export default router;