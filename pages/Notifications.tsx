import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Bell,
  Check,
  Trash2,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BellOff,
  Filter,
  Clock,
  CheckCheck,
  MoreVertical,
  X,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Button, Card, CardContent, Skeleton, Badge } from "../components/UI";
import { api } from "../services/api";
import { Notification, User } from "../types";
import { EmptyState } from "../components/Loading";
import { useToast } from "../components/Toast";

const NotificationSkeleton = () => (
  <Card className="animate-pulse">
    <CardContent className="p-4 flex items-start gap-4">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-48 mb-2" />
        <Skeleton className="h-3 w-full mb-2" />
        <Skeleton className="h-3 w-24" />
      </div>
    </CardContent>
  </Card>
);

// Helper function for relative time
const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
  return date.toLocaleDateString();
};

// Helper to group notifications by date
const groupByDate = (notifications: Notification[]) => {
  const groups: { [key: string]: Notification[] } = {
    Today: [],
    Yesterday: [],
    "This Week": [],
    Older: [],
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 604800000);

  notifications.forEach((notif) => {
    const notifDate = new Date(notif.createdAt);
    if (notifDate >= today) {
      groups["Today"].push(notif);
    } else if (notifDate >= yesterday) {
      groups["Yesterday"].push(notif);
    } else if (notifDate >= weekAgo) {
      groups["This Week"].push(notif);
    } else {
      groups["Older"].push(notif);
    }
  });

  return groups;
};

interface NotificationsProps {
  user: User;
  onNavigate?: (page: string) => void;
}

type FilterType = "all" | "unread" | "read";

const Notifications: React.FC<NotificationsProps> = ({ user, onNavigate }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [markingRead, setMarkingRead] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { showToast } = useToast();

  const fetchNotifs = async () => {
    try {
      const data = await api.getNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
    pollIntervalRef.current = setInterval(fetchNotifs, 30000); // Changed to 30s
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [user.id]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    switch (filter) {
      case "unread":
        return notifications.filter((n) => !n.isRead);
      case "read":
        return notifications.filter((n) => n.isRead);
      default:
        return notifications;
    }
  }, [notifications, filter]);

  // Grouped notifications
  const groupedNotifications = useMemo(
    () => groupByDate(filteredNotifications),
    [filteredNotifications]
  );

  // Stats
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = async () => {
    if (unreadCount === 0) return;
    
    setMarkingAllRead(true);
    try {
      await api.markAllNotificationsRead(user.id);
      // Update local state immediately for instant feedback
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      showToast("Success", "All notifications marked as read", "success");
    } catch (error) {
      showToast("Error", "Failed to mark notifications as read", "error");
    } finally {
      setMarkingAllRead(false);
    }
  };

  const markAsRead = async (id: string) => {
    setMarkingRead(id);
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      showToast("Error", "Failed to mark notification as read", "error");
    } finally {
      setMarkingRead(null);
    }
  };

  const deleteNotification = async (id: string) => {
    setDeleting(id);
    try {
      await api.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      showToast("Success", "Notification deleted", "success");
    } catch (error) {
      showToast("Error", "Failed to delete notification", "error");
    } finally {
      setDeleting(null);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return (
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
        );
      case "warning":
        return (
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
        );
      case "error":
        return (
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-rose-600" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Info className="w-5 h-5 text-blue-600" />
          </div>
        );
    }
  };

  const filterButtons: { value: FilterType; label: string; count?: number }[] = [
    { value: "all", label: "All", count: notifications.length },
    { value: "unread", label: "Unread", count: unreadCount },
    { value: "read", label: "Read", count: notifications.length - unreadCount },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="primary" className="animate-pulse">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <p className="text-gray-500">Stay updated with your requests and announcements</p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllRead}
            isLoading={markingAllRead}
            className="shrink-0"
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {filterButtons.map((btn) => (
          <button
            key={btn.value}
            onClick={() => setFilter(btn.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              filter === btn.value
                ? "bg-primary-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {btn.label}
            {btn.count !== undefined && (
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  filter === btn.value
                    ? "bg-white/20 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {btn.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <NotificationSkeleton key={i} />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            icon={<BellOff className="w-8 h-8" />}
            title={
              filter === "all"
                ? "No notifications yet"
                : filter === "unread"
                ? "No unread notifications"
                : "No read notifications"
            }
            description={
              filter === "all"
                ? "You'll see updates about your complaints and service requests here."
                : filter === "unread"
                ? "You're all caught up! No new notifications."
                : "Read notifications will appear here."
            }
          />
        ) : (
          (Object.entries(groupedNotifications) as [string, Notification[]][]).map(
            ([group, notifs]) =>
              notifs.length > 0 && (
                <div key={group} className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {group}
                  </h3>
                  {notifs.map((notif, index) => {
                    // Determine navigation page from notification data
                    const getNavigationPage = (): string | null => {
                      if (notif.link) return notif.link;
                      if (notif.relatedType) {
                        switch (notif.relatedType) {
                          case "complaint": return "complaints";
                          case "service": return "services";
                          case "event": return "events";
                          case "announcement": return "announcements";
                        }
                      }
                      // Try to infer from title/message
                      const text = (notif.title + notif.message).toLowerCase();
                      if (text.includes("complaint")) return "complaints";
                      if (text.includes("service") || text.includes("request") || text.includes("equipment") || text.includes("facility")) return "services";
                      if (text.includes("event")) return "events";
                      if (text.includes("announcement")) return "announcements";
                      return null;
                    };

                    const navPage = getNavigationPage();
                    const isClickable = !!navPage && !!onNavigate;

                    const handleClick = () => {
                      if (isClickable) {
                        // Mark as read when clicked
                        if (!notif.isRead) {
                          markAsRead(notif.id);
                        }
                        onNavigate!(navPage!);
                      }
                    };

                    return (
                      <Card
                        key={notif.id}
                        className={`group transition-all hover:shadow-md animate-fade-in-up ${
                          notif.isRead
                            ? "bg-white"
                            : "bg-gradient-to-r from-primary-50 to-blue-50/50 border-primary-200"
                        } ${isClickable ? "cursor-pointer hover:border-primary-300" : ""}`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                        onClick={handleClick}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className="shrink-0">{getIcon(notif.type)}</div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <h4
                                    className={`text-sm font-semibold leading-tight ${
                                      notif.isRead ? "text-gray-900" : "text-primary-900"
                                    }`}
                                  >
                                    {notif.title}
                                    {!notif.isRead && (
                                      <span className="inline-block w-2 h-2 bg-primary-500 rounded-full ml-2 animate-pulse" />
                                    )}
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {notif.message}
                                  </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0">
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                    {!notif.isRead && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          markAsRead(notif.id);
                                        }}
                                        disabled={markingRead === notif.id}
                                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-600 transition-colors"
                                        title="Mark as read"
                                      >
                                        {markingRead === notif.id ? (
                                          <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                          <Check className="w-4 h-4" />
                                        )}
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notif.id);
                                      }}
                                      disabled={deleting === notif.id}
                                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                                      title="Delete"
                                    >
                                      {deleting === notif.id ? (
                                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                      ) : (
                                        <Trash2 className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>
                                  {/* Navigation indicator */}
                                  {isClickable && (
                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 transition-colors ml-1" />
                                  )}
                                </div>
                              </div>

                              {/* Timestamp */}
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {getRelativeTime(notif.createdAt)}
                                </span>
                                {notif.isRead && (
                                  <span className="text-xs text-gray-400 flex items-center gap-1">
                                    • <CheckCheck className="w-3 h-3" /> Read
                                  </span>
                                )}
                                {isClickable && (
                                  <span className="text-xs text-primary-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                    View {notif.relatedType || "details"}
                                    <ExternalLink className="w-3 h-3" />
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )
          )
        )}
      </div>

      {/* Footer Stats */}
      {!loading && notifications.length > 0 && (
        <div className="text-center text-sm text-gray-400 pt-4 border-t">
          Showing {filteredNotifications.length} of {notifications.length} notifications
        </div>
      )}
    </div>
  );
};

export default Notifications;

