import { Router } from 'express';
import { signup, signin, refresh, logout } from '../controllers/index.js';
import { requireAuth } from '../middlewares/index.js';

const router = Router();

router.post('/signup', signup, requireAuth);
router.post('/signin', signin, requireAuth);
router.post('/refresh', refresh, requireAuth);
router.post('/logout', logout, requireAuth);

export default router;