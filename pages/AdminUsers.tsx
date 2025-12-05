import React, { useEffect, useState } from "react";
import {
  Search,
  UserPlus,
  Trash2,
  MoreVertical,
  Shield,
  CheckCircle,
  FileText,
  XCircle,
  Users as UsersIcon,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Badge,
  ConfirmDialog,
  Tabs,
  Modal,
  Label,
  Select,
  Skeleton,
} from "../components/UI";
import { api } from "../services/api";
import { User } from "../types";
import { useToast } from "../components/Toast";
import { TableSkeleton, EmptyState, ErrorState } from "../components/Loading";

const UserRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div>
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <Skeleton className="h-4 w-24 mb-1" />
      <Skeleton className="h-3 w-32" />
    </td>
    <td className="px-6 py-4">
      <Skeleton className="h-5 w-16" />
    </td>
    <td className="px-6 py-4">
      <Skeleton className="h-5 w-20" />
    </td>
    <td className="px-6 py-4 text-right">
      <Skeleton className="h-8 w-20 ml-auto" />
    </td>
  </tr>
);

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    userId: string | null;
  }>({ isOpen: false, userId: null });
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({ isOpen: false, user: null });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setError(null);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      setError("Failed to fetch users");
      showToast("Error", "Failed to fetch users", "error");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteDialog.userId) {
      try {
        await api.deleteUser(deleteDialog.userId);
        setDeleteDialog({ isOpen: false, userId: null });
        showToast("Success", "User deleted successfully", "success");
        fetchUsers();
      } catch (error) {
        showToast("Error", "Failed to delete user", "error");
      }
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    setLoading(true);
    try {
      await api.updateUser(updatedUser.id, {
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
      });
      setEditModal({ isOpen: false, user: null });
      showToast("Success", "User updated successfully", "success");
      fetchUsers();
    } catch (error: any) {
      showToast("Error", error.message || "Failed to update user", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "pending") return !u.isVerified;
    if (activeTab === "staff") return u.role === "staff";
    if (activeTab === "admin") return u.role === "admin";

    return true;
  });

  const pendingCount = users.filter((u) => !u.isVerified).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500">
            Manage residents, staff, and admin accounts
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="warning" className="text-sm px-3 py-1">
            {pendingCount} Pending Verification
          </Badge>
        )}
      </div>

      {error && !initialLoading ? (
        <ErrorState
          title="Failed to load users"
          message={error}
          onRetry={fetchUsers}
        />
      ) : (
        <>
          <Tabs
            activeTab={activeTab}
            onChange={setActiveTab}
            tabs={[
              { id: "all", label: `All Users (${users.length})` },
              { id: "pending", label: `Pending (${pendingCount})` },
              { id: "staff", label: "Staff" },
              { id: "admin", label: "Admins" },
            ]}
          />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {initialLoading ? (
                    <>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <UserRowSkeleton key={i} />
                      ))}
                    </>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12">
                        <EmptyState
                          icon={<UsersIcon className="w-8 h-8" />}
                          title={search ? "No users found" : "No users yet"}
                          description={
                            search
                              ? `No users match "${search}"`
                              : "User accounts will appear here once created."
                          }
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 flex items-center gap-3">
                          <img
                            src={u.avatar}
                            alt=""
                            className="w-10 h-10 rounded-full bg-gray-200 object-cover"
                          />
                          <div>
                            <div className="font-medium text-gray-900">
                              {u.firstName} {u.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {u.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700">
                            {u.phoneNumber || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {u.address || "No address"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              u.role === "admin"
                                ? "danger"
                                : u.role === "staff"
                                ? "info"
                                : "default"
                            }
                            className="uppercase text-[10px] tracking-wide"
                          >
                            {u.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={u.isVerified ? "success" : "warning"}
                            >
                              {u.isVerified ? "Verified" : "Unverified"}
                            </Badge>
                            {!u.isVerified && u.idDocumentUrl && (
                              <Badge variant="info" className="text-[10px]">
                                <FileText className="w-3 h-3 mr-1" />
                                ID Uploaded
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {!u.isVerified && u.idDocumentUrl && (
                              <button
                                className="text-green-500 hover:text-green-700 p-1.5 hover:bg-green-50 rounded transition-colors"
                                title="Review & Verify"
                                onClick={() =>
                                  setEditModal({ isOpen: true, user: u })
                                }
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded transition-colors"
                              title="Edit User"
                              onClick={() =>
                                setEditModal({ isOpen: true, user: u })
                              }
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {u.role !== "admin" && (
                              <button
                                className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded transition-colors"
                                title="Delete User"
                                onClick={() =>
                                  setDeleteDialog({
                                    isOpen: true,
                                    userId: u.id,
                                  })
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, userId: null })}
        onConfirm={handleDelete}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete User"
      />

      {/* Edit User Modal */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, user: null })}
        title="User Details & Verification"
      >
        {editModal.user && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <img
                src={editModal.user.avatar}
                className="w-16 h-16 rounded-full bg-gray-200 object-cover"
                alt="User avatar"
              />
              <div className="flex-1">
                <h3 className="font-bold text-lg">
                  {editModal.user.firstName} {editModal.user.lastName}
                </h3>
                <p className="text-gray-500 text-sm">{editModal.user.email}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {editModal.user.phoneNumber || "No phone"} •{" "}
                  {editModal.user.address || "No address"}
                </p>
              </div>
            </div>

            {/* Verification Section - Show uploaded ID if available */}
            {!editModal.user.isVerified && (
              <div
                className={`border-l-4 p-4 rounded ${
                  editModal.user.idDocumentUrl
                    ? "border-blue-400 bg-blue-50"
                    : "border-orange-400 bg-orange-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4
                    className={`font-bold text-sm ${
                      editModal.user.idDocumentUrl
                        ? "text-blue-900"
                        : "text-orange-900"
                    }`}
                  >
                    {editModal.user.idDocumentUrl
                      ? "ID Document Submitted"
                      : "Pending Verification"}
                  </h4>
                  {editModal.user.idDocumentUrl && (
                    <Badge variant="info" className="text-xs">
                      <FileText className="w-3 h-3 mr-1" />
                      Review Required
                    </Badge>
                  )}
                </div>
                {editModal.user.idDocumentUrl ? (
                  <div className="space-y-3">
                    <p className="text-xs text-blue-800">
                      User has uploaded the following government ID for
                      verification:
                    </p>
                    <div className="bg-white border-2 border-blue-200 rounded-lg p-2">
                      <img
                        src={editModal.user.idDocumentUrl}
                        alt="Government ID"
                        className="w-full h-64 object-contain rounded"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() =>
                          handleUpdateUser({
                            ...editModal.user!,
                            isVerified: true,
                          })
                        }
                        disabled={loading}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve & Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => {
                          if (
                            confirm(
                              "Reject this ID document? User will need to upload a new one."
                            )
                          ) {
                            showToast(
                              "Info",
                              "ID rejection feature coming soon",
                              "info"
                            );
                          }
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject ID
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-orange-800">
                    <p>User has not uploaded a government ID document yet.</p>
                    <p className="text-xs mt-1">
                      They can upload it from their profile page.
                    </p>
                  </div>
                )}
              </div>
            )}

            {editModal.user.isVerified && (
              <div className="border-l-4 border-green-400 bg-green-50 p-4 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-bold text-sm text-green-900">
                    Verified Resident
                  </h4>
                </div>
                <p className="text-xs text-green-800">
                  This user's identity has been verified and approved.
                </p>
                {editModal.user.idDocumentUrl && (
                  <div className="mt-3 bg-white border border-green-200 rounded p-2">
                    <img
                      src={editModal.user.idDocumentUrl}
                      alt="Verified ID"
                      className="w-full h-32 object-contain rounded"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={editModal.user.role}
                onChange={(e) =>
                  setEditModal({
                    isOpen: true,
                    user: { ...editModal.user!, role: e.target.value as any },
                  })
                }
              >
                <option value="resident">Resident</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </Select>
              <p className="text-xs text-gray-500">
                Staff can manage content. Admins have full access.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Verification Status</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant={editModal.user.isVerified ? "primary" : "outline"}
                  size="sm"
                  onClick={() =>
                    setEditModal({
                      isOpen: true,
                      user: { ...editModal.user!, isVerified: true },
                    })
                  }
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Verified
                </Button>
                <Button
                  variant={!editModal.user.isVerified ? "danger" : "outline"}
                  size="sm"
                  onClick={() =>
                    setEditModal({
                      isOpen: true,
                      user: { ...editModal.user!, isVerified: false },
                    })
                  }
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Unverified
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Verified users can access all services and features.
              </p>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <Button
                variant="ghost"
                onClick={() => setEditModal({ isOpen: false, user: null })}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleUpdateUser(editModal.user!)}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminUsers;
