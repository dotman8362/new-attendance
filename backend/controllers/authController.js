import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Attendance from '../models/attendance.js';
import User from '../models/user.js';
import nodemailer from "nodemailer";

export const register = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
   const ipAddress =
  (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "")
    .replace(/^.*:/, "");
    // 🔹 Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 🔹 Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 🔹 Generate unique student ID
    const year = new Date().getFullYear();
    const count = (await User.countDocuments()) + 1;
    const paddedCount = String(count).padStart(3, "0"); // 001, 002...
    const studentId = `LSEI/${year}/SIWES/${paddedCount}`;

    // 🔹 Create new user
    const user = new User({
      fullname,
      email,
      password: hashedPassword,
      ipAddress,
      studentId,
    });

    await user.save();

    // 🔹 Create JWT token
    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 🔹 Send Email Notification
    const transporter = nodemailer.createTransport({
      service: "gmail", // or use SMTP config
      auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // app password
      },
      tls: {
    rejectUnauthorized: false, // allow self-signed certificates (dev only)
  }
    });

    const mailOptions = {
      from: `"LSEI SIWES Program" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🎉 Welcome to LSEI SIWES Program",
      html: `
        <h2>Hello ${fullname},</h2>
        <p>Congratulations! You have successfully registered for the <b>LSEI SIWES Program Attendance System</b>.</p>
        
        <p><b>Your LSEI Student ID:</b> ${studentId}</p>

        <p>The SIWES program will run for <b>3 months</b>. Please note that <b>attendance is compulsory</b> throughout the duration of the program.</p>

        <p>We look forward to seeing your active participation.</p>
        
        <p>Best Regards,<br/>LSEI SIWES Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "User registered successfully & email sent",
      token,
      studentId: user.studentId,
    });
  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};



export const login = async (req, res) => {
  try {
    const { studentId, password } = req.body;

    // 🔹 Check if user exists
    const user = await User.findOne({ studentId });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid Student ID or Password" });
    }

    // 🔹 Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid Student ID or Password" });
    }

    // 🔹 Capture client IP
    const clientIp =
      (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").replace(
        "::ffff:",
        ""
      );
    const loginTime = new Date();

    // 🔹 Update last login info
    user.lastLoginIp = clientIp;
    user.lastLoginAt = loginTime;
    await user.save();

    // 🔹 Create JWT token
    const payload = {
      id: user._id,
      email: user.email,
      studentId: user.studentId,
      fullname: user.fullname,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      studentId: user.studentId,
      fullname: user.fullname,
      role: user.role,
      ip: clientIp,
      loginTime,
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};



// const router = express.Router();

// Helper: check if within school premises (radius in km)
const isWithinSchool = (lat, lng) => {
    const schoolLat = 7.442096; // Replace with actual latitude
    const schoolLng = 3.9674371; // Replace with actual longitude
    const radius = 200; // meters

    const toRad = x => (x * Math.PI) / 180;

    const dLat = toRad(lat - schoolLat);
    const dLng = toRad(lng - schoolLng);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(schoolLat)) * Math.cos(toRad(lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = 6371000 * c; // meters (Earth radius in meters)

    return distance <= radius;
};

// POST /attendance/mark
export const markAttendance = async (req, res) => {
    try {
        const { studentId, fullname, ipAddress, latitude, longitude, type } = req.body;

        // Validate user
        const user = await User.findOne({ studentId });
        if (!user) return res.status(400).json({ msg: "User not found" });

        // Validate IP
        const currentIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        if (currentIP !== user.ipAddress) {
            return res.status(403).json({ msg: "IP address mismatch" });
        }

        // Validate geolocation
        if (!isWithinSchool(latitude, longitude)) {
            return res.status(403).json({ msg: "You are not within the school premises" });
        }

        // Validate time window
        const now = new Date();
        const hour = now.getHours();
        const minutes = now.getMinutes();

        const isMorning = hour >= 8 && hour <= 10; // 8am-10am
        const isAfternoon = hour >= 14 && hour <= 23; // 2pm-4pm

        if (type === 'morning' && !isMorning) return res.status(403).json({ msg: "Morning attendance can only be marked between 08:00 - 10:00" });
        if (type === 'afternoon' && !isAfternoon) return res.status(403).json({ msg: "Afternoon attendance can only be marked between 14:00 - 16:00" });

        // Today's date
        const today = now.toISOString().split('T')[0];

        // Check existing attendance for today
        let attendance = await Attendance.findOne({ studentId, date: today });

        if (!attendance) {
            // First attendance for today -> sign in
            attendance = new Attendance({
                studentId,
                fullname,
                ipAddress,
                latitude,
                longitude,
                signInTime: now,
                date: today
            });
            await attendance.save();
            return res.json({ msg: "Sign-in successful", attendance });
        } else {
            // Already signed in -> update sign-out
            if (attendance.signOutTime) {
                return res.status(400).json({ msg: "You have already signed out today" });
            }
            attendance.signOutTime = now;
            await attendance.save();
            return res.json({ msg: "Sign-out successful", attendance });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server error" });
    }
};

// GET /attendance/records
// Fetch logged-in student's attendance
export const record = async (req, res) => {
  try {
    // req.user comes from the JWT (decoded in authenticateToken middleware)
    const studentId = req.user.id;  

    const records = await Attendance.find({ studentId }).sort({ date: -1 });

    if (!records || records.length === 0) {
      return res.status(404).json({ msg: "No attendance records found" });
    }

    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// export default router;
