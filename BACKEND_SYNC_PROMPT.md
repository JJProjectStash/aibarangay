# Backend Sync Requirements for AIBarangay

This document outlines the backend changes required to sync with frontend improvements and ensure optimal performance, security, and reliability.

---

## 🔴 CRITICAL: New Endpoints Required

### 1. Health Check Endpoint

**Endpoint:** `GET /api/health`  
**Purpose:** Monitor backend availability and for frontend to check connectivity

```javascript
// routes/public.js - Add health check
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || "1.0.0",
  });
});
```

### 2. Session Validation Endpoint

**Endpoint:** `GET /api/auth/me`  
**Purpose:** Validate existing token and return current user data

```javascript
// routes/auth.js - Add session validation
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
```

### 3. Login Attempt Tracking (Server-side Lockout)

**Purpose:** Server-side login attempt tracking to complement frontend lockout

```javascript
// models/User.js - Add lockout fields
const UserSchema = new mongoose.Schema({
  // ... existing fields
  loginAttempts: { type: Number, default: 0 },
  lockoutUntil: { type: Date, default: null },
  lastFailedLogin: { type: Date, default: null },
});

// Method to check if user is locked out
UserSchema.methods.isLockedOut = function () {
  return this.lockoutUntil && this.lockoutUntil > Date.now();
};

// Method to increment login attempts
UserSchema.methods.incrementLoginAttempts = async function () {
  const LOCKOUT_CONFIG = {
    maxAttempts: 5,
    lockoutDuration: 5 * 60 * 1000, // 5 minutes
  };

  this.loginAttempts += 1;
  this.lastFailedLogin = new Date();

  if (this.loginAttempts >= LOCKOUT_CONFIG.maxAttempts) {
    this.lockoutUntil = new Date(Date.now() + LOCKOUT_CONFIG.lockoutDuration);
  }

  await this.save();
};

// Method to reset login attempts on successful login
UserSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockoutUntil = null;
  this.lastFailedLogin = null;
  await this.save();
};
```

```javascript
// routes/auth.js - Update login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user is locked out
    if (user.isLockedOut()) {
      const remainingTime = Math.ceil(
        (user.lockoutUntil - Date.now()) / 1000 / 60
      );
      return res.status(423).json({
        message: `Account temporarily locked. Try again in ${remainingTime} minutes.`,
        lockoutUntil: user.lockoutUntil,
        isLockedOut: true,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      await user.incrementLoginAttempts();

      const remainingAttempts = 5 - user.loginAttempts;
      return res.status(401).json({
        message: "Invalid credentials",
        remainingAttempts: Math.max(0, remainingAttempts),
      });
    }

    // Reset attempts on successful login
    await user.resetLoginAttempts();

    // Generate token and return user data...
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
```

---

## 🟠 HIGH PRIORITY: Security Improvements

### 4. Install Security Packages

```bash
npm install helmet express-rate-limit express-validator compression morgan
```

### 5. Add Security Middleware to server.js

```javascript
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const morgan = require("morgan");

// Security headers
app.use(helmet());

// Response compression
app.use(compression());

// Request logging
app.use(morgan("combined"));

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { message: "Too many login attempts, please try again later." },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
```

### 6. Input Validation Middleware

```javascript
// middleware/validate.js
const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

module.exports = validate;
```

### 7. Add Validation to Auth Routes

```javascript
// routes/auth.js
const { body } = require("express-validator");
const validate = require("../middleware/validate");

router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    validate,
  ],
  loginController
);

router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("firstName").trim().notEmpty(),
    body("lastName").trim().notEmpty(),
    validate,
  ],
  registerController
);
```

---

## 🟡 MEDIUM PRIORITY: Performance Improvements

### 8. Add Database Indexes

```javascript
// models/Complaint.js - Add indexes for frequent queries
ComplaintSchema.index({ userId: 1 });
ComplaintSchema.index({ status: 1 });
ComplaintSchema.index({ createdAt: -1 });
ComplaintSchema.index({ category: 1, status: 1 });

// models/ServiceRequest.js
ServiceRequestSchema.index({ userId: 1 });
ServiceRequestSchema.index({ status: 1 });
ServiceRequestSchema.index({ createdAt: -1 });

// models/Event.js
EventSchema.index({ eventDate: 1 });
EventSchema.index({ status: 1 });

// models/Notification.js
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

// models/AuditLog.js
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ userId: 1 });
AuditLogSchema.index({ action: 1 });
```

### 9. Add Pagination Limits

```javascript
// middleware/pagination.js
const paginate =
  (defaultLimit = 50, maxLimit = 100) =>
  (req, res, next) => {
    let limit = parseInt(req.query.limit) || defaultLimit;
    limit = Math.min(limit, maxLimit);

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const skip = (page - 1) * limit;

    req.pagination = { limit, skip, page };
    next();
  };

module.exports = paginate;
```

### 10. Response Caching for Public Endpoints

```javascript
// middleware/cache.js
const cache = new Map();

const cacheMiddleware =
  (duration = 60) =>
  (req, res, next) => {
    const key = req.originalUrl;
    const cached = cache.get(key);

    if (cached && Date.now() - cached.timestamp < duration * 1000) {
      return res.json(cached.data);
    }

    const originalJson = res.json.bind(res);
    res.json = (data) => {
      cache.set(key, { data, timestamp: Date.now() });
      return originalJson(data);
    };

    next();
  };

// Usage in routes/public.js
router.get("/site-settings", cacheMiddleware(300), getSiteSettings); // 5 min cache
router.get("/announcements", cacheMiddleware(60), getAnnouncements); // 1 min cache
```

---

## 🟢 NICE TO HAVE: Reliability Improvements

### 11. Graceful Shutdown

```javascript
// server.js - Add graceful shutdown handling
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  server.close(() => {
    console.log("HTTP server closed");

    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed");
      process.exit(0);
    });
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error("Forcing shutdown...");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
```

### 12. Database Connection Retry

```javascript
// config/db.js - Add connection retry logic
const connectDB = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(
        `MongoDB connection attempt ${i + 1} failed:`,
        error.message
      );
      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  console.error("Failed to connect to MongoDB after all retries");
  process.exit(1);
};
```

### 13. Request Timeout Middleware

```javascript
// middleware/timeout.js
const timeout =
  (seconds = 30) =>
  (req, res, next) => {
    req.setTimeout(seconds * 1000, () => {
      if (!res.headersSent) {
        res.status(408).json({ message: "Request timeout" });
      }
    });
    next();
  };

// Usage in server.js
app.use(timeout(30));
```

---

## 🔵 API VERSIONING (Future-proofing)

### 14. Add API Versioning

```javascript
// server.js
const v1Routes = require("./routes/v1");

// Current routes (backward compatible)
app.use("/api", require("./routes"));

// Versioned routes
app.use("/api/v1", v1Routes);

// routes/v1/index.js
const router = require("express").Router();
router.use("/auth", require("./auth"));
router.use("/complaints", require("./complaints"));
// ... other routes
module.exports = router;
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Critical (Do First)

- [ ] Add `GET /api/health` endpoint
- [ ] Add `GET /api/auth/me` endpoint
- [ ] Install and configure `helmet`
- [ ] Add rate limiting to auth routes

### Phase 2: Security

- [ ] Install `express-validator`
- [ ] Add input validation to all routes
- [ ] Add global rate limiting
- [ ] Review and sanitize all user inputs

### Phase 3: Performance

- [ ] Add database indexes
- [ ] Install and configure `compression`
- [ ] Add pagination limits
- [ ] Add caching for public endpoints

### Phase 4: Reliability

- [ ] Add graceful shutdown handling
- [ ] Add database connection retry
- [ ] Add request timeout middleware
- [ ] Add request logging with `morgan`

---

## 🚀 Quick Start Commands

```bash
# Install all recommended packages
npm install helmet express-rate-limit express-validator compression morgan

# Run database index creation
node scripts/createIndexes.js
```

---

## 📝 Environment Variables to Add

```env
# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5

# Caching
CACHE_TTL_SECONDS=60

# Timeouts
REQUEST_TIMEOUT_SECONDS=30
DB_CONNECTION_RETRIES=5

# Lockout Configuration
LOGIN_MAX_ATTEMPTS=5
LOGIN_LOCKOUT_DURATION_MS=300000
```

---

## 🔗 Frontend Changes Already Implemented

The frontend has been updated with:

### Authentication & Security

1. ✅ Token expiry checking before API calls
2. ✅ Automatic retry logic with exponential backoff for transient errors
3. ✅ Health check API method (`api.healthCheck()`)
4. ✅ Session validation method (`api.validateSession()`)
5. ✅ **NEW:** Client-side login lockout after 5 failed attempts (5-minute lockout)
6. ✅ **NEW:** Visual countdown timer during lockout period
7. ✅ **NEW:** Login attempt warning notifications

### UX Improvements

8. ✅ Escape key support for closing modals
9. ✅ Click outside to close modals
10. ✅ **NEW:** Loading skeletons for Events, Hotlines, Announcements, and Notifications pages
11. ✅ **NEW:** Empty states with icons and descriptions for all data lists
12. ✅ **NEW:** Error states with retry functionality
13. ✅ **NEW:** Export button loading states (CSV/PDF) with visual feedback
14. ✅ **NEW:** Pin/unpin button loading state for announcements

### Hooks

15. ✅ `useEscapeKey`, `useKeyboardShortcut`, `useClickOutside`, `useRetry`, `useLocalStorage`

These frontend changes expect the backend to:

- Return proper HTTP status codes (especially 401, 408, 423 for lockout, 429, 500, 502, 503, 504)
- Provide the `/api/health` endpoint
- Provide the `/api/auth/me` endpoint
- Include `exp` claim in JWT tokens
- **NEW:** Return `423 Locked` status when user is locked out server-side
- **NEW:** Include `lockoutUntil`, `isLockedOut`, and `remainingAttempts` in login error responses

---

## 📋 UPDATED IMPLEMENTATION CHECKLIST

### Phase 1: Critical (Do First)

- [ ] Add `GET /api/health` endpoint
- [ ] Add `GET /api/auth/me` endpoint
- [ ] Add login attempt tracking fields to User model (`loginAttempts`, `lockoutUntil`, `lastFailedLogin`)
- [ ] Update login endpoint to track failed attempts and return `423 Locked` when appropriate
- [ ] Install and configure `helmet`
- [ ] Add rate limiting to auth routes

### Phase 2: Security

- [ ] Install `express-validator`
- [ ] Add input validation to all routes
- [ ] Add global rate limiting
- [ ] Review and sanitize all user inputs

### Phase 3: Performance

- [ ] Add database indexes
- [ ] Install and configure `compression`
- [ ] Add pagination limits
- [ ] Add caching for public endpoints

### Phase 4: Reliability

- [ ] Add graceful shutdown handling
- [ ] Add database connection retry
- [ ] Add request timeout middleware
- [ ] Add request logging with `morgan`

---

_Last Updated: December 5, 2025_
