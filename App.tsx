import React, { useState, useEffect } from "react";
import {
  Home,
  FileText,
  MessageSquare,
  LogOut,
  Menu,
  Bell,
  X,
  Calendar,
  Megaphone,
  Users as UsersIcon,
  Settings,
  HelpCircle,
  FileClock,
  Info,
  Phone,
  Newspaper,
  User as UserIcon,
  Globe,
} from "lucide-react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Complaints from "./pages/Complaints";
import Services from "./pages/Services";
import Events from "./pages/Events";
import Announcements from "./pages/Announcements";
import Notifications from "./pages/Notifications";
import AdminUsers from "./pages/AdminUsers";
import AdminAuditLogs from "./pages/AdminAuditLogs";
import AdminConfig from "./pages/AdminConfig";
import AdminNews from "./pages/AdminNews";
import AdminCalendar from "./pages/AdminCalendar";
import AdminContent from "./pages/AdminContent";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Signup from "./pages/Signup";
import Hotlines from "./pages/Hotlines";
import Profile from "./pages/Profile";
import NewsPage from "./pages/News";
import { User, Notification, SiteSettings } from "./types";
import { Button } from "./components/UI";
import { ToastContainer, useToast } from "./components/Toast";
import { api } from "./services/api";

type Page =
  | "landing"
  | "login"
  | "signup"
  | "hotlines"
  | "news"
  | "dashboard"
  | "complaints"
  | "services"
  | "events"
  | "announcements"
  | "notifications"
  | "admin-users"
  | "admin-audit-logs"
  | "admin-config"
  | "admin-news"
  | "admin-calendar"
  | "admin-content"
  | "help"
  | "profile"
  | "404";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const { showToast } = useToast();

  // Notification State
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [recentNotifs, setRecentNotifs] = useState<Notification[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const settings = await api.getPublicSiteSettings();
        setSiteSettings(settings);
      } catch (err) {
        console.warn(
          "Could not load admin site settings (may be admin-only):",
          err
        );
        // Use a lightweight/default fallback so UI has a name and logo can be absent.
        setSiteSettings({
          id: "default",
          barangayName: "iBarangay",
          logoUrl: "",
          contactEmail: "",
          contactPhone: "",
          address: "",
          facebookUrl: "",
          twitterUrl: "",
        });
      }
    })();
  }, []);

  // Refresh site settings when admin config is updated
  const refreshSiteSettings = async () => {
    try {
      const settings = await api.getPublicSiteSettings();
      setSiteSettings(settings);
    } catch (err) {
      console.warn("Could not refresh site settings:", err);
    }
  };

  useEffect(() => {
    if (!user) return;

    api.getNotifications(user.id).then((notifs) => {
      setRecentNotifs(notifs.slice(0, 5));
      setUnreadCount(notifs.filter((n) => !n.isRead).length);
    });

    const intervalId = setInterval(() => {
      const newNotif = api.simulateIncomingNotification(user.id);
      if (newNotif) {
        showToast(newNotif.title, newNotif.message, "info");
        api.getNotifications(user.id).then((notifs) => {
          setRecentNotifs(notifs.slice(0, 5));
          setUnreadCount(notifs.filter((n) => !n.isRead).length);
        });
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, [user]);

  // Router
  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard user={user!} />;
      case "complaints":
        return <Complaints user={user!} />;
      case "services":
        return <Services user={user!} />;
      case "events":
        return (
          <Events
            user={user!}
            onNavigate={(page) => setCurrentPage(page as Page)}
          />
        );
      case "announcements":
        return <Announcements user={user!} />;
      case "notifications":
        return <Notifications user={user!} />;
      case "profile":
        return <Profile user={user!} onUpdate={setUser} />;
      case "help":
        return <Help />;

      // Admin Routes
      case "admin-users":
        return user?.role === "admin" ? (
          <AdminUsers />
        ) : (
          <NotFound onGoHome={() => setCurrentPage("dashboard")} />
        );
      case "admin-audit-logs":
        return user?.role === "admin" ? (
          <AdminAuditLogs />
        ) : (
          <NotFound onGoHome={() => setCurrentPage("dashboard")} />
        );
      case "admin-config":
        return user?.role === "admin" ? (
          <AdminConfig onSettingsUpdate={refreshSiteSettings} />
        ) : (
          <NotFound onGoHome={() => setCurrentPage("dashboard")} />
        );
      case "admin-news":
        return user?.role === "admin" || user?.role === "staff" ? (
          <AdminNews />
        ) : (
          <NotFound onGoHome={() => setCurrentPage("dashboard")} />
        );
      case "admin-calendar":
        return user?.role === "admin" || user?.role === "staff" ? (
          <AdminCalendar />
        ) : (
          <NotFound onGoHome={() => setCurrentPage("dashboard")} />
        );
      case "admin-content":
        return user?.role === "admin" || user?.role === "staff" ? (
          <AdminContent />
        ) : (
          <NotFound onGoHome={() => setCurrentPage("dashboard")} />
        );

      default:
        return <NotFound onGoHome={() => setCurrentPage("dashboard")} />;
    }
  };

  // Layout Component
  const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
    <div
      className="min-h-screen bg-gray-50 flex"
      onClick={() => setShowNotifDropdown(false)}
    >
      {/* ToastContainer is rendered by ToastProvider at the app root */}

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-gray-200 fixed h-full z-10 shadow-sm">
        <div
          className="h-16 flex items-center px-6 border-b border-gray-100 bg-primary-900 text-white cursor-pointer"
          onClick={() => setCurrentPage("dashboard")}
        >
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3 font-bold overflow-hidden">
            {siteSettings?.logoUrl ? (
              <img
                src={siteSettings.logoUrl}
                className="w-full h-full object-cover"
              />
            ) : (
              "i"
            )}
          </div>
          <span className="font-bold text-lg tracking-tight truncate">
            {siteSettings?.barangayName || "iBarangay"}
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavButton
            active={currentPage === "dashboard"}
            onClick={() => setCurrentPage("dashboard")}
            icon={<Home size={20} />}
          >
            Dashboard
          </NavButton>
          <NavButton
            active={currentPage === "services"}
            onClick={() => setCurrentPage("services")}
            icon={<FileText size={20} />}
          >
            Services
          </NavButton>
          <NavButton
            active={currentPage === "complaints"}
            onClick={() => setCurrentPage("complaints")}
            icon={<MessageSquare size={20} />}
          >
            Complaints
          </NavButton>
          <NavButton
            active={currentPage === "events"}
            onClick={() => setCurrentPage("events")}
            icon={<Calendar size={20} />}
          >
            Events
          </NavButton>
          <NavButton
            active={currentPage === "announcements"}
            onClick={() => setCurrentPage("announcements")}
            icon={<Megaphone size={20} />}
          >
            Announcements
          </NavButton>

          {(user?.role === "admin" || user?.role === "staff") && (
            <>
              <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                CMS & Admin
              </div>
              <NavButton
                active={currentPage === "admin-news"}
                onClick={() => setCurrentPage("admin-news")}
                icon={<Newspaper size={20} />}
              >
                News CMS
              </NavButton>
              <NavButton
                active={currentPage === "admin-calendar"}
                onClick={() => setCurrentPage("admin-calendar")}
                icon={<Calendar size={20} />}
              >
                Calendar CMS
              </NavButton>
              <NavButton
                active={currentPage === "admin-content"}
                onClick={() => setCurrentPage("admin-content")}
                icon={<Globe size={20} />}
              >
                Content CMS
              </NavButton>

              {user?.role === "admin" && (
                <>
                  <NavButton
                    active={currentPage === "admin-users"}
                    onClick={() => setCurrentPage("admin-users")}
                    icon={<UsersIcon size={20} />}
                  >
                    Users
                  </NavButton>
                  <NavButton
                    active={currentPage === "admin-audit-logs"}
                    onClick={() => setCurrentPage("admin-audit-logs")}
                    icon={<FileClock size={20} />}
                  >
                    Audit Logs
                  </NavButton>
                  <NavButton
                    active={currentPage === "admin-config"}
                    onClick={() => setCurrentPage("admin-config")}
                    icon={<Settings size={20} />}
                  >
                    System Config
                  </NavButton>
                </>
              )}
            </>
          )}

          <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
            Support
          </div>
          <NavButton
            active={currentPage === "help"}
            onClick={() => setCurrentPage("help")}
            icon={<HelpCircle size={20} />}
          >
            Help & FAQ
          </NavButton>
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div
            className="flex items-center gap-3 mb-4 px-2 cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors"
            onClick={() => setCurrentPage("profile")}
          >
            <img
              src={user?.avatar}
              alt="Avatar"
              className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white shadow-sm object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-primary-600 capitalize font-medium">
                {user?.role}
              </p>
            </div>
            <Settings className="w-4 h-4 text-gray-400" />
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => {
              setUser(null);
              setCurrentPage("landing");
            }}
          >
            <LogOut size={18} className="mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-gray-900/50 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-64 h-full bg-white shadow-xl p-4 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center overflow-hidden">
                  {siteSettings?.logoUrl ? (
                    <img
                      src={siteSettings.logoUrl}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold">i</span>
                  )}
                </div>
                <span className="font-bold text-xl text-primary-900">
                  {siteSettings?.barangayName || "iBarangay"}
                </span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <nav className="space-y-2 flex-1 overflow-y-auto">
              <NavButton
                active={currentPage === "dashboard"}
                onClick={() => {
                  setCurrentPage("dashboard");
                  setIsMobileMenuOpen(false);
                }}
                icon={<Home size={20} />}
              >
                Dashboard
              </NavButton>
              <NavButton
                active={currentPage === "services"}
                onClick={() => {
                  setCurrentPage("services");
                  setIsMobileMenuOpen(false);
                }}
                icon={<FileText size={20} />}
              >
                Services
              </NavButton>
              <NavButton
                active={currentPage === "complaints"}
                onClick={() => {
                  setCurrentPage("complaints");
                  setIsMobileMenuOpen(false);
                }}
                icon={<MessageSquare size={20} />}
              >
                Complaints
              </NavButton>
              <NavButton
                active={currentPage === "events"}
                onClick={() => {
                  setCurrentPage("events");
                  setIsMobileMenuOpen(false);
                }}
                icon={<Calendar size={20} />}
              >
                Events
              </NavButton>
              <NavButton
                active={currentPage === "profile"}
                onClick={() => {
                  setCurrentPage("profile");
                  setIsMobileMenuOpen(false);
                }}
                icon={<UserIcon size={20} />}
              >
                My Profile
              </NavButton>

              {(user?.role === "admin" || user?.role === "staff") && (
                <>
                  <div className="pt-2 text-xs font-bold text-gray-400 uppercase">
                    CMS
                  </div>
                  <NavButton
                    active={currentPage === "admin-news"}
                    onClick={() => {
                      setCurrentPage("admin-news");
                      setIsMobileMenuOpen(false);
                    }}
                    icon={<Newspaper size={20} />}
                  >
                    News
                  </NavButton>
                  <NavButton
                    active={currentPage === "admin-calendar"}
                    onClick={() => {
                      setCurrentPage("admin-calendar");
                      setIsMobileMenuOpen(false);
                    }}
                    icon={<Calendar size={20} />}
                  >
                    Calendar
                  </NavButton>
                </>
              )}

              {user?.role === "admin" && (
                <>
                  <div className="pt-2 text-xs font-bold text-gray-400 uppercase">
                    Admin
                  </div>
                  <NavButton
                    active={currentPage === "admin-users"}
                    onClick={() => {
                      setCurrentPage("admin-users");
                      setIsMobileMenuOpen(false);
                    }}
                    icon={<UsersIcon size={20} />}
                  >
                    Users
                  </NavButton>
                  <NavButton
                    active={currentPage === "admin-config"}
                    onClick={() => {
                      setCurrentPage("admin-config");
                      setIsMobileMenuOpen(false);
                    }}
                    icon={<Settings size={20} />}
                  >
                    Config
                  </NavButton>
                </>
              )}
            </nav>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setUser(null)}
            >
              Sign Out
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen transition-all duration-300">
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-20 flex items-center justify-between px-4 lg:px-8 shadow-sm/50">
          <div className="flex items-center">
            <button
              className="lg:hidden p-2 -ml-2 mr-2 text-gray-600 hover:bg-gray-100 rounded-md"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-gray-800 capitalize hidden sm:block">
              {currentPage.replace(/-/g, " ").replace("admin", "")}
            </h2>
          </div>

          <div className="flex items-center gap-4 relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowNotifDropdown(!showNotifDropdown);
              }}
              className={`relative p-2 rounded-full transition-colors ${
                showNotifDropdown
                  ? "bg-primary-50 text-primary-600"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </button>

            {/* Notification Popover */}
            {showNotifDropdown && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-sm text-gray-900">
                    Notifications
                  </span>
                  <span
                    className="text-xs text-primary-600 cursor-pointer"
                    onClick={() => {
                      setCurrentPage("notifications");
                      setUnreadCount(0);
                    }}
                  >
                    View All
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {recentNotifs.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No new notifications
                    </div>
                  ) : (
                    recentNotifs.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${
                          !n.isRead ? "bg-primary-50/30" : ""
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1 text-right">
                          {new Date(n.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="p-4 lg:p-8 flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
            {children}
          </div>
        </div>
      </main>
    </div>
  );

  const NavButton = ({ active, onClick, icon, children }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
        active
          ? "bg-primary-50 text-primary-700"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <span
        className={`mr-3 ${
          active
            ? "text-primary-600"
            : "text-gray-400 group-hover:text-gray-500"
        }`}
      >
        {icon}
      </span>
      {children}
    </button>
  );

  // Unauthenticated Routes
  if (!user) {
    if (currentPage === "login")
      return (
        <Login
          onLogin={(u) => {
            setUser(u);
            setCurrentPage("dashboard");
          }}
        />
      );
    if (currentPage === "signup")
      return (
        <Signup
          onBack={() => setCurrentPage("login")}
          onSuccess={() => setCurrentPage("login")}
        />
      );
    if (currentPage === "hotlines")
      return <Hotlines onBack={() => setCurrentPage("landing")} />;
    if (currentPage === "news")
      return <NewsPage onBack={() => setCurrentPage("landing")} />;
    return (
      <Landing
        onLogin={() => setCurrentPage("login")}
        onSignup={() => setCurrentPage("signup")}
        onNavigate={(page) => setCurrentPage(page as Page)}
        siteSettings={siteSettings}
      />
    );
  }

  return <Layout>{renderPage()}</Layout>;
}
