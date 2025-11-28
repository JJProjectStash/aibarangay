import React, { useEffect, useState } from "react";
import {
  Users,
  FileText,
  Calendar,
  Activity,
  TrendingUp,
  AlertCircle,
  Download,
  FolderOpen,
  PlusCircle,
  MessageSquarePlus,
  ArrowRight,
  Megaphone,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Skeleton,
  Badge,
} from "../components/UI";
import { api } from "../services/api";
import { useToast } from '../components/Toast';
import { User, Announcement } from "../types";

interface DashboardProps {
  user: User;
  onNavigate?: (page: string) => void;
}

const COLORS = ["#14b8a6", "#f59e0b", "#ef4444", "#3b82f6"];

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [latestAnnouncement, setLatestAnnouncement] =
    useState<Announcement | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const data = await api.getStats(user);
      setStats(data);
      if (user.role === "resident") {
        const announcements = await api.getAnnouncements();
        const pinned = announcements.find((a) => a.isPinned && a.isPublished);
        setLatestAnnouncement(pinned || announcements[0] || null);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const { showToast } = useToast();
  const handlePrintReport = async () => {
    try {
      setGeneratingPDF(true);
      const blob = await api.generateReport();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `barangay-report-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate report:", error);
      showToast('Error', 'Failed to generate report. Please try again.', 'error');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const dataComplaintTrend = [
    { name: "Mon", count: 4 },
    { name: "Tue", count: 7 },
    { name: "Wed", count: 3 },
    { name: "Thu", count: 8 },
    { name: "Fri", count: 5 },
    { name: "Sat", count: 2 },
    { name: "Sun", count: 1 },
  ];

  const dataCategory = [
    { name: "Sanitation", value: 400 },
    { name: "Noise", value: 300 },
    { name: "Infra", value: 300 },
    { name: "Security", value: 200 },
  ];

  const getStatCards = () => {
    if (user.role === "resident") {
      return [
        {
          title: "Pending Complaints",
          value: stats?.myPendingComplaints || 0,
          icon: <AlertCircle className="h-6 w-6 text-orange-600" />,
          color: "bg-orange-50",
          trend: "Waiting for action",
        },
        {
          title: "Active Requests",
          value: stats?.myActiveServices || 0,
          icon: <FileText className="h-6 w-6 text-blue-600" />,
          color: "bg-blue-50",
          trend: "Items/Facilities",
        },
        {
          title: "Upcoming Events",
          value: stats?.upcomingEvents || 0,
          icon: <Calendar className="h-6 w-6 text-purple-600" />,
          color: "bg-purple-50",
          trend: "Next: Assembly",
        },
        {
          title: "Total Submissions",
          value: stats?.myTotalComplaints || 0,
          icon: <FolderOpen className="h-6 w-6 text-teal-600" />,
          color: "bg-teal-50",
          trend: "Lifetime",
        },
      ];
    }
    // Staff/Admin Cards
    return [
      {
        title: "Total Residents",
        value: stats?.totalResidents,
        icon: <Users className="h-6 w-6 text-primary-600" />,
        color: "bg-primary-50",
        trend: "+12% from last month",
      },
      {
        title: "Pending Complaints",
        value: stats?.pendingComplaints,
        icon: <AlertCircle className="h-6 w-6 text-orange-600" />,
        color: "bg-orange-50",
        trend: "-2% from last week",
      },
      {
        title: "Active Services",
        value: stats?.activeServices,
        icon: <FileText className="h-6 w-6 text-blue-600" />,
        color: "bg-blue-50",
        trend: "+5 new today",
      },
      {
        title: "Resolved Cases",
        value: stats?.resolvedComplaints,
        icon: <Activity className="h-6 w-6 text-green-600" />,
        color: "bg-green-50",
        trend: "+8 this week",
      },
    ];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-gray-500">
            {user.role === "resident"
              ? "Here is the status of your recent activities."
              : "Overview of barangay operations and performance."}
          </p>
        </div>
        {(user.role === "admin" || user.role === "staff") && (
          <Button
            variant="outline"
            onClick={handlePrintReport}
            isLoading={generatingPDF}
          >
            <Download className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        )}
      </div>

      {/* Resident Featured Sections */}
      {user.role === "resident" && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-4">
            <button className="flex items-center justify-between p-4 bg-primary-600 text-white rounded-xl shadow-md hover:bg-primary-700 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <MessageSquarePlus className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold">File a Complaint</h3>
                  <p className="text-primary-100 text-sm">
                    Report issues in your area
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
            </button>

            <button className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold">Request Service</h3>
                  <p className="text-blue-100 text-sm">
                    Borrow equipment or facilities
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Latest Announcement Widget */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-100 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Megaphone className="w-5 h-5 text-orange-600" />
              <h3 className="font-bold text-gray-900">Latest Update</h3>
              {latestAnnouncement?.isPinned && (
                <Badge variant="danger" className="text-[10px]">
                  PINNED
                </Badge>
              )}
            </div>
            {loading ? (
              <Skeleton className="w-full h-16" />
            ) : latestAnnouncement ? (
              <div>
                <h4 className="font-semibold text-gray-900 line-clamp-1">
                  {latestAnnouncement.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {latestAnnouncement.content}
                </p>
                <p className="text-xs text-gray-400 mt-3">
                  {new Date(latestAnnouncement.createdAt).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No new announcements.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array(4)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="h-32">
                  <CardContent className="p-6 h-full flex flex-col justify-between">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-10 rounded-lg" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))
          : getStatCards().map((stat, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-start justify-between p-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </p>
                    <h3 className="mt-2 text-3xl font-bold text-gray-900">
                      {stat.value}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1 text-green-500" />{" "}
                      {stat.trend}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    {stat.icon}
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Analytics Section - Only for Staff/Admin */}
      {(user.role === "admin" || user.role === "staff") && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Complaint Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {loading ? (
                  <Skeleton className="w-full h-full rounded-lg" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataComplaintTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: "#f0fdfa" }}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#14b8a6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Complaint Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full flex items-center justify-center">
                {loading ? (
                  <Skeleton className="w-48 h-48 rounded-full" />
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dataCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {dataCategory.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 ml-4">
                      {dataCategory.map((entry, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          ></div>
                          <span className="text-gray-600">{entry.name}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading
              ? [1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))
              : [1, 2, 3].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.role === "resident"
                          ? `Your request #${1020 + i} was updated`
                          : `New complaint submitted by Resident #${100 + i}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {i * 2 + 5} mins ago
                      </p>
                    </div>
                  </div>
                ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
