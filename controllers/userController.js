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
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
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

    const userCollection = client.db("data").collection("users");

    await userCollection.createIndex({ email: 1 });

    const user = await userCollection.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Email does not exist" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

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
  // console.log(req.cookies);
  const token = req.cookies.token;

  if (!token) {
    return res.send({ loggedIn: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.send({ loggedIn: true, user: decoded });
  } catch (err) {
    res.clearCookie("token");
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
    const userCollection = client.db("data").collection("users");
    const users = await userCollection
      .find({ name: { $regex: searchQuery, $options: "i" } })
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
