const express = require("express");
const { createAccount, login } = require("../Controllers/authController");

const router = express.Router();

router.post("/create-account", createAccount);
router.post("/login", login);

module.exports = router;
