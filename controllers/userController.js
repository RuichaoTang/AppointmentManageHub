import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { client } from "../config/db.js";

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

    // Check if user exists
    const userCollection = client.db("data").collection("users");
    const user = await userCollection.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Email does not exist" });
    }

    // Compare password with the hashed password stored in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Return the token and user info
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: error.message });
  }
};
