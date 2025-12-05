# Backend Sync Requirements for AIBarangay

This document outlines the backend changes required to sync with frontend improvements and ensure optimal performance, security, and reliability.

---

## 🔴 CRITICAL: Token-Based Session Persistence (HIGH PRIORITY)

The frontend needs to persist user sessions across page refreshes. Currently, users are logged out when the page is refreshed. Implement the following:

### Token Storage & Validation Flow

```javascript
// Frontend will store token in localStorage after login
// On page load, frontend will call /api/auth/me to validate the token
// If valid, user remains logged in
// If invalid/expired, user is redirected to login

// Expected login response format:
{
  "user": {
    "id": "...",
    "email": "...",
    "firstName": "...",
    "lastName": "...",
    "role": "resident|staff|admin",
    "avatar": "...",
    // ... other user fields
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400 // 24 hours in seconds
}
```

### Login Endpoint Update

**Endpoint:** `POST /api/auth/login`  
**Response should include token with expiration:**

```javascript
// routes/auth.js - Updated login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT with expiration
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" } // Token expires in 24 hours
    );

    // Return user data (without password) and token
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      user: userResponse,
      token,
      expiresIn: 86400 // 24 hours in seconds
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
```

### Token Refresh Endpoint (Optional but Recommended)

**Endpoint:** `POST /api/auth/refresh`  
**Purpose:** Refresh token before it expires

```javascript
// routes/auth.js - Token refresh endpoint
router.post("/refresh", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate new token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      user,
      token,
      expiresIn: 86400
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
```

### Auth Middleware Update

```javascript
// middleware/auth.js
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        message: "Token expired", 
        code: "TOKEN_EXPIRED" 
      });
    }
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = auth;
```

### Environment Variables Required

```env
JWT_SECRET=your-super-secret-key-here-change-in-production
JWT_EXPIRES_IN=24h
```

> ⚠️ **IMPORTANT:** The frontend will store the token in `localStorage` and send it in the `Authorization: Bearer <token>` header for all authenticated requests. Make sure all protected routes use the `auth` middleware.

---

## 🔴 CRITICAL: Role-Based Endpoint Restrictions

**Problem:** Admin and Staff should NOT be able to submit complaints or service requests. They should only be able to review, update, and delete them. Only Residents can submit new requests.

### Middleware Implementation

```javascript
// middleware/roleCheck.js
const residentOnly = (req, res, next) => {
  if (req.user.role !== 'resident') {
    return res.status(403).json({ 
      message: 'Only residents can submit requests. Admins and staff can only manage existing requests.'
    });
  }
  next();
};

const staffOrAdmin = (req, res, next) => {
  if (!['staff', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ 
      message: 'Only staff and admin can perform this action'
    });
  }
  next();
};

module.exports = { residentOnly, staffOrAdmin };
```

### Apply to Routes

```javascript
// routes/complaints.js
const { residentOnly, staffOrAdmin } = require('../middleware/roleCheck');

// Only residents can CREATE complaints
router.post('/', auth, residentOnly, async (req, res) => { ... });

// Staff/Admin can UPDATE status
router.put('/:id/status', auth, staffOrAdmin, async (req, res) => { ... });

// Staff/Admin can DELETE (or restrict to admin only if preferred)
router.delete('/:id', auth, staffOrAdmin, async (req, res) => { ... });


// routes/services.js
const { residentOnly, staffOrAdmin } = require('../middleware/roleCheck');

// Only residents can CREATE service requests
router.post('/', auth, residentOnly, async (req, res) => { ... });

// Staff/Admin can UPDATE status
router.put('/:id/status', auth, staffOrAdmin, async (req, res) => { ... });

// Staff/Admin can DELETE
router.delete('/:id', auth, staffOrAdmin, async (req, res) => { ... });
```

> ⚠️ **IMPORTANT:** The frontend already hides the "New Request" and "File Complaint" buttons for admin/staff. This backend middleware provides a security layer to prevent direct API calls from bypassing the UI restrictions.

---

## 🟡 NEW: Overdue Service Notifications

**Purpose:** Automatically notify users when their borrowed items are overdue or approaching due date.

### Backend Requirements

```javascript
// Scheduled job (run daily at 8 AM) - Use node-cron or similar
const cron = require('node-cron');

// Check for overdue and due soon services
cron.schedule('0 8 * * *', async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Find overdue items (borrowed/approved and past expectedReturnDate)
  const overdueServices = await Service.find({
    status: { $in: ['borrowed', 'approved'] },
    expectedReturnDate: { $lt: today }
  }).populate('userId');
  
  for (const service of overdueServices) {
    await Notification.create({
      userId: service.userId._id,
      title: '⚠️ Overdue Return Notice',
      message: `Your request for "${service.itemName}" is overdue. Please return it as soon as possible.`,
      type: 'warning',
      relatedType: 'service',
      relatedId: service._id
    });
  }
  
  // Find items due within 2 days
  const twoDaysFromNow = new Date(today);
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
  
  const dueSoonServices = await Service.find({
    status: { $in: ['borrowed', 'approved'] },
    expectedReturnDate: { $gte: today, $lte: twoDaysFromNow }
  }).populate('userId');
  
  for (const service of dueSoonServices) {
    const daysUntilDue = Math.ceil((new Date(service.expectedReturnDate) - today) / (1000 * 60 * 60 * 24));
    await Notification.create({
      userId: service.userId._id,
      title: '📅 Return Reminder',
      message: `Your request for "${service.itemName}" is due ${daysUntilDue === 0 ? 'today' : `in ${daysUntilDue} day(s)`}.`,
      type: 'info',
      relatedType: 'service',
      relatedId: service._id
    });
  }
});
```

---

## 🟡 NEW: Status Change Notifications

**Purpose:** Notify users when their complaint or service request status changes.

### Trigger on Status Update

```javascript
// In routes/complaints.js - updateStatus endpoint
router.put('/:id/status', auth, staffOrAdmin, async (req, res) => {
  const { status, note } = req.body;
  const complaint = await Complaint.findByIdAndUpdate(
    req.params.id,
    { status, updatedAt: new Date() },
    { new: true }
  );
  
  // Create notification for status change
  await Notification.create({
    userId: complaint.userId,
    title: `Complaint Status Updated`,
    message: `Your complaint "${complaint.title}" is now ${status}.${note ? ` Note: ${note}` : ''}`,
    type: status === 'resolved' ? 'success' : 'info',
    relatedType: 'complaint',
    relatedId: complaint._id
  });
  
  res.json(complaint);
});

// Same pattern for services
router.put('/:id/status', auth, staffOrAdmin, async (req, res) => {
  const { status, note } = req.body;
  const service = await Service.findByIdAndUpdate(
    req.params.id,
    { status, updatedAt: new Date() },
    { new: true }
  );
  
  await Notification.create({
    userId: service.userId,
    title: `Service Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: `Your request for "${service.itemName}" has been ${status}.`,
    type: status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'info',
    relatedType: 'service',
    relatedId: service._id
  });
  
  res.json(service);
});
```

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
- **NEW:** Provide `PUT /api/notifications/:id/read` endpoint to mark individual notification as read
- **NEW:** Provide `DELETE /api/notifications/:id` endpoint to delete individual notification

---

### Notification Endpoints Required

#### Mark Individual Notification as Read

**Endpoint:** `PUT /api/notifications/:id/read`

```javascript
// routes/notifications.js
router.put("/:id/read", auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
```

#### Delete Individual Notification

**Endpoint:** `DELETE /api/notifications/:id`

```javascript
router.delete("/:id", auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
```

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
