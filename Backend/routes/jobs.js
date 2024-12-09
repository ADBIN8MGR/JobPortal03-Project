const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");
const verifyToken = require("../routes/authMiddleware"); // Add the auth middleware

// Set up multer storage configuration for job posting photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/jobs/"); // Store files in 'uploads/jobs' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Use timestamp for unique names
  },
});

// Initialize multer upload for job photos
const upload = multer({ storage: storage });

// Add a new job (Company-specific)
router.post("/add", verifyToken, upload.single("photo"), async (req, res) => {
  const { title, description } = req.body;
  const company_id = req.user.id; // Get the logged-in company's ID
  const photo = req.file ? req.file.filename : null;

  if (!title || !description) {
    return res.status(400).json({ success: false, message: "Title and description are required." });
  }

  try {
    await db.query(
      "INSERT INTO jobs (title, description, company_id, photo) VALUES (?, ?, ?, ?)",
      [title, description, company_id, photo]
    );
    res.status(201).json({ success: true, message: "Job posted successfully!" });
  } catch (err) {
    console.error("Error posting job:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// View all jobs (Job Seeker)
router.get("/view", async (req, res) => {
  try {
    const [jobs] = await db.query("SELECT id, title, description FROM jobs");
    res.status(200).json({ success: true, jobs });
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Apply for a job (Job Seeker)
router.post("/apply", verifyToken, async (req, res) => {
  const { job_id } = req.body;
  const jobSeeker_id = req.user.id;

  if (!job_id) {
    return res.status(400).json({ success: false, message: "Job ID is required." });
  }

  try {
    // Check if the job exists
    const [job] = await db.query("SELECT * FROM jobs WHERE id = ?", [job_id]);
    if (job.length === 0) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    // Check if the job seeker has already applied
    const [existingApplication] = await db.query(
      "SELECT * FROM applications WHERE job_id = ? AND job_seeker_id = ?",
      [job_id, jobSeeker_id]
    );
    if (existingApplication.length > 0) {
      return res.status(400).json({ success: false, message: "You have already applied for this job." });
    }

    // Insert the application (reference job_seeker_id)
    await db.query("INSERT INTO applications (job_id, job_seeker_id) VALUES (?, ?)", [
      job_id,
      jobSeeker_id,
    ]);
    res.status(200).json({ success: true, message: "Application successful" });
  } catch (err) {
    console.error("Error applying for job:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all applications for a company's jobs
router.get("/applications", verifyToken, async (req, res) => {
  const company_id = req.user.id;

  try {
    const [applications] = await db.query(
      `
      SELECT a.id AS application_id, j.title AS job_title, u.username AS applicant_name, u.email AS applicant_email, u.cv 
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON a.jobSeeker_id = u.id
      WHERE j.company_id = ?
      `,
      [company_id]
    );
    res.status(200).json({ success: true, applications });
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete a job (Company-specific)
router.delete("/delete/:jobId", verifyToken, async (req, res) => {
  const jobId = req.params.jobId;
  const company_id = req.user.id; // Ensure the company owns the job

  try {
    // Check if the job belongs to the company
    const [job] = await db.query("SELECT * FROM jobs WHERE id = ? AND company_id = ?", [jobId, company_id]);
    if (job.length === 0) {
      return res.status(404).json({ success: false, message: "Job not found or unauthorized." });
    }

    // Delete the job
    await db.query("DELETE FROM jobs WHERE id = ?", [jobId]);
    res.status(200).json({ success: true, message: "Job deleted successfully!" });
  } catch (err) {
    console.error("Error deleting job:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
