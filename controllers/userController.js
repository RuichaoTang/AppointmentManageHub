import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { client } from "../config/db.js";
import { ObjectId } from "mongodb";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userCollection = client.db("data").collection("users");
    const userExists = await userCollection.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Tokenize the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = {
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    const result = await userCollection.insertOne(newUser);
    const insertedUser = result;

    // Generate a JWT token
    const token = jwt.sign({ id: insertedUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true, // 防止 JavaScript 访问
      secure: process.env.NODE_ENV === "production", // 仅在 HTTPS 下启用
      sameSite: "Strict", // 预防 CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天
    });

    // return the token and user info
    res.status(201).json({
      token,
      user: {
        id: insertedUser._id,
        name: insertedUser.name,
        email: insertedUser.email,
      },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 连接数据库
    const userCollection = client.db("data").collection("users");

    // 确保 email 字段有索引（MongoDB 端）
    await userCollection.createIndex({ email: 1 });

    // 查找用户
    const user = await userCollection.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Email does not exist" });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // 生成 JWT 令牌（有效期 7 天）
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 设置 Cookie（httpOnly, secure, sameSite）
    res.cookie("token", token, {
      httpOnly: true, // 防止 JavaScript 访问
      secure: process.env.NODE_ENV === "production", // 仅在 HTTPS 下启用
      sameSite: "Strict", // 预防 CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天
    });

    // 发送登录成功的响应（不返回 token）
    res.status(200).json({
      message: "Login successful",
      user: { email: user.email, id: user._id },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const checkLogin = async (req, res) => {
  console.log("Checking login status...");
  console.log(req.cookies);
  const token = req.cookies.token;

  if (!token) {
    return res.send({ loggedIn: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.send({ loggedIn: true, user: decoded });
  } catch (err) {
    res.clearCookie("token"); // 清除无效 token
    res.send({ loggedIn: false });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  res.send({ success: true, message: "Logout successful" });
};

export const searchUser = async (req, res) => {
  const searchQuery = req.query.name;
  console.log("searchQuery:", searchQuery);

  if (!searchQuery) {
    return res.status(400).json({ error: "搜索内容不能为空" });
  }

  try {
    // 进行模糊查询
    const userCollection = client.db("data").collection("users");
    const users = await userCollection
      .find({ name: { $regex: searchQuery, $options: "i" } }) // 不区分大小写搜索
      .toArray();

    res.json(users);
  } catch (err) {
    console.error("搜索错误:", err);
    res.status(500).json({ error: "服务器错误" });
  }
};

export const bookUser = async (req, res) => {
  try {
    const userID = req.params.userId;
    console.log("userID:", userID);
    const userCollection = client.db("data").collection("users");

    // 查询数据库
    const user = await userCollection.findOne({ _id: new ObjectId(userID) });
    console.log("user:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: { fullName: user.name, email: user.email } });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
