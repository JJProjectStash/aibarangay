import React from "react";

export type UserRole = "resident" | "staff" | "admin";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatar?: string;
  address?: string;
  phoneNumber?: string;
  isVerified?: boolean;
  idDocumentUrl?: string; // New: For verification
}

export type ComplaintStatus = "pending" | "in-progress" | "resolved" | "closed";
export type Priority = "low" | "medium" | "high" | "urgent";

export interface ComplaintHistory {
  id: string;
  action: string;
  by: string;
  timestamp: string;
  note?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  message: string;
  timestamp: string;
}

export interface Complaint {
  id: string;
  userId: string;
  user: User;
  title: string;
  description: string;
  category: string;
  status: ComplaintStatus;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  feedback?: string;
  rating?: number;
  history: ComplaintHistory[];
  comments: Comment[];
  attachments?: string[]; // New: Evidence photos
}

export type ServiceStatus =
  | "pending"
  | "approved"
  | "borrowed"
  | "returned"
  | "rejected";
export type RequestType = "Equipment" | "Facility";

export interface ServiceRequest {
  id: string;
  userId: string;
  user: User;
  requestType: RequestType;
  itemName: string;
  itemType: string;
  borrowDate: string;
  expectedReturnDate: string;
  timeSlot?: string;
  numberOfPeople?: number;
  status: ServiceStatus;
  purpose: string;
  createdAt: string;
  notes?: string;
  rejectionReason?: string;
  approvalNote?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  organizerId: string;
  maxAttendees: number;
  currentAttendees: number;
  category: string;
  imageUrl?: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  isRegistered?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: "general" | "emergency" | "event" | "maintenance" | "policy";
  priority: Priority;
  isPublished: boolean;
  isPinned: boolean;
  views: number;
  createdAt: string;
  author: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  publishedAt: string;
  author: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  user: User;
  action: string;
  resource: string;
  timestamp: string;
  status: "success" | "failure";
  ipAddress?: string;
}

export interface Hotline {
  id: string;
  name: string;
  number: string;
  category: "emergency" | "health" | "security" | "utility" | "official";
  icon?: string;
}

export interface Official {
  id: string;
  name: string;
  position: string;
  imageUrl: string;
  contact?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface SiteSettings {
  id: string;
  barangayName: string;
  logoUrl: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  facebookUrl?: string;
  twitterUrl?: string;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  color?: string;
}
