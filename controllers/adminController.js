import pool from "../config/db.js";

const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE role != "admin"'
    );
    if (rows.length === 0) {
      return { status: "No users found" };
    }
    return rows;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`Received request to delete user with ID: ${id}`);
    const [user] = await pool.query("SELECT role FROM users WHERE id = ?", [
      id,
    ]);
    if (user.length === 0) {
      return res.status(404).send({ message: "User not found" });
    }
    if (user[0].role === "admin") {
      return res.status(403).send({ message: "Cannot delete admin user" });
    }

    const query = "DELETE FROM users WHERE id = ?";
    const result = await pool.query(query, [id]);
    console.log("Delete query result:", result);
    res.redirect("/admin/users");
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send(error);
  }
};

const deleteJob = async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`Removing job with ID: ${id}`);
    const query = "DELETE FROM jobs WHERE id = ?";
    await pool.query(query, [id]);
    res.redirect("/admin/jobs");
  } catch (error) {
    console.error("Error removing job:", error);
    res.status(500).send(error);
  }
};

const getJobs = async () => {
  try {
    const [rows] = await pool.query("SELECT * FROM jobs");
    return rows;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
};

module.exports = { getUsers, deleteUser, deleteJob, getJobs };
