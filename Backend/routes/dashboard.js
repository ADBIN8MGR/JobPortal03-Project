const express = require("express");
const router = express.Router();
const verifyToken = require("./authMiddleware"); // JWT middleware
const verifyRole = require("./roleMiddleware"); // Role middleware
const db = require("../config/db"); // Database connection

// Job Seeker Dashboard
router.get("/jobseeker", verifyToken, verifyRole("jobSeeker"), async (req, res) => {
  try {
    // Fetch available jobs
    const [jobs] = await db.query("SELECT id, title, description FROM jobs");

    // Fetch applied jobs for this job seeker, including CV from users table
    const appliedJobsQuery = `
      SELECT j.id AS job_id, j.title, j.description, u.cv
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON a.job_seeker_id = u.id
      WHERE a.job_seeker_id = ?
    `;
    const [appliedJobs] = await db.query(appliedJobsQuery, [req.user.id]);

    res.render("jobseeker-dashboard", {
      user: req.user,
      jobs,
      appliedJobs,
    });
  } catch (error) {
    console.error("Error loading job seeker dashboard:", error);
    res.status(500).send("Error loading dashboard");
  }
});

// Company Dashboard
router.get("/company", verifyToken, verifyRole("company"), async (req, res) => {
  try {
    // Fetch jobs posted by this company
    const [postedJobs] = await db.query(
      "SELECT id, title, description FROM jobs WHERE company_id = ?",
      [req.user.id]
    );

    // Fetch applications for the company's jobs
    const applicationsQuery = `
      SELECT a.id AS application_id, j.title AS job_title, u.username AS applicant_name, 
             u.email AS applicant_email, u.cv AS applicant_cv
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON a.job_seeker_id = u.id
      WHERE j.company_id = ?
    `;
    const [applications] = await db.query(applicationsQuery, [req.user.id]);

    res.render("company-dashboard", {
      user: req.user,
      postedJobs,
      applications,
    });
  } catch (error) {
    console.error("Error loading company dashboard:", error);
    res.status(500).send("Error loading dashboard");
  }
});

// Admin Dashboard
router.get("/admin", verifyToken, verifyRole("admin"), async (req, res) => {
  try {
    // Fetch all job seekers
    const [jobSeekers] = await db.query("SELECT id, username, email FROM users WHERE role = 'jobSeeker'");

    // Fetch all companies
    const [companies] = await db.query("SELECT id, username, email FROM users WHERE role = 'company'");

    res.render("admin-dashboard", {
      user: req.user,
      jobSeekers,
      companies,
    });
  } catch (error) {
    console.error("Error loading admin dashboard:", error);
    res.status(500).send("Error loading dashboard");
  }
});

module.exports = router;
