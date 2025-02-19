import pool from "../config/db.js";

export const applyForJob = async (req, res) => {
  const { job_id } = req.body;
  const job_seeker_id = req.user.id;
  try {
    const query =
      'INSERT INTO applications (job_id, job_seeker_id, status) VALUES (?, ?, "pending")';
    await pool.execute(query, [job_id, job_seeker_id]);
    res.redirect("/jobs");
  } catch (error) {
    console.error("Error applying for job:", error);
    if (!res.headersSent) {
      res.status(500).send("Server Error");
    }
  }
};

export const getApplications = async (req, res) => {
  const { job_seeker_id, job_id } = req.query;
  try {
    let query = `
            SELECT applications.*, jobs.title, jobs.description, jobs.location 
            FROM applications 
            JOIN jobs ON applications.job_id = jobs.id 
            WHERE 1=1
        `;
    const values = [];
    if (job_seeker_id) {
      query += " AND applications.job_seeker_id = ?";
      values.push(job_seeker_id);
    }
    if (job_id) {
      query += " AND applications.job_id = ?";
      values.push(job_id);
    }

    const [result] = await pool.execute(query, values);
    console.log("Fetched applications:", JSON.stringify(result, null, 2));

    if (!res.headersSent) {
      // Ensure no duplicate response
      return res.render("applicationsPage", { applications: result });
    }
  } catch (error) {
    console.error("Error fetching applications:", error);
    if (!res.headersSent) {
      return res.status(500).send("Server Error");
    }
  }
};

export const shortlistApplication = async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'UPDATE applications SET status = "shortlisted" WHERE id = ?';
    await pool.execute(query, [id]);
    res.redirect("/company/applications");
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).send(error);
    }
  }
};

export const rejectApplication = async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'UPDATE applications SET status = "rejected" WHERE id = ?';
    await pool.execute(query, [id]);
    res.redirect("/company/applications");
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).send(error);
    }
  }
};

export const getCompanyApplications = async (companyId) => {
  // Accept companyId as an argument
  try {
    const [applications] = await pool.execute(
      `
            SELECT 
                applications.id AS application_id,
                applications.status AS application_status, 
                applications.applied_at,
                jobs.title AS job_title,
                jobs.description AS job_description,
                jobs.location AS job_location,
                users.username AS job_seeker_username,
                users.email AS job_seeker_email,
                users.cv AS job_seeker_cv
            FROM applications
            JOIN jobs ON applications.job_id = jobs.id
            JOIN users ON applications.job_seeker_id = users.id
            WHERE jobs.company_id = ?
        `,
      [companyId]
    );

    return applications;
  } catch (error) {
    console.error("Error fetching company applications:", error);
    throw error;
  }
};

export const updateApplicationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const query = "UPDATE applications SET status = ? WHERE id = ?";
    await pool.execute(query, [status, id]);

    if (!res.headersSent) {
      return res.redirect("/applications");
    }
  } catch (error) {
    console.error("Error updating application status:", error);
    if (!res.headersSent) {
      return res.status(500).send("Server Error");
    }
  }
};
