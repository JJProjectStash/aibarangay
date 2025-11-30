import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Shield,
  Users,
  Activity,
  Calendar,
  Megaphone,
  MapPin,
  Clock,
  Newspaper,
  ChevronRight,
  Phone,
  X,
  Sparkles,
  Zap,
  Heart,
} from "lucide-react";
import { Button, Card, CardContent, Badge, Modal } from "../components/UI";
import { SharedCalendar } from "../components/SharedCalendar";
import { api } from "../services/api";
import {
  Announcement,
  Event,
  NewsItem,
  Official,
  SiteSettings,
} from "../types";

interface LandingProps {
  onLogin: () => void;
  onSignup: () => void;
  onNavigate?: (page: string) => void;
  siteSettings: SiteSettings | null;
}

const Landing: React.FC<LandingProps> = ({
  onLogin,
  onSignup,
  onNavigate,
  siteSettings,
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [officials, setOfficials] = useState<Official[]>([]);
  const [loading, setLoading] = useState(true);
  const [requiresSignIn, setRequiresSignIn] = useState(false);

  // Modals for Footer/News
  const [activeModal, setActiveModal] = useState<"privacy" | "terms" | null>(
    null
  );
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const results = await Promise.allSettled([
        api.getPublicEvents(),
        api.getPublicAnnouncements(),
        api.getPublicNews(),
        api.getPublicOfficials(),
      ]);

      // Results order matches the original Promise.all
      const [eventsRes, announcementsRes, newsRes, officialsRes] = results;

      setEvents(
        eventsRes.status === "fulfilled" ? (eventsRes.value as Event[]) : []
      );
      setAnnouncements(
        announcementsRes.status === "fulfilled"
          ? (announcementsRes.value as Announcement[])
              .filter((a) => a.isPublished)
              .slice(0, 3)
          : []
      );
      setNews(
        newsRes.status === "fulfilled"
          ? (newsRes.value as NewsItem[]).slice(0, 3)
          : []
      );
      setOfficials(
        officialsRes.status === "fulfilled"
          ? (officialsRes.value as Official[])
          : []
      );

      const rejected = results.filter((r) => r.status === "rejected");
      if (rejected.length) {
        console.warn("Some landing fetches failed:", rejected);
        rejected.forEach((r) => {
          const reason = (r as PromiseRejectedResult).reason;
          if (reason?.status === 401) {
            setRequiresSignIn(true);
            console.info(
              "A landing endpoint is returning 401: it may require authentication."
            );
          }
        });
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  const displayName = siteSettings?.barangayName || "iBarangay";
  const displayLogo = siteSettings?.logoUrl;

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-primary-100 selection:text-primary-900">
      {/* Nav */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-md z-40 transition-all shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/30 overflow-hidden group-hover:scale-110 transition-transform duration-300">
              {displayLogo ? (
                <img
                  src={displayLogo}
                  className="w-full h-full object-cover"
                  alt="Logo"
                />
              ) : (
                "i"
              )}
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight group-hover:text-primary-600 transition-colors">
              {displayName}
            </span>
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={onLogin}
              className="text-gray-600 font-medium hover:text-primary-600 hover:bg-primary-50 transition-all"
            >
              Sign In
            </Button>
            <Button
              onClick={onSignup}
              className="font-medium shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 transition-all hover:scale-105 active:scale-95"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-teal-900 pt-20 pb-32 text-white">
        {requiresSignIn && (
          <div className="absolute top-4 right-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-3 rounded shadow-lg z-50 animate-slide-up">
            <div className="text-sm font-medium">
              Some content on this page requires authentication.
            </div>
            <div className="text-xs text-yellow-600">
              Sign in to view protected content or make the endpoint public on
              the backend for non-authenticated users.
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-primary-900 to-teal-900" />
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <Badge
            variant="primary"
            className="bg-white/10 text-primary-50 border border-white/10 mb-6 backdrop-blur-sm px-4 py-1.5 text-sm uppercase tracking-wide font-semibold shadow-sm animate-slide-up"
          >
            <Sparkles className="w-4 h-4 mr-1 inline" />
            Official Barangay Portal
          </Badge>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl text-white mb-6 leading-tight drop-shadow-lg animate-slide-up">
            Digital Services for a<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-200 via-teal-200 to-primary-300 animate-shimmer">
              Better Community
            </span>
          </h1>
          <p
            className="mt-4 max-w-2xl text-xl text-primary-100 leading-relaxed font-light animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            Stay connected. Access services, file complaints, and get the latest
            updates anytime, anywhere with the new {displayName} system.
          </p>
          <div
            className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <Button
              size="lg"
              onClick={onSignup}
              className="h-14 px-8 text-lg bg-white text-primary-900 hover:bg-primary-50 shadow-xl shadow-primary-900/20 font-bold hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Register Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-8 text-lg border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm hover:border-white/50 transition-all duration-300"
              onClick={onLogin}
            >
              Member Login
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats/Features overlapping Hero */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 mb-20 z-10">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <Shield className="w-8 h-8" />,
              title: "Secure & Verified",
              text: "Only verified residents can access sensitive services.",
              color: "blue",
              gradient: "from-blue-500 to-blue-600",
            },
            {
              icon: <Activity className="w-8 h-8" />,
              title: "Real-time Updates",
              text: "Track complaints and requests with instant notifications.",
              color: "teal",
              gradient: "from-teal-500 to-teal-600",
            },
            {
              icon: <Users className="w-8 h-8" />,
              title: "Community First",
              text: "Bridging the gap between officials and residents.",
              color: "purple",
              gradient: "from-purple-500 to-purple-600",
            },
          ].map((feat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 flex items-start gap-4 transform hover:-translate-y-2 transition-all duration-300 card-hover animate-slide-up"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div
                className={`p-3 rounded-xl bg-gradient-to-br ${feat.gradient} text-white shadow-lg`}
              >
                {feat.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {feat.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {feat.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Latest News Section */}
      <div className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <Newspaper className="w-8 h-8 text-primary-600" />
                </div>
                Community News
              </h2>
              <p className="text-gray-500 mt-2 text-lg">
                What's happening in our barangay
              </p>
            </div>
            <Button
              variant="ghost"
              className="text-primary-600 hover:text-primary-700 font-semibold hover:bg-primary-50 transition-all"
              onClick={() => onNavigate && onNavigate("news")}
            >
              View All News <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
              <p className="text-gray-500 mt-4">Loading news...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((item, idx) => (
                <div
                  key={item.id}
                  className="group cursor-pointer flex flex-col h-full bg-white rounded-2xl hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden card-hover animate-slide-up"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                  onClick={() => setSelectedNews(item)}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
                    <span className="absolute bottom-4 left-4 text-white text-xs font-medium bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(item.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-3 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-3 text-sm leading-relaxed mb-4 flex-1">
                      {item.summary}
                    </p>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                      <span className="text-xs text-gray-400 font-medium">
                        By {item.author}
                      </span>
                      <button className="text-primary-600 font-bold text-sm flex items-center hover:underline group-hover:translate-x-1 transition-transform">
                        Read Story <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Community Calendar Section */}
      <div className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
              <div className="p-2 bg-primary-50 rounded-lg">
                <Calendar className="w-8 h-8 text-primary-600" />
              </div>
              Community Calendar
            </h2>
            <p className="text-gray-500 mt-3 text-lg">
              Schedule of events and activities
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 shadow-xl rounded-xl overflow-hidden border border-gray-200">
              <SharedCalendar events={events} readOnly />
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary-500" /> Upcoming Highlights
              </h3>
              {events.slice(0, 3).map((event, idx) => (
                <Card
                  key={event.id}
                  className="border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white card-hover animate-slide-up"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <CardContent className="p-4 flex gap-4 items-start">
                    <div className="bg-gradient-to-br from-primary-50 to-primary-100 text-primary-700 rounded-lg p-3 text-center min-w-[60px] border border-primary-200 shadow-sm">
                      <div className="text-xs font-bold uppercase">
                        {new Date(event.eventDate).toLocaleString("default", {
                          month: "short",
                        })}
                      </div>
                      <div className="text-2xl font-bold">
                        {new Date(event.eventDate).getDate()}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 line-clamp-1 text-base">
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Clock className="w-3 h-3" />{" "}
                        {new Date(event.eventDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <MapPin className="w-3 h-3" /> {event.location}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3 h-7 text-xs hover:bg-primary-50 hover:text-primary-700 hover:border-primary-300 transition-all"
                        onClick={onLogin}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Officials Section */}
      <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
              <div className="p-2 bg-primary-50 rounded-lg">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              Meet Your Officials
            </h2>
            <p className="text-gray-500 mt-3 text-lg">
              Dedicated leaders serving our community
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {officials.map((official, idx) => (
              <div
                key={official.id}
                className="bg-white border border-gray-100 rounded-xl p-6 text-center shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 card-hover animate-slide-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="w-24 h-24 rounded-full mx-auto p-1 border-2 border-primary-100 bg-white mb-4 shadow-lg overflow-hidden">
                  <img
                    src={official.imageUrl}
                    alt={official.name}
                    className="w-full h-full rounded-full object-cover bg-gray-100"
                  />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">
                  {official.name}
                </h3>
                <p className="text-primary-600 text-sm font-medium uppercase tracking-wide mt-1">
                  {official.position}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Announcements Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-1/3">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <Megaphone className="w-8 h-8 text-primary-600" />
                </div>
                Announcements
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-6">
                Important updates from the Barangay Hall. Please check regularly
                for schedule changes, policies, and emergency alerts.
              </p>
              <Button
                variant="outline"
                className="w-full sm:w-auto hover:bg-primary-50 hover:text-primary-600 hover:border-primary-300 transition-all"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <Heart className="w-4 h-4 mr-2" />
                Subscribe to Alerts
              </Button>
            </div>

            <div className="md:w-2/3 space-y-4">
              {announcements.map((announcement, idx) => (
                <div
                  key={announcement.id}
                  className="bg-white border-l-4 border-primary-500 pl-6 py-4 pr-4 relative shadow-md rounded-r-xl hover:shadow-xl transition-all duration-300 card-hover animate-slide-up"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <Badge
                      variant={
                        announcement.priority === "high" ? "danger" : "default"
                      }
                      className="uppercase text-[10px] tracking-wider font-bold"
                    >
                      {announcement.category}
                    </Badge>
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {announcement.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {announcement.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Quick Contact */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => onNavigate && onNavigate("hotlines")}
          className="bg-gradient-to-br from-red-600 to-red-700 text-white p-4 rounded-full shadow-2xl shadow-red-600/40 hover:shadow-red-600/60 hover:scale-110 transition-all duration-300 group relative animate-bounce-slow"
        >
          <Phone className="w-6 h-6" />
          <span className="absolute right-full mr-4 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-medium top-1/2 -translate-y-1/2 shadow-xl">
            Emergency Hotlines
          </span>
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold overflow-hidden shadow-lg">
                {displayLogo ? (
                  <img
                    src={displayLogo}
                    className="w-full h-full object-cover"
                    alt="Logo"
                  />
                ) : (
                  "i"
                )}
              </div>
              <span className="text-xl font-bold text-white">
                {displayName}
              </span>
            </div>
            <p className="max-w-md leading-relaxed mb-6 text-gray-400">
              Empowering communities through digital innovation. Efficient
              service delivery and transparent governance for every resident.
            </p>
            <div className="flex gap-4">
              {["f", "t", "in"].map((social, idx) => (
                <div
                  key={idx}
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all cursor-pointer font-bold shadow-lg hover:scale-110 hover:shadow-primary-600/50"
                >
                  {social}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide uppercase text-sm">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={onLogin}
                  className="hover:text-primary-400 transition-colors hover:translate-x-1 inline-block"
                >
                  Resident Login
                </button>
              </li>
              <li>
                <button
                  onClick={onSignup}
                  className="hover:text-primary-400 transition-colors hover:translate-x-1 inline-block"
                >
                  New Registration
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal("privacy")}
                  className="hover:text-primary-400 transition-colors hover:translate-x-1 inline-block"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal("terms")}
                  className="hover:text-primary-400 transition-colors hover:translate-x-1 inline-block"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide uppercase text-sm">
              Contact Us
            </h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 group">
                <MapPin className="w-5 h-5 text-gray-600 group-hover:text-primary-500 transition-colors mt-0.5" />
                <span>
                  {siteSettings?.address ||
                    "Barangay Hall, 123 Rizal St.\nQuezon City, 1100"}
                </span>
              </li>
              <li className="flex items-center gap-3 group">
                <Phone className="w-5 h-5 text-gray-600 group-hover:text-primary-500 transition-colors" />
                <span>{siteSettings?.contactPhone || "(02) 8123-4567"}</span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="w-5 h-5 flex items-center justify-center text-gray-600 group-hover:text-primary-500 transition-colors">
                  @
                </div>
                <span>
                  {siteSettings?.contactEmail || "help@ibarangay.com"}
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          &copy; 2024 {displayName} Online Services. All rights reserved.
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      <Modal
        isOpen={activeModal === "privacy"}
        onClose={() => setActiveModal(null)}
        title="Privacy Policy"
      >
        <div className="space-y-4 text-sm text-gray-600">
          <p>
            Your privacy is important to us. It is {displayName}'s policy to
            respect your privacy regarding any information we may collect from
            you across our website.
          </p>
          <h4 className="font-bold text-gray-900">1. Information We Collect</h4>
          <p>
            We only ask for personal information when we truly need it to
            provide a service to you. We collect it by fair and lawful means,
            with your knowledge and consent.
          </p>
          <h4 className="font-bold text-gray-900">2. How We Use Information</h4>
          <p>
            We use your data to provide barangay services, process complaints,
            and verify residency. We do not share your data publicly or with
            third-parties, except when required to by law.
          </p>
        </div>
      </Modal>

      {/* Terms Modal */}
      <Modal
        isOpen={activeModal === "terms"}
        onClose={() => setActiveModal(null)}
        title="Terms of Service"
      >
        <div className="space-y-4 text-sm text-gray-600">
          <p>
            By accessing the website at {displayName}, you are agreeing to be
            bound by these terms of service, all applicable laws and
            regulations, and agree that you are responsible for compliance with
            any applicable local laws.
          </p>
          <h4 className="font-bold text-gray-900">1. Use License</h4>
          <p>
            Permission is granted to temporarily download one copy of the
            materials (information or software) on {displayName}'s website for
            personal, non-commercial transitory viewing only.
          </p>
        </div>
      </Modal>

      {/* News Article Modal */}
      <Modal
        isOpen={!!selectedNews}
        onClose={() => setSelectedNews(null)}
        title=""
      >
        {selectedNews && (
          <div className="space-y-6">
            <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden shadow-inner relative">
              <img
                src={selectedNews.imageUrl}
                alt={selectedNews.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <h3 className="absolute bottom-4 left-4 right-4 text-2xl font-bold text-white shadow-black">
                {selectedNews.title}
              </h3>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 border-b border-gray-100 pb-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />{" "}
                {new Date(selectedNews.publishedAt).toLocaleDateString()}
              </span>
              <span>By {selectedNews.author}</span>
            </div>

            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
              {selectedNews.content}
            </p>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setSelectedNews(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Landing;
