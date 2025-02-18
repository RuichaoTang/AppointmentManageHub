import express from "express";
import aptRoutes from "./routes/aptRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import dotenv from "dotenv";
import { connectDb } from "./config/db.js"; // 导入连接函数
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // 处理 JSON 请求体
app.use(cookieParser()); // 解析 Cookies

connectDb();

app.use(express.static("public"));

app.use("/api/appointments", aptRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
