require("dotenv").config(); // Load environment variables

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const catalogRouter = require("./routes/catalog");
const compression = require("compression");
const helmet = require("helmet");

const app = express();

app.set("trust proxy", 1); // Percayai proxy pertama (Railway, Heroku, dll.)
// Set up rate limiter: maximum of twenty requests per minute
const RateLimit = require("express-rate-limit");
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
});

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression()); // Compress all routes
// Add helmet to the middleware chain.
// Set CSP headers to allow our Bootstrap and jQuery to be served
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net"],
    },
  })
);
// Apply rate limiter to all requests
app.use(limiter);
app.use(express.static(path.join(__dirname, "public")));

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Routers
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/catalog", catalogRouter);

module.exports = app;
