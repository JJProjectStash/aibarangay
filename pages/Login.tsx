import React, { useState } from "react";
import { Home, Lock, Mail, User, ShieldCheck, Users } from "lucide-react";
import { Button, Card, CardContent, Input, Label } from "../components/UI";
import { api } from "../services/api";
import { useToast } from "../components/Toast";
import { User as UserType } from "../types";

interface LoginProps {
  onLogin: (user: UserType) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { showToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Trim and validate email
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const user = await api.login(trimmedEmail);
      if (user) {
        onLogin(user);
        showToast("Welcome", `Welcome back, ${user.firstName}!`, "success");
      } else {
        setError("User not found. Try the demo accounts below.");
        showToast(
          "Not Found",
          "User not found. Try the demo accounts below.",
          "error"
        );
      }
    } catch (err) {
      setError("A connection error occurred. Please try again.");
      showToast(
        "Error",
        "A connection error occurred. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCreds = (role: string) => {
    setEmail(`${role}@ibarangay.com`);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:16px_16px]"></div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-teal-600 mb-6 shadow-lg shadow-primary-500/20 transform rotate-3 hover:rotate-6 transition-transform">
            <Home className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to iBarangay Online Services
          </p>
        </div>

        <Card className="border-0 shadow-xl ring-1 ring-gray-900/5 backdrop-blur-sm bg-white/90">
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="name@ibarangay.com"
                    className="h-12 pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                    error={error}
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="text-xs text-primary-600 hover:text-primary-800 font-medium hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="h-12 pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                    disabled
                    autoComplete="current-password"
                    // We are simulating passwordless/auto-login with just email for demo
                  />
                </div>
                <p className="text-xs text-gray-500 italic">
                  Demo: Password not required
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-bold shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 transition-all"
                isLoading={loading}
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-center text-gray-400 mb-4 font-semibold uppercase tracking-wider">
                Try Demo Accounts
              </p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => fillDemoCreds("resident")}
                  className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700 transition-all group shadow-sm hover:shadow-md"
                  disabled={loading}
                >
                  <User className="w-5 h-5 mb-1 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  <span className="text-xs font-medium">Resident</span>
                </button>
                <button
                  onClick={() => fillDemoCreds("staff")}
                  className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-all group shadow-sm hover:shadow-md"
                  disabled={loading}
                >
                  <Users className="w-5 h-5 mb-1 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <span className="text-xs font-medium">Staff</span>
                </button>
                <button
                  onClick={() => fillDemoCreds("admin")}
                  className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 hover:text-purple-700 transition-all group shadow-sm hover:shadow-md"
                  disabled={loading}
                >
                  <ShieldCheck className="w-5 h-5 mb-1 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  <span className="text-xs font-medium">Admin</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 font-medium">
          &copy; 2024 iBarangay System. Secure & Official.
        </p>
      </div>
    </div>
  );
};

export default Login;
