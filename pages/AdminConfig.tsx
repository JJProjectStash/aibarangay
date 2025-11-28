import React, { useState, useEffect } from "react";
import { Save } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Tabs,
  FileUpload,
} from "../components/UI";
import { api } from "../services/api";
import { useToast } from '../components/Toast';

interface AdminConfigProps {
  onSettingsUpdate?: () => void;
}

const AdminConfig: React.FC<AdminConfigProps> = ({ onSettingsUpdate }) => {
  const [activeTab, setActiveTab] = useState("branding");

  const [siteSettings, setSiteSettings] = useState({
    barangayName: "",
    logoUrl: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
  });

  useEffect(() => {
    // Load settings
    api.getSiteSettings().then(setSiteSettings);
  }, []);

  const { showToast } = useToast();
  const handleSave = async () => {
    await api.updateSiteSettings(siteSettings as any);
    if (onSettingsUpdate) {
      onSettingsUpdate();
    }
    showToast('Success', 'Configuration saved successfully!', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            System Configuration
          </h1>
          <p className="text-gray-500">Manage site identity and branding</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[{ id: "branding", label: "Site Identity & Footer" }]}
      />

      {activeTab === "branding" && (
        <Card>
          <CardHeader>
            <CardTitle>Branding & Contact Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FileUpload
              label="Barangay Logo"
              value={siteSettings.logoUrl}
              onChange={(base64) =>
                setSiteSettings({ ...siteSettings, logoUrl: base64 })
              }
              accept="image/*"
              helperText="PNG, JPG or SVG (Max 5MB)"
            />

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Barangay Name</Label>
                <Input
                  value={siteSettings.barangayName}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      barangayName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input
                  value={siteSettings.contactPhone}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      contactPhone: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input
                  value={siteSettings.contactEmail}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      contactEmail: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address</Label>
                <Input
                  value={siteSettings.address}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      address: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminConfig;
