import express from "express";
import groupRoutes from "./groups/groupRoutes.js";
import userRoutes from "./users/userRoutes.js";
import apiRouter from "./api/apiRoutes.js";
import recommendationRoutes from "./recommendations/recommendationRoutes.js";

const router = express.Router();

router.use("/google", apiRouter);
router.use("/users", userRoutes);
router.use("/groups", groupRoutes);
router.use("/recommendations", recommendationRoutes);

export default router;
