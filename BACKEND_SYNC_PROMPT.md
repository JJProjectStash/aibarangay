# Backend Sync Requirements for AIBarangay

This document outlines the backend requirements to sync with the frontend. All requirements are current as of December 9, 2025.

---

## 🔴 CRITICAL: JWT Token-Based Authentication

The frontend uses JWT tokens for authentication. Tokens are stored in `localStorage` and sent in the `Authorization: Bearer <token>` header.

### Login Response Format

**Endpoint:** `POST /api/auth/login`

```json
{
  "_id": "user_id_here",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "resident|staff|admin",
  "avatar": "base64_or_url",
  "address": "...",
  "phoneNumber": "...",
  "isVerified": true,
  "idDocumentUrl": "...",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400
}
```

### Token Validation Endpoint

**Endpoint:** `GET /api/auth/me`  
**Purpose:** Validate existing token and return current user data

```javascript
// routes/auth.js
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

### Auth Middleware

```javascript
// middleware/auth.js
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const token = authHeader.replace("Bearer ", "");
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

---

## 🔴 CRITICAL: Role-Based Endpoint Restrictions

Only residents can submit complaints and service requests. Staff and Admin can only review, update, and delete them.

```javascript
// middleware/roleCheck.js
const residentOnly = (req, res, next) => {
  if (req.user.role !== 'resident') {
    return res.status(403).json({ 
      message: 'Only residents can submit requests.'
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
// routes/complaints.js & routes/services.js
router.post('/', auth, residentOnly, createHandler);       // Only residents
router.put('/:id/status', auth, staffOrAdmin, updateHandler); // Staff/Admin only
router.delete('/:id', auth, staffOrAdmin, deleteHandler);     // Staff/Admin only
```

---

## 🔴 CRITICAL: Site Settings Endpoints

The frontend dynamically displays the barangay name and other settings. Changes in admin config should be immediately reflected.

### Admin Settings (Protected)

**Endpoint:** `GET /api/admin/settings`  
**Purpose:** Get full site settings for admin config page

```javascript
router.get("/settings", auth, adminOnly, async (req, res) => {
  const settings = await SiteSettings.findOne() || await SiteSettings.create({
    barangayName: "iBarangay",
    logoUrl: "",
    contactEmail: "",
    contactPhone: "",
    address: ""
  });
  res.json(settings);
});
```

**Endpoint:** `PUT /api/admin/settings`  
**Purpose:** Update site settings

```javascript
router.put("/settings", auth, adminOnly, async (req, res) => {
  const { barangayName, logoUrl, contactEmail, contactPhone, address } = req.body;
  
  const settings = await SiteSettings.findOneAndUpdate(
    {},
    { barangayName, logoUrl, contactEmail, contactPhone, address },
    { new: true, upsert: true }
  );
  
  res.json(settings);
});
```

### Public Settings (No Auth Required)

**Endpoint:** `GET /api/public/settings`  
**Purpose:** Get site settings for unauthenticated users (landing page, sidebar)

> ⚠️ **IMPORTANT:** This endpoint must NOT cache responses. Frontend calls this after settings are updated.

```javascript
router.get("/settings", async (req, res) => {
  const settings = await SiteSettings.findOne() || {
    barangayName: "iBarangay",
    logoUrl: "",
    contactEmail: "",
    contactPhone: "",
    address: ""
  };
  res.json(settings);
});
```

---

## 🟠 HIGH PRIORITY: Notifications

### Get User Notifications

**Endpoint:** `GET /api/notifications`

Returns all notifications for the authenticated user, sorted by creation date (newest first).

### Mark Notification as Read

**Endpoint:** `PUT /api/notifications/:id/read`

```javascript
router.put("/:id/read", auth, async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { isRead: true },
    { new: true }
  );
  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }
  res.json(notification);
});
```

### Mark All as Read

**Endpoint:** `PUT /api/notifications/mark-all-read`

```javascript
router.put("/mark-all-read", auth, async (req, res) => {
  await Notification.updateMany(
    { userId: req.user.id, isRead: false },
    { isRead: true }
  );
  res.json({ message: "All notifications marked as read" });
});
```

### Delete Notification

**Endpoint:** `DELETE /api/notifications/:id`

```javascript
router.delete("/:id", auth, async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id
  });
  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }
  res.json({ message: "Notification deleted" });
});
```

---

## 🟠 HIGH PRIORITY: Status Change Notifications

When a complaint or service request status is updated, create a notification for the user.

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
```

---

## 🟡 MEDIUM PRIORITY: Health Check

**Endpoint:** `GET /api/health`

```javascript
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

---

## 🟡 MEDIUM PRIORITY: Security

### Rate Limiting

```bash
npm install helmet express-rate-limit compression
```

```javascript
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

app.use(helmet());

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use("/api/", limiter);

// Stricter rate limiting for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
```

---

## 📋 API Endpoints Summary

### Public Endpoints (No Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/public/settings` | Site settings |
| GET | `/api/public/events` | Public events |
| GET | `/api/public/announcements` | Public announcements |
| GET | `/api/public/news` | Public news |
| GET | `/api/public/officials` | Barangay officials |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |

### Protected Endpoints (Require Auth)

| Method | Endpoint | Description | Role Restriction |
|--------|----------|-------------|------------------|
| GET | `/api/auth/me` | Current user | All |
| PUT | `/api/auth/profile` | Update profile | All |
| GET | `/api/complaints` | List complaints | All |
| POST | `/api/complaints` | Create complaint | Resident only |
| PUT | `/api/complaints/:id/status` | Update status | Staff/Admin only |
| POST | `/api/complaints/:id/comments` | Add comment | All |
| GET | `/api/services` | List services | All |
| POST | `/api/services` | Create service | Resident only |
| PUT | `/api/services/:id/status` | Update status | Staff/Admin only |
| GET | `/api/events` | List events | All |
| POST | `/api/events/:id/register` | Register for event | All |
| GET | `/api/notifications` | User notifications | All |
| PUT | `/api/notifications/:id/read` | Mark as read | All |
| PUT | `/api/notifications/mark-all-read` | Mark all read | All |
| DELETE | `/api/notifications/:id` | Delete notification | All |

### Admin Endpoints (Require Admin Role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/settings` | Get site settings |
| PUT | `/api/admin/settings` | Update site settings |
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/audit-logs` | View audit logs |

---

## 📝 Environment Variables

```env
# Database
MONGO_URI=mongodb://localhost:27017/aibarangay

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# Server
PORT=5000
NODE_ENV=development

# CORS
CLIENT_URL=http://localhost:5173
```

---

## ✅ Frontend Changes Already Implemented

The frontend has implemented:

1. ✅ Token storage in localStorage
2. ✅ Token expiry checking before API calls
3. ✅ Automatic retry logic with exponential backoff
4. ✅ Session validation on page load (`api.validateSession()`)
5. ✅ **FIXED:** Logout now clears tokens from localStorage
6. ✅ **FIXED:** Site settings refresh uses cache-busting after admin updates
7. ✅ Loading skeletons for all data pages
8. ✅ Empty states with retry functionality
9. ✅ Error states with retry buttons
10. ✅ Client-side login lockout after 5 failed attempts

---

_Last Updated: December 9, 2025_
