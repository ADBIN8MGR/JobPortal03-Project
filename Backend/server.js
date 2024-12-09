const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');  // Add this line to import cookie-parser
const path = require('path');

// Load environment variables from .env file
dotenv.config();

// Initialize the Express application
const app = express();

// Middleware
app.use(cors());  // Enable CORS for cross-origin requests
app.use(bodyParser.json());  // For parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));  // For parsing application/x-www-form-urlencoded
app.use(cookieParser());  // Add this line to use cookie-parser

// Set the view engine and views directory
app.set('view engine', 'ejs');  // Use EJS as the template engine
app.set('views', path.join(__dirname, '../Frontend/public/views'));  // Correct path to the views directory

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, '../Frontend/public')));  // Correct path to public folder

// Routes
const authRoutes = require('./routes/auth');  // Import authentication routes
const dashboardRoutes = require('./routes/dashboard');  // Import dashboard routes
const jobsRoutes = require("./routes/jobs");

// Use authentication routes for /auth
app.use('/auth', authRoutes);
// Use dashboard routes for /dashboard, only accessible after token verification
app.use('/dashboard', dashboardRoutes);
app.use("/jobs", jobsRoutes);
// Home route
app.get('/', (req, res) => {
    res.render('index');  // Render the index.ejs file
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
