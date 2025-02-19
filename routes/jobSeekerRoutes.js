import express from "express";
const router = express.Router();
import { getJobs, applyForJob } from "../controllers/jobController.js";
import authenticate from "../middleware/authMiddleware.js";
import { updateJobSeekerProfile } from "../controllers/profileManageController.js";
import upload from "../utils/multer.js";

router.get("/", authenticate, getJobs);
router.post("/apply", authenticate, applyForJob);
router.post(
  "/updateProfile",
  authenticate,
  upload.single("cv"),
  updateJobSeekerProfile
);

export default router;
