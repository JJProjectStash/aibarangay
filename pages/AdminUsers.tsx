import React, { useEffect, useState } from 'react';
import { Search, UserPlus, Trash2, MoreVertical, Shield, CheckCircle, FileText } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Badge, ConfirmDialog, Tabs, Modal, Label, Select } from '../components/UI';
import { api } from '../services/api';
import { User } from '../types';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState<{isOpen: boolean, userId: string | null}>({isOpen: false, userId: null});
  const [editModal, setEditModal] = useState<{isOpen: boolean, user: User | null}>({isOpen: false, user: null});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const data = await api.getUsers();
    setUsers(data);
  };

  const handleDelete = async () => {
      if (deleteDialog.userId) {
          await api.deleteUser(deleteDialog.userId);
          setDeleteDialog({isOpen: false, userId: null});
          fetchUsers();
      }
  };

  const handleUpdateUser = async (updatedUser: User) => {
      await api.updateProfile(updatedUser);
      setEditModal({isOpen: false, user: null});
      fetchUsers();
  }

  const filteredUsers = users.filter(u => {
      const matchesSearch = 
        u.firstName.toLowerCase().includes(search.toLowerCase()) || 
        u.lastName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      
      if (!matchesSearch) return false;

      if (activeTab === 'pending') return !u.isVerified;
      if (activeTab === 'staff') return u.role === 'staff';
      if (activeTab === 'admin') return u.role === 'admin';
      
      return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500">Manage residents, staff, and admin accounts</p>
        </div>
        <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
        </Button>
      </div>

      <Tabs 
        activeTab={activeTab} 
        onChange={setActiveTab} 
        tabs={[
            { id: 'all', label: 'All Users' },
            { id: 'pending', label: 'Pending Verification' },
            { id: 'staff', label: 'Staff' },
            { id: 'admin', label: 'Admins' }
        ]} 
      />

      <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search users..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
          </CardHeader>
          <CardContent className="p-0">
              <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                      <tr>
                          <th className="px-6 py-4">User</th>
                          <th className="px-6 py-4">Role</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {filteredUsers.length === 0 ? (
                          <tr><td colSpan={4} className="text-center py-8 text-gray-500">No users found</td></tr>
                      ) : filteredUsers.map(u => (
                          <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 flex items-center gap-3">
                                  <img src={u.avatar} alt="" className="w-8 h-8 rounded-full bg-gray-200 object-cover" />
                                  <div>
                                      <div className="font-medium text-gray-900">{u.firstName} {u.lastName}</div>
                                      <div className="text-xs text-gray-500">{u.email}</div>
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                  <Badge variant={u.role === 'admin' ? 'danger' : u.role === 'staff' ? 'info' : 'default'} className="uppercase text-[10px] tracking-wide">
                                      {u.role}
                                  </Badge>
                              </td>
                              <td className="px-6 py-4">
                                  <Badge variant={u.isVerified ? 'success' : 'warning'}>
                                      {u.isVerified ? 'Verified' : 'Unverified'}
                                  </Badge>
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <div className="flex justify-end gap-2">
                                      {!u.isVerified && (
                                          <button 
                                            className="text-green-500 hover:text-green-700 p-1 hover:bg-green-50 rounded"
                                            title="Verify User"
                                            onClick={() => setEditModal({isOpen: true, user: u})}
                                          >
                                              <CheckCircle className="w-4 h-4" />
                                          </button>
                                      )}
                                      <button 
                                          className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded"
                                          onClick={() => setEditModal({isOpen: true, user: u})}
                                      >
                                          <MoreVertical className="w-4 h-4" />
                                      </button>
                                      {u.role !== 'admin' && (
                                          <button 
                                            className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded"
                                            onClick={() => setDeleteDialog({isOpen: true, userId: u.id})}
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                      )}
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </CardContent>
      </Card>

      <ConfirmDialog 
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({isOpen: false, userId: null})}
        onConfirm={handleDelete}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete User"
      />

      {/* Edit User Modal */}
      <Modal isOpen={editModal.isOpen} onClose={() => setEditModal({isOpen: false, user: null})} title="Edit User">
          {editModal.user && (
              <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <img src={editModal.user.avatar} className="w-16 h-16 rounded-full bg-gray-200" />
                      <div>
                          <h3 className="font-bold text-lg">{editModal.user.firstName} {editModal.user.lastName}</h3>
                          <p className="text-gray-500 text-sm">{editModal.user.email}</p>
                      </div>
                  </div>

                  {/* Verification Section - Show uploaded ID if available */}
                  {!editModal.user.isVerified && (
                      <div className="border-l-4 border-orange-400 bg-orange-50 p-4">
                          <h4 className="font-bold text-orange-900 text-sm mb-2">Pending Verification</h4>
                          {editModal.user.idDocumentUrl ? (
                              <div className="space-y-2">
                                  <p className="text-xs text-orange-800">User uploaded the following ID:</p>
                                  <img 
                                    src={editModal.user.idDocumentUrl} 
                                    alt="User ID" 
                                    className="w-full h-40 object-contain bg-white border border-orange-200 rounded"
                                  />
                                  <Button 
                                    size="sm" 
                                    className="w-full bg-green-600 hover:bg-green-700"
                                    onClick={() => handleUpdateUser({...editModal.user!, isVerified: true})}
                                  >
                                      Verify Identity
                                  </Button>
                              </div>
                          ) : (
                              <div className="text-sm text-orange-800">
                                  User has not uploaded an ID document yet.
                              </div>
                          )}
                      </div>
                  )}

                  <div className="space-y-2">
                      <Label>Role</Label>
                      <Select 
                        value={editModal.user.role} 
                        onChange={(e) => setEditModal({
                            isOpen: true, 
                            user: {...editModal.user!, role: e.target.value as any}
                        })}
                      >
                          <option value="resident">Resident</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                      </Select>
                  </div>

                  <div className="space-y-2">
                       <Label>Verification Status</Label>
                       <div className="flex items-center gap-2">
                           <Button 
                                variant={editModal.user.isVerified ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => setEditModal({
                                    isOpen: true, 
                                    user: {...editModal.user!, isVerified: true}
                                })}
                           >
                               Verified
                           </Button>
                           <Button 
                                variant={!editModal.user.isVerified ? 'danger' : 'outline'}
                                size="sm"
                                onClick={() => setEditModal({
                                    isOpen: true, 
                                    user: {...editModal.user!, isVerified: false}
                                })}
                           >
                               Unverified
                           </Button>
                       </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                      <Button variant="ghost" onClick={() => setEditModal({isOpen: false, user: null})}>Cancel</Button>
                      <Button onClick={() => handleUpdateUser(editModal.user!)}>Save Changes</Button>
                  </div>
              </div>
          )}
      </Modal>
    </div>
  );
};

export default AdminUsers;