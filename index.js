const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const path = require("path");

const app = express();

/* Database Connection */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

/* File Upload */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

/* Middleware */
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/* Home Page */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* Form Submit */
app.post("/form", upload.single("file"), async (req, res) => {
  try {
    const file = req.file ? req.file.filename : null;

    const { reno, snm, bch, sed, adr } = req.body;

    await pool.query(
        `INSERT INTO Registered_details
        (Registeration_no, Student_name, Batch, Department, Upload_resume, Address)
        VALUES ($1,$2,$3,$4,$5,$6)`,
        [reno, snm, bch, sed, file, adr]
        );

    console.log("Data Stored Successfully");

    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.send("Database Error");
  }
});

/* Server Start */
const PORT = process.env.PORT || 4567;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});