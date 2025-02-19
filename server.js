import express from "express";
const app = express();
import cookieParser from "cookie-parser";
import methodOverride from "method-override";
const PORT = process.env.PORT || 8000;
const path = require("path");

//routers
import authRoutes from "./routes/authRoutes";
import jobSeekerRoutes from "./routes/jobSeekerRoutes";
import adminRoutes from "./routes/adminRoutes";
import companyRoutes from "./routes/companyRoutes";

//middleware
import authenticateUser from "./middleware/authMiddleware";

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
