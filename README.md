# iBarangay - User Verification System

## Overview
This project implements a complete user management and verification system for the iBarangay platform, allowing residents to upload government IDs for identity verification.

## Key Features Implemented

### 1. Government ID Upload
- **User Profile**: Residents can upload their government ID (UMID, Driver's License, Passport, etc.) from their profile page
- **File Validation**: Automatic validation for file size (max 5MB) and format
- **Visual Preview**: Users can preview their uploaded ID before submission
- **Status Tracking**: Clear indicators showing verification status (Verified/Unverified/Pending)

### 2. Admin Verification Dashboard
- **User Management**: Comprehensive admin panel to view all users
- **Filtering**: Quick filters for All Users, Pending Verification, Staff, and Admins
- **ID Review**: Admins can view uploaded government IDs in high quality
- **One-Click Verification**: Approve or reject verification with a single click
- **Audit Trail**: All verification actions are logged for accountability

### 3. Backend API Enhancements
- **Secure Upload**: Base64 image handling with size validation
- **Dynamic Updates**: Real-time synchronization between frontend and backend
- **Audit Logging**: Automatic logging of ID uploads and verification actions
- **Role Management**: Admins can update user roles and verification status

### 4. Data Validation & Security
- **Input Validation**: Comprehensive validation for all user inputs
- **Phone Number**: Philippine format validation (09XXXXXXXXX)
- **Name Fields**: Only letters, spaces, dots, and dashes allowed
- **Address**: Maximum 200 characters with proper sanitization
- **File Size Limits**: 4MB for avatars, 5MB for ID documents

## Project Structure

```
aibarangay/
├── aibarangay-backend/
│   ├── models/
│   │   └── User.js (Updated with idDocumentUrl field)
│   ├── routes/
│   │   ├── auth.js (Enhanced with ID upload support)
│   │   └── admin.js (New verification endpoints)
│   ├── .env (Configuration)
│   └── server.js
│
└── aibarangay-frontend/
    ├── pages/
    │   ├── Profile.tsx (ID upload interface)
    │   ├── AdminUsers.tsx (Verification dashboard)
    │   └── Signup.tsx (Enhanced validation)
    ├── services/
    │   └── api.ts (Updated API methods)
    ├── components/
    │   └── UI.tsx (FileUpload component)
    └── types.ts (User interface with idDocumentUrl)
```

## Setup Instructions

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd aibarangay-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update `MONGODB_URI` with your MongoDB connection string
   - Set a secure `JWT_SECRET`

4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd aibarangay-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure API URL:
   - Create `.env` file
   - Set `VITE_API_URL=http://localhost:5000/api`

4. Start development server:
   ```bash
   npm run dev
   ```

## User Flow

### For Residents:
1. **Sign Up**: Create account with validated personal information
2. **Upload ID**: Navigate to Profile page and upload government ID
3. **Wait for Verification**: Admin reviews and approves the ID
4. **Access Services**: Once verified, access all barangay services

### For Admins:
1. **View Pending Users**: Check "Pending Verification" tab in User Management
2. **Review ID Documents**: Click on user to view uploaded government ID
3. **Verify Identity**: Click "Approve & Verify" to grant full access
4. **Manage Roles**: Update user roles (Resident, Staff, Admin)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile (includes ID upload)

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user (role, verification)
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/audit-logs` - View audit logs

## Validation Rules

### User Registration
- **First/Last Name**: 2-50 characters, letters only
- **Email**: Valid email format
- **Password**: Min 8 chars, uppercase, lowercase, number
- **Phone**: 09XXXXXXXXX (11 digits)
- **Address**: Max 200 characters

### ID Upload
- **Accepted Formats**: JPG, PNG, GIF, SVG
- **Max Size**: 5MB
- **Required**: Clear photo showing full name and photo

## Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Password Hashing**: bcrypt with salt rounds
3. **Input Sanitization**: All inputs validated and sanitized
4. **File Size Limits**: Prevent large file uploads
5. **Role-Based Access**: Admin-only verification endpoints
6. **Audit Logging**: Track all verification actions

## Database Schema

### User Model
```javascript
{
  firstName: String (required, 2-50 chars),
  lastName: String (required, 2-50 chars),
  email: String (required, unique, lowercase),
  password: String (required, hashed, min 6 chars),
  role: String (resident/staff/admin),
  avatar: String (base64 or URL),
  address: String (max 200 chars),
  phoneNumber: String (09XXXXXXXXX),
  isVerified: Boolean (default: false),
  idDocumentUrl: String (base64 or URL),
  timestamps: true
}
```

## Testing Checklist

- [ ] User can register with valid information
- [ ] User can upload government ID from profile
- [ ] Admin can see pending verification count
- [ ] Admin can view uploaded ID documents
- [ ] Admin can approve verification
- [ ] Verification status updates in real-time
- [ ] Audit logs record verification actions
- [ ] File size validation works correctly
- [ ] Phone number validation (Philippine format)
- [ ] Name validation (letters only)

## Future Enhancements

1. **ID Rejection**: Allow admins to reject IDs with reason
2. **Email Notifications**: Notify users when verified
3. **Document Expiry**: Track ID expiration dates
4. **Multiple IDs**: Support multiple ID uploads
5. **OCR Integration**: Auto-extract information from IDs
6. **SMS Verification**: Add phone number verification

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file

2. **CORS Error**
   - Verify CLIENT_URL in backend .env
   - Check VITE_API_URL in frontend .env

3. **File Upload Fails**
   - Check file size (max 5MB)
   - Ensure correct file format (images only)

4. **Verification Not Updating**
   - Clear browser cache
   - Check network tab for API errors
   - Verify admin role permissions

## Support

For issues or questions, please check:
- Backend logs: `npm run dev` output
- Frontend console: Browser developer tools
- Network requests: Browser network tab

## License

This project is part of the iBarangay Online Services platform.