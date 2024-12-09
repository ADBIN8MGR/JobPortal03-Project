const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const upload = require("../utils/multer"); // Import multer configuration
const jwt = require("jsonwebtoken");
const pool = require("../config/db");







// Serve login pages dynamically
router.get("/login", (req, res) => {
  const { role } = req.query;
  console.log(`Role provided: ${role}`); // Debugging: Log the role query parameter

  if (role === "admin") {
    res.render("admin-login");
  } else if (role === "company") {
    res.render("company-login");
  } else if (role === "jobSeeker") {
    res.render("jobseeker-login");
  } else {
    console.error("Invalid role detected"); // Debugging: Log invalid role access
    res.status(400).send("Invalid role."); // Handle invalid role
  }
});

// Handle login form submission
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userQuery = "SELECT id, email, password, role FROM users WHERE email = ?";
    const [rows] = await pool.execute(userQuery, [email]);

    if (!rows || rows.length === 0) {
      console.error("Login failed: User not found");
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.error("Login failed: Invalid credentials");
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Set the token in an HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,       // Prevent access from JavaScript
      secure: process.env.NODE_ENV === "production", // Use HTTPS only in production
      maxAge: 3600000,      // Token expiration (1 hour)
      sameSite: "lax",      // Allow cookies to be sent with cross-origin requests
    });

    console.log("Token set in cookie for user:", user.role); // Debugging

    let redirectUrl = "";
    if (user.role === "jobSeeker") {
      redirectUrl = "/dashboard/jobseeker";
    } else if (user.role === "company") {
      redirectUrl = "/dashboard/company";
    } else if (user.role === "admin") {
      redirectUrl = "/dashboard/admin";
    } else {
      console.error("Unknown role detected during login");
      return res.status(400).json({ success: false, message: "Unknown role" });
    }

    console.log("Redirecting to:", redirectUrl); // Debugging: log the redirect URL
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Logout route
router.get("/logout", (req, res) => {
  // Clear the JWT token cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  console.log("User logged out"); // Debugging: Log logout action
  // Redirect to the home page or login page
  res.redirect("/");
});


// Serve registration pages dynamically
router.get("/register/:role", (req, res) => {
  const { role } = req.params;
  console.log(`Register page accessed for role: ${role}`); // Debugging: Log accessed role

  if (role === "company") {
    res.render("company-register");
  } else if (role === "jobSeeker") {
    res.render("jobseeker-register");
  } else {
    console.error("Invalid role detected for registration");
    res.status(400).send("Invalid role.");
  }
});

// Handle registration form submission
router.post("/register", upload.single("cv"), async (req, res) => {
  const { name, email, phoneNumber, password, location, role } = req.body;

  try {
    // Validation for required fields
    if (!name || !email || !password || !role) {
      console.error("Registration failed: Missing fields"); // Debugging: Missing fields
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Encrypt the password

    if (role === "jobSeeker") {
      const cv = req.file ? req.file.filename : null; // Save uploaded CV filename
      await pool.execute(
        "INSERT INTO users (username, email, password, phone_number, role, cv) VALUES (?, ?, ?, ?, ?, ?)",
        [name, email, hashedPassword, phoneNumber, role, cv]
      );
    } else if (role === "company") {
      await pool.execute(
        "INSERT INTO users (username, email, password, phone_number, role, location) VALUES (?, ?, ?, ?, ?, ?)",
        [name, email, hashedPassword, phoneNumber, role, location]
      );
    }

    console.log(`Registration successful for role: ${role}`); // Debugging: Log successful registration
    res.redirect(`/auth/login?role=${role}`); // Redirect to login page for the specific role
  } catch (error) {
    console.error("Error during registration:", error); // Debugging: Log server errors
    res.status(500).json({ success: false, message: "Registration failed." });
  }
});

module.exports = router;
