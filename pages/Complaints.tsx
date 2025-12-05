import React, { useEffect, useState, useMemo, useCallback } from "react";
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
  Edit,
  Download,
  FileSpreadsheet,
  Printer,
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
  Skeleton,
} from "../components/UI";
import { api } from "../services/api";
import { Complaint, User, Comment } from "../types";
import { useToast } from "../components/Toast";
import { format } from "date-fns";
import { Pagination } from "../components/Pagination";
import { usePagination, useDebounce } from "../hooks/useAsync";
import {
  PageLoader,
  EmptyState,
  ErrorState,
  TableSkeleton,
  CardSkeleton,
  StatCardSkeleton,
  LoadingOverlay,
} from "../components/Loading";
import {
  useBulkSelection,
  BulkCheckbox,
  BulkActionBar,
  BulkStatusModal,
} from "../components/BulkActions";
import { exportComplaints } from "../utils/export";

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
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    complaint: Complaint | null;
  }>({ isOpen: false, complaint: null });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const { showToast } = useToast();

  // Debounced search for better performance
  const debouncedSearch = useDebounce(searchQuery, 300);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
  });
  const [attachments, setAttachments] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [statusFormData, setStatusFormData] = useState({
    status: "" as Complaint["status"],
    note: "",
  });

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
  }, [complaints, debouncedSearch, statusFilter, categoryFilter]);

  // Admin/Staff see all complaints, regular users see only their own
  const displayComplaints = useMemo(() => {
    return isAdminOrStaff
      ? filteredComplaints
      : filteredComplaints.filter((c) => c.userId === user.id);
  }, [filteredComplaints, isAdminOrStaff, user.id]);

  // Bulk selection - only for admin/staff
  const bulkSelection = useBulkSelection(displayComplaints);

  // Pagination
  const pagination = usePagination<Complaint>(displayComplaints, {
    pageSize: 10,
  });

  const fetchComplaints = async () => {
    setFetchError(null);
    try {
      const data = await api.getComplaints(user);
      setComplaints(data);
    } catch (error) {
      setFetchError("Failed to fetch complaints");
      showToast("Error", "Failed to fetch complaints", "error");
    } finally {
      setInitialLoading(false);
    }
  };

  // Bulk status update handler
  const handleBulkStatusUpdate = async (status: string, note?: string) => {
    setBulkLoading(true);
    try {
      const selectedItems = bulkSelection.getSelectedItems();
      await Promise.all(
        selectedItems.map((complaint) =>
          api.updateComplaintStatus(
            complaint.id,
            status as Complaint["status"],
            note
          )
        )
      );
      showToast(
        "Success",
        `Updated ${selectedItems.length} complaints`,
        "success"
      );
      bulkSelection.clearSelection();
      setShowBulkStatusModal(false);
      fetchComplaints();
    } catch (error: any) {
      showToast(
        "Error",
        error.message || "Failed to update complaints",
        "error"
      );
    } finally {
      setBulkLoading(false);
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    const dataToExport =
      bulkSelection.selectedCount > 0
        ? bulkSelection.getSelectedItems()
        : displayComplaints;
    exportComplaints(dataToExport).toCSV();
    showToast("Success", "Export started", "success");
  };

  const handleExportPDF = () => {
    const dataToExport =
      bulkSelection.selectedCount > 0
        ? bulkSelection.getSelectedItems()
        : displayComplaints;
    exportComplaints(dataToExport).toPDF();
  };

  const filterComplaints = () => {
    let filtered = [...complaints];

    // Search filter - dynamically search in title and description
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
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

  const validateField = (field: string, value: any) => {
    const newErrors = { ...errors };

    switch (field) {
      case "title":
        if (!value.trim() || value.length < 5) {
          newErrors.title = "Title must be at least 5 characters";
        } else if (value.length > 100) {
          newErrors.title = "Title must not exceed 100 characters";
        } else {
          delete newErrors.title;
        }
        break;

      case "description":
        if (!value.trim() || value.length < 20) {
          newErrors.description = "Description must be at least 20 characters";
        } else if (value.length > 1000) {
          newErrors.description = "Description must not exceed 1000 characters";
        } else {
          delete newErrors.description;
        }
        break;

      case "category":
        if (!value) {
          newErrors.category = "Please select a category";
        } else {
          delete newErrors.category;
        }
        break;

      case "attachments":
        if (attachments.length > 5) {
          newErrors.attachments = "Maximum 5 attachments allowed";
        } else {
          delete newErrors.attachments;
        }
        break;
    }

    setErrors(newErrors);
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

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!statusFormData.status) {
      showToast("Error", "Please select a status", "error");
      return;
    }

    if (!statusModal.complaint) return;

    setLoading(true);
    try {
      await api.updateComplaintStatus(
        statusModal.complaint.id,
        statusFormData.status,
        statusFormData.note
      );
      showToast("Success", "Status updated successfully", "success");
      setStatusModal({ isOpen: false, complaint: null });
      setStatusFormData({ status: "" as Complaint["status"], note: "" });
      fetchComplaints();

      // Also close detail modal if open
      if (detailModal.isOpen) {
        setDetailModal({ isOpen: false, complaint: null });
      }
    } catch (error: any) {
      showToast("Error", error.message || "Failed to update status", "error");
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
    validateField("attachments", [...attachments, base64]);
  };

  const removeAttachment = (index: number) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    setAttachments(newAttachments);
    validateField("attachments", newAttachments);
  };

  const myComplaints = filteredComplaints.filter((c) => c.userId === user.id);

  const stats = useMemo(
    () => ({
      total: myComplaints.length,
      pending: myComplaints.filter((c) => c.status === "pending").length,
      inProgress: myComplaints.filter((c) => c.status === "in-progress").length,
      resolved: myComplaints.filter((c) => c.status === "resolved").length,
    }),
    [myComplaints]
  );

  // Show initial loading state
  if (initialLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (fetchError) {
    return (
      <ErrorState
        title="Failed to load complaints"
        message={fetchError}
        onRetry={fetchComplaints}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
        <div className="flex items-center gap-2">
          {isAdminOrStaff && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <FileSpreadsheet className="w-4 h-4 mr-1" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <Printer className="w-4 h-4 mr-1" />
                PDF
              </Button>
            </div>
          )}
          <Button onClick={() => setCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            File Complaint
          </Button>
        </div>
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
          <>
            {/* Select All for Admin */}
            {isAdminOrStaff && pagination.items.length > 0 && (
              <div className="flex items-center gap-3 px-2">
                <BulkCheckbox
                  checked={bulkSelection.isAllSelected}
                  indeterminate={bulkSelection.isSomeSelected}
                  onChange={bulkSelection.toggleAll}
                />
                <span className="text-sm text-gray-600">
                  {bulkSelection.selectedCount > 0
                    ? `${bulkSelection.selectedCount} selected`
                    : "Select all"}
                </span>
              </div>
            )}

            {pagination.items.map((complaint) => (
              <Card
                key={complaint.id}
                className={`hover:shadow-md transition-shadow cursor-pointer ${
                  bulkSelection.isSelected(complaint.id)
                    ? "ring-2 ring-primary-500 bg-primary-50/50"
                    : ""
                }`}
                onClick={() =>
                  setDetailModal({ isOpen: true, complaint: complaint })
                }
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {isAdminOrStaff && (
                      <div
                        className="pt-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <BulkCheckbox
                          checked={bulkSelection.isSelected(complaint.id)}
                          onChange={() =>
                            bulkSelection.toggleSelection(complaint.id)
                          }
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              {complaint.title}
                            </h3>
                            <Badge
                              variant={getPriorityColor(complaint.priority)}
                            >
                              {complaint.priority}
                            </Badge>
                            {isAdminOrStaff && complaint.user && (
                              <Badge
                                variant="default"
                                className="flex items-center gap-1"
                              >
                                <UserIcon className="w-3 h-3" />
                                {typeof complaint.user === "object"
                                  ? `${complaint.user.firstName} ${complaint.user.lastName}`
                                  : "User"}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {complaint.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge variant={getStatusColor(complaint.status)}>
                            {getStatusIcon(complaint.status)}
                            <span className="ml-1 capitalize">
                              {complaint.status.replace("-", " ")}
                            </span>
                          </Badge>
                          {isAdminOrStaff && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setStatusModal({ isOpen: true, complaint });
                                setStatusFormData({
                                  status: complaint.status,
                                  note: "",
                                });
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4 text-gray-500">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {complaint.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {format(
                              new Date(complaint.createdAt),
                              "MMM d, yyyy"
                            )}
                          </span>
                          {complaint.attachments &&
                            complaint.attachments.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Paperclip className="w-4 h-4" />
                                {complaint.attachments.length}
                              </span>
                            )}
                        </div>
                        {complaint.comments &&
                          complaint.comments.length > 0 && (
                            <span className="text-primary-600 font-medium">
                              {complaint.comments.length} comment
                              {complaint.comments.length !== 1 ? "s" : ""}
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                pageSize={pagination.pageSize}
                onPageChange={pagination.setPage}
                onPageSizeChange={pagination.setPageSize}
              />
            )}
          </>
        )}
      </div>

      {/* Bulk Action Bar */}
      {isAdminOrStaff && (
        <BulkActionBar
          selectedCount={bulkSelection.selectedCount}
          totalCount={displayComplaints.length}
          onClearSelection={bulkSelection.clearSelection}
          onSelectAll={bulkSelection.selectAll}
          isLoading={bulkLoading}
          actions={[
            {
              id: "update-status",
              label: "Update Status",
              icon: <Edit className="w-4 h-4" />,
              variant: "primary",
              onClick: () => setShowBulkStatusModal(true),
            },
            {
              id: "export",
              label: "Export Selected",
              icon: <Download className="w-4 h-4" />,
              variant: "secondary",
              onClick: handleExportCSV,
            },
          ]}
        />
      )}

      {/* Bulk Status Update Modal */}
      <BulkStatusModal
        isOpen={showBulkStatusModal}
        onClose={() => setShowBulkStatusModal(false)}
        onConfirm={handleBulkStatusUpdate}
        selectedCount={bulkSelection.selectedCount}
        statusOptions={[
          { value: "pending", label: "Pending" },
          { value: "in-progress", label: "In Progress" },
          { value: "resolved", label: "Resolved" },
          { value: "closed", label: "Closed" },
        ]}
        title="Bulk Update Complaint Status"
        isLoading={bulkLoading}
      />

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
                validateField("title", e.target.value);
              }}
              onBlur={(e) => validateField("title", e.target.value)}
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
                validateField("description", e.target.value);
              }}
              onBlur={(e) => validateField("description", e.target.value)}
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
                  validateField("category", e.target.value);
                }}
                onBlur={(e) => validateField("category", e.target.value)}
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

      {/* Update Status Modal (Admin/Staff only) */}
      {isAdminOrStaff && (
        <Modal
          isOpen={statusModal.isOpen}
          onClose={() => {
            setStatusModal({ isOpen: false, complaint: null });
            setStatusFormData({ status: "" as Complaint["status"], note: "" });
          }}
          title="Update Complaint Status"
          className="max-w-md"
        >
          {statusModal.complaint && (
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {statusModal.complaint.title}
                </h3>
                <p className="text-sm text-gray-600">
                  Current status:{" "}
                  <Badge variant={getStatusColor(statusModal.complaint.status)}>
                    {statusModal.complaint.status}
                  </Badge>
                </p>
              </div>

              <div className="space-y-2">
                <Label required>New Status</Label>
                <Select
                  value={statusFormData.status}
                  onChange={(e) =>
                    setStatusFormData({
                      ...statusFormData,
                      status: e.target.value as Complaint["status"],
                    })
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Note (Optional)</Label>
                <Textarea
                  value={statusFormData.note}
                  onChange={(e) =>
                    setStatusFormData({
                      ...statusFormData,
                      note: e.target.value,
                    })
                  }
                  placeholder="Add a note about this status change..."
                  className="min-h-[80px]"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500">
                  {statusFormData.note.length}/500 characters
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setStatusModal({ isOpen: false, complaint: null });
                    setStatusFormData({
                      status: "" as Complaint["status"],
                      note: "",
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}

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
                    <Badge
                      variant="default"
                      className="flex items-center gap-1"
                    >
                      <UserIcon className="w-3 h-3" />
                      {typeof detailModal.complaint.user === "object"
                        ? `${detailModal.complaint.user.firstName} ${detailModal.complaint.user.lastName}`
                        : "User"}
                    </Badge>
                  )}
                </div>
              </div>
              {isAdminOrStaff && (
                <Button
                  size="sm"
                  onClick={() => {
                    setStatusModal({
                      isOpen: true,
                      complaint: detailModal.complaint,
                    });
                    setStatusFormData({
                      status: detailModal.complaint!.status,
                      note: "",
                    });
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Update Status
                </Button>
              )}
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
