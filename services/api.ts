import {
  Complaint,
  ServiceRequest,
  User,
  Event,
  Announcement,
  Notification,
  AuditLog,
  NewsItem,
  Hotline,
  Official,
  FAQ,
  SiteSettings,
  Comment,
} from "../types";

const normalizeApiUrl = (raw?: string) => {
  let url = raw || "http://localhost:5000/api";

  // If someone used a shorthand like ":5000/api" -> prefix with http://localhost
  if (url.startsWith(":")) url = `http://localhost${url}`;
  // If scheme-relative (//localhost:5000) -> use http:
  if (url.startsWith("//")) url = `http:${url}`;
  // If no scheme, prefix with http://
  if (!/^https?:\/\//i.test(url)) url = `http://${url}`;

  // Remove trailing slash for easier concatenation
  if (url.endsWith("/")) url = url.slice(0, -1);

  return url;
};

const API_URL = normalizeApiUrl(
  import.meta.env.VITE_API_URL as string | undefined
);

// Helper to get auth token
const getToken = () => localStorage.getItem("token");

// Helper to set auth token
const setToken = (token: string) => localStorage.setItem("token", token);

// Helper to remove auth token
const removeToken = () => localStorage.removeItem("token");

// Simple ApiError type so callers can examine response status
class ApiError extends Error {
  status?: number;
  constructor(message?: string, status?: number) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// Helper for API requests
const apiRequest = async (
  endpoint: string,
  options: RequestInit & { skipAuth?: boolean } = {}
) => {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(!options.skipAuth && token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const url = `${API_URL}${endpoint}`;
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err) {
    console.error(`Network error requesting ${url}:`, err);
    throw new Error((err as Error).message || "Network error");
  }

  if (!response.ok) {
    // If unauthorized and we sent a token, retry once without the token in case it is invalid/expired
    if (response.status === 401 && token) {
      console.warn(
        `Authorization failure for ${url}: removing token and retrying fetch without it.`
      );
      // Remove stored token and retry once
      removeToken();
      const retryHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...options.headers,
      };

      try {
        const retryResp = await fetch(url, {
          ...options,
          headers: retryHeaders,
        });
        if (!retryResp.ok) {
          const error = await retryResp
            .json()
            .catch(() => ({ message: "Request failed" }));
          throw new ApiError(
            error.message || "Request failed",
            retryResp.status
          );
        }
        return retryResp.json();
      } catch (err) {
        console.error(`Retry without token failed for ${url}:`, err);
        const error = await response
          .json()
          .catch(() => ({ message: "Request failed" }));
        throw new ApiError(error.message || "Request failed", response.status);
      }
    }
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    throw new ApiError(error.message || "Request failed", response.status);
  }

  return response.json();
};

class ApiService {
  // Auth
  async login(email: string, password?: string): Promise<User | null> {
    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (data.token) {
        setToken(data.token);
      }

      return {
        id: data._id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        avatar: data.avatar,
        address: data.address,
        phoneNumber: data.phoneNumber,
        isVerified: data.isVerified,
      };
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  }

  async register(userData: any): Promise<User> {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (data.token) {
      setToken(data.token);
    }

    return {
      id: data._id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: data.role,
      avatar: data.avatar,
      address: data.address,
      phoneNumber: data.phoneNumber,
      isVerified: data.isVerified,
    };
  }

  async updateProfile(user: User): Promise<User> {
    const data = await apiRequest("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(user),
    });

    return {
      id: data._id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: data.role,
      avatar: data.avatar,
      address: data.address,
      phoneNumber: data.phoneNumber,
      isVerified: data.isVerified,
    };
  }

  logout() {
    removeToken();
  }

  // Dashboard Stats
  async getStats(user: User) {
    return apiRequest("/stats");
  }

  // Analytics (Admin/Staff only)
  async getAnalytics() {
    return apiRequest("/stats/analytics");
  }

  // Complaints
  async getComplaints(user: User): Promise<Complaint[]> {
    const data = await apiRequest("/complaints");
    return data.map((item: any) => ({
      id: item._id,
      userId: item.userId._id || item.userId,
      user: item.userId._id
        ? {
            id: item.userId._id,
            firstName: item.userId.firstName,
            lastName: item.userId.lastName,
            email: item.userId.email,
            role: item.userId.role,
            avatar: item.userId.avatar,
          }
        : item.userId,
      title: item.title,
      description: item.description,
      category: item.category,
      status: item.status,
      priority: item.priority,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      assignedTo: item.assignedTo,
      feedback: item.feedback,
      rating: item.rating,
      history: item.history,
      comments: item.comments,
      attachments: item.attachments,
    }));
  }

  async createComplaint(
    complaint: Omit<
      Complaint,
      "id" | "createdAt" | "updatedAt" | "user" | "comments"
    >
  ): Promise<Complaint> {
    const data = await apiRequest("/complaints", {
      method: "POST",
      body: JSON.stringify(complaint),
    });

    return {
      id: data._id,
      userId: data.userId._id,
      user: {
        id: data.userId._id,
        firstName: data.userId.firstName,
        lastName: data.userId.lastName,
        email: data.userId.email,
        role: data.userId.role,
        avatar: data.userId.avatar,
      },
      title: data.title,
      description: data.description,
      category: data.category,
      status: data.status,
      priority: data.priority,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      history: data.history,
      comments: data.comments,
    };
  }

  async updateComplaintStatus(
    id: string,
    status: Complaint["status"],
    note?: string
  ): Promise<void> {
    await apiRequest(`/complaints/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, note }),
    });
  }

  async addComplaintComment(
    complaintId: string,
    comment: Omit<Comment, "id" | "timestamp">
  ): Promise<Comment> {
    const data = await apiRequest(`/complaints/${complaintId}/comments`, {
      method: "POST",
      body: JSON.stringify(comment),
    });

    return {
      id: data._id,
      userId: data.userId,
      userName: data.userName,
      userRole: data.userRole,
      message: data.message,
      timestamp: data.timestamp,
    };
  }

  // Services
  async getServices(user: User): Promise<ServiceRequest[]> {
    const data = await apiRequest("/services");
    return data.map((item: any) => ({
      id: item._id,
      userId: item.userId._id || item.userId,
      user: item.userId._id
        ? {
            id: item.userId._id,
            firstName: item.userId.firstName,
            lastName: item.userId.lastName,
            email: item.userId.email,
            role: item.userId.role,
            avatar: item.userId.avatar,
          }
        : item.userId,
      itemName: item.itemName,
      itemType: item.itemType,
      borrowDate: item.borrowDate,
      expectedReturnDate: item.expectedReturnDate,
      status: item.status,
      purpose: item.purpose,
      createdAt: item.createdAt,
      notes: item.notes,
      rejectionReason: item.rejectionReason,
      approvalNote: item.approvalNote,
    }));
  }

  async createService(
    service: Omit<ServiceRequest, "id" | "createdAt" | "user">
  ): Promise<ServiceRequest> {
    const data = await apiRequest("/services", {
      method: "POST",
      body: JSON.stringify(service),
    });

    return {
      id: data._id,
      userId: data.userId._id,
      user: {
        id: data.userId._id,
        firstName: data.userId.firstName,
        lastName: data.userId.lastName,
        email: data.userId.email,
        role: data.userId.role,
        avatar: data.userId.avatar,
      },
      itemName: data.itemName,
      itemType: data.itemType,
      borrowDate: data.borrowDate,
      expectedReturnDate: data.expectedReturnDate,
      status: data.status,
      purpose: data.purpose,
      createdAt: data.createdAt,
    };
  }

  async updateServiceStatus(
    id: string,
    status: ServiceRequest["status"],
    note?: string
  ): Promise<void> {
    await apiRequest(`/services/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, note }),
    });
  }

  // Events
  async getEvents(): Promise<Event[]> {
    const data = await apiRequest("/events");
    return data.map((item: any) => ({
      id: item._id,
      title: item.title,
      description: item.description,
      eventDate: item.eventDate,
      location: item.location,
      organizerId: item.organizerId,
      maxAttendees: item.maxAttendees,
      currentAttendees: item.currentAttendees,
      category: item.category,
      imageUrl: item.imageUrl,
      status: item.status,
      isRegistered: item.isRegistered,
    }));
  }

  // Public Events (no auth)
  async getPublicEvents(): Promise<Event[]> {
    const data = await apiRequest("/public/events", { skipAuth: true });
    return data.map((item: any) => ({
      id: item._id,
      title: item.title,
      description: item.description,
      eventDate: item.eventDate,
      location: item.location,
      organizerId: item.organizerId,
      maxAttendees: item.maxAttendees,
      currentAttendees: item.currentAttendees,
      category: item.category,
      imageUrl: item.imageUrl,
      status: item.status,
      // Public events do not include registered info for the current user
      isRegistered: item.isRegistered ?? false,
    }));
  }

  async createEvent(
    event: Omit<Event, "id" | "currentAttendees" | "status">
  ): Promise<void> {
    await apiRequest("/events", {
      method: "POST",
      body: JSON.stringify(event),
    });
  }

  async deleteEvent(id: string): Promise<void> {
    await apiRequest(`/events/${id}`, {
      method: "DELETE",
    });
  }

  async registerForEvent(eventId: string, userId: string): Promise<void> {
    await apiRequest(`/events/${eventId}/register`, {
      method: "POST",
    });
  }

  async getEventRegisteredUsers(eventId: string): Promise<User[]> {
    const data = await apiRequest(`/events/${eventId}/registered`);
    return data.map((item: any) => ({
      id: item._id,
      firstName: item.firstName,
      lastName: item.lastName,
      email: item.email,
      role: item.role,
      avatar: item.avatar,
      address: item.address,
      phoneNumber: item.phoneNumber,
      isVerified: item.isVerified,
    }));
  }

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    const data = await apiRequest("/announcements");
    return data.map((item: any) => ({
      id: item._id,
      title: item.title,
      content: item.content,
      category: item.category,
      priority: item.priority,
      isPublished: item.isPublished,
      isPinned: item.isPinned,
      views: item.views,
      createdAt: item.createdAt,
      author: item.author,
    }));
  }

  // Public Announcements (unauthenticated)
  async getPublicAnnouncements(): Promise<Announcement[]> {
    const data = await apiRequest("/public/announcements", { skipAuth: true });
    return data.map((item: any) => ({
      id: item._id,
      title: item.title,
      content: item.content,
      category: item.category,
      priority: item.priority,
      isPublished: item.isPublished,
      isPinned: item.isPinned,
      views: item.views,
      createdAt: item.createdAt,
      author: item.author,
    }));
  }

  async toggleAnnouncementPin(id: string): Promise<void> {
    await apiRequest(`/announcements/${id}/pin`, {
      method: "PUT",
    });
  }

  // News
  async getNews(): Promise<NewsItem[]> {
    const data = await apiRequest("/news");
    return data.map((item: any) => ({
      id: item._id,
      title: item.title,
      summary: item.summary,
      content: item.content,
      imageUrl: item.imageUrl,
      publishedAt: item.createdAt,
      author: item.author,
    }));
  }

  // Public news (unauthenticated)
  async getPublicNews(): Promise<NewsItem[]> {
    const data = await apiRequest("/public/news", { skipAuth: true });
    return data.map((item: any) => ({
      id: item._id,
      title: item.title,
      summary: item.summary,
      content: item.content,
      imageUrl: item.imageUrl,
      publishedAt: item.createdAt,
      author: item.author,
    }));
  }

  async createNews(item: Omit<NewsItem, "id" | "publishedAt">): Promise<void> {
    await apiRequest("/news", {
      method: "POST",
      body: JSON.stringify(item),
    });
  }

  async deleteNews(id: string): Promise<void> {
    await apiRequest(`/news/${id}`, {
      method: "DELETE",
    });
  }

  // Hotlines
  async getHotlines(): Promise<Hotline[]> {
    const data = await apiRequest("/content/hotlines");
    return data.map((item: any) => ({
      id: item._id,
      name: item.name,
      number: item.number,
      category: item.category,
      icon: item.icon,
    }));
  }

  async createHotline(hotline: Omit<Hotline, "id">): Promise<void> {
    await apiRequest("/content/hotlines", {
      method: "POST",
      body: JSON.stringify(hotline),
    });
  }

  async deleteHotline(id: string): Promise<void> {
    await apiRequest(`/content/hotlines/${id}`, {
      method: "DELETE",
    });
  }

  // Officials
  async getOfficials(): Promise<Official[]> {
    const data = await apiRequest("/content/officials");
    return data.map((item: any) => ({
      id: item._id,
      name: item.name,
      position: item.position,
      imageUrl: item.imageUrl,
      contact: item.contact,
    }));
  }

  // Public officials list
  async getPublicOfficials(): Promise<Official[]> {
    const data = await apiRequest("/public/officials", { skipAuth: true });
    return data.map((item: any) => ({
      id: item._id,
      name: item.name,
      position: item.position,
      imageUrl: item.imageUrl,
      contact: item.contact,
    }));
  }

  async createOfficial(official: Omit<Official, "id">): Promise<void> {
    await apiRequest("/content/officials", {
      method: "POST",
      body: JSON.stringify(official),
    });
  }

  async deleteOfficial(id: string): Promise<void> {
    await apiRequest(`/content/officials/${id}`, {
      method: "DELETE",
    });
  }

  // FAQs
  async getFAQs(): Promise<FAQ[]> {
    const data = await apiRequest("/content/faqs");
    return data.map((item: any) => ({
      id: item._id,
      question: item.question,
      answer: item.answer,
      category: item.category,
    }));
  }

  async createFAQ(faq: Omit<FAQ, "id">): Promise<void> {
    await apiRequest("/content/faqs", {
      method: "POST",
      body: JSON.stringify(faq),
    });
  }

  async deleteFAQ(id: string): Promise<void> {
    await apiRequest(`/content/faqs/${id}`, {
      method: "DELETE",
    });
  }

  // Site Settings
  async getSiteSettings(): Promise<SiteSettings> {
    const data = await apiRequest("/admin/settings");
    return {
      id: data._id,
      barangayName: data.barangayName,
      logoUrl: data.logoUrl,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      address: data.address,
      facebookUrl: data.facebookUrl,
      twitterUrl: data.twitterUrl,
    };
  }

  async updateSiteSettings(settings: SiteSettings): Promise<void> {
    await apiRequest("/admin/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  }

  // Public site settings for unauthenticated UI
  async getPublicSiteSettings(): Promise<SiteSettings> {
    const data = await apiRequest("/public/settings", { skipAuth: true });
    return {
      id: data._id,
      barangayName: data.barangayName,
      logoUrl: data.logoUrl,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      address: data.address,
      facebookUrl: data.facebookUrl,
      twitterUrl: data.twitterUrl,
    };
  }

  // Users (Admin)
  async getUsers(): Promise<User[]> {
    const data = await apiRequest("/admin/users");
    return data.map((item: any) => ({
      id: item._id,
      firstName: item.firstName,
      lastName: item.lastName,
      email: item.email,
      role: item.role,
      avatar: item.avatar,
      address: item.address,
      phoneNumber: item.phoneNumber,
      isVerified: item.isVerified,
    }));
  }

  async deleteUser(id: string): Promise<void> {
    await apiRequest(`/admin/users/${id}`, {
      method: "DELETE",
    });
  }

  // Audit Logs (Admin)
  async getAuditLogs(): Promise<AuditLog[]> {
    const data = await apiRequest("/admin/audit-logs");
    return data.map((item: any) => ({
      id: item._id,
      userId: item.userId._id,
      user: {
        id: item.userId._id,
        firstName: item.userId.firstName,
        lastName: item.userId.lastName,
        email: item.userId.email,
        role: item.userId.role,
      },
      action: item.action,
      resource: item.resource,
      timestamp: item.createdAt,
      status: item.status,
      ipAddress: item.ipAddress,
    }));
  }

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    const data = await apiRequest("/notifications");
    return data.map((item: any) => ({
      id: item._id,
      userId: item.userId,
      title: item.title,
      message: item.message,
      type: item.type,
      isRead: item.isRead,
      createdAt: item.createdAt,
    }));
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await apiRequest("/notifications/read-all", {
      method: "PUT",
    });
  }

  // Real-time Simulation (kept for compatibility, but won't work with real backend)
  simulateIncomingNotification(userId: string): Notification | null {
    return null;
  }

  // Generate PDF Report
  async generateReport(): Promise<Blob> {
    const token = getToken();
    const response = await fetch(`${API_URL}/stats/report`, {
      method: "GET",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to generate report");
    }

    return response.blob();
  }
}

export const api = new ApiService();
