
import React, { useEffect, useState } from 'react';
import { Plus, Package, Layers, Calendar, AlertTriangle, User as UserIcon, Phone, MapPin, CheckCircle, Info, MessageSquare } from 'lucide-react';
import { Button, Card, CardContent, Badge, Input, Label, Select, Modal, Textarea, ConfirmDialog } from '../components/UI';
import { api } from '../services/api';
import { ServiceRequest, User } from '../types';

interface ServicesProps {
  user: User;
}

const Services: React.FC<ServicesProps> = ({ user }) => {
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'Equipment' | 'Facility'>('all');
  const [submitting, setSubmitting] = useState(false);
  
  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Confirmation/Action Dialogs
  const [rejectDialog, setRejectDialog] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [approveDialog, setApproveDialog] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNote, setApprovalNote] = useState('');

  const [newRequest, setNewRequest] = useState({
    itemName: '',
    itemType: 'Equipment',
    borrowDate: '',
    expectedReturnDate: '',
    purpose: ''
  });

  const fetchServices = async () => {
    setLoading(true);
    const data = await api.getServices(user);
    setServices(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, [user]);

  const validateForm = () => {
      const newErrors: Record<string, string> = {};
      const now = new Date();
      now.setHours(0,0,0,0);
      const borrow = new Date(newRequest.borrowDate);
      const returnDate = new Date(newRequest.expectedReturnDate);

      if (!newRequest.itemName) newErrors.itemName = "Item name is required";
      if (!newRequest.borrowDate) newErrors.borrowDate = "Borrow date is required";
      if (!newRequest.expectedReturnDate) newErrors.expectedReturnDate = "Return date is required";
      if (!newRequest.purpose) newErrors.purpose = "Purpose is required";

      // Allow selecting today
      if (newRequest.borrowDate && borrow < now) {
          newErrors.borrowDate = "Cannot select a past date";
      }

      if (newRequest.borrowDate && newRequest.expectedReturnDate && returnDate < borrow) {
          newErrors.expectedReturnDate = "Return date must be after or same as borrow date";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    await api.createService({
      ...newRequest,
      userId: user.id,
      status: 'pending'
    });
    setSubmitting(false);
    setShowModal(false);
    // Reset form
    setNewRequest({ itemName: '', itemType: 'Equipment', borrowDate: '', expectedReturnDate: '', purpose: '' });
    setErrors({});
    fetchServices();
  };

  const handleStatusUpdate = async (id: string, status: ServiceRequest['status']) => {
    await api.updateServiceStatus(id, status);
    fetchServices();
  };

  const confirmReject = async () => {
      if (rejectDialog.id) {
          if (!rejectionReason.trim()) {
              alert("Please provide a rejection reason.");
              return;
          }
          await api.updateServiceStatus(rejectDialog.id, 'rejected', rejectionReason);
          setRejectDialog({ isOpen: false, id: null });
          setRejectionReason('');
          fetchServices();
      }
  };

  const confirmApprove = async () => {
      if (approveDialog.id) {
          await api.updateServiceStatus(approveDialog.id, 'approved', approvalNote);
          setApproveDialog({ isOpen: false, id: null });
          setApprovalNote('');
          fetchServices();
      }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'borrowed': return 'info';
      case 'returned': return 'default';
      case 'rejected': return 'danger';
      default: return 'warning';
    }
  };

  const filteredServices = services.filter(s => activeTab === 'all' || s.itemType === activeTab);
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services & Requests</h1>
          <p className="text-gray-500">
            {user.role === 'resident' ? 'Manage your equipment and facility requests' : 'Manage resident requests'}
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Quick Access Cards */}
        <Card 
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => setActiveTab('Equipment')}
        >
            <CardContent className="p-6">
                <Package className="w-8 h-8 mb-4 opacity-80" />
                <h3 className="text-lg font-semibold mb-1">Equipment</h3>
                <p className="text-blue-100 text-sm mb-4">Chairs, tables, tents, and sound systems.</p>
                <div 
                    className="text-xs font-medium bg-white/20 inline-block px-2 py-1 rounded hover:bg-white/30 transition-colors"
                    onClick={(e) => { e.stopPropagation(); setShowCatalog(true); }}
                >
                    View Catalog →
                </div>
            </CardContent>
        </Card>
        <Card 
            className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-none cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => setActiveTab('Facility')}
        >
            <CardContent className="p-6">
                <Calendar className="w-8 h-8 mb-4 opacity-80" />
                <h3 className="text-lg font-semibold mb-1">Facilities</h3>
                <p className="text-indigo-100 text-sm mb-4">Basketball court, multi-purpose hall, and parks.</p>
                <div className="text-xs font-medium bg-white/20 inline-block px-2 py-1 rounded">Check Availability →</div>
            </CardContent>
        </Card>
        <Card 
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => setActiveTab('all')}
        >
            <CardContent className="p-6">
                <Layers className="w-8 h-8 mb-4 opacity-80" />
                <h3 className="text-lg font-semibold mb-1">All Requests</h3>
                <p className="text-purple-100 text-sm mb-4">View and track all your ongoing requests.</p>
                <div className="text-xs font-medium bg-white/20 inline-block px-2 py-1 rounded">Manage →</div>
            </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
            <button onClick={() => setActiveTab('all')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'all' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>All</button>
            <button onClick={() => setActiveTab('Equipment')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'Equipment' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Equipment</button>
            <button onClick={() => setActiveTab('Facility')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'Facility' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Facilities</button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                <tr>
                    <th className="px-6 py-4 font-medium">Request ID</th>
                    <th className="px-6 py-4 font-medium">Item</th>
                    <th className="px-6 py-4 font-medium">Dates</th>
                    <th className="px-6 py-4 font-medium">Purpose</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    {(user.role === 'staff' || user.role === 'admin') && (
                        <th className="px-6 py-4 font-medium">Actions</th>
                    )}
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {loading ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading requests...</td></tr>
                ) : filteredServices.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No requests found under this category.</td></tr>
                ) : filteredServices.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-600 font-mono">#{service.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                        {service.itemName}
                        <span className="block text-xs text-gray-400 font-normal">{service.itemType}</span>
                        {service.status === 'rejected' && service.rejectionReason && (
                            <div className="mt-1 text-xs text-red-600 bg-red-50 p-1 rounded border border-red-100 flex items-start gap-1">
                                <Info className="w-3 h-3 mt-0.5 shrink-0" />
                                <span>{service.rejectionReason}</span>
                            </div>
                        )}
                        {service.status === 'approved' && service.approvalNote && (
                            <div className="mt-1 text-xs text-green-700 bg-green-50 p-1 rounded border border-green-100 flex items-start gap-1">
                                <Info className="w-3 h-3 mt-0.5 shrink-0" />
                                <span>Note: {service.approvalNote}</span>
                            </div>
                        )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded w-fit">From: {new Date(service.borrowDate).toLocaleDateString()}</span>
                            <span className="text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded w-fit">To: {new Date(service.expectedReturnDate).toLocaleDateString()}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{service.purpose}</td>
                    <td className="px-6 py-4">
                        <Badge variant={getStatusColor(service.status) as any} className="capitalize">
                        {service.status}
                        </Badge>
                    </td>
                    {(user.role === 'staff' || user.role === 'admin') && (
                        <td className="px-6 py-4">
                        {service.status === 'pending' && (
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => setApproveDialog({ isOpen: true, id: service.id })}>Approve</Button>
                                <Button size="sm" variant="ghost" className="text-xs h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setRejectDialog({ isOpen: true, id: service.id })}>Reject</Button>
                            </div>
                        )}
                        {service.status === 'approved' && (
                            <Button size="sm" variant="primary" className="text-xs h-7 px-2" onClick={() => handleStatusUpdate(service.id, 'borrowed')}>Mark Borrowed</Button>
                        )}
                        {service.status === 'borrowed' && (
                            <Button size="sm" variant="secondary" className="text-xs h-7 px-2" onClick={() => handleStatusUpdate(service.id, 'returned')}>Mark Returned</Button>
                        )}
                        </td>
                    )}
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
      </div>

       {/* Create Modal */}
       <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Service Request">
        <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Auto-filled User Credentials Section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <UserIcon className="w-4 h-4 mr-2" /> Requesting Party
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500 block text-xs">Full Name</span>
                        <span className="font-medium text-gray-900">{user.firstName} {user.lastName}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block text-xs">Email</span>
                        <span className="font-medium text-gray-900">{user.email}</span>
                    </div>
                    <div>
                         <span className="text-gray-500 block text-xs flex items-center gap-1"><Phone className="w-3 h-3"/> Phone</span>
                         <span className="font-medium text-gray-900">{user.phoneNumber || 'N/A'}</span>
                    </div>
                    <div>
                         <span className="text-gray-500 block text-xs flex items-center gap-1"><MapPin className="w-3 h-3"/> Address</span>
                         <span className="font-medium text-gray-900">{user.address || 'N/A'}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label required>Item Type</Label>
                    <Select
                        value={newRequest.itemType}
                        onChange={e => setNewRequest({...newRequest, itemType: e.target.value})}
                    >
                        <option value="Equipment">Equipment</option>
                        <option value="Facility">Facility</option>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label required>Item Name</Label>
                    <Input 
                        value={newRequest.itemName}
                        onChange={e => setNewRequest({...newRequest, itemName: e.target.value})}
                        placeholder="e.g. Chairs, Court"
                        error={errors.itemName}
                    />
                </div>
            </div>

            {/* Check Availability Indicator (Visual Only for now) */}
            {newRequest.itemName.length > 2 && (
                <div className="flex items-center text-xs text-green-600 bg-green-50 px-3 py-2 rounded">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Available for requested dates (Mock Check)
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label required>Borrow Date</Label>
                    <Input 
                        type="date"
                        min={today}
                        value={newRequest.borrowDate}
                        onChange={e => setNewRequest({...newRequest, borrowDate: e.target.value})}
                        error={errors.borrowDate}
                    />
                </div>
                <div className="space-y-2">
                    <Label required>Return Date</Label>
                    <Input 
                        type="date"
                        min={newRequest.borrowDate || today}
                        value={newRequest.expectedReturnDate}
                        onChange={e => setNewRequest({...newRequest, expectedReturnDate: e.target.value})}
                        error={errors.expectedReturnDate}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label required>Purpose</Label>
                <Textarea 
                    value={newRequest.purpose}
                    onChange={e => setNewRequest({...newRequest, purpose: e.target.value})}
                    placeholder="Why do you need this?"
                    error={errors.purpose}
                />
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" isLoading={submitting}>Submit Request</Button>
            </div>
        </form>
       </Modal>
       
       {/* Catalog Modal */}
       <Modal isOpen={showCatalog} onClose={() => setShowCatalog(false)} title="Equipment Catalog">
           <div className="grid gap-4">
               {['Monoblock Chairs (50pcs set)', 'Plastic Tables (10pcs set)', 'Sound System', 'Tents (10x10)'].map(item => (
                   <div key={item} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
                       <span className="font-medium">{item}</span>
                       <Button size="sm" variant="outline" onClick={() => { 
                           setNewRequest({...newRequest, itemName: item, itemType: 'Equipment'}); 
                           setShowCatalog(false); 
                           setShowModal(true); 
                       }}>Select</Button>
                   </div>
               ))}
           </div>
       </Modal>

        {/* Custom Confirmation Dialog content for Rejection */}
        {rejectDialog.isOpen && (
             <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-200">
                <Card className="w-full max-w-md shadow-xl relative">
                    <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-100 text-red-600">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Reject Request</h3>
                        <p className="text-sm text-gray-500 mb-4">Please provide a reason for rejection.</p>
                        
                        <div className="text-left mb-6">
                            <Label>Reason</Label>
                            <Input 
                                value={rejectionReason} 
                                onChange={e => setRejectionReason(e.target.value)}
                                placeholder="e.g. Item unavailable, Date conflict..." 
                            />
                        </div>

                        <div className="flex gap-3 justify-center">
                            <Button variant="ghost" onClick={() => setRejectDialog({ isOpen: false, id: null })}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={confirmReject}>
                                Reject Request
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}

        {/* Custom Confirmation Dialog content for Approval */}
        {approveDialog.isOpen && (
             <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-200">
                <Card className="w-full max-w-md shadow-xl relative">
                    <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-100 text-green-600">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Approve Request</h3>
                        <p className="text-sm text-gray-500 mb-4">Add optional instructions for the resident.</p>
                        
                        <div className="text-left mb-6">
                            <Label>Notes (Optional)</Label>
                            <Input 
                                value={approvalNote} 
                                onChange={e => setApprovalNote(e.target.value)}
                                placeholder="e.g. Pick up at Guard House at 2PM" 
                            />
                        </div>

                        <div className="flex gap-3 justify-center">
                            <Button variant="ghost" onClick={() => setApproveDialog({ isOpen: false, id: null })}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={confirmApprove}>
                                Approve Request
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}
    </div>
  );
};

export default Services;