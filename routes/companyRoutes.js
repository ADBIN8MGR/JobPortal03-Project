import express from "express";
const router = express.Router();
import {
  addJob,
  updateJob,
  deleteJob,
  getCompanyJobs,
} from "../controllers/jobController.js";
import {
  shortlistApplication,
  rejectApplication,
  getCompanyApplications,
  updateApplicationStatus,
} from "../controllers/applicationController.js";
import authenticate from "../middleware/authMiddleware.js";
import { logoutUser } from "../controllers/authController.js";

router.post("/jobs/add", authenticate, addJob);
router.post("/jobs/update/:id", authenticate, updateJob);
router.post("/jobs/delete/:id", authenticate, deleteJob);
router.put(
  "/company/applications/:id/status",
  authenticate,
  updateApplicationStatus
);
router.post("/applications/shortlist/:id", authenticate, shortlistApplication);
router.post("/applications/reject/:id", authenticate, rejectApplication);
router.get("/logout", logoutUser);

const menuItems = [
  { name: "Dashboard", link: "/company/dashboard" },
  { name: "Job Management", link: "/company/jobs" },
  { name: "Your Jobs", link: "/company/your-jobs" },
  { name: "Application Management", link: "/company/applications" },
];

router.get("/dashboard", authenticate, async (req, res) => {
  console.log("Dashboard route hit");
  res.render("dashboard", {
    title: "Company Dashboard",
    menuItems,
    section: "dynamicDboard",
    userType: req.user.role,
    userName: req.user.name || "User",
    data: [],
  });
});
router.get("/jobs", authenticate, async (req, res) => {
  try {
    const jobs = await getCompanyJobs(req.user.id);
    res.render("dashboard", {
      title: "Job Management",
      menuItems,
      section: "jobManagement",
      userType: req.user.role,
      data: jobs,
    });
  } catch (error) {
    console.error("Error rendering job management page:", error);
    if (!res.headersSent) {
      res.status(500).send("Internal Server Error");
    }
  }
});
router.get("/your-jobs", authenticate, async (req, res) => {
  try {
    const yourJobs = await getCompanyJobs(req.user.id);
    res.render("dashboard", {
      title: "Your Jobs",
      menuItems,
      section: "yourJobs",
      userType: req.user.role,
      data: yourJobs,
    });
  } catch (error) {
    console.error("Error rendering your jobs page:", error);
    if (!res.headersSent) {
      res.status(500).send("Internal Server Error");
    }
  }
});
router.get("/applications", authenticate, async (req, res) => {
  const companyId = req.user.id;
  try {
    const applications = await getCompanyApplications(companyId);
    res.render("dashboard", {
      title: "Application Management",
      menuItems,
      section: "applicationManage",
      userType: req.user.role,
      data: applications,
    });
  } catch (error) {
    console.error("Error fetching company applications:", error);
    res.status(500).send("Server Error");
  }
});

export default router;
