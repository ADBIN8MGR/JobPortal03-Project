const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;  // Retrieve token from cookies

  console.log("Request cookies:", req.cookies);  // Debugging: log all cookies

  if (!token) {
    console.error("Access denied: No token provided.");
    return res.redirect("/auth/login?role=jobSeeker"); // Adjust role as necessary
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Attach user info to the request
    console.log("Token verified for user:", req.user);  // Debugging: log verified user
    next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    res.status(401).send("Invalid token");
  }
};

module.exports = verifyToken;
