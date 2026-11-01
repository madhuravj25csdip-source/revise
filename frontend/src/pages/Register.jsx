import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "ta", label: "தமிழ் (Tamil)" },
  { code: "te", label: "తెలుగు (Telugu)" },
  { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
  { code: "ml", label: "മലയാളം (Malayalam)" },
  { code: "mr", label: "मराठी (Marathi)" },
  { code: "bn", label: "বাংলা (Bengali)" },
  { code: "gu", label: "ગુજરાતી (Gujarati)" },
  { code: "pa", label: "ਪੰਜਾਬੀ (Punjabi)" },
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab", "Rajasthan",
  "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
    village: "",
    district: "",
    state: "",
    language: "en",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear the field error when the user edits it
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};

    if (!form.fullName.trim() || form.fullName.trim().length < 3) {
      errs.fullName = "Full name is required (min 3 characters).";
    }

    // Indian mobile: 10 digits, starting 6-9
    if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) {
      errs.mobile = "Enter a valid 10-digit mobile number.";
    }

    // Email is optional, but validate if provided
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = "Enter a valid email address.";
    }

    // Password strength: min 8, at least one letter and one number
    if (form.password.length < 8) {
      errs.password = "Password must be at least 8 characters.";
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(form.password)) {
      errs.password = "Password must contain letters and numbers.";
    }

    if (form.password !== form.confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }

    if (!form.village.trim()) errs.village = "Village name is required.";
    if (!form.district.trim()) errs.district = "District is required.";
    if (!form.state) errs.state = "Please select a state.";
    if (!form.language) errs.language = "Please select a language.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      // NOTE: never hash the password in the browser.
      // Send it over HTTPS; the server hashes it with bcrypt before saving.
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          mobile: form.mobile.trim(),
          email: form.email.trim() || null,
          password: form.password,
          village: form.village.trim(),
          district: form.district.trim(),
          state: form.state,
          preferredLanguage: form.language,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.field && data.message) {
          setErrors((prev) => ({ ...prev, [data.field]: data.message }));
        } else {
          setServerError(data.message || "Registration failed. Please try again.");
        }
        return;
      }

      // Success → redirect to login
      navigate("/login", {
        state: { registered: true, mobile: form.mobile.trim() },
      });
    } catch (err) {
      setServerError("Network error. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit} noValidate>
        <h2>Farmer Registration</h2>

        {serverError && <p className="server-error">{serverError}</p>}

        <label>
          Full Name *
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="e.g. Ramesh Kumar"
          />
          {errors.fullName && <span className="error">{errors.fullName}</span>}
        </label>

        <label>
          Mobile Number *
          <input
            type="tel"
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            placeholder="10-digit mobile number"
            maxLength={10}
            inputMode="numeric"
          />
          {errors.mobile && <span className="error">{errors.mobile}</span>}
        </label>

        <label>
          Email Address (optional)
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </label>

        <label>
          Password *
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Min 8 characters, letters + numbers"
          />
          {errors.password && <span className="error">{errors.password}</span>}
        </label>

        <label>
          Confirm Password *
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter password"
          />
          {errors.confirmPassword && (
            <span className="error">{errors.confirmPassword}</span>
          )}
        </label>

        <label>
          Village Name *
          <input
            type="text"
            name="village"
            value={form.village}
            onChange={handleChange}
            placeholder="e.g. Kothapalli"
          />
          {errors.village && <span className="error">{errors.village}</span>}
        </label>

        <label>
          District *
          <input
            type="text"
            name="district"
            value={form.district}
            onChange={handleChange}
            placeholder="e.g. Krishna"
          />
          {errors.district && <span className="error">{errors.district}</span>}
        </label>

        <label>
          State *
          <select name="state" value={form.state} onChange={handleChange}>
            <option value="">-- Select State --</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.state && <span className="error">{errors.state}</span>}
        </label>

        <label>
          Preferred Language *
          <select name="language" value={form.language} onChange={handleChange}>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
          {errors.language && <span className="error">{errors.language}</span>}
        </label>

        <button type="submit" disabled={submitting}>
          {submitting ? "Registering..." : "Register"}
        </button>

        <p className="login-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
}