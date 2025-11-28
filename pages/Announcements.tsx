import React, { useEffect, useState } from 'react';
import { Pin, Megaphone, Clock } from 'lucide-react';
import { Button, Card, CardContent, Badge } from '../components/UI';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import { Announcement, User } from '../types';

interface AnnouncementProps {
  user: User;
}

const Announcements: React.FC<AnnouncementProps> = ({ user }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
        const data = await api.getAnnouncements();
        // Sort: Pinned first, then new
        setAnnouncements(data.sort((a,b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1)));
        setLoading(false);
    };
    fetch();
  }, []);

    const { showToast } = useToast();
      const togglePin = async (id: string) => {
        await api.toggleAnnouncementPin(id);
        const data = await api.getAnnouncements();
        setAnnouncements(data.sort((a,b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1)));
        const updated = data.find(a => a.id === id);
        showToast('Success', updated?.isPinned ? 'Announcement pinned' : 'Announcement unpinned', 'success');
      }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500">Latest news and updates</p>
        </div>
        {user.role !== 'resident' && <Button>Post Announcement</Button>}
      </div>

      <div className="space-y-4">
        {loading ? (
             <div className="text-center py-12">Loading...</div>
        ) : announcements.map(announcement => (
            <Card key={announcement.id} className={`transition-all ${announcement.isPinned ? 'border-primary-200 bg-primary-50/30' : 'hover:border-primary-200'}`}>
                <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                {announcement.isPinned && <Pin className="w-4 h-4 text-primary-600 fill-primary-600 rotate-45" />}
                                <Badge variant={announcement.priority === 'high' ? 'danger' : 'default'} className="uppercase text-[10px] tracking-wider">
                                    {announcement.category}
                                </Badge>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {new Date(announcement.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{announcement.title}</h3>
                            <p className="text-gray-600 whitespace-pre-wrap">{announcement.content}</p>
                            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                                <span>Posted by {announcement.author}</span>
                                <span>•</span>
                                <span>{announcement.views} views</span>
                            </div>
                        </div>
                        {user.role !== 'resident' && (
                             <button onClick={() => togglePin(announcement.id)} className={`p-2 rounded-full hover:bg-gray-100 ${announcement.isPinned ? 'text-primary-600' : 'text-gray-400'}`}>
                                 <Pin className="w-5 h-5" />
                             </button>
                        )}
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
};

export default Announcements;