import React, { useEffect, useState } from "react";
import {
  Package,
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Filter,
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
} from "../components/UI";
import { api } from "../services/api";
import { ServiceRequest, User } from "../types";
import { useToast } from "../components/Toast";
import { format } from "date-fns";

interface ServicesProps {
  user: User;
}

const Services: React.FC<ServicesProps> = ({ user }) => {
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServiceRequest[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [createModal, setCreateModal] = useState(false);
  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    service: ServiceRequest | null;
  }>({ isOpen: false, service: null });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    itemName: "",
    itemType: "",
    borrowDate: "",
    expectedReturnDate: "",
    purpose: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const itemTypes = [
    "Sports Equipment",
    "Audio/Visual Equipment",
    "Tables & Chairs",
    "Tents & Canopies",
    "Sound System",
    "Generator",
    "Cooking Equipment",
    "Other",
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchQuery, statusFilter, typeFilter]);

  const fetchServices = async () => {
    try {
      const data = await api.getServices(user);
      setServices(data);
    } catch (error) {
      showToast("Error", "Failed to fetch service requests", "error");
    }
  };

  const filterServices = () => {
    let filtered = [...services];

    // Search filter - dynamically search in item name and purpose
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.itemName.toLowerCase().includes(query) ||
          s.purpose.toLowerCase().includes(query) ||
          s.itemType.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((s) => s.itemType === typeFilter);
    }

    // Sort by date (newest first)
    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setFilteredServices(filtered);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemName.trim() || formData.itemName.length < 3) {
      newErrors.itemName = "Item name must be at least 3 characters";
    }
    if (formData.itemName.length > 100) {
      newErrors.itemName = "Item name must not exceed 100 characters";
    }

    if (!formData.itemType) {
      newErrors.itemType = "Please select an item type";
    }

    if (!formData.borrowDate) {
      newErrors.borrowDate = "Please select a borrow date";
    } else {
      const borrowDate = new Date(formData.borrowDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (borrowDate < today) {
        newErrors.borrowDate = "Borrow date cannot be in the past";
      }
    }

    if (!formData.expectedReturnDate) {
      newErrors.expectedReturnDate = "Please select a return date";
    } else if (formData.borrowDate) {
      const borrowDate = new Date(formData.borrowDate);
      const returnDate = new Date(formData.expectedReturnDate);
      if (returnDate <= borrowDate) {
        newErrors.expectedReturnDate = "Return date must be after borrow date";
      }
      // Check if duration is reasonable (max 30 days)
      const diffDays = Math.ceil(
        (returnDate.getTime() - borrowDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays > 30) {
        newErrors.expectedReturnDate =
          "Maximum borrow period is 30 days. Please contact admin for longer periods.";
      }
    }

    if (!formData.purpose.trim() || formData.purpose.length < 10) {
      newErrors.purpose = "Purpose must be at least 10 characters";
    }
    if (formData.purpose.length > 500) {
      newErrors.purpose = "Purpose must not exceed 500 characters";
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
      await api.createService({
        ...formData,
        userId: user.id,
        status: "pending",
      });
      setCreateModal(false);
      setFormData({
        itemName: "",
        itemType: "",
        borrowDate: "",
        expectedReturnDate: "",
        purpose: "",
      });
      setErrors({});
      showToast("Success", "Service request submitted successfully", "success");
      fetchServices();
    } catch (error: any) {
      showToast(
        "Error",
        error.message || "Failed to submit service request",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "borrowed":
        return <Package className="w-4 h-4" />;
      case "returned":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "approved":
        return "info";
      case "borrowed":
        return "primary";
      case "returned":
        return "success";
      case "rejected":
        return "danger";
      default:
        return "default";
    }
  };

  const myServices = filteredServices.filter((s) => s.userId === user.id);

  const stats = {
    total: myServices.length,
    pending: myServices.filter((s) => s.status === "pending").length,
    approved: myServices.filter((s) => s.status === "approved").length,
    borrowed: myServices.filter((s) => s.status === "borrowed").length,
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Equipment & Services
          </h1>
          <p className="text-gray-500">
            Borrow equipment and request barangay services
          </p>
        </div>
        <Button onClick={() => setCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <Package className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-amber-600">
                  {stats.pending}
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
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.approved}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Borrowed</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.borrowed}
                </p>
              </div>
              <Package className="w-8 h-8 text-purple-400" />
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
                placeholder="Search requests..."
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
              <option value="approved">Approved</option>
              <option value="borrowed">Borrowed</option>
              <option value="returned">Returned</option>
              <option value="rejected">Rejected</option>
            </Select>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              {itemTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>
          {(searchQuery || statusFilter !== "all" || typeFilter !== "all") && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>
                Showing {filteredServices.length} of {services.length} requests
              </span>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
                className="ml-auto text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Services List */}
      <div className="space-y-4">
        {filteredServices.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                  ? "No requests found"
                  : "No service requests yet"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Start by creating your first service request"}
              </p>
              {!searchQuery &&
                statusFilter === "all" &&
                typeFilter === "all" && (
                  <Button onClick={() => setCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Request
                  </Button>
                )}
            </CardContent>
          </Card>
        ) : (
          myServices.map((service) => (
            <Card
              key={service.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setDetailModal({ isOpen: true, service: service })}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {service.itemName}
                      </h3>
                      <Badge variant="default">{service.itemType}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {service.purpose}
                    </p>
                  </div>
                  <Badge
                    variant={getStatusColor(service.status)}
                    className="ml-4"
                  >
                    {getStatusIcon(service.status)}
                    <span className="ml-1 capitalize">{service.status}</span>
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(service.borrowDate), "MMM d")} -{" "}
                    {format(
                      new Date(service.expectedReturnDate),
                      "MMM d, yyyy"
                    )}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Requested{" "}
                    {format(new Date(service.createdAt), "MMM d, yyyy")}
                  </span>
                </div>

                {service.status === "rejected" && service.rejectionReason && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    <strong>Rejection Reason:</strong> {service.rejectionReason}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Service Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => {
          setCreateModal(false);
          setFormData({
            itemName: "",
            itemType: "",
            borrowDate: "",
            expectedReturnDate: "",
            purpose: "",
          });
          setErrors({});
        }}
        title="New Service Request"
        className="max-w-2xl"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <Label required>Item Name</Label>
            <Input
              value={formData.itemName}
              onChange={(e) => {
                setFormData({ ...formData, itemName: e.target.value });
                if (errors.itemName) setErrors({ ...errors, itemName: "" });
              }}
              placeholder="e.g., Basketball, Sound System, Tent"
              maxLength={100}
              error={errors.itemName}
            />
            <p className="text-xs text-gray-500">
              {formData.itemName.length}/100 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label required>Item Type</Label>
            <Select
              value={formData.itemType}
              onChange={(e) => {
                setFormData({ ...formData, itemType: e.target.value });
                if (errors.itemType) setErrors({ ...errors, itemType: "" });
              }}
              error={errors.itemType}
            >
              <option value="">Select item type</option>
              {itemTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label required>Borrow Date</Label>
              <Input
                type="date"
                value={formData.borrowDate}
                onChange={(e) => {
                  setFormData({ ...formData, borrowDate: e.target.value });
                  if (errors.borrowDate)
                    setErrors({ ...errors, borrowDate: "" });
                }}
                min={today}
                error={errors.borrowDate}
              />
            </div>

            <div className="space-y-2">
              <Label required>Expected Return Date</Label>
              <Input
                type="date"
                value={formData.expectedReturnDate}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    expectedReturnDate: e.target.value,
                  });
                  if (errors.expectedReturnDate)
                    setErrors({ ...errors, expectedReturnDate: "" });
                }}
                min={formData.borrowDate || today}
                error={errors.expectedReturnDate}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label required>Purpose</Label>
            <Textarea
              value={formData.purpose}
              onChange={(e) => {
                setFormData({ ...formData, purpose: e.target.value });
                if (errors.purpose) setErrors({ ...errors, purpose: "" });
              }}
              placeholder="Describe the purpose of borrowing this item..."
              className="min-h-[100px]"
              maxLength={500}
              error={errors.purpose}
            />
            <p className="text-xs text-gray-500">
              {formData.purpose.length}/500 characters
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Your request will be reviewed by the
              barangay staff. You'll be notified once it's approved or if
              additional information is needed.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setCreateModal(false);
                setFormData({
                  itemName: "",
                  itemType: "",
                  borrowDate: "",
                  expectedReturnDate: "",
                  purpose: "",
                });
                setErrors({});
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, service: null })}
        title="Service Request Details"
        className="max-w-2xl"
      >
        {detailModal.service && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {detailModal.service.itemName}
                </h2>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant={getStatusColor(detailModal.service.status)}>
                    {getStatusIcon(detailModal.service.status)}
                    <span className="ml-1 capitalize">
                      {detailModal.service.status}
                    </span>
                  </Badge>
                  <Badge variant="default">
                    {detailModal.service.itemType}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Borrow Date</p>
                <p className="font-semibold text-gray-900">
                  {format(
                    new Date(detailModal.service.borrowDate),
                    "MMMM d, yyyy"
                  )}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Return Date</p>
                <p className="font-semibold text-gray-900">
                  {format(
                    new Date(detailModal.service.expectedReturnDate),
                    "MMMM d, yyyy"
                  )}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Purpose</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {detailModal.service.purpose}
                </p>
              </div>
            </div>

            {detailModal.service.approvalNote && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">
                  Approval Note
                </h3>
                <p className="text-sm text-green-800">
                  {detailModal.service.approvalNote}
                </p>
              </div>
            )}

            {detailModal.service.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">
                  Rejection Reason
                </h3>
                <p className="text-sm text-red-800">
                  {detailModal.service.rejectionReason}
                </p>
              </div>
            )}

            {detailModal.service.notes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Additional Notes
                </h3>
                <p className="text-sm text-blue-800">
                  {detailModal.service.notes}
                </p>
              </div>
            )}

            <div className="text-sm text-gray-500 border-t pt-4">
              <p>
                Requested on{" "}
                {format(
                  new Date(detailModal.service.createdAt),
                  "MMMM d, yyyy 'at' h:mm a"
                )}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Services;
