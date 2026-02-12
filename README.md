# Broken Authentication Assignment – Fixed Implementation

This repository contains my completed solution to the **Broken Authentication Backend Debugging Assignment**.

The objective was to debug and repair a broken authentication flow and ensure the full session → OTP → JWT → protected route cycle works correctly.

---

## ✅ Summary of Fixes

During debugging, I identified and resolved the following issues:

### 1️⃣ Middleware Flow Issue
- `next()` was missing in middleware.
- This caused requests to hang.
- Fixed by ensuring proper middleware chaining.

### 2️⃣ OTP Verification Handling
- Ensured correct session validation.
- Proper OTP comparison.
- Expired session handling added.

### 3️⃣ Cookie-Based Session Exchange (Critical Fix)
- `/auth/token` was incorrectly reading Authorization headers.
- Updated to correctly read `session_token` from cookies.
- Added `cookieParser()` middleware.

### 4️⃣ JWT Handling
- Implemented secure JWT generation.
- Ensured proper Bearer token validation in protected route middleware.

### 5️⃣ Async Error Handling Bug
- In `tokenGenerator.js`, the catch block was swallowing errors.
- Fixed by logging and rethrowing errors.
- Prevents silent failures and undefined tokens.

### 6️⃣ Environment Configuration
- Added proper `.env` setup.
- Ensured `APPLICATION_SECRET` and `JWT_SECRET` are required.
- Verified dotenv loads correctly.

---

## 🔐 Authentication Flow

The working flow is:

1. **Login**  
   Generates a `loginSessionId` and logs OTP in server console.

2. **Verify OTP**  
   Validates OTP and sets `session_token` cookie.

3. **Token Exchange**  
   Reads session cookie and returns JWT access token.

4. **Protected Route**  
   Validates JWT and returns:
   - Authenticated user
   - Unique success flag

---

## ⚙️ Setup Instructions

### 1️⃣ Create `.env` file in root directory:
`APPLICATION_SECRET=your-secret`
`JWT_SECRET=your-secret`


### 2️⃣ Install dependencies


### 3️⃣ Start server

## Server runs at:

### http://localhost:3000

---

## 🧪 Testing

I tested the complete authentication flow using **Thunder Client (VS Code extension)**.

### Test Sequence:

1. `POST /auth/login`
2. `POST /auth/verify-otp`
3. `POST /auth/token`
4. `GET /protected` (with Bearer token)

All steps successfully return expected responses, including the final `success_flag`.

---

## 🛡️ Security Notes

- HTTP-only session cookies used.
- JWT expiry enforced.
- Middleware validates proper Bearer format.
- Environment secrets excluded from version control.

---

## 📌 Final Result

The backend authentication flow now works end-to-end without errors.

All required tasks from the assignment have been completed and verified.

---

Thank you for reviewing my submission.

### 1️⃣ Create `.env` file in root directory:

