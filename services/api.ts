
import { Complaint, ServiceRequest, User, Event, Announcement, Notification, AuditLog, NewsItem, Hotline, Official, FAQ, SiteSettings, Comment } from '../types';
import { MOCK_COMPLAINTS, MOCK_SERVICES, MOCK_USERS, MOCK_EVENTS, MOCK_ANNOUNCEMENTS, MOCK_NOTIFICATIONS, MOCK_AUDIT_LOGS, MOCK_NEWS, MOCK_HOTLINES, MOCK_OFFICIALS, MOCK_FAQS, MOCK_SITE_SETTINGS } from '../mockData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class ApiService {
  private complaints: Complaint[] = [...MOCK_COMPLAINTS];
  private services: ServiceRequest[] = [...MOCK_SERVICES];
  private events: Event[] = [...MOCK_EVENTS];
  private announcements: Announcement[] = [...MOCK_ANNOUNCEMENTS];
  private notifications: Notification[] = [...MOCK_NOTIFICATIONS];
  private users: User[] = [...MOCK_USERS];
  private auditLogs: AuditLog[] = [...MOCK_AUDIT_LOGS];
  private news: NewsItem[] = [...MOCK_NEWS];
  private hotlines: Hotline[] = [...MOCK_HOTLINES];
  private officials: Official[] = [...MOCK_OFFICIALS];
  private faqs: FAQ[] = [...MOCK_FAQS];
  private siteSettings: SiteSettings = { ...MOCK_SITE_SETTINGS };

  // Auth
  async login(email: string): Promise<User | null> {
    await delay(800);
    const user = this.users.find(u => u.email === email);
    return user || null;
  }

  async register(data: any): Promise<User> {
    await delay(1000);
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      role: 'resident',
      avatar: `https://i.pravatar.cc/150?u=${Math.random()}`,
      isVerified: false
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateProfile(user: User): Promise<User> {
    await delay(500);
    const idx = this.users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
        this.users[idx] = user;
    }
    return user;
  }

  // Dashboard Stats - Role Based
  async getStats(user: User) {
    await delay(500);
    
    // Admin/Staff View: System-wide stats
    if (user.role === 'admin' || user.role === 'staff') {
        return {
            totalResidents: this.users.filter(u => u.role === 'resident').length,
            pendingComplaints: this.complaints.filter(c => c.status === 'pending').length,
            activeServices: this.services.filter(s => ['approved', 'borrowed'].includes(s.status)).length,
            upcomingEvents: this.events.filter(e => e.status === 'upcoming').length,
            resolvedComplaints: this.complaints.filter(c => c.status === 'resolved').length
        };
    }

    // Resident View: Personal stats
    return {
        myPendingComplaints: this.complaints.filter(c => c.userId === user.id && c.status === 'pending').length,
        myActiveServices: this.services.filter(s => s.userId === user.id && ['approved', 'borrowed'].includes(s.status)).length,
        upcomingEvents: this.events.filter(e => e.status === 'upcoming').length,
        myTotalComplaints: this.complaints.filter(c => c.userId === user.id).length
    };
  }

  // Complaints
  async getComplaints(user: User): Promise<Complaint[]> {
    await delay(600);
    if (user.role === 'resident') {
        return this.complaints.filter(c => c.userId === user.id);
    }
    return [...this.complaints];
  }

  async createComplaint(complaint: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'user' | 'comments'>): Promise<Complaint> {
    await delay(600);
    const newComplaint: Complaint = {
      ...complaint,
      id: Math.random().toString(36).substr(2, 9),
      user: this.users.find(u => u.id === complaint.userId)!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: []
    };
    this.complaints.unshift(newComplaint);
    return newComplaint;
  }

  async updateComplaintStatus(id: string, status: Complaint['status']): Promise<void> {
    await delay(400);
    const idx = this.complaints.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.complaints[idx] = { ...this.complaints[idx], status, updatedAt: new Date().toISOString() };
    }
  }

  async addComplaintComment(complaintId: string, comment: Omit<Comment, 'id' | 'timestamp'>): Promise<Comment> {
    await delay(400);
    const idx = this.complaints.findIndex(c => c.id === complaintId);
    const newComment = {
        ...comment,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString()
    };
    if (idx !== -1) {
        this.complaints[idx].comments.push(newComment);
    }
    return newComment;
  }

  // Services
  async getServices(user: User): Promise<ServiceRequest[]> {
    await delay(600);
    if (user.role === 'resident') {
        return this.services.filter(s => s.userId === user.id);
    }
    return [...this.services];
  }

  async createService(service: Omit<ServiceRequest, 'id' | 'createdAt' | 'user'>): Promise<ServiceRequest> {
    await delay(600);
    const newService: ServiceRequest = {
        ...service,
        id: Math.random().toString(36).substr(2, 9),
        user: this.users.find(u => u.id === service.userId)!,
        createdAt: new Date().toISOString()
    }
    this.services.unshift(newService);
    return newService;
  }

  async updateServiceStatus(id: string, status: ServiceRequest['status'], note?: string): Promise<void> {
    await delay(400);
    const idx = this.services.findIndex(s => s.id === id);
    if (idx !== -1) {
        const update: Partial<ServiceRequest> = { status };
        
        if (status === 'rejected') {
            update.rejectionReason = note;
        } else if (status === 'approved') {
            update.approvalNote = note;
        }

        this.services[idx] = { 
            ...this.services[idx], 
            ...update
        };
    }
  }

  // Events & Calendar
  async getEvents(): Promise<Event[]> {
    await delay(500);
    return [...this.events];
  }

  async createEvent(event: Omit<Event, 'id' | 'currentAttendees' | 'status'>): Promise<void> {
    await delay(500);
    this.events.push({
        ...event,
        id: Math.random().toString(36).substr(2, 9),
        currentAttendees: 0,
        status: 'upcoming'
    });
  }

  async deleteEvent(id: string): Promise<void> {
      await delay(300);
      this.events = this.events.filter(e => e.id !== id);
  }

  async registerForEvent(eventId: string, userId: string): Promise<void> {
    await delay(400);
    const idx = this.events.findIndex(e => e.id === eventId);
    if (idx !== -1) {
        this.events[idx] = { 
            ...this.events[idx], 
            currentAttendees: this.events[idx].currentAttendees + 1,
            isRegistered: true 
        };
    }
  }

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    await delay(400);
    return [...this.announcements];
  }

  async toggleAnnouncementPin(id: string): Promise<void> {
    await delay(200);
    const idx = this.announcements.findIndex(a => a.id === id);
    if (idx !== -1) {
        this.announcements[idx].isPinned = !this.announcements[idx].isPinned;
    }
  }

  // News CMS
  async getNews(): Promise<NewsItem[]> {
      await delay(400);
      return [...this.news];
  }

  async createNews(item: Omit<NewsItem, 'id' | 'publishedAt'>): Promise<void> {
      await delay(500);
      this.news.unshift({
          ...item,
          id: Math.random().toString(36).substr(2, 9),
          publishedAt: new Date().toISOString()
      });
  }

  async deleteNews(id: string): Promise<void> {
      await delay(300);
      this.news = this.news.filter(n => n.id !== id);
  }

  // Hotlines CMS
  async getHotlines(): Promise<Hotline[]> {
      await delay(300);
      return [...this.hotlines];
  }

  async createHotline(hotline: Omit<Hotline, 'id'>): Promise<void> {
      await delay(400);
      this.hotlines.push({ ...hotline, id: Math.random().toString(36).substr(2, 9) });
  }

  async deleteHotline(id: string): Promise<void> {
      await delay(300);
      this.hotlines = this.hotlines.filter(h => h.id !== id);
  }

  // Officials CMS
  async getOfficials(): Promise<Official[]> {
      await delay(300);
      return [...this.officials];
  }

  async createOfficial(official: Omit<Official, 'id'>): Promise<void> {
      await delay(400);
      this.officials.push({ ...official, id: Math.random().toString(36).substr(2, 9) });
  }

  async deleteOfficial(id: string): Promise<void> {
      await delay(300);
      this.officials = this.officials.filter(o => o.id !== id);
  }

  // FAQs CMS
  async getFAQs(): Promise<FAQ[]> {
      await delay(300);
      return [...this.faqs];
  }

  async createFAQ(faq: Omit<FAQ, 'id'>): Promise<void> {
      await delay(400);
      this.faqs.push({ ...faq, id: Math.random().toString(36).substr(2, 9) });
  }

  async deleteFAQ(id: string): Promise<void> {
      await delay(300);
      this.faqs = this.faqs.filter(f => f.id !== id);
  }

  // Site Settings
  async getSiteSettings(): Promise<SiteSettings> {
      await delay(300);
      return { ...this.siteSettings };
  }

  async updateSiteSettings(settings: SiteSettings): Promise<void> {
      await delay(500);
      this.siteSettings = settings;
  }

  // Users (Admin)
  async getUsers(): Promise<User[]> {
    await delay(600);
    return [...this.users];
  }

  async deleteUser(id: string): Promise<void> {
    await delay(500);
    this.users = this.users.filter(u => u.id !== id);
  }

  // Audit Logs (Admin)
  async getAuditLogs(): Promise<AuditLog[]> {
    await delay(500);
    return [...this.auditLogs];
  }

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    await delay(300);
    return this.notifications.filter(n => n.userId === userId);
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await delay(300);
    this.notifications.forEach(n => {
        if(n.userId === userId) n.isRead = true;
    });
  }

  // Real-time Simulation
  simulateIncomingNotification(userId: string): Notification | null {
      if (Math.random() > 0.85) { 
          const newNotif: Notification = {
              id: Math.random().toString(36).substr(2, 9),
              userId,
              title: 'Update from Barangay',
              message: 'Your request status has been updated or a new announcement is available.',
              type: 'info',
              isRead: false,
              createdAt: new Date().toISOString()
          };
          this.notifications.unshift(newNotif);
          return newNotif;
      }
      return null;
  }
}

export const api = new ApiService();
