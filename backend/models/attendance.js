// models/attendance.js
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    ref: "User", // links to User collection
  },
  fullname: {
    type: String,
    required: true,
  },
  registeredIP: {
    type: String,
  },
  ipAddress: {
    type: String,
  },
  signInTime: {
    type: Date,
  },
  signOutTime: {
    type: Date,
  },
  signOutIP: {
    type: String,
  },
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
  date: {
    type: String, // "YYYY-MM-DD"
    required: true,
  },
}, {
  timestamps: true, // adds createdAt & updatedAt automatically
});

export default mongoose.model("Attendance", attendanceSchema);
