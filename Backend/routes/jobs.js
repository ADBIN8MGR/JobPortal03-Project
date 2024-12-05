const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require('multer');
const path = require('path');

// Set up multer storage configuration for job photo
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/jobs/'); // Store files in 'uploads/jobs' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Use current timestamp to avoid file name conflicts
  }
});

// Initialize multer upload
const upload = multer({ storage: storage });

// Add a new job
router.post("/add", upload.single('photo'), async (req, res) => {
  const { title, description, employer_id } = req.body;
  const photo = req.file ? req.file.filename : null; // Save file name to the database

  if (!title || !description) {
    return res.status(400).json({ success: false, message: "Title and description are required." });
  }

  try {
    // Verify the employer exists
    const [rows] = await db.query("SELECT id FROM users WHERE id = ? AND role = ?", [employer_id, "company"]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Employer not found." });
    }

    // Insert the new job with the photo URL
    await db.query("INSERT INTO jobs (title, description, employer_id, photo) VALUES (?, ?, ?, ?)", [
      title, description, employer_id, photo
    ]);
    res.status(201).json({ success: true, message: "Job added successfully" });
  } catch (err) {
    console.error("Error adding job:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// View all jobs for job seekers
router.get("/view", async (req, res) => {
  try {
    const [jobs] = await db.query("SELECT * FROM jobs");
    res.status(200).json({ success: true, jobs });
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ success: false, message: "Error fetching jobs" });
  }
});

// Apply for a job
router.post("/apply", async (req, res) => {
  const { job_id, jobSeeker_id } = req.body;

  if (!job_id || !jobSeeker_id) {
    return res.status(400).json({ success: false, message: "Job ID and Job Seeker ID are required." });
  }

  try {
    // Check if the job exists
    const [job] = await db.query("SELECT * FROM jobs WHERE id = ?", [job_id]);
    if (job.length === 0) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    // Check if the job seeker has already applied
    const [existingApplication] = await db.query("SELECT * FROM applications WHERE job_id = ? AND jobSeeker_id = ?", [job_id, jobSeeker_id]);
    if (existingApplication.length > 0) {
      return res.status(400).json({ success: false, message: "You have already applied for this job." });
    }

    // Insert the application
    await db.query("INSERT INTO applications (job_id, jobSeeker_id) VALUES (?, ?)", [job_id, jobSeeker_id]);
    res.status(200).json({ success: true, message: "Job application successful" });
  } catch (err) {
    console.error("Error applying for job:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get applied jobs for a job seeker
router.get("/applied/:jobSeeker_id", async (req, res) => {
  const jobSeekerId = req.params.jobSeeker_id;

  try {
    const [appliedJobs] = await db.query(
      `SELECT jobs.id AS job_id, jobs.title, jobs.description, applications.applied_at
       FROM applications
       JOIN jobs ON applications.job_id = jobs.id
       WHERE applications.jobSeeker_id = ?`, [jobSeekerId]
    );
    res.status(200).json({ success: true, appliedJobs });
  } catch (err) {
    console.error("Error fetching applied jobs:", err);
    res.status(500).json({ success: false, message: "Error fetching applied jobs" });
  }
});

module.exports = router;



















// const express = require("express");
// const router = express.Router();
// const db = require("../config/db");

// // Add a new job
// router.post("/add", async (req, res) => {
//   const { title, description, employer_id, role } = req.body;

//   if (!title || !description) {
//     return res.status(400).json({ success: false, message: "Title and description are required." });
//   }
//   if (role !== "employer") {
//     return res.status(403).json({ success: false, message: "Access denied: Only employers can add jobs." });
//   }

//   try {
//     // Verify the employer exists
//     const [rows] = await db.query("SELECT id FROM users WHERE id = ? AND role = ?", [employer_id, "employer"]);
//     if (rows.length === 0) {
//       return res.status(404).json({ success: false, message: "Employer not found." });
//     }

//     // Add the job
//     await db.query("INSERT INTO jobs (title, description, employer_id) VALUES (?, ?, ?)", [
//       title,
//       description,
//       employer_id,
//     ]);
//     res.status(201).json({ success: true, message: "Job added successfully" });
//   } catch (err) {
//     console.error("Error adding job:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // Update a job
// router.put("/update/:id", async (req, res) => {
//   const jobId = req.params.id;
//   const { title, description, role } = req.body;

//   if (!title || !description) {
//     return res.status(400).json({ success: false, message: "Title and description are required." });
//   }
//   if (role !== "employer") {
//     return res.status(403).json({ success: false, message: "Access denied: Only employers can update jobs." });
//   }

//   try {
//     const [result] = await db.query("UPDATE jobs SET title = ?, description = ? WHERE id = ?", [
//       title,
//       description,
//       jobId,
//     ]);
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ success: false, message: "Job not found." });
//     }
//     res.status(200).json({ success: true, message: "Job updated successfully" });
//   } catch (err) {
//     console.error("Error updating job:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // Delete a job
// router.delete("/delete/:id", async (req, res) => {
//   const jobId = req.params.id;
//   const { role } = req.body;

//   if (role !== "employer") {
//     return res.status(403).json({ success: false, message: "Access denied: Only employers can delete jobs." });
//   }

//   try {
//     const [result] = await db.query("DELETE FROM jobs WHERE id = ?", [jobId]);
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ success: false, message: "Job not found." });
//     }
//     res.status(200).json({ success: true, message: "Job deleted successfully" });
//   } catch (err) {
//     console.error("Error deleting job:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// module.exports = router;















