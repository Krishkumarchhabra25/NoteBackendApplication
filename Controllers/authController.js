const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

exports.createAccount = async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ error: true, message: "All fields are required" });
    }

    const isUser = await User.findOne({ email });

    if (isUser) {
        return res.json({ error: true, message: "User already exists" });
    }

    const user = new User({ fullName, email, password });
    await user.save();

    const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "3600m" });

    return res.json({ error: false, user, accessToken, message: "Registration Successful" });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: true, message: "Email and password are required" });
    }

    const userInfo = await User.findOne({ email });

    if (!userInfo || userInfo.password !== password) {
        return res.status(400).json({ error: true, message: "Invalid credentials" });
    }

    const user = { user: userInfo };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "3600m" });

    return res.json({ error: false, message: "Login Successful", email, accessToken });
};
