import express from "express";
import { registerUser } from "../controllers/userController.js";
import {
  loginUser,
  checkLogin,
  logout,
  searchUser,
  bookUser,
} from "../controllers/userController.js";

const router = express.Router();

/* GET users listing. */
router.get("/", (req, res, next) => {
  res.send("respond with a resource");
  next();
});

// 检查登录状态接口
router.get("/check-login", checkLogin);

router.post("/logout", logout);

router.get("/search-users", searchUser);

// create a user in mongodb
router.post("/registerUser", registerUser);
router.post("/loginUser", loginUser);
router.get("/book/:userId", bookUser);

export default router;
