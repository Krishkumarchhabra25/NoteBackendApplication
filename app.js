require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoute");
const userRoutes = require("./routes/userRoute");

const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
    res.json({ data: "Hello" });
});

module.exports = app;
