const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

    // Generate JWT token
    const token = jwt.sign({ id: user[0].id, role: user[0].role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ success: true, message: "Login successful.", token }); // Send token to frontend
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// Handle registration form submission
router.post("/register", async (req, res) => {
  const { name, email, password, phoneNumber, role, location } = req.body;
  try {
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "jobSeeker") {
      await db.query(
        "INSERT INTO users (username, email, password, phone_number, role) VALUES (?, ?, ?, ?, ?)",
        [name, email, hashedPassword, phoneNumber, role]
      );
    } else if (role === "company") {
      await db.query(
        "INSERT INTO users (username, email, password, phone_number, role, location) VALUES (?, ?, ?, ?, ?, ?)",
        [name, email, hashedPassword, phoneNumber, role, location]
      );
    }

    res.json({ success: true, message: "Registration successful." });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
