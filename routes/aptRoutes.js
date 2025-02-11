import express from "express";
import { makeApt, getAvailableSlot } from "../controllers/aptController.js";

const router = express.Router();

router.get("/get", getAvailableSlot);
router.post("/make", makeApt);

export default router;
