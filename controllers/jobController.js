import pool from "../config/db.js";

const getJobs = async (req, res) => {
  const userId = req.user.id;
  const { location } = req.query;
  try {
    let query = "SELECT * FROM jobs";
    const values = [];

    if (location) {
      query += " WHERE location = ?";
      values.push(location);
    }

    const [jobs] = await pool.execute(query, values);

    const [appliedJobs] = await pool.execute(
      `
            SELECT applications.*, jobs.title, jobs.description, jobs.location, applications.status 
            FROM applications 
            JOIN jobs ON applications.job_id = jobs.id 
            WHERE applications.job_seeker_id = ?
        `,
      [userId]
    );

    const [locations] = await pool.execute(
      "SELECT DISTINCT location FROM jobs"
    );

    res.render("jobApp", { jobs, appliedJobs, locations, user: req.user });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

const applyForJob = async (req, res) => {
  const { job_id } = req.body;
  const job_seeker_id = req.user.id;
  try {
    const query =
      'INSERT INTO applications (job_id, job_seeker_id, status) VALUES (?, ?, "pending")';
    await pool.execute(query, [job_id, job_seeker_id]);
    res.redirect("/jobSeeker"); // Redirect to the job seeker page after applying
  } catch (error) {
    console.error("Error applying for job:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

const addJob = async (req, res) => {
  const { title, description, location } = req.body;
  const company_id = req.user.id;
  try {
    const query =
      "INSERT INTO jobs (title, description, location, company_id) VALUES (?, ?, ?, ?)";
    const values = [title, description, location, company_id];

    const [result] = await pool.execute(query, values);
    res.redirect("/company/your-jobs");
  } catch (error) {
    console.error("Error adding job:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

const updateJob = async (req, res) => {
  const { id } = req.params;
  const { title, description, location } = req.body;
  try {
    const query =
      "UPDATE jobs SET title = ?, description = ?, location = ? WHERE id = ?";
    await pool.execute(query, [title, description, location, id]);

    res.redirect("/company/your-jobs");
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

const deleteJob = async (req, res) => {
  const { id } = req.params;
  try {
    const query = "DELETE FROM jobs WHERE id = ?";
    await pool.execute(query, [id]);

    res.redirect("/company/your-jobs");
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

const getCompanyJobs = async (companyId) => {
  try {
    const [jobs] = await pool.execute(
      "SELECT * FROM jobs WHERE company_id = ?",
      [companyId]
    );
    return jobs;
  } catch (error) {
    console.error("Error fetching company jobs:", error);
    throw error;
  }
};

module.exports = {
  getJobs,
  applyForJob,
  addJob,
  updateJob,
  deleteJob,
  getCompanyJobs,
};
