import React, { useEffect, useState } from "react";
import { Pin, Megaphone, Clock } from "lucide-react";
import { Button, Card, CardContent, Badge } from "../components/UI";
import { api } from "../services/api";
import { useToast } from "../components/Toast";
import { Announcement, User } from "../types";

interface AnnouncementProps {
  user: User;
}

const Announcements: React.FC<AnnouncementProps> = ({ user }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await api.getAnnouncements();
        // Sort: Pinned first, then by date (newest first)
        setAnnouncements(
          data.sort((a, b) => {
            if (a.isPinned === b.isPinned) {
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            }
            return a.isPinned ? -1 : 1;
          })
        );
      } catch (error) {
        showToast("Error", "Failed to load announcements", "error");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const { showToast } = useToast();
  const togglePin = async (id: string) => {
    try {
      await api.toggleAnnouncementPin(id);
      const data = await api.getAnnouncements();
      setAnnouncements(
        data.sort((a, b) => {
          if (a.isPinned === b.isPinned) {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          }
          return a.isPinned ? -1 : 1;
        })
      );
      const updated = data.find((a) => a.id === id);
      showToast(
        "Success",
        updated?.isPinned ? "Announcement pinned" : "Announcement unpinned",
        "success"
      );
    } catch (error) {
      showToast("Error", "Failed to update announcement", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500">
            Latest news and updates from the barangay
          </p>
        </div>
        {user.role !== "resident" && <Button>Post Announcement</Button>}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-500">Loading announcements...</p>
        </div>
      ) : announcements.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No announcements yet
            </h3>
            <p className="text-gray-500 mb-4">
              Check back later for updates from the barangay
            </p>
            {user.role !== "resident" && (
              <Button>Post First Announcement</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card
              key={announcement.id}
              className={`transition-all ${
                announcement.isPinned
                  ? "border-primary-300 bg-primary-50/30 shadow-md"
                  : "hover:border-primary-200 hover:shadow-md"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      {announcement.isPinned && (
                        <div className="flex items-center gap-1 text-primary-600">
                          <Pin className="w-4 h-4 fill-primary-600 rotate-45" />
                          <span className="text-xs font-bold uppercase tracking-wide">
                            Pinned
                          </span>
                        </div>
                      )}
                      <Badge
                        variant={
                          announcement.priority === "urgent"
                            ? "danger"
                            : announcement.priority === "high"
                            ? "warning"
                            : "default"
                        }
                        className="uppercase text-[10px] tracking-wider"
                      >
                        {announcement.category}
                      </Badge>
                      {announcement.priority !== "low" && (
                        <Badge
                          variant={
                            announcement.priority === "urgent"
                              ? "danger"
                              : "warning"
                          }
                          className="uppercase text-[10px] tracking-wider"
                        >
                          {announcement.priority}
                        </Badge>
                      )}
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(announcement.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {announcement.title}
                    </h3>
                    <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                      {announcement.content}
                    </p>
                    <div className="mt-4 flex items-center gap-3 text-xs text-gray-400">
                      <span>
                        Posted by{" "}
                        <span className="font-medium text-gray-600">
                          {announcement.author}
                        </span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Megaphone className="w-3 h-3" />
                        {announcement.views}{" "}
                        {announcement.views === 1 ? "view" : "views"}
                      </span>
                    </div>
                  </div>
                  {user.role !== "resident" && (
                    <button
                      onClick={() => togglePin(announcement.id)}
                      className={`p-2 rounded-full transition-all ${
                        announcement.isPinned
                          ? "text-primary-600 bg-primary-100 hover:bg-primary-200"
                          : "text-gray-400 hover:text-primary-600 hover:bg-gray-100"
                      }`}
                      title={
                        announcement.isPinned
                          ? "Unpin announcement"
                          : "Pin announcement"
                      }
                    >
                      <Pin className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;
