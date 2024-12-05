const express = require("express");
const router = express.Router();
const verifyToken = require("./authMiddleware"); // JWT verification middleware
const db = require("../config/db"); // Your database connection

// Role-Based Dashboard
router.get("/", verifyToken, async (req, res) => {
  const { role, username, id } = req.user;

  let data = {};

  try {
    if (role === "company") {
      const [jobs] = await db.query("SELECT * FROM jobs WHERE company_id = ?", [id]);
      data.jobs = jobs;
    } else if (role === "jobSeeker") {
      const [jobs] = await db.query("SELECT * FROM jobs");
      data.jobs = jobs;

      const [appliedJobs] = await db.query(
        "SELECT jobs.title, applications.applied_at FROM applications JOIN jobs ON applications.job_id = jobs.id WHERE applications.job_seeker_id = ?",
        [id]
      );
      data.appliedJobs = appliedJobs;
    } else if (role === "admin") {
      const [jobSeekers] = await db.query("SELECT * FROM users WHERE role = 'jobSeeker'");
      const [companies] = await db.query("SELECT * FROM users WHERE role = 'company'");
      data.jobSeekers = jobSeekers;
      data.companies = companies;
    }

    res.render("dashboard", { username, role, data });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).send("Error fetching dashboard data.");
  }
});

module.exports = router;
