import { Router } from "express";
import { saveSearch } from "../controllers/index.js";
import { requireAuth } from "../middlewares/index.js";

const router = Router();

router.post('/save', requireAuth, saveSearch);

export default router;