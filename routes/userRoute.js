const express = require("express");
const { getUser } = require("../Controllers/userController");
const { authenticateToken } = require("../utilites");



const router = express.Router();

router.get("/get-user", authenticateToken, getUser);

module.exports = router;
