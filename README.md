# iBarangay - Online Services Platform (Frontend)

## Overview

iBarangay is a modern web application for barangay residents to access local government services, view announcements, register for events, file complaints, and stay informed about community news. This repository contains the **React/TypeScript frontend** built with Vite.

## Key Features

### For Residents

- **Landing Page**: View public events, announcements, news, and barangay officials without signing in
- **Dashboard**: Personalized overview of services, events, and notifications
- **Services**: Request barangay documents (Barangay Clearance, Indigency Certificate, etc.)
- **Events**: Browse and register for community events
- **Complaints**: File and track complaints
- **Announcements & News**: Stay updated with community information
- **Profile Management**: Update personal info, upload government ID for verification

### For Admins

- **User Management**: View/edit users, approve ID verification
- **Content Management**: Manage announcements, news, events, and services
- **Calendar**: Shared calendar for scheduling
- **Audit Logs**: Track system activities
- **Site Configuration**: Customize barangay info, hotlines, and settings

### Technical Features

- **Toast Notifications**: User-friendly feedback via a global Toast provider
- **Public Endpoints**: Landing page data fetched without authentication
- **Role-Based Views**: Different UI for residents vs admins
- **Responsive Design**: Mobile-friendly with Tailwind CSS

## Project Structure

```
aibarangay/
├── components/
│   ├── SharedCalendar.tsx   # Calendar component
│   ├── Toast.tsx            # Toast notifications provider
│   └── UI.tsx               # Reusable UI components
├── pages/
│   ├── Landing.tsx          # Public landing page
│   ├── Login.tsx / Signup.tsx
│   ├── Dashboard.tsx        # User dashboard
│   ├── Services.tsx         # Service requests
│   ├── Events.tsx           # Community events
│   ├── Complaints.tsx       # File complaints
│   ├── Announcements.tsx    # View announcements
│   ├── News.tsx             # Community news
│   ├── Profile.tsx          # User profile & ID upload
│   ├── Help.tsx / Hotlines.tsx
│   ├── Admin*.tsx           # Admin pages
│   └── NotFound.tsx
├── services/
│   └── api.ts               # API wrapper with public/admin endpoints
├── App.tsx                  # Main app with routing
├── index.tsx                # Entry point with ToastProvider
├── types.ts                 # TypeScript interfaces
├── mockData.ts              # Sample data for development
├── vite.config.ts           # Vite configuration
├── tsconfig.json
├── package.json
└── .env.example             # Environment variables template
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Backend server running (see backend repo)

### Installation

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd aibarangay
   npm install
   ```

2. **Configure environment variables:**

   Create a `.env` file (or `.env.local`) in the root:

   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

   > **Note:** All frontend environment variables must be prefixed with `VITE_` to be accessible in the browser.

3. **Start the development server:**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173` (or the next available port).

4. **Build for production:**
   ```bash
   npm run build
   npm run preview   # Preview the production build
   ```

## Environment Variables

| Variable              | Description                      | Example                     |
| --------------------- | -------------------------------- | --------------------------- |
| `VITE_API_URL`        | Backend API base URL             | `http://localhost:5000/api` |
| `VITE_GEMINI_API_KEY` | Google Gemini API key (optional) | `AIza...`                   |

> **Important:** Use `http://` (not `https://`) for local development unless your backend has SSL configured.

## API Endpoints

The frontend communicates with the backend via `services/api.ts`. Endpoints are split into **public** (no auth required) and **protected** (requires JWT token).

### Public Endpoints (No Authentication)

Used by the landing page and public views:

- `GET /api/public/events` - Get public events
- `GET /api/public/announcements` - Get public announcements
- `GET /api/public/news` - Get public news articles
- `GET /api/public/officials` - Get barangay officials
- `GET /api/public/settings` - Get site settings (name, contact, etc.)

### Protected Endpoints (Requires Login)

**Authentication:**

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

**User Resources:**

- `GET /api/services` - Get available services
- `POST /api/services/request` - Submit service request
- `GET /api/events` - Get events (with registration info)
- `POST /api/events/:id/register` - Register for event
- `GET /api/complaints` - Get user complaints
- `POST /api/complaints` - File new complaint

**Admin Only:**

- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `GET /api/admin/audit-logs` - View audit logs
- `PUT /api/admin/settings` - Update site settings

## Validation Rules

### User Registration

| Field           | Rule                                       |
| --------------- | ------------------------------------------ |
| First/Last Name | 2-50 characters, letters only              |
| Email           | Valid email format                         |
| Password        | Min 8 chars, uppercase, lowercase, number  |
| Phone           | 09XXXXXXXXX (11 digits, Philippine format) |
| Address         | Max 200 characters                         |

### File Uploads

| Type          | Max Size | Formats       |
| ------------- | -------- | ------------- |
| Avatar        | 4MB      | JPG, PNG, GIF |
| Government ID | 5MB      | JPG, PNG, GIF |

## Toast Notifications

The app uses a global Toast system for user feedback. To show a toast in any component:

```tsx
import { useToast } from "../components/Toast";

function MyComponent() {
  const { showToast } = useToast();

  const handleAction = () => {
    showToast("Operation successful!", "success");
    // Types: 'success' | 'error' | 'info' | 'warning'
  };
}
```

## Troubleshooting

### Common Issues

**1. "401 Unauthorized" on Landing Page**

- The landing page should use public endpoints (`/api/public/*`)
- Ensure your backend has the public routes configured
- Check that `services/api.ts` uses `getPublicEvents()`, `getPublicAnnouncements()`, etc.

**2. CORS Errors**

- Verify `CLIENT_URL` in backend `.env` matches your frontend URL
- For local dev, backend should allow `http://localhost:5173`

**3. API Connection Failed**

- Ensure backend is running on the correct port
- Check `VITE_API_URL` uses `http://` not `https://` for local dev
- Verify the API URL ends with `/api` (e.g., `http://localhost:5000/api`)

**4. Repeated API Requests (Fetch Spam)**

- Check browser console for React re-render loops
- Ensure `useEffect` dependencies are stable (use `useCallback`/`useMemo`)
- Verify fetch functions have guards against concurrent calls

**5. Toast Not Showing**

- Ensure `<ToastProvider>` wraps the app in `index.tsx`
- Check that `useToast()` is called inside a component within the provider

**6. File Upload Fails**

- Check file size limits (4MB avatar, 5MB ID)
- Ensure correct file format (images only)
- Verify backend accepts base64 encoded files

**7. Verification Not Updating**

- Clear browser cache
- Check network tab for API errors
- Verify admin role permissions

## Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start development server |
| `npm run build`   | Build for production     |
| `npm run preview` | Preview production build |
| `npm run lint`    | Run ESLint               |

## Tech Stack

- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Routing:** React Router DOM
- **State:** React hooks (useState, useEffect, useContext)
- **API:** Fetch API with custom wrapper

## License

This project is part of the iBarangay Online Services platform.
