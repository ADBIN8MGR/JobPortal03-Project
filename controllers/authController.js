import pool from "../config/db.js";
import bcrypt from "bcrypt";
import { setUser } from "../utils/jwt.js";
const saltRounds = 10;

export const registerUser = async (req, res) => {
  console.log(req.params);
  console.log("Request Body:", req.body);
  const { name, email, phoneNumber, password, location, role } = req.body;

  try {
    if (!name || !email || !password || !role) {
      console.error("Registration Failed: Missing Fields");
      return res.status(400).send("All fields are required!");
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Registration based on role
    if (role === "jobSeeker") {
      let cv;
      if (req.file) {
        cv = req.file.filename;
      } else {
        cv = null;
      }

      if (!cv) {
        return res.status(400).send("CV is required for jobSeeker!");
      }
      await pool.execute(
        "INSERT INTO users(username, email, password, phone_number, role, cv) VALUES (?, ?, ?, ?, ?, ?)",
        [name, email, hashedPassword, phoneNumber, role, cv]
      );
    } else if (role === "company") {
      if (!location) {
        return res.status(400).send("Location is required for company!");
      }
      await pool.execute(
        "INSERT INTO users(username, email, password, phone_number, role, location) VALUES (?, ?, ?, ?, ?, ?)",
        [name, email, hashedPassword, phoneNumber, role, location]
      );
    } else {
      return res.status(400).send("Invalid Role!");
    }

    console.log(`Registration successful for role: ${role}`);
    return res.redirect("/");
  } catch (error) {
    console.error("Error occurred during registration: ", error);
    res.status(500).send("Server error! Please try again later.");
  }
};

export const findUserByEmail = async (email) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  return rows;
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt with email:", email);

    const users = await findUserByEmail(email);
    if (users.length === 0) {
      console.error("User not found");
      return res.status(401).send("Invalid credentials");
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.error("Invalid password");
      return res.status(401).send("Invalid credentials");
    }

    const token = setUser(user);
    res.cookie("token", token, { httpOnly: true });

    switch (user.role) {
      case "jobSeeker":
        return res.redirect("/jobSeeker");
      case "company":
        return res.redirect("/company/dashboard");
      case "admin":
        return res.redirect("/admin/dashboard");
      default:
        return res.status(400).send("Invalid role");
    }
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).send("Server error");
  }
};

export const loginPage = (req, res) => {
  const role = req.query.role;
  res.render("login", { role });
};

export const registerPage = (req, res) => {
  const { role } = req.query;
  console.log(`Role Provided: ${role}`);
  res.render("register", { role });
};

export const dashboardPage = (req, res) => {
  const role = req.user.role;
  switch (role) {
    case "jobSeeker":
      res.render("jobApp", { user: req.user });
      break;
    case "company":
      res.render("dashboard", { user: req.user });
      break;
    case "admin":
      res.render("dashboard", { user: req.user });
      break;
    default:
      res.status(400).send("Invalid role");
  }
};

export const logoutUser = (req, res) => {
  const token = req.cookies.token;
  if (token) {
    res.clearCookie("token");
  }
  res.redirect("/");
};
