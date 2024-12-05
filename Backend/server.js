const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const path = require("path");
const jwt = require("jsonwebtoken");
const verifyToken = require("./routes/authMiddleware"); // JWT verification middleware

// Load environment variables from .env file
dotenv.config();

// Initialize the Express application
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json()); // For parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.set("view engine", "ejs"); // Set EJS as the template engine

// Ensure the path to views is correct
app.set("views", path.join(__dirname, "../frontend/views")); // Correct path to views

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, "frontend", "public"))); // Correct path to public

// Routes
const authRoutes = require("./routes/auth"); // Import authentication routes
const dashboardRoutes = require("./routes/dashboard"); // Import dashboard routes

// Use authentication routes for /auth
app.use("/auth", authRoutes);

// Use dashboard routes for /dashboard
app.use("/dashboard", verifyToken, dashboardRoutes); // Verify token for accessing dashboard

// Sample route to test JWT token
app.get("/protected", verifyToken, (req, res) => {
  res.json({ success: true, message: "This is a protected route." });
});

// Home route
app.get("/", (req, res) => {
  res.render("index"); // Render home page (index.ejs)
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
