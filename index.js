const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const path = require("path");

const app = express();


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage });


app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


app.post("/form", upload.single("file"), async (req, res) => {
  try {
    let file = req.file ? req.file.filename : null;

    let { reno, snm, bch, sed, adr } = req.body;

    await pool.query(
      `INSERT INTO Registered_details 
      (rollno, student_name, branch, semester, image, address)
      VALUES ($1,$2,$3,$4,$5,$6)`,
      [reno, snm, bch, sed, file, adr]
    );

    console.log("Data Stored Successfully");

    res.redirect("/");
  } catch (error) {
    console.log("Error:", error);
    res.send("Database Error");
  }
});


const PORT = process.env.PORT || 4567;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});