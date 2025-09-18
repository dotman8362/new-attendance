import Attendance from "../models/attendance.js";
import Student from "../models/user.js";
import { normalizeIP } from "../utils/ipHelper.js";






// 📍 Approximate check instead of Haversine
// const isWithinLocation = (lat, lon, schoolLat, schoolLon, tolerance = 0.001) => {
//   return (
//     Math.abs(lat - schoolLat) < tolerance &&
//     Math.abs(lon - schoolLon) < tolerance
//   );
// };

// export const markAttendance = async (req, res) => {
//   try {
//     const { studentId, latitude, longitude, type } = req.body;

//     // 🔎 Find student
//     const user = await Student.findOne({ studentId });
//     if (!user) return res.status(404).json({ msg: "Student not found" });

//     // ✅ Normalize current IP
//     const currentIP = normalizeIP(
//       req.headers["x-forwarded-for"] || req.socket.remoteAddress, 2
//     );

//     const registeredIP = normalizeIP(user.ipAddress, 2);

//     // ✅ Enforce IP check only in production
//     if (process.env.NODE_ENV === "production") {
//       if (currentIP !== registeredIP) {
//         return res.status(403).json({ msg: "IP address mismatch" });
//       }
//     }

//     // ✅ Location check (simple tolerance)
//     const schoolLat = parseFloat(process.env.SCHOOL_LAT);
//     const schoolLon = parseFloat(process.env.SCHOOL_LON);

//     if (!isWithinLocation(latitude, longitude, schoolLat, schoolLon, 0.001)) {
//       return res.status(403).json({
//         msg: "You are outside the allowed LSEI location",
//       });
//     }

//     // ✅ Time validation
//     const now = new Date();
//     const hour = now.getHours();
//     const minutes = now.getMinutes();

//     const isMorningWindow = hour === 10 && minutes <= 30;
//     const isAfternoonWindow = hour === 14 && minutes <= 30;

//     if (type === "morning" && !isMorningWindow) {
//       return res
//         .status(400)
//         .json({ msg: "Morning sign-in allowed only between 08:00 - 08:30" });
//     }

//     if (type === "afternoon" && !isAfternoonWindow) {
//       return res
//         .status(400)
//         .json({ msg: "Afternoon sign-out allowed only between 14:00 - 14:30" });
//     }

//     // ✅ Today’s date
//     const today = now.toISOString().split("T")[0];
//     let attendance = await Attendance.findOne({ studentId, date: today });

//     // --------------------
//     // MORNING SIGN-IN
//     // --------------------
//     if (type === "morning") {
//       if (attendance) {
//         return res
//           .status(400)
//           .json({ msg: "You already signed in this morning" });
//       }

//       attendance = new Attendance({
//         studentId,
//         fullname: user.fullname,
//         registeredIP: user.ipAddress,
//         ipAddress: currentIP,
//         latitude,
//         longitude,
//         signInTime: now,
//         date: today,
//       });

//       await attendance.save();
//       return res.json({ msg: "Morning sign-in successful ✅", attendance });
//     }

//     // --------------------
//     // AFTERNOON SIGN-OUT
//     // --------------------
//     if (type === "afternoon") {
//       if (!attendance) {
//         return res
//           .status(400)
//           .json({ msg: "You must sign in before signing out" });
//       }

//       if (attendance.signOutTime) {
//         return res.status(400).json({ msg: "You already signed out today" });
//       }

//       attendance.signOutTime = now;
//       attendance.signOutIP = currentIP;
//       await attendance.save();

//       return res.json({ msg: "Afternoon sign-out successful ✅", attendance });
//     }

//     return res.status(400).json({ msg: "Invalid attendance type" });
//   } catch (error) {
//     console.error("Attendance Error:", error.message);
//     res.status(500).json({ msg: "Server error" });
//   }
// };



// 🌍 Haversine formula to calculate distance between 2 points in meters
const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Radius of Earth in meters
  const toRad = (value) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in meters
};

export const markAttendance = async (req, res) => {
  try {
    const { studentId, latitude, longitude, type } = req.body;

    // 🔎 Find student
    const user = await Student.findOne({ studentId });
    if (!user) return res.status(404).json({ msg: "Student not found" });

    // ✅ Normalize current IP
    const currentIP = normalizeIP(
      req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      2
    );

    const registeredIP = normalizeIP(user.ipAddress, 2);

    // ✅ Enforce IP check only in production
    if (process.env.NODE_ENV === "production") {
      if (currentIP !== registeredIP) {
        return res.status(403).json({ msg: "IP address mismatch" });
      }
    }

    // ✅ Location check (200m radius)
    const schoolLat = parseFloat(process.env.SCHOOL_LAT);
    const schoolLon = parseFloat(process.env.SCHOOL_LON);
    const distance = getDistanceInMeters(latitude, longitude, schoolLat, schoolLon);

    if (distance > 500) {
      return res.status(403).json({
        msg: `You are outside the allowed LSEI location. Distance: ${distance.toFixed(
          2
        )}m`,
      });
    }

    // ✅ Time validation
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();

    const isMorningWindow = hour === 14 && minutes <= 30; // 08:00 - 08:30
    const isAfternoonWindow = hour === 15 && minutes <= 30; // 14:00 - 14:30

    if (type === "morning" && !isMorningWindow) {
      return res
        .status(400)
        .json({ msg: "Morning sign-in allowed only between 10:00 - 08:30" });
    }

    if (type === "afternoon" && !isAfternoonWindow) {
      return res
        .status(400)
        .json({ msg: "Afternoon sign-out allowed only between 14:00 - 14:30" });
    }

    // ✅ Today’s date
    const today = now.toISOString().split("T")[0];
    let attendance = await Attendance.findOne({ studentId, date: today });

    // --------------------
    // MORNING SIGN-IN
    // --------------------
    if (type === "morning") {
      if (attendance) {
        return res
          .status(400)
          .json({ msg: "You already signed in this morning" });
      }

      attendance = new Attendance({
        studentId,
        fullname: user.fullname,
        registeredIP: user.ipAddress,
        ipAddress: currentIP,
        latitude,
        longitude,
        signInTime: now,
        date: today,
      });

      await attendance.save();
      return res.json({ msg: "Morning sign-in successful ✅", attendance });
    }

    // --------------------
    // AFTERNOON SIGN-OUT
    // --------------------
    if (type === "afternoon") {
      if (!attendance) {
        return res
          .status(400)
          .json({ msg: "You must sign in before signing out" });
      }

      if (attendance.signOutTime) {
        return res.status(400).json({ msg: "You already signed out today" });
      }

      attendance.signOutTime = now;
      attendance.signOutIP = currentIP;
      await attendance.save();

      return res.json({ msg: "Afternoon sign-out successful ✅", attendance });
    }

    return res.status(400).json({ msg: "Invalid attendance type" });
  } catch (error) {
    console.error("Attendance Error:", error.message);
    res.status(500).json({ msg: "Server error" });
  }
};




export const getAttendanceRecords = async (req, res) => {
  try {
    // Extract studentId from the token payload (set in auth middleware)
    const { studentId } = req.user;

    if (!studentId) {
      return res.status(400).json({ msg: "Student ID missing from token" });
    }

    // Fetch all records for this student
    const records = await Attendance.find({ studentId }).sort({ date: -1 });

    if (!records || records.length === 0) {
      return res.status(404).json({ msg: "No attendance records found" });
    }

    res.json(records);
  } catch (error) {
    console.error("Fetch records error:", error);
    res.status(500).json({ msg: "Server error fetching records" });
  }
};
