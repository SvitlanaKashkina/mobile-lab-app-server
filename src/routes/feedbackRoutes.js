import { Router } from "express";
const router = Router();
import {sendFeedback} from "../controllers/feedbackController.js";

router.post("/feedback", sendFeedback);

export default router;

