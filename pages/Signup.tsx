import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button, Card, CardContent, Input, Label } from "../components/UI";
import { api } from "../services/api";
import { useToast } from "../components/Toast";

interface SignupProps {
  onBack: () => void;
  onSuccess: () => void;
}

const Signup: React.FC<SignupProps> = ({ onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s.-]+$/.test(formData.firstName)) {
      newErrors.firstName =
        "First name can only contain letters, spaces, dots, and dashes";
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s.-]+$/.test(formData.lastName)) {
      newErrors.lastName =
        "Last name can only contain letters, spaces, dots, and dashes";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and number";
    }

    // Confirm Password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^(09)\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Must start with 09 and be 11 digits";
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    } else if (formData.address.trim().length < 10) {
      newErrors.address = "Please provide a complete address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNameChange = (field: "firstName" | "lastName", value: string) => {
    // Only allow letters, spaces, dots, and dashes
    if (/^[a-zA-Z\s.-]*$/.test(value) || value === "") {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    }
  };

  const handlePhoneChange = (value: string) => {
    // Only allow numbers, max 11 chars
    const numeric = value.replace(/\D/g, "");
    if (numeric.length <= 11) {
      setFormData((prev) => ({ ...prev, phone: numeric }));
      // Clear error when user starts typing
      if (errors.phone) {
        setErrors((prev) => ({ ...prev, phone: "" }));
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
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
      await api.register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phoneNumber: formData.phone,
        address: formData.address.trim(),
      });
      showToast(
        "Success",
        "Account created successfully! Please log in.",
        "success"
      );
      onSuccess();
    } catch (err: any) {
      console.error("Signup failed", err);
      const errorMessage = err?.message || "Signup failed. Please try again.";
      showToast("Error", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md my-8">
        <CardContent className="p-8">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </button>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-500 text-sm">Join your community online.</p>
          </div>

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
                  placeholder="Juan"
                  maxLength={50}
                />
              </div>
              <div className="space-y-2">
                <Label required>Last Name</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleNameChange("lastName", e.target.value)}
                  error={errors.lastName}
                  placeholder="Dela Cruz"
                  maxLength={50}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label required>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                error={errors.email}
                placeholder="name@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label required>Phone Number</Label>
              <Input
                type="tel"
                placeholder="09123456789"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                error={errors.phone}
                maxLength={11}
              />
              <p className="text-xs text-gray-500">
                Format: 09XXXXXXXXX (11 digits)
              </p>
            </div>
            <div className="space-y-2">
              <Label required>Password</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                error={errors.password}
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-500">
                Min 8 characters, include uppercase, lowercase, and number
              </p>
            </div>
            <div className="space-y-2">
              <Label required>Confirm Password</Label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                error={errors.confirmPassword}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label required>Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Block X Lot Y, Street Name, Barangay"
                error={errors.address}
                maxLength={200}
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-6"
              isLoading={loading}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
