import express from "express";
import aptRoutes from "./routes/aptRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import dotenv from "dotenv";
import { connectDb } from "./config/db.js"; // 导入连接函数

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // 处理 JSON 请求体

connectDb();

app.use(express.static("public"));

app.use("/api/appointment", aptRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
