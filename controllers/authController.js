const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const bcrypt = require("bcrypt");
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

const register = async (req, res) => {
  console.log("Register request received");
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Render registration page again with error messages
      return res.status(400).render("auth/register", { errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).render("auth/register", {
        errors: [{ msg: "User already exists with this email" }],
      });
    }

    // Hash the password
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await User.create({
      name,
      email,
      password,
      role: role || "user",
    });

    // Redirect to login page after successful registration
    res.render("auth/login");
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).render("register", {
      errors: [{ msg: "Server error during registration" }],
    });
  }
};



const login = async (req, res) => {
  console.log("Login request received");
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("auth/login", { errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).render("auth/login", {
        errors: [{ msg: "Invalid credentials" }],
      });
    }
     console.log("User found:", user);
    // Compare password using bcrypt
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).render("auth/login", {
        errors: [{ msg: "Invalid credentials" }],
      });
    }
    console.log("Password matched for user:", user.email);
    // Generate JWT token
    const token = generateToken(user._id);
    // console.log("Generated token:", token);

    // Store token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // use true in production (https)
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    // Set user in request for further use
    req.flash("success_msg", "Login successful");
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).render("auth/login", {
      errors: [{ msg: "Server error during login" }],
    });
  }
};

const logout = (req, res) => {
  // Clear the cookie
  res.clearCookie("token");
  req.flash("success_msg", "Logged out successfully");
  res.redirect("/login");
};
// router.post("/logout", (req, res) => {
//   res.clearCookie("token");
//   req.flash("success_msg", "Logged out successfully");
//   res.redirect("/login");
// });

module.exports = {
  register,
  login,
  logout
};