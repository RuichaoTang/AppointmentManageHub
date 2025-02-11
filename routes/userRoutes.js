import express from "express";
import { registerUser } from "../controllers/userController.js";
import { loginUser } from "../controllers/userController.js";

const router = express.Router();

/* GET users listing. */
router.get("/", (req, res, next) => {
  res.send("respond with a resource");
  next();
});

// create a user in mongodb
router.post("/registerUser", registerUser);
router.post("/loginUser", loginUser);

export default router;
