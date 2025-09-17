import jwt from "jsonwebtoken";

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ msg: "Access denied. No token provided." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ msg: "Invalid or expired token." });
      }

      // attach decoded user info (id, studentId, role) to req.user
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res.status(500).json({ msg: "Server error in authentication" });
  }
};

export default authenticateToken;
