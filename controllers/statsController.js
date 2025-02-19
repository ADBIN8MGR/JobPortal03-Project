import pool from "../config/db.js";

export const getStats = async (req, res) => {
  try {
    const [activeUsers] = await pool.query(
      "SELECT COUNT(*) AS count FROM users"
    );
    const [jobPostings] = await pool.query(
      'SELECT COUNT(*) AS count FROM jobs WHERE status = "active"'
    );
    const [applications] = await pool.query(
      "SELECT COUNT(*) AS count FROM applications"
    );

    return {
      activeUsers: activeUsers[0].count,
      jobPostings: jobPostings[0].count,
      applications: applications[0].count,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    throw error;
  }
};
