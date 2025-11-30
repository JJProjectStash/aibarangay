import React, { useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button, Card, CardContent, Label } from "../components/UI";
import { api } from "../services/api";
import { useToast } from "../components/Toast";

interface SignupProps {
  onBack: () => void;
  onSuccess: () => void;
}

const Signup: React.FC<SignupProps> = ({ onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
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

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const { showToast } = useToast();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md my-8 shadow-2xl border-0">
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
                <div className="w-full">
                  <input
                    value={formData.firstName}
                    onChange={(e) =>
                      handleNameChange("firstName", e.target.value)
                    }
                    onBlur={() => handleBlur("firstName")}
                    placeholder="Juan"
                    maxLength={50}
                    disabled={loading}
                    className={`flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm ${
                      touched.firstName && errors.firstName
                        ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {touched.firstName && errors.firstName && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium">
                      {errors.firstName}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label required>Last Name</Label>
                <div className="w-full">
                  <input
                    value={formData.lastName}
                    onChange={(e) =>
                      handleNameChange("lastName", e.target.value)
                    }
                    onBlur={() => handleBlur("lastName")}
                    placeholder="Dela Cruz"
                    maxLength={50}
                    disabled={loading}
                    className={`flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm ${
                      touched.lastName && errors.lastName
                        ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {touched.lastName && errors.lastName && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label required>Email</Label>
              <div className="w-full">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  placeholder="name@email.com"
                  disabled={loading}
                  maxLength={100}
                  className={`flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm ${
                    touched.email && errors.email
                      ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {touched.email && errors.email && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label required>Phone Number</Label>
              <div className="w-full">
                <input
                  type="tel"
                  placeholder="09123456789"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onBlur={() => handleBlur("phone")}
                  maxLength={11}
                  disabled={loading}
                  className={`flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm ${
                    touched.phone && errors.phone
                      ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {touched.phone && errors.phone && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium">
                    {errors.phone}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Format: 09XXXXXXXXX (11 digits)
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label required>Password</Label>
              <div className="w-full">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    onBlur={() => handleBlur("password")}
                    placeholder="••••••••"
                    disabled={loading}
                    maxLength={128}
                    className={`flex h-10 w-full rounded-lg border bg-white px-3 pr-12 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm ${
                      touched.password && errors.password
                        ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none p-1"
                    tabIndex={-1}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium">
                    {errors.password}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Min 8 characters, include uppercase, lowercase, and number
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label required>Confirm Password</Label>
              <div className="w-full">
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    onBlur={() => handleBlur("confirmPassword")}
                    placeholder="••••••••"
                    disabled={loading}
                    maxLength={128}
                    className={`flex h-10 w-full rounded-lg border bg-white px-3 pr-12 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm ${
                      touched.confirmPassword && errors.confirmPassword
                        ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none p-1"
                    tabIndex={-1}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label required>Address</Label>
              <div className="w-full">
                <input
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  onBlur={() => handleBlur("address")}
                  placeholder="Block X Lot Y, Street Name, Barangay"
                  maxLength={200}
                  disabled={loading}
                  className={`flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm ${
                    touched.address && errors.address
                      ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {touched.address && errors.address && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium">
                    {errors.address}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-6 h-12 font-bold"
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
