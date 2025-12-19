// backend/controllers/userController.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

// Register
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", err });
    if (results.length > 0) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role],
      (err, result) => {
        if (err) return res.status(500).json({ message: "Database error", err });
        res.status(201).json({ message: "User registered successfully", userId: result.insertId });
      }
    );
  });
};

// Login
export const loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", err });
    if (results.length === 0) return res.status(400).json({ message: "User not found" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        company_id: user.company_id, // included for recruiter/company context
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful", token });
  });
};

// Update Profile
export const updateProfile = (req, res) => {
  const { name, email } = req.body;
  const userId = req.user.userId;

  db.query("UPDATE users SET name = ?, email = ? WHERE id = ?", [name, email, userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", err });
    res.status(200).json({ message: "Profile updated successfully" });
  });
};

// Get all users (recruiter only)
export const getAllUsers = (req, res) => {
  db.query("SELECT id, name, email, role FROM users", (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", err });
    res.status(200).json(results);
  });
};
