import React, { useEffect, useState } from "react";
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Paperclip,
  Send,
  Image as ImageIcon,
  X,
  User as UserIcon,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  Textarea,
  Badge,
  Modal,
  FileUpload,
} from "../components/UI";
import { api } from "../services/api";
import { Complaint, User, Comment } from "../types";
import { useToast } from "../components/Toast";
import { format } from "date-fns";

interface ComplaintsProps {
  user: User;
}

const Complaints: React.FC<ComplaintsProps> = ({ user }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [createModal, setCreateModal] = useState(false);
  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    complaint: Complaint | null;
  }>({ isOpen: false, complaint: null });
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
  });
  const [attachments, setAttachments] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    "Infrastructure",
    "Sanitation",
    "Security",
    "Noise",
    "Lighting",
    "Drainage",
    "Road",
    "Other",
  ];

  // Check if user is admin or staff
  const isAdminOrStaff = user.role === "admin" || user.role === "staff";

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    filterComplaints();
  }, [complaints, searchQuery, statusFilter, categoryFilter]);

  const fetchComplaints = async () => {
    try {
      const data = await api.getComplaints(user);
      setComplaints(data);
    } catch (error) {
      showToast("Error", "Failed to fetch complaints", "error");
    }
  };

  const filterComplaints = () => {
    let filtered = [...complaints];

    // Search filter - dynamically search in title and description
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.category.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((c) => c.category === categoryFilter);
    }

    // Sort by date (newest first)
    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setFilteredComplaints(filtered);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim() || formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    }
    if (formData.title.length > 100) {
      newErrors.title = "Title must not exceed 100 characters";
    }

    if (!formData.description.trim() || formData.description.length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }
    if (formData.description.length > 1000) {
      newErrors.description = "Description must not exceed 1000 characters";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (attachments.length > 5) {
      newErrors.attachments = "Maximum 5 attachments allowed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      showToast(
        "Validation Error",
        "Please fix the errors in the form",
        "error"
      );
      return;
    }

    setLoading(true);
    try {
      await api.createComplaint({
        ...formData,
        userId: user.id,
        status: "pending",
        attachments: attachments,
        history: [],
      });
      setCreateModal(false);
      setFormData({
        title: "",
        description: "",
        category: "",
        priority: "medium",
      });
      setAttachments([]);
      setErrors({});
      showToast("Success", "Complaint submitted successfully", "success");
      fetchComplaints();
    } catch (error: any) {
      showToast(
        "Error",
        error.message || "Failed to submit complaint",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !detailModal.complaint) {
      showToast("Error", "Please enter a comment", "error");
      return;
    }

    if (commentText.length > 500) {
      showToast("Error", "Comment must not exceed 500 characters", "error");
      return;
    }

    try {
      const newComment = await api.addComplaintComment(
        detailModal.complaint.id,
        {
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          userRole: user.role,
          message: commentText,
        }
      );

      const updatedComplaint = {
        ...detailModal.complaint,
        comments: [...detailModal.complaint.comments, newComment],
      };

      setDetailModal({ isOpen: true, complaint: updatedComplaint });
      setCommentText("");
      showToast("Success", "Comment added", "success");
      fetchComplaints();
    } catch (error: any) {
      showToast("Error", error.message || "Failed to add comment", "error");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "in-progress":
        return <AlertCircle className="w-4 h-4" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4" />;
      case "closed":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "in-progress":
        return "info";
      case "resolved":
        return "success";
      case "closed":
        return "default";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "danger";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "default";
      default:
        return "default";
    }
  };

  const addAttachment = (base64: string) => {
    if (attachments.length >= 5) {
      showToast("Error", "Maximum 5 attachments allowed", "error");
      return;
    }
    setAttachments([...attachments, base64]);
    setErrors({ ...errors, attachments: "" });
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // Admin/Staff see all complaints, regular users see only their own
  const displayComplaints = isAdminOrStaff
    ? filteredComplaints
    : filteredComplaints.filter((c) => c.userId === user.id);

  const myComplaints = filteredComplaints.filter((c) => c.userId === user.id);

  const stats = {
    total: myComplaints.length,
    pending: myComplaints.filter((c) => c.status === "pending").length,
    inProgress: myComplaints.filter((c) => c.status === "in-progress").length,
    resolved: myComplaints.filter((c) => c.status === "resolved").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Complaints & Reports
          </h1>
          <p className="text-gray-500">
            {isAdminOrStaff
              ? "Manage and respond to all complaints"
              : "Report issues and track their resolution"}
          </p>
        </div>
        <Button onClick={() => setCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          File Complaint
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {isAdminOrStaff ? "All Complaints" : "My Total"}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {isAdminOrStaff ? filteredComplaints.length : stats.total}
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-amber-600">
                  {isAdminOrStaff
                    ? filteredComplaints.filter((c) => c.status === "pending")
                        .length
                    : stats.pending}
                </p>
              </div>
              <Clock className="w-8 h-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {isAdminOrStaff
                    ? filteredComplaints.filter(
                        (c) => c.status === "in-progress"
                      ).length
                    : stats.inProgress}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {isAdminOrStaff
                    ? filteredComplaints.filter((c) => c.status === "resolved")
                        .length
                    : stats.resolved}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search complaints..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </Select>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </div>
          {(searchQuery ||
            statusFilter !== "all" ||
            categoryFilter !== "all") && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>
                Showing {displayComplaints.length} of {complaints.length}{" "}
                complaints
              </span>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                }}
                className="ml-auto text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Complaints List */}
      <div className="space-y-4">
        {displayComplaints.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ||
                statusFilter !== "all" ||
                categoryFilter !== "all"
                  ? "No complaints found"
                  : "No complaints yet"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery ||
                statusFilter !== "all" ||
                categoryFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Start by filing your first complaint"}
              </p>
              {!searchQuery &&
                statusFilter === "all" &&
                categoryFilter === "all" && (
                  <Button onClick={() => setCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    File Complaint
                  </Button>
                )}
            </CardContent>
          </Card>
        ) : (
          displayComplaints.map((complaint) => (
            <Card
              key={complaint.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() =>
                setDetailModal({ isOpen: true, complaint: complaint })
              }
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {complaint.title}
                      </h3>
                      <Badge variant={getPriorityColor(complaint.priority)}>
                        {complaint.priority}
                      </Badge>
                      {isAdminOrStaff && complaint.user && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <UserIcon className="w-3 h-3" />
                          {typeof complaint.user === 'object' 
                            ? `${complaint.user.firstName} ${complaint.user.lastName}`
                            : 'User'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {complaint.description}
                    </p>
                  </div>
                  <Badge
                    variant={getStatusColor(complaint.status)}
                    className="ml-4"
                  >
                    {getStatusIcon(complaint.status)}
                    <span className="ml-1 capitalize">
                      {complaint.status.replace("-", " ")}
                    </span>
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-gray-500">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {complaint.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {format(new Date(complaint.createdAt), "MMM d, yyyy")}
                    </span>
                    {complaint.attachments &&
                      complaint.attachments.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Paperclip className="w-4 h-4" />
                          {complaint.attachments.length}
                        </span>
                      )}
                  </div>
                  {complaint.comments && complaint.comments.length > 0 && (
                    <span className="text-primary-600 font-medium">
                      {complaint.comments.length} comment
                      {complaint.comments.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Complaint Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => {
          setCreateModal(false);
          setFormData({
            title: "",
            description: "",
            category: "",
            priority: "medium",
          });
          setAttachments([]);
          setErrors({});
        }}
        title="File a Complaint"
        className="max-w-2xl"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <Label required>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (errors.title) setErrors({ ...errors, title: "" });
              }}
              placeholder="Brief summary of the issue"
              maxLength={100}
              error={errors.title}
            />
            <p className="text-xs text-gray-500">
              {formData.title.length}/100 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label required>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (errors.description)
                  setErrors({ ...errors, description: "" });
              }}
              placeholder="Provide detailed information about the issue..."
              className="min-h-[120px]"
              maxLength={1000}
              error={errors.description}
            />
            <p className="text-xs text-gray-500">
              {formData.description.length}/1000 characters
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label required>Category</Label>
              <Select
                value={formData.category}
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value });
                  if (errors.category) setErrors({ ...errors, category: "" });
                }}
                error={errors.category}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label required>Priority</Label>
              <Select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as any,
                  })
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Attachments (Optional)</Label>
            {attachments.length < 5 && (
              <FileUpload
                value=""
                onChange={addAttachment}
                label=""
                helperText="Add photos or documents (Max 5 files, 5MB each)"
              />
            )}
            {errors.attachments && (
              <p className="text-xs text-red-600">{errors.attachments}</p>
            )}
            {attachments.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {attachments.map((att, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={att}
                      alt={`Attachment ${idx + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setCreateModal(false);
                setFormData({
                  title: "",
                  description: "",
                  category: "",
                  priority: "medium",
                });
                setAttachments([]);
                setErrors({});
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Complaint"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, complaint: null })}
        title="Complaint Details"
        className="max-w-3xl"
      >
        {detailModal.complaint && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {detailModal.complaint.title}
                </h2>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant={getStatusColor(detailModal.complaint.status)}>
                    {getStatusIcon(detailModal.complaint.status)}
                    <span className="ml-1 capitalize">
                      {detailModal.complaint.status.replace("-", " ")}
                    </span>
                  </Badge>
                  <Badge
                    variant={getPriorityColor(detailModal.complaint.priority)}
                  >
                    {detailModal.complaint.priority}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {detailModal.complaint.category}
                  </span>
                  {isAdminOrStaff && detailModal.complaint.user && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <UserIcon className="w-3 h-3" />
                      {typeof detailModal.complaint.user === 'object'
                        ? `${detailModal.complaint.user.firstName} ${detailModal.complaint.user.lastName}`
                        : 'User'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {detailModal.complaint.description}
              </p>
            </div>

            {detailModal.complaint.attachments &&
              detailModal.complaint.attachments.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Attachments
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {detailModal.complaint.attachments.map((att, idx) => (
                      <img
                        key={idx}
                        src={att}
                        alt={`Attachment ${idx + 1}`}
                        className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-75"
                        onClick={() => window.open(att, "_blank")}
                      />
                    ))}
                  </div>
                </div>
              )}

            <div className="text-sm text-gray-500">
              <p>
                Filed on{" "}
                {format(
                  new Date(detailModal.complaint.createdAt),
                  "MMMM d, yyyy 'at' h:mm a"
                )}
              </p>
              <p>
                Last updated{" "}
                {format(
                  new Date(detailModal.complaint.updatedAt),
                  "MMMM d, yyyy 'at' h:mm a"
                )}
              </p>
            </div>

            {/* Comments Section */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-4">
                Comments & Updates
              </h3>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {detailModal.complaint.comments &&
                detailModal.complaint.comments.length > 0 ? (
                  detailModal.complaint.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-gray-900">
                          {comment.userName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(comment.timestamp), "MMM d, h:mm a")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No comments yet
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  maxLength={500}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {commentText.length}/500 characters
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Complaints;