import express from "express";
const app = express();
import cookieParser from "cookie-parser";
import methodOverride from "method-override";
import path from "path";
import { fileURLToPath } from "url";
const PORT = process.env.PORT || 8000;

//routers
import authRoutes from "./routes/authRoutes.js";
import jobSeekerRoutes from "./routes/jobSeekerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";

//middleware
import authenticateUser from "./middleware/authMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

app.use("/auth", authRoutes);
app.use("/jobSeeker", authenticateUser, jobSeekerRoutes);
app.use("/admin", authenticateUser, adminRoutes);
app.use("/company", authenticateUser, companyRoutes);

app.get("/", (req, res) => {
  res.render("index");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
