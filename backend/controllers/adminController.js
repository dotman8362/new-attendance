import jwt from "jsonwebtoken";
import User from "../models/user.js";
import dotenv from "dotenv"

dotenv.config();
// Load from environment variables

const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Incoming:", email, password);
console.log("Expected:", EMAIL, PASSWORD);

    if (email !== EMAIL || password !== PASSWORD) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { email: EMAIL, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      msg: "Admin login successful",
      token,
      fullname: "System Administrator",
      email: EMAIL,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ Get all student details
export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find().select("-password"); // hide password
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
