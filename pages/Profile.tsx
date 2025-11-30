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
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { showToast } = useToast();

  const handleNameChange = (field: "firstName" | "lastName", value: string) => {
    // Only allow letters, spaces, dots, and dashes
    if (/^[a-zA-Z\s.-]*$/.test(value) || value === "") {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setTouched((prev) => ({ ...prev, [field]: true }));

      // Real-time validation
      if (touched[field]) {
        if (!value.trim() || value.length < 2) {
          setErrors((prev) => ({
            ...prev,
            [field]: `${
              field === "firstName" ? "First" : "Last"
            } name must be at least 2 characters`,
          }));
        } else if (value.length > 50) {
          setErrors((prev) => ({
            ...prev,
            [field]: `${
              field === "firstName" ? "First" : "Last"
            } name must not exceed 50 characters`,
          }));
        } else {
          setErrors((prev) => ({ ...prev, [field]: "" }));
        }
      }
    }
  };

  const handlePhoneChange = (value: string) => {
    // Only allow numbers, max 11 chars
    const numeric = value.replace(/\D/g, "");
    if (numeric.length <= 11) {
      setFormData((prev) => ({ ...prev, phoneNumber: numeric }));
      setTouched((prev) => ({ ...prev, phoneNumber: true }));

      // Real-time validation
      if (touched.phoneNumber && numeric) {
        if (!/^(09)\d{9}$/.test(numeric) && numeric.length === 11) {
          setErrors((prev) => ({
            ...prev,
            phoneNumber: "Phone must start with 09",
          }));
        } else if (numeric.length > 0 && numeric.length < 11) {
          setErrors((prev) => ({
            ...prev,
            phoneNumber: "Phone must be 11 digits",
          }));
        } else {
          setErrors((prev) => ({ ...prev, phoneNumber: "" }));
        }
      }
    }
  };

  const handleAddressChange = (value: string) => {
    if (value.length <= 200) {
      setFormData((prev) => ({ ...prev, address: value }));
      setTouched((prev) => ({ ...prev, address: true }));

      if (touched.address && value.length > 0 && value.length < 10) {
        setErrors((prev) => ({
          ...prev,
          address: "Please provide a complete address (minimum 10 characters)",
        }));
      } else {
        setErrors((prev) => ({ ...prev, address: "" }));
      }
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim() || formData.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    } else if (formData.firstName.length > 50) {
      newErrors.firstName = "First name must not exceed 50 characters";
    }

    if (!formData.lastName.trim() || formData.lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    } else if (formData.lastName.length > 50) {
      newErrors.lastName = "Last name must not exceed 50 characters";
    }

    if (formData.phoneNumber) {
      if (!/^(09)\d{9}$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = "Phone must start with 09 and be 11 digits";
      }
    }

    if (formData.address && formData.address.length < 10) {
      newErrors.address =
        "Please provide a complete address (minimum 10 characters)";
    }

    setErrors(newErrors);
    setTouched({
      firstName: true,
      lastName: true,
      phoneNumber: true,
      address: true,
    });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      showToast(
        "Validation Error",
        "Please fix the errors before saving",
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
      showToast(
        "Profile Updated!",
        "Your profile has been updated successfully",
        "success"
      );

      if (idDocument && !user.idDocumentUrl) {
        setTimeout(() => {
          showToast(
            "ID Submitted",
            "Your ID has been submitted for verification. You'll be notified once approved.",
            "info",
            5000
          );
        }, 1000);
      }
    } catch (error: any) {
      showToast(
        "Update Failed",
        error.message || "Failed to update profile",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const hasChanges =
    formData.firstName !== user.firstName ||
    formData.lastName !== user.lastName ||
    formData.phoneNumber !== (user.phoneNumber || "") ||
    formData.address !== (user.address || "") ||
    avatar !== user.avatar ||
    idDocument !== (user.idDocumentUrl || "");

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
          <Card className="border-2 hover:border-primary-200 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-primary-600" />
                Profile Photo
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="relative group">
                  <img
                    src={avatar || user.avatar}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 shadow-lg group-hover:border-primary-200 transition-all"
                  />
                  {avatar !== user.avatar && (
                    <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
              <FileUpload
                value={avatar}
                onChange={(newAvatar) => {
                  setAvatar(newAvatar);
                  showToast(
                    "Photo Selected",
                    "Remember to save your changes",
                    "info",
                    2000
                  );
                }}
                label=""
                helperText="Upload a clear profile picture (max 4MB)"
              />
            </CardContent>
          </Card>

          <Card
            className={`border-2 transition-all ${
              user.isVerified
                ? "border-green-300 bg-gradient-to-br from-green-50 to-emerald-50"
                : "border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50"
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                {user.isVerified ? (
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                ) : (
                  <div className="p-2 bg-orange-100 rounded-full">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                  </div>
                )}
                <h3
                  className={`font-bold text-lg ${
                    user.isVerified ? "text-green-800" : "text-orange-800"
                  }`}
                >
                  {user.isVerified ? "Verified Resident" : "Unverified Account"}
                </h3>
              </div>

              {user.isVerified ? (
                <div className="space-y-3">
                  <p className="text-sm text-green-700 leading-relaxed">
                    Your identity has been verified by the barangay
                    administration. You have full access to all services.
                  </p>
                  {user.idDocumentUrl && (
                    <div className="bg-white border-2 border-green-200 rounded-lg p-3 shadow-sm">
                      <p className="text-xs font-semibold text-green-700 mb-2">
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
                  <p className="text-sm text-orange-800 leading-relaxed">
                    Please upload a valid Government ID to verify your residency
                    and access all services.
                  </p>
                  <div className="bg-white border-2 border-orange-200 rounded-lg p-3 shadow-sm">
                    <p className="text-xs font-semibold text-orange-900 mb-2">
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
                    <div className="bg-white border-2 border-blue-200 rounded-lg p-3 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-blue-900">
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
                    onChange={(newDoc) => {
                      setIdDocument(newDoc);
                      showToast(
                        "ID Selected",
                        "Click 'Submit for Verification' to upload",
                        "info",
                        3000
                      );
                    }}
                    label={
                      idDocument ? "Change ID Document" : "Upload Government ID"
                    }
                    helperText="Clear photo showing your full name and photo (max 5MB)"
                  />
                  {idDocument && !user.idDocumentUrl && (
                    <Button
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
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
        <Card className="md:col-span-2 h-fit border-2 hover:border-primary-200 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary-600" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label required>First Name</Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) =>
                      handleNameChange("firstName", e.target.value)
                    }
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, firstName: true }))
                    }
                    error={touched.firstName ? errors.firstName : ""}
                    maxLength={50}
                    placeholder="Juan"
                  />
                  {formData.firstName &&
                    !errors.firstName &&
                    touched.firstName && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Looks good!
                      </p>
                    )}
                </div>
                <div className="space-y-2">
                  <Label required>Last Name</Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) =>
                      handleNameChange("lastName", e.target.value)
                    }
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, lastName: true }))
                    }
                    error={touched.lastName ? errors.lastName : ""}
                    maxLength={50}
                    placeholder="Dela Cruz"
                  />
                  {formData.lastName &&
                    !errors.lastName &&
                    touched.lastName && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Looks good!
                      </p>
                    )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={user.email}
                    disabled
                    className="pl-9 bg-gray-50 cursor-not-allowed"
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
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, phoneNumber: true }))
                    }
                    className="pl-9"
                    placeholder="09123456789"
                    maxLength={11}
                    error={touched.phoneNumber ? errors.phoneNumber : ""}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Format: 09XXXXXXXXX (11 digits)
                  {formData.phoneNumber && formData.phoneNumber.length > 0 && (
                    <span className="ml-2 text-primary-600">
                      ({formData.phoneNumber.length}/11)
                    </span>
                  )}
                </p>
                {formData.phoneNumber &&
                  !errors.phoneNumber &&
                  touched.phoneNumber &&
                  formData.phoneNumber.length === 11 && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Valid phone number!
                    </p>
                  )}
              </div>

              <div className="space-y-2">
                <Label>Home Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={formData.address}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, address: true }))
                    }
                    className="pl-9"
                    placeholder="Block X Lot Y, Street Name, Barangay"
                    maxLength={200}
                    error={touched.address ? errors.address : ""}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  This address will be auto-filled in your service requests.
                  {formData.address && (
                    <span className="ml-2 text-primary-600">
                      ({formData.address.length}/200)
                    </span>
                  )}
                </p>
              </div>

              {hasChanges && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-sm text-blue-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    You have unsaved changes
                  </p>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setFormData({
                      firstName: user.firstName,
                      lastName: user.lastName,
                      phoneNumber: user.phoneNumber || "",
                      address: user.address || "",
                    });
                    setAvatar(user.avatar || "");
                    setIdDocument(user.idDocumentUrl || "");
                    setErrors({});
                    setTouched({});
                    showToast(
                      "Changes Discarded",
                      "Form reset to original values",
                      "info",
                      2000
                    );
                  }}
                  disabled={loading || !hasChanges}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  disabled={
                    loading ||
                    !hasChanges ||
                    Object.values(errors).some((e) => e !== "")
                  }
                  className="shadow-lg hover:shadow-xl transition-all"
                >
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
