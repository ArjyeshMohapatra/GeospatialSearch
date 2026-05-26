import { Router } from "express";
import { saveSearch } from "../controllers/history.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/save', requireAuth, saveSearch);

export default router;