import express from "express";
import { markAttendance, getAttendanceRecords } from "../controllers/attendanceController.js";
import authenticateToken from "../middleware/userAuth.js";
import { getAttendanceReport } from "../controllers/getAttendanceReport.js";

const router = express.Router();

// POST: Mark attendance (sign-in or sign-out)
router.post("/", authenticateToken, markAttendance);

// GET: Fetch all attendance records for logged-in student
router.get("/record", authenticateToken, getAttendanceRecords);

router.get("/report", authenticateToken, getAttendanceReport);

export default router;
