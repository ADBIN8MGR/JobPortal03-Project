import pool from "../config/db.js";

export const updateJobSeekerProfile = async (req, res) => {
  const { id } = req.user;
  const cv = req.file ? req.file.path : null;

  try {
    const query = "UPDATE users SET cv = ? WHERE id = ?";
    await pool.execute(query, [cv, id]);
    res.redirect("/jobSeeker");
  } catch (error) {
    console.error("Error updating CV:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};
