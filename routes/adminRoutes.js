import express from "express";
const router = express.Router();
import {
  getUsers,
  deleteUser,
  deleteJob,
  getJobs,
} from "../controllers/adminController";
import { getStats } from "../controllers/statsController";
import authenticate from "../middleware/authMiddleware";

router.delete("/users/:id", authenticate, deleteUser);
router.delete("/jobs/:id", authenticate, deleteJob);

const menuItems = [
  { name: "Dashboard", link: "/admin/dashboard" },
  { name: "User Management", link: "/admin/users" },
  { name: "Job Postings", link: "/admin/jobs" },
  { name: "Statistics", link: "/admin/stats" },
];
router.route("/dashboard").get(authenticate, async (req, res) => {
  res.render("dashboard", {
    title: "Admin Dashboard",
    menuItems,
    section: "dynamicDboard",
    userType: req.user.role,
    userName: req.user.name || "User",
    data: [],
  });
});

router.route("/users").get(authenticate, async (req, res) => {
  try {
    const users = await getUsers(req, res);
    res.render("dashboard", {
      title: "User Management",
      menuItems,
      section: "userManagement",
      userType: req.user.role,
      data: users.length ? users : [],
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.route("/jobs").get(authenticate, async (req, res) => {
  try {
    const jobs = await getJobs(req, res);
    res.render("dashboard", {
      title: "All JOBS",
      menuItems,
      section: "allJobs",
      userType: req.user.role,
      data: jobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.route("/stats").get(authenticate, async (req, res) => {
  console.log("Statistics route hit");
  try {
    const stats = await getStats(req, res);
    console.log("Stats data:", stats);
    res.render("dashboard", {
      title: "Platform Statistics",
      menuItems,
      section: "stats",
      userType: req.user.role,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
