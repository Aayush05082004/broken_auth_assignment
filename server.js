require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const requestLogger = require("./middleware/logger");
const authMiddleware = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory session stores
const loginSessions = {};
const otpStore = {};

// Middleware
app.use(requestLogger);
app.use(express.json());
app.use(cookieParser());

/**
 * Root Route
 */
app.get("/", (req, res) => {
  res.json({
    challenge: "Complete the Authentication Flow",
    flow:
      "Login -> Verify OTP -> Exchange Session Cookie -> Access Protected Route",
  });
});

/**
 * 1️⃣ LOGIN
 * Generates loginSessionId and OTP
 */
app.post("/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password required",
      });
    }

    // Basic password check for assignment
    if (password !== "password123") {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const loginSessionId = Math.random().toString(36).substring(2, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    loginSessions[loginSessionId] = {
      email,
      createdAt: Date.now(),
      expiresAt: Date.now() + 2 * 60 * 1000, // 2 min expiry
    };

    otpStore[loginSessionId] = otp;

    console.log(
      `[OTP] Session ${loginSessionId} generated with OTP: ${otp}`
    );

    return res.status(200).json({
      message: "OTP generated",
      loginSessionId,
    });

  } catch (error) {
    return res.status(500).json({
      error: "Login failed",
    });
  }
});

/**
 * 2️⃣ VERIFY OTP
 * Validates OTP and sets session cookie
 */
app.post("/auth/verify-otp", (req, res) => {
  try {
    const { loginSessionId, otp } = req.body;

    if (!loginSessionId || !otp) {
      return res.status(400).json({
        error: "loginSessionId and otp required",
      });
    }

    const session = loginSessions[loginSessionId];

    if (!session) {
      return res.status(401).json({
        error: "Invalid session",
      });
    }

    if (Date.now() > session.expiresAt) {
      delete loginSessions[loginSessionId];
      delete otpStore[loginSessionId];
      return res.status(401).json({
        error: "Session expired",
      });
    }

    if (otp !== otpStore[loginSessionId]) {
      return res.status(401).json({
        error: "Invalid OTP",
      });
    }

    // Set session cookie
    res.cookie("session_token", loginSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    delete otpStore[loginSessionId];

    return res.status(200).json({
      message: "OTP verified",
    });

  } catch (error) {
    return res.status(500).json({
      error: "OTP verification failed",
    });
  }
});

/**
 * 3️⃣ EXCHANGE SESSION COOKIE FOR JWT
 */
app.post("/auth/token", (req, res) => {
  try {
    const sessionToken = req.cookies.session_token;

    if (!sessionToken) {
      return res.status(401).json({
        error: "Valid session cookie required",
      });
    }

    const session = loginSessions[sessionToken];

    if (!session) {
      return res.status(401).json({
        error: "Invalid session",
      });
    }

    const secret = process.env.JWT_SECRET || "default-secret-key";

    const accessToken = jwt.sign(
      {
        email: session.email,
        sessionId: sessionToken,
      },
      secret,
      { expiresIn: "15m" }
    );

    return res.status(200).json({
      access_token: accessToken,
      expires_in: 900,
    });

  } catch (error) {
    return res.status(500).json({
      error: "Token generation failed",
    });
  }
});

/**
 * 4️⃣ PROTECTED ROUTE
 */
app.get("/protected", authMiddleware, (req, res) => {
  return res.status(200).json({
    message: "Access granted",
    user: req.user,
    success_flag: `FLAG-${Buffer.from(
      req.user.email + "_COMPLETED_ASSIGNMENT"
    ).toString("base64")}`,
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
