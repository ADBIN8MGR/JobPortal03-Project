import express from "express";
const router = express.Router();
import {
  loginUser,
  registerUser,
  loginPage,
  registerPage,
  dashboardPage,
  logoutUser,
} from "../controllers/authController.js";
import authenticate from "../middleware/authMiddleware.js";
import upload from "../utils/multer.js";

router
  .route("/register")
  .get(registerPage)
  .post(upload.single("cv"), registerUser);
router.route("/login").get(loginPage).post(loginUser);
router.get("/dashboard", authenticate, dashboardPage);
router.get("/logout", logoutUser);

export default router;
