import React, { useEffect, useState } from 'react';
import { Plus, Filter, MessageSquare, History, Clock, User as UserIcon, Phone, MapPin, Send, MessageCircle, Image as ImageIcon } from 'lucide-react';
import { Button, Card, CardContent, Badge, Input, Label, Select, Modal, Skeleton, Textarea, FileUpload, Tabs } from '../components/UI';
import { api } from '../services/api';
import { Complaint, User } from '../types';

interface ComplaintsProps {
  user: User;
}

const Complaints: React.FC<ComplaintsProps> = ({ user }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [newComplaint, setNewComplaint] = useState({ title: '', description: '', category: 'Sanitation', priority: 'medium' as const, attachments: [] as string[] });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Comment State
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  // Detail Modal Tab
  const [detailTab, setDetailTab] = useState('details');

  const fetchComplaints = async () => {
    setLoading(true);
    const data = await api.getComplaints(user);
    setComplaints(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  const validate = () => {
      const newErrors: Record<string, string> = {};
      if (!newComplaint.title.trim()) newErrors.title = "Title is required";
      if (!newComplaint.description.trim()) newErrors.description = "Description is required";
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    await api.createComplaint({
      ...newComplaint,
      userId: user.id,
      status: 'pending',
      history: [{
          id: Math.random().toString(),
          action: 'Complaint Filed',
          by: `${user.firstName} ${user.lastName}`,
          timestamp: new Date().toISOString()
      }]
    });
    setSubmitting(false);
    setShowCreateModal(false);
    setNewComplaint({ title: '', description: '', category: 'Sanitation', priority: 'medium', attachments: [] });
    fetchComplaints();
  };

  const handleStatusUpdate = async (e: React.ChangeEvent<HTMLSelectElement>, complaint: Complaint) => {
    e.stopPropagation();
    const newStatus = e.target.value as Complaint['status'];
    await api.updateComplaintStatus(complaint.id, newStatus);
    fetchComplaints();
  };

  const handlePostComment = async () => {
      if (!selectedComplaint || !newComment.trim()) return;
      setSendingComment(true);
      await api.addComplaintComment(selectedComplaint.id, {
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          userRole: user.role,
          message: newComment
      });
      // Refresh local state for immediate feedback
      const updatedList = await api.getComplaints(user);
      const updatedSelected = updatedList.find(c => c.id === selectedComplaint.id) || null;
      setComplaints(updatedList);
      setSelectedComplaint(updatedSelected);
      setNewComment('');
      setSendingComment(false);
  }

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getStatusVariant = (s: string) => {
    switch(s) {
        case 'resolved': return 'success';
        case 'closed': return 'default';
        case 'in-progress': return 'info';
        default: return 'warning';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
          <p className="text-gray-500">
            {user.role === 'resident' ? 'Manage your filed complaints' : 'Track and resolve resident issues'}
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          File Complaint
        </Button>
      </div>

      {/* Filters Toolbar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="relative flex-1 max-w-sm">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input className="pl-9" placeholder="Filter by title..." />
        </div>
        <div className="w-[180px]">
            <Select>
                <option>All Categories</option>
                <option>Sanitation</option>
                <option>Noise</option>
                <option>Security</option>
            </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
            {[1,2,3].map(i => (
                <Card key={i} className="p-6">
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-3">
                             <Skeleton className="w-1/4 h-4" />
                             <Skeleton className="w-1/2 h-6" />
                             <Skeleton className="w-3/4 h-4" />
                        </div>
                        <Skeleton className="w-24 h-8 rounded-full" />
                    </div>
                </Card>
            ))}
        </div>
      ) : complaints.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <MessageSquare className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-gray-900 font-bold text-lg mb-1">No complaints found</h3>
              <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                  You haven't filed any complaints yet. If you notice any issues in the community, please let us know.
              </p>
              <Button variant="outline" onClick={() => setShowCreateModal(true)}>
                  File a Complaint
              </Button>
          </div>
      ) : (
        <div className="grid gap-4">
          {complaints.map((complaint) => (
            <Card 
                key={complaint.id} 
                className="hover:border-primary-200 transition-colors cursor-pointer group"
                onClick={() => { setSelectedComplaint(complaint); setDetailTab('details'); }}
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-400">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{complaint.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{complaint.description}</p>
                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{complaint.comments?.length || 0} comments</span>
                      </div>
                      {complaint.attachments && complaint.attachments.length > 0 && (
                          <div className="flex items-center gap-1">
                              <ImageIcon className="w-4 h-4" />
                              <span>{complaint.attachments.length} attached</span>
                          </div>
                      )}
                      <span>•</span>
                      <span>Filed by {complaint.user.firstName} {complaint.user.lastName}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div onClick={e => e.stopPropagation()}>
                        {(user.role === 'staff' || user.role === 'admin') ? (
                        <div className="w-[140px]">
                            <Select 
                                value={complaint.status}
                                onChange={(e) => handleStatusUpdate(e, complaint)}
                                className="h-8 text-xs py-1"
                            >
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </Select>
                        </div>
                        ) : (
                            <Badge variant={getStatusVariant(complaint.status) as any} className="capitalize">
                            {complaint.status}
                            </Badge>
                        )}
                    </div>
                    <span className="text-xs text-primary-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                        View Details <History className="w-3 h-3 ml-1" />
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="File a New Complaint">
        <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Auto-filled User Credentials Section */}
            <div className="bg-primary-50 p-4 rounded-lg border border-primary-100 mb-4">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-semibold text-primary-900 flex items-center">
                        <UserIcon className="w-4 h-4 mr-2" /> Complainant Details
                    </h4>
                    <span className="text-[10px] bg-white text-primary-700 px-2 py-0.5 rounded border border-primary-200">Auto-filled</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-primary-600/70 block text-xs">Full Name</span>
                        <span className="font-medium text-primary-900">{user.firstName} {user.lastName}</span>
                    </div>
                    <div>
                        <span className="text-primary-600/70 block text-xs">Email</span>
                        <span className="font-medium text-primary-900">{user.email}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label required>Title</Label>
                <Input 
                    value={newComplaint.title}
                    onChange={e => setNewComplaint({...newComplaint, title: e.target.value})}
                    placeholder="Brief summary of the issue"
                    error={errors.title}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label required>Category</Label>
                    <Select
                        value={newComplaint.category}
                        onChange={e => setNewComplaint({...newComplaint, category: e.target.value})}
                    >
                        <option value="Sanitation">Sanitation</option>
                        <option value="Noise Disturbance">Noise Disturbance</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Security">Security</option>
                        <option value="Other">Other</option>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label required>Priority</Label>
                    <Select
                        value={newComplaint.priority}
                        onChange={e => setNewComplaint({...newComplaint, priority: e.target.value as any})}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
                <Label required>Description</Label>
                <Textarea 
                    value={newComplaint.description}
                    onChange={e => setNewComplaint({...newComplaint, description: e.target.value})}
                    placeholder="Detailed description of the problem..."
                    error={errors.description}
                />
            </div>
            <div className="space-y-2">
                <FileUpload 
                    label="Attach Evidence (Photo)"
                    value={newComplaint.attachments[0] || ''}
                    onChange={val => setNewComplaint({...newComplaint, attachments: val ? [val] : []})}
                />
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit" isLoading={submitting}>Submit Complaint</Button>
            </div>
        </form>
      </Modal>

      {/* Details & History Modal */}
      <Modal isOpen={!!selectedComplaint} onClose={() => setSelectedComplaint(null)} title="Complaint Details" className="max-w-2xl">
        {selectedComplaint && (
            <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900 text-lg">{selectedComplaint.title}</h3>
                        <Badge variant={getStatusVariant(selectedComplaint.status) as any}>{selectedComplaint.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{selectedComplaint.description}</p>
                    <div className="mt-4 pt-4 border-t border-gray-200 flex gap-4 text-xs text-gray-500">
                         <span>Category: {selectedComplaint.category}</span>
                         <span>Filed: {new Date(selectedComplaint.createdAt).toLocaleString()}</span>
                    </div>
                </div>

                <Tabs 
                    activeTab={detailTab}
                    onChange={setDetailTab}
                    tabs={[
                        {id: 'details', label: 'Discussion & Activity'},
                        {id: 'evidence', label: 'Evidence/Photos'}
                    ]}
                />
                
                {/* Discussion Section */}
                {detailTab === 'details' && (
                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <MessageCircle className="w-4 h-4"/> Discussion
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-60 overflow-y-auto space-y-4 mb-4">
                            {(!selectedComplaint.comments || selectedComplaint.comments.length === 0) && (
                                <p className="text-center text-sm text-gray-500 italic">No comments yet.</p>
                            )}
                            {selectedComplaint.comments?.map(comment => (
                                <div key={comment.id} className={`flex flex-col ${comment.userId === user.id ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[80%] rounded-lg p-3 text-sm ${comment.userId === user.id ? 'bg-primary-100 text-primary-900' : 'bg-white border border-gray-200 text-gray-800'}`}>
                                        <p>{comment.message}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1">
                                        {comment.userName} • {new Date(comment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input 
                                value={newComment} 
                                onChange={e => setNewComment(e.target.value)} 
                                placeholder="Type a message..." 
                                className="flex-1"
                                onKeyDown={e => e.key === 'Enter' && handlePostComment()}
                            />
                            <Button onClick={handlePostComment} disabled={!newComment.trim() || sendingComment} variant="secondary">
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* History Section */}
                    <div className="pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Activity History</h4>
                        <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
                            {selectedComplaint.history?.map((log, index) => (
                                <div key={log.id} className="relative pl-8">
                                    <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-white border-2 border-primary-500"></div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{log.action}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                                            <span>by {log.by}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {new Date(log.timestamp).toLocaleString()}</span>
                                        </p>
                                        {log.note && (
                                            <div className="mt-2 text-sm text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-100">
                                                "{log.note}"
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                )}

                {/* Evidence Section */}
                {detailTab === 'evidence' && (
                    <div className="min-h-[200px]">
                        {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4">
                                {selectedComplaint.attachments.map((img, idx) => (
                                    <div key={idx} className="relative aspect-video bg-black rounded-lg overflow-hidden border border-gray-200">
                                        <img src={img} alt="Evidence" className="w-full h-full object-contain" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <ImageIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                                <p>No evidence attached to this complaint.</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-end pt-4">
                     <Button variant="outline" onClick={() => setSelectedComplaint(null)}>Close</Button>
                </div>
            </div>
        )}
      </Modal>
    </div>
  );
};

export default Complaints;