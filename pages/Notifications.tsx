import React, { useEffect, useState } from 'react';
import { Bell, Check, Trash2, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button, Card, CardContent } from '../components/UI';
import { api } from '../services/api';
import { Notification, User } from '../types';

interface NotificationsProps {
  user: User;
}

const Notifications: React.FC<NotificationsProps> = ({ user }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
      setLoading(true);
      const data = await api.getNotifications(user.id);
      setNotifications(data);
      setLoading(false);
  };

  useEffect(() => {
    fetchNotifs();
  }, [user.id]);

  const markAllRead = async () => {
      await api.markAllNotificationsRead(user.id);
      fetchNotifs();
  };

  const getIcon = (type: string) => {
      switch(type) {
          case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
          case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
          case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
          default: return <Info className="w-5 h-5 text-blue-500" />;
      }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500">Stay updated with your requests</p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllRead}>Mark all as read</Button>
      </div>

      <div className="space-y-2">
          {loading ? (
               <div className="text-center py-12">Loading...</div>
          ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No notifications yet.</div>
          ) : notifications.map(notif => (
              <Card key={notif.id} className={`${notif.isRead ? 'bg-white' : 'bg-primary-50/50 border-primary-100'}`}>
                  <CardContent className="p-4 flex items-start gap-4">
                      <div className="mt-1">{getIcon(notif.type)}</div>
                      <div className="flex-1">
                          <h4 className={`text-sm font-semibold ${notif.isRead ? 'text-gray-900' : 'text-primary-900'}`}>{notif.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                          <span className="text-xs text-gray-400 mt-2 block">{new Date(notif.createdAt).toLocaleString()}</span>
                      </div>
                  </CardContent>
              </Card>
          ))}
      </div>
    </div>
  );
};

export default Notifications;