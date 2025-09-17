import express from "express";
// import {adminAuth} from "../middleware/adminAuth.js"
import { adminLogin, getAllStudents} from "../controllers/adminController.js";

const router = express.Router();

// Admin login route
router.post("/login", adminLogin);
// Get all students (protected)
router.get("/students", getAllStudents);

export default router;
