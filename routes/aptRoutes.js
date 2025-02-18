import express from "express";
import {
  makeAppointments,
  getAppointments,
  confirmAppointment,
  cancelAppointment,
} from "../controllers/aptController.js";

const router = express.Router();

// router.get("/get/:userId", getAppointments);
router.post("/make/:userId", makeAppointments);
router.post("/confirm/:aptId", confirmAppointment);
router.delete("/cancel/:aptId", cancelAppointment);

// 假设你用 token 来获取用户的 ID
router.get("/get/:userId", getAppointments);

export default router;
