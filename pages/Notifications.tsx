import React, { useEffect, useState, useRef } from "react";
import {
  Bell,
  Check,
  Trash2,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BellOff,
} from "lucide-react";
import { Button, Card, CardContent, Skeleton } from "../components/UI";
import { api } from "../services/api";
import { Notification, User } from "../types";
import { EmptyState } from "../components/Loading";

const NotificationSkeleton = () => (
  <Card className="animate-pulse">
    <CardContent className="p-4 flex items-start gap-4">
      <Skeleton className="w-5 h-5 mt-1 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-48 mb-2" />
        <Skeleton className="h-3 w-full mb-2" />
        <Skeleton className="h-3 w-24" />
      </div>
    </CardContent>
  </Card>
);

interface NotificationsProps {
  user: User;
}

const Notifications: React.FC<NotificationsProps> = ({ user }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
    // Initial fetch
    fetchNotifs();

    // Set up polling every 10 seconds
    pollIntervalRef.current = setInterval(() => {
      fetchNotifs();
    }, 10000);

    // Cleanup on unmount
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [user.id]);

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsRead(user.id);
      await fetchNotifs();
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500">Stay updated with your requests</p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <NotificationSkeleton key={i} />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<BellOff className="w-8 h-8" />}
            title="No notifications yet"
            description="You'll see updates about your complaints and service requests here."
          />
        ) : (
          notifications.map((notif) => (
            <Card
              key={notif.id}
              className={`${
                notif.isRead
                  ? "bg-white"
                  : "bg-primary-50/50 border-primary-100"
              }`}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className="mt-1">{getIcon(notif.type)}</div>
                <div className="flex-1">
                  <h4
                    className={`text-sm font-semibold ${
                      notif.isRead ? "text-gray-900" : "text-primary-900"
                    }`}
                  >
                    {notif.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                  <span className="text-xs text-gray-400 mt-2 block">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
