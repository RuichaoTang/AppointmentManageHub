import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { client } from "../config/db.js";

export const makeAppointments = async (req, res) => {
  // console.log(req.body);
  const { userId } = req.params;
  const { name, email, date, time, comments } = req.body;

  console.log("userId:", userId);
  console.log("date:", date);
  console.log("time:", time);
  console.log("name:", name);
  console.log("email:", email);
  console.log("comments:", comments);

  if (!userId || !date || !time) {
    return res.status(400).json({ error: "Invalid Input." });
  }

  try {
    const userCollection = client.db("data").collection("users");
    const user = await userCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ error: "User Not Found." });
    }

    const appointmentCollection = client.db("data").collection("appointments");
    const appointment = {
      userId: new ObjectId(userId),
      by: name,
      email,
      date,
      time,
      comments,
      confirmed: false,
    };

    const result = await appointmentCollection.insertOne(appointment);
    console.log("result:", result);

    res.json({ success: true, appointment });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server Error." });
  }
};

export const getAppointments = async (req, res) => {
  const userId = req.params.userId;
  console.log("userId:", userId);
  // 检查 userId 是否有效
  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid User ID" });
  }

  try {
    const appointmentCollection = client.db("data").collection("appointments");
    const appointments = await appointmentCollection
      .find({ userId: new ObjectId(userId) })
      .toArray();

    if (appointments.length > 0) {
      res.json(appointments);
    } else {
      res.json([]); // 如果没有找到预约
    }
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const confirmAppointment = async (req, res) => {
  const { aptId: aptId } = req.params;
  const token = req.cookies.token;

  console.log("aptId:", aptId);
  console.log("token:", token);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  try {
    // Verify the JWT token and extract user info
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Get user ID from the decoded token

    // 查找该预约并更新 confirmed 字段
    const appointmentCollection = client.db("data").collection("appointments");
    const updatedAppointment = await appointmentCollection.updateOne(
      { _id: new ObjectId(aptId), userId: new ObjectId(userId) }, // Ensure the user is the one who created the appointment
      { $set: { confirmed: true } }
    );

    if (updatedAppointment.matchedCount === 0) {
      return res.status(404).json({
        message: "Appointment not found or you don't have permission.",
      });
    }

    res.status(200).json({ message: "Appointment confirmed" });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const cancelAppointment = async (req, res) => {
  const { aptId } = req.params;
  const token = req.cookies.token;
  console.log("aptId:", aptId);
  console.log("token:", token);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  try {
    // Verify the JWT token and extract user info
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Get user ID from the decoded token

    // Delete the appointment only if it belongs to the logged-in user
    const appointmentCollection = client.db("data").collection("appointments");
    const result = await appointmentCollection.deleteOne({
      _id: new ObjectId(aptId),
      userId: new ObjectId(userId), // Ensure the user is the one who created the appointment
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Appointment not found or you don't have permission.",
      });
    }

    res.status(200).json({ message: "Appointment canceled" });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
