import React, { useState } from "react";
import {
  User as UserIcon,
  MapPin,
  Phone,
  Mail,
  Save,
  Shield,
  CheckCircle,
  AlertCircle,
  Upload,
  FileText,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  FileUpload,
  Badge,
} from "../components/UI";
import { api } from "../services/api";
import { useToast } from "../components/Toast";
import { User } from "../types";

interface ProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber || "",
    address: user.address || "",
  });
  const [idDocument, setIdDocument] = useState<string>(
    user.idDocumentUrl || ""
  );
  const [avatar, setAvatar] = useState<string>(user.avatar || "");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNameChange = (field: "firstName" | "lastName", value: string) => {
    // Only allow letters, spaces, dots, and dashes
    if (/^[a-zA-Z\s.-]*$/.test(value)) {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    }
  };

  const handlePhoneChange = (value: string) => {
    // Only allow numbers, max 11 chars
    const numeric = value.replace(/\D/g, "");
    if (numeric.length <= 11) {
      setFormData((prev) => ({ ...prev, phoneNumber: numeric }));
      if (errors.phoneNumber) {
        setErrors((prev) => ({ ...prev, phoneNumber: "" }));
      }
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim() || formData.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    if (!formData.lastName.trim() || formData.lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    if (formData.phoneNumber && !/^(09)\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone must start with 09 and be 11 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { showToast } = useToast();
  const handleSubmit = async (e: React.FormEvent) => {
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
      const updatedUser = await api.updateProfile({
        ...formData,
        avatar: avatar,
        idDocumentUrl: idDocument,
      });
      onUpdate(updatedUser);
      showToast("Success", "Profile updated successfully", "success");

      if (idDocument && !user.idDocumentUrl) {
        showToast(
          "ID Submitted",
          "Your ID has been submitted for verification",
          "info"
        );
      }
    } catch (error: any) {
      showToast("Error", error.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500">
          Manage your account settings and identity verification
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Identity Verification Section */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-4 flex justify-center">
                <img
                  src={avatar || user.avatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                />
              </div>
              <FileUpload
                value={avatar}
                onChange={setAvatar}
                label=""
                helperText="Upload a clear profile picture (max 4MB)"
              />
            </CardContent>
          </Card>

          <Card
            className={
              user.isVerified
                ? "border-green-200 bg-green-50"
                : "border-orange-200 bg-orange-50"
            }
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                {user.isVerified ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                )}
                <h3
                  className={`font-bold ${
                    user.isVerified ? "text-green-800" : "text-orange-800"
                  }`}
                >
                  {user.isVerified ? "Verified Resident" : "Unverified Account"}
                </h3>
              </div>

              {user.isVerified ? (
                <div className="space-y-3">
                  <p className="text-sm text-green-700">
                    Your identity has been verified by the barangay
                    administration. You have full access to all services.
                  </p>
                  {user.idDocumentUrl && (
                    <div className="bg-white border border-green-200 rounded p-2">
                      <p className="text-xs text-green-700 mb-2">
                        Verified ID Document:
                      </p>
                      <img
                        src={user.idDocumentUrl}
                        alt="Verified ID"
                        className="w-full h-32 object-contain rounded"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-orange-800">
                    Please upload a valid Government ID to verify your residency
                    and access all services.
                  </p>
                  <div className="bg-white border border-orange-200 rounded p-3">
                    <p className="text-xs font-medium text-orange-900 mb-2">
                      Accepted IDs:
                    </p>
                    <ul className="text-xs text-orange-800 space-y-1">
                      <li>• UMID / SSS ID</li>
                      <li>• Driver's License</li>
                      <li>• Passport</li>
                      <li>• Voter's ID</li>
                      <li>• PhilHealth ID</li>
                    </ul>
                  </div>
                  {idDocument || user.idDocumentUrl ? (
                    <div className="bg-white border-2 border-blue-200 rounded p-2">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-blue-900">
                          {user.idDocumentUrl && !idDocument
                            ? "Submitted (Under Review)"
                            : "Ready to Submit"}
                        </p>
                        {user.idDocumentUrl && !idDocument && (
                          <Badge variant="info" className="text-xs">
                            <FileText className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                      <img
                        src={idDocument || user.idDocumentUrl}
                        alt="ID Document"
                        className="w-full h-40 object-contain rounded bg-gray-50"
                      />
                    </div>
                  ) : null}
                  <FileUpload
                    value={idDocument}
                    onChange={setIdDocument}
                    label={
                      idDocument ? "Change ID Document" : "Upload Government ID"
                    }
                    helperText="Clear photo showing your full name and photo (max 5MB)"
                  />
                  {idDocument && !user.idDocumentUrl && (
                    <Button
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {loading ? "Submitting..." : "Submit for Verification"}
                    </Button>
                  )}
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
                  <Label required>First Name</Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) =>
                      handleNameChange("firstName", e.target.value)
                    }
                    error={errors.firstName}
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label required>Last Name</Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) =>
                      handleNameChange("lastName", e.target.value)
                    }
                    error={errors.lastName}
                    maxLength={50}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={user.email}
                    disabled
                    className="pl-9 bg-gray-50"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Email cannot be changed. Contact admin for support.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={formData.phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="pl-9"
                    placeholder="09123456789"
                    maxLength={11}
                    error={errors.phoneNumber}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Format: 09XXXXXXXXX (11 digits)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Home Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="pl-9"
                    placeholder="Block X Lot Y, Street Name, Barangay"
                    maxLength={200}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  This address will be auto-filled in your service requests.
                </p>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button type="submit" disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Saving..." : "Save Changes"}
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
