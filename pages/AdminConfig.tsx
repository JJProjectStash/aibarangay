import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Globe, Layout, Shield } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Toggle, Tabs } from '../components/UI';
import { api } from '../services/api';

const AdminConfig = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [config, setConfig] = useState({
      maintenanceMode: false,
      allowRegistrations: true,
      maxServiceRequestsPerUser: 5,
      systemEmail: 'admin@ibarangay.com',
      autoApproveLowPriority: false
  });
  
  const [siteSettings, setSiteSettings] = useState({
      barangayName: '',
      logoUrl: '',
      contactEmail: '',
      contactPhone: '',
      address: ''
  });

  useEffect(() => {
      // Load settings
      api.getSiteSettings().then(setSiteSettings);
  }, []);

  const handleSave = async () => {
      await api.updateSiteSettings(siteSettings as any);
      alert('Configuration saved successfully!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
          <p className="text-gray-500">Manage global system settings and branding</p>
        </div>
        <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
        </Button>
      </div>

      <Tabs 
        activeTab={activeTab} 
        onChange={setActiveTab} 
        tabs={[
            { id: 'general', label: 'General Settings' },
            { id: 'branding', label: 'Site Identity & Footer' }
        ]} 
      />

      {activeTab === 'general' && (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>System Rules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-base mb-1">Maintenance Mode</Label>
                            <p className="text-sm text-gray-500">Disable access for all non-admin users.</p>
                        </div>
                        <Toggle 
                            checked={config.maintenanceMode} 
                            onCheckedChange={v => setConfig({...config, maintenanceMode: v})} 
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-base mb-1">Allow User Registrations</Label>
                            <p className="text-sm text-gray-500">If disabled, only admins can create new accounts.</p>
                        </div>
                        <Toggle 
                            checked={config.allowRegistrations} 
                            onCheckedChange={v => setConfig({...config, allowRegistrations: v})} 
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Service Limits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Max Pending Requests Per User</Label>
                            <Input 
                                type="number" 
                                value={config.maxServiceRequestsPerUser}
                                onChange={e => setConfig({...config, maxServiceRequestsPerUser: parseInt(e.target.value)})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>System Notification Email</Label>
                            <Input 
                                type="email" 
                                value={config.systemEmail}
                                onChange={e => setConfig({...config, systemEmail: e.target.value})}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      )}

      {activeTab === 'branding' && (
          <Card>
              <CardHeader>
                  <CardTitle>Branding & Contact Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <Label>Barangay Name</Label>
                          <Input value={siteSettings.barangayName} onChange={e => setSiteSettings({...siteSettings, barangayName: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                          <Label>Logo URL</Label>
                          <Input value={siteSettings.logoUrl} onChange={e => setSiteSettings({...siteSettings, logoUrl: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                          <Label>Contact Phone</Label>
                          <Input value={siteSettings.contactPhone} onChange={e => setSiteSettings({...siteSettings, contactPhone: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                          <Label>Contact Email</Label>
                          <Input value={siteSettings.contactEmail} onChange={e => setSiteSettings({...siteSettings, contactEmail: e.target.value})} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                          <Label>Address</Label>
                          <Input value={siteSettings.address} onChange={e => setSiteSettings({...siteSettings, address: e.target.value})} />
                      </div>
                  </div>
              </CardContent>
          </Card>
      )}
    </div>
  );
};

export default AdminConfig;