import React, { useState } from "react";
import {
  Home,
  Mail,
  User,
  ShieldCheck,
  Users,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button, Card, CardContent, Input, Label } from "../components/UI";
import { api } from "../services/api";
import { useToast } from "../components/Toast";
import { User as UserType } from "../types";

interface LoginProps {
  onLogin: (user: UserType) => void;
  onNavigateToSignup?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [touched, setTouched] = useState<{
    email?: boolean;
    password?: boolean;
  }>({});

  const { showToast } = useToast();

  const validateEmail = (email: string): string => {
    const trimmed = email.trim();
    if (!trimmed) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePassword = (password: string): string => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    return "";
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (touched.email) {
      const validationError = validateEmail(value);
      setErrors({ ...errors, email: validationError });
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (touched.password) {
      const validationError = validatePassword(value);
      setErrors({ ...errors, password: validationError });
    }
  };

  const handleEmailBlur = () => {
    setTouched({ ...touched, email: true });
    const validationError = validateEmail(email);
    setErrors({ ...errors, email: validationError });
  };

  const handlePasswordBlur = () => {
    setTouched({ ...touched, password: true });
    const validationError = validatePassword(password);
    setErrors({ ...errors, password: validationError });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    const emailError = validateEmail(trimmedEmail);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      setTouched({ email: true, password: true });
      showToast(
        "Validation Error",
        "Please fix the errors in the form",
        "error"
      );
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const user = await api.login(trimmedEmail, password);
      if (user) {
        showToast(
          "Welcome Back!",
          `Successfully logged in as ${user.firstName} ${user.lastName}`,
          "success",
          3000
        );
        setTimeout(() => onLogin(user), 500);
      } else {
        const errorMsg = "Invalid email or password. Please try again.";
        setErrors({ email: errorMsg });
        showToast("Login Failed", errorMsg, "error");
      }
    } catch (err: any) {
      const errorMsg =
        err?.message ||
        "Login failed. Please check your credentials and try again.";
      setErrors({ email: errorMsg });
      showToast("Login Error", errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCreds = (role: string) => {
    const demoEmail = `${role}@ibarangay.com`;
    const demoPassword = "demo1234";
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrors({});
    setTouched({});
    showToast(
      "Demo Account",
      `${
        role.charAt(0).toUpperCase() + role.slice(1)
      } credentials loaded. Click Sign In to continue.`,
      "info",
      3000
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/20 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-teal-600 mb-6 shadow-2xl shadow-primary-500/30 transform hover:scale-110 transition-transform duration-300">
            <Home className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-sm text-gray-600">
            Sign in to iBarangay Online Services
          </p>
        </div>

        <Card className="border-0 shadow-2xl ring-1 ring-gray-900/5 backdrop-blur-sm bg-white/95">
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onBlur={handleEmailBlur}
                    placeholder="name@ibarangay.com"
                    className="h-12 pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                    error={touched.email ? errors.email : ""}
                    disabled={loading}
                    autoComplete="email"
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="font-medium">
                    Password
                  </Label>
                  <a
                    href="#"
                    className="text-xs text-primary-600 hover:text-primary-800 font-medium hover:underline transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      showToast(
                        "Password Reset",
                        "Please contact your barangay administrator for password assistance.",
                        "info"
                      );
                    }}
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    onBlur={handlePasswordBlur}
                    placeholder="••••••••"
                    className="h-12 pr-12 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                    error={touched.password ? errors.password : ""}
                    disabled={loading}
                    autoComplete="current-password"
                    maxLength={128}
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
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-bold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                isLoading={loading}
                disabled={
                  loading ||
                  (touched.email && !!errors.email) ||
                  (touched.password && !!errors.password)
                }
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  onClick={onNavigateToSignup}
                  className="text-primary-600 hover:text-primary-800 font-semibold hover:underline transition-colors"
                  type="button"
                >
                  Sign up here
                </button>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-center text-gray-400 mb-4 font-semibold uppercase tracking-wider">
                Try Demo Accounts
              </p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => fillDemoCreds("resident")}
                  className="flex flex-col items-center justify-center p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700 transition-all duration-200 group shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                  disabled={loading}
                  type="button"
                >
                  <User className="w-5 h-5 mb-1 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  <span className="text-xs font-medium">Resident</span>
                </button>
                <button
                  onClick={() => fillDemoCreds("staff")}
                  className="flex flex-col items-center justify-center p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                  disabled={loading}
                  type="button"
                >
                  <Users className="w-5 h-5 mb-1 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <span className="text-xs font-medium">Staff</span>
                </button>
                <button
                  onClick={() => fillDemoCreds("admin")}
                  className="flex flex-col items-center justify-center p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 group shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                  disabled={loading}
                  type="button"
                >
                  <ShieldCheck className="w-5 h-5 mb-1 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  <span className="text-xs font-medium">Admin</span>
                </button>
              </div>
              <p className="text-xs text-center text-gray-500 mt-3 italic">
                Demo accounts are for testing purposes only
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 font-medium">
          &copy; 2024 iBarangay System. Secure & Official.
        </p>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -20px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 20px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Login;
