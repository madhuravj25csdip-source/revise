const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const Farmer = require("../models/Farmer"); // your DB model

const SALT_ROUNDS = 12;

router.post("/register", async (req, res) => {
  try {
    const {
      fullName,
      mobile,
      email,
      password,
      village,
      district,
      state,
      preferredLanguage,
    } = req.body;

    // ---- Server-side validation (never trust the client) ----
    if (!fullName || fullName.trim().length < 3) {
      return res.status(400).json({ field: "fullName", message: "Full name is required (min 3 characters)." });
    }
    if (!/^[6-9]\d{9}$/.test((mobile || "").trim())) {
      return res.status(400).json({ field: "mobile", message: "Enter a valid 10-digit mobile number." });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ field: "email", message: "Invalid email address." });
    }
    if (!password || password.length < 8 || !/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      return res.status(400).json({ field: "password", message: "Password must be at least 8 characters and contain letters and numbers." });
    }
    if (!village?.trim() || !district?.trim() || !state) {
      return res.status(400).json({ message: "Village, district and state are required." });
    }

    // ---- Duplicate check ----
    const existing = await Farmer.findOne({ mobile: mobile.trim() });
    if (existing) {
      return res.status(409).json({ field: "mobile", message: "This mobile number is already registered." });
    }
    if (email) {
      const emailExists = await Farmer.findOne({ email: email.toLowerCase().trim() });
      if (emailExists) {
        return res.status(409).json({ field: "email", message: "This email is already registered." });
      }
    }

    // ---- Hash password ----
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // ---- Save farmer ----
    const farmer = await Farmer.create({
      fullName: fullName.trim(),
      mobile: mobile.trim(),
      email: email ? email.toLowerCase().trim() : null,
      passwordHash,          // NEVER store plaintext
      village: village.trim(),
      district: district.trim(),
      state,
      preferredLanguage: preferredLanguage || "en",
    });

    // Never send passwordHash back
    return res.status(201).json({
      message: "Registration successful. Please log in.",
      farmerId: farmer._id,
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
});

module.exports = router;