
import React, { useState } from 'react';
import { User as UserIcon, MapPin, Phone, Mail, Save, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, FileUpload, Badge } from '../components/UI';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import { User } from '../types';

interface ProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber || '',
      address: user.address || ''
  });
  const [idDocument, setIdDocument] = useState<string>(user.idDocumentUrl || '');
  const [avatar, setAvatar] = useState<string>(user.avatar || '');
  const [loading, setLoading] = useState(false);

  const handleNameChange = (field: 'firstName' | 'lastName', value: string) => {
    // Only allow letters, spaces, dots, and dashes
    if (/^[a-zA-Z\s.-]*$/.test(value)) {
        setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handlePhoneChange = (value: string) => {
    // Only allow numbers, max 11 chars
    const numeric = value.replace(/\D/g, '');
    if (numeric.length <= 11) {
        setFormData(prev => ({ ...prev, phoneNumber: numeric }));
    }
  };

    const { showToast } = useToast();
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Basic validation check
      if(!formData.firstName.trim() || !formData.lastName.trim()) {
          showToast('Validation', 'First and Last name are required.', 'error');
          return;
      }

      setLoading(true);
      // Simulate API update
      const updatedUser: User = { 
          ...user, 
          ...formData,
          avatar: avatar,
          idDocumentUrl: idDocument,
          // If they upload a document, we can simulate putting them in "pending" or keeping them unverified until admin checks
          isVerified: user.isVerified 
      };
      await api.updateProfile(updatedUser);
      onUpdate(updatedUser);
      setLoading(false);
      showToast('Success', 'Profile updated successfully', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500">Manage your account settings and identity verification</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
          {/* Identity Verification Section */}
          <div className="md:col-span-1 space-y-6">
              <Card>
                  <CardHeader>
                      <CardTitle>Profile Photo</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                       <FileUpload 
                            value={avatar} 
                            onChange={setAvatar} 
                            label=""
                            className="mb-4"
                            helperText="Upload a clear profile picture"
                       />
                  </CardContent>
              </Card>

              <Card className={user.isVerified ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
                  <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                          {user.isVerified ? (
                              <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                              <AlertCircle className="w-6 h-6 text-orange-600" />
                          )}
                          <h3 className={`font-bold ${user.isVerified ? 'text-green-800' : 'text-orange-800'}`}>
                              {user.isVerified ? 'Verified Resident' : 'Unverified'}
                          </h3>
                      </div>
                      
                      {user.isVerified ? (
                          <p className="text-sm text-green-700">
                              Your identity has been verified by the barangay administration. You have full access to all services.
                          </p>
                      ) : (
                          <div className="space-y-4">
                              <p className="text-sm text-orange-800">
                                  Please upload a valid Government ID to verify your residency and access restricted services.
                              </p>
                              <FileUpload 
                                  value={idDocument}
                                  onChange={setIdDocument}
                                  label="Upload Government ID"
                                  helperText="UMID, Drivers License, etc."
                              />
                              <Button size="sm" className="w-full" onClick={handleSubmit} disabled={!idDocument}>
                                  Submit for Verification
                              </Button>
                          </div>
                      )}
                  </CardContent>
              </Card>
          </div>

          {/* Edit Form */}
          <Card className="md:col-span-2 h-fit">
              <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label>First Name</Label>
                              <Input 
                                value={formData.firstName} 
                                onChange={e => handleNameChange('firstName', e.target.value)} 
                              />
                          </div>
                          <div className="space-y-2">
                              <Label>Last Name</Label>
                              <Input 
                                value={formData.lastName} 
                                onChange={e => handleNameChange('lastName', e.target.value)} 
                              />
                          </div>
                      </div>

                      <div className="space-y-2">
                          <Label>Email Address</Label>
                          <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input value={user.email} disabled className="pl-9 bg-gray-50" />
                          </div>
                          <p className="text-xs text-gray-500">Email cannot be changed. Contact admin for support.</p>
                      </div>

                      <div className="space-y-2">
                          <Label>Phone Number</Label>
                          <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input 
                                value={formData.phoneNumber} 
                                onChange={e => handlePhoneChange(e.target.value)} 
                                className="pl-9" 
                                placeholder="09xxxxxxxxx"
                                maxLength={11}
                              />
                          </div>
                      </div>

                      <div className="space-y-2">
                          <Label>Home Address</Label>
                          <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="pl-9" />
                          </div>
                          <p className="text-xs text-gray-500">This address will be auto-filled in your service requests.</p>
                      </div>

                      <div className="pt-4 flex justify-end">
                          <Button type="submit" isLoading={loading}>
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                          </Button>
                      </div>
                  </form>
              </CardContent>
          </Card>
      </div>
    </div>
  );
};

export default Profile;