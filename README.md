# iBarangay Online Services Platform

A comprehensive web-based platform for barangay (community) management, enabling residents to access services, file complaints, register for events, and stay informed about community announcements.

## Features

### For Residents
- **Dashboard**: Overview of personal requests, complaints, and upcoming events
- **Service Requests**: Request equipment (chairs, tables, tents) or facility bookings (basketball court, multi-purpose hall)
- **Complaints Management**: File and track complaints with photo evidence and real-time updates
- **Events Registration**: Browse and register for community events
- **Announcements**: Stay updated with official barangay announcements
- **Profile Management**: Update personal information and verify identity

### For Staff & Admin
- **Request Management**: Approve/reject service requests with notes
- **Complaint Resolution**: Track and resolve resident complaints
- **Content Management**: Manage news, events, announcements, hotlines, and FAQs
- **User Management**: View and manage resident accounts
- **Audit Logs**: Track all system activities
- **System Configuration**: Customize barangay information and settings

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Recharts** for data visualization
- **date-fns** for date manipulation

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **PDFKit** for report generation

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or pnpm

### Backend Setup

1. Navigate to the backend directory:
```bash
cd aibarangay-be
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ibarangay
JWT_SECRET=your_secure_random_string_here
CLIENT_URL=http://localhost:5173
```

5. Seed the database with sample data (optional):
```bash
npm run seed
```

6. Start the development server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd aibarangay
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Create a `.env` file:
```bash
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

4. Start the development server:
```bash
npm run dev
# or
pnpm run dev
```

The frontend will be available at `http://localhost:5173`

## Demo Accounts

After seeding the database, you can use these demo accounts:

- **Admin**: admin@ibarangay.com
- **Staff**: staff@ibarangay.com
- **Resident**: resident@ibarangay.com

(Password authentication is optional in demo mode - just enter the email)

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Complaints Endpoints
- `GET /api/complaints` - Get all complaints (filtered by role)
- `POST /api/complaints` - Create new complaint
- `PUT /api/complaints/:id/status` - Update complaint status (Staff/Admin)
- `POST /api/complaints/:id/comments` - Add comment to complaint

### Services Endpoints
- `GET /api/services` - Get all service requests (filtered by role)
- `POST /api/services` - Create new service request
- `PUT /api/services/:id/status` - Update service status (Staff/Admin)

### Events Endpoints
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event (Staff/Admin)
- `POST /api/events/:id/register` - Register for event
- `GET /api/events/:id/registered` - Get registered users (Staff/Admin)
- `DELETE /api/events/:id` - Delete event (Admin)

### Public Endpoints (No Authentication Required)
- `GET /api/public/events` - Get public events
- `GET /api/public/announcements` - Get public announcements
- `GET /api/public/news` - Get public news
- `GET /api/public/officials` - Get barangay officials
- `GET /api/public/settings` - Get site settings

## Input Validation

The platform implements comprehensive input validation on both frontend and backend:

### Frontend Validation
- Real-time validation feedback
- Character limits and format restrictions
- Pattern matching for phone numbers, emails, etc.
- Date validation for service requests

### Backend Validation
- express-validator for all API endpoints
- Sanitization of user inputs
- Type checking and format validation
- Business logic validation (e.g., dates, status transitions)

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control (RBAC)
- Input sanitization and validation
- CORS configuration
- Audit logging for all critical actions
- File size limits for uploads

## Project Structure

```
aibarangay/
├── components/          # Reusable UI components
├── pages/              # Page components
├── services/           # API service layer
├── types.ts            # TypeScript type definitions
└── App.tsx             # Main application component

aibarangay-be/
├── config/             # Configuration files
├── middleware/         # Express middleware
├── models/             # Mongoose models
├── routes/             # API routes
├── scripts/            # Utility scripts (seeding, etc.)
├── utils/              # Helper functions
└── server.js           # Express server entry point
```

## Development

### Running Tests
```bash
# Backend
cd aibarangay-be
npm test

# Frontend
cd aibarangay
npm test
```

### Building for Production

Frontend:
```bash
cd aibarangay
npm run build
```

Backend:
```bash
cd aibarangay-be
# Set NODE_ENV=production in .env
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For issues and questions, please open an issue on GitHub or contact the development team.

## Acknowledgments

- Built with modern web technologies
- Designed for Philippine barangay communities
- Inspired by digital governance initiatives