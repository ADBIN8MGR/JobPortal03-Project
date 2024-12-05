const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const upload = require("../utils/multer"); // Import multer configuration

// Serve login pages dynamically
router.get("/login", (req, res) => {
  const { role } = req.query; // Role passed as a query parameter
  if (role === "admin") {
    res.render("admin-login");
  } else if (role === "company") {
    res.render("company-login");
  } else if (role === "jobSeeker") {
    res.render("jobseeker-login");
  } else {
    res.status(400).send("Invalid role.");
  }
});

// Handle login form submission
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;
  try {
    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const [user] = await db.query("SELECT * FROM users WHERE email = ? AND role = ?", [email, role]);
    if (user.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const validPassword = await bcrypt.compare(password, user[0].password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const token = jwt.sign({ id: user[0].id, role: user[0].role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ success: true, message: "Login successful.", token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// Serve registration pages dynamically
router.get("/register/:role", (req, res) => {
  const { role } = req.params;
  if (role === "company") {
    res.render("company-register");
  } else if (role === "jobseeker") {
    res.render("jobseeker-register");
  } else {
    res.status(400).send("Invalid role.");
  }
});

// Handle registration form submission
router.post("/register", upload.single("cv"), async (req, res) => {
  const { name, email, phoneNumber, password, location, role } = req.body;
  try {
    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "jobSeeker") {
      const cv = req.file ? req.file.filename : null; // Save uploaded CV filename
      await db.query(
        "INSERT INTO users (username, email, password, phone_number, role, cv) VALUES (?, ?, ?, ?, ?, ?)",
        [name, email, hashedPassword, phoneNumber, role, cv]
      );
    } else if (role === "company") {
      await db.query(
        "INSERT INTO users (username, email, password, phone_number, role, location) VALUES (?, ?, ?, ?, ?, ?)",
        [name, email, hashedPassword, phoneNumber, role, location]
      );
    }

    res.redirect(`/auth/login?role=${role}`); // Redirect to login page
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ success: false, message: "Registration failed." });
  }
});

module.exports = router;
