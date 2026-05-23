// ─────────────────────────────────────────────────────────
// Auth Page — Login Form (Split-panel design)
// ─────────────────────────────────────────────────────────

import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthService } from "../../hooks/useAuthService";
import DefaultTextField from "../../components/ui/DefaultTextField";
import DefaultButton from "../../components/ui/DefaultButton";
import { Eye, EyeOff } from "lucide-react";
import authBg from "../../assets/auth_bg.png";
import courtlabLogo from "../../assets/courtlab_logo.png";

export default function AuthPage() {
  const { session, isLoading, signIn } = useAuthService();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && session) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async () => {
    setErrorMsg(null);
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    const { error } = await signIn(email, password);
    if (error) setErrorMsg(error.message);
    setSubmitting(false);
  };

  const isFormEmpty = !email || !password;

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel ─────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-3/5 flex-col justify-between p-12 relative overflow-hidden"
        style={{
          backgroundImage: `url(${authBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Logo */}
        <div className="relative z-10">
          {/* ✏️ Replace with your logo */}
          <div className="w-12 h-12 flex items-center justify-center">
            <svg
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12"
            >
              <line
                x1="24"
                y1="4"
                x2="24"
                y2="44"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1="4"
                y1="24"
                x2="44"
                y2="24"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1="8.7"
                y1="8.7"
                x2="39.3"
                y2="39.3"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1="39.3"
                y1="8.7"
                x2="8.7"
                y2="39.3"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Center copy */}
        <div className="relative z-10">
          {/* ✏️ Change headline and subtext */}
          <h1 className="text-6xl font-extrabold text-white leading-tight mb-6">
            Court Lab Console
          </h1>
          <p className="text-white/80 text-lg leading-relaxed max-w-md">
            Manage inventory, products, orders, and daily store operations — all
            in one place.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} Court Lab. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right Panel ────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-20 bg-white">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="mb-20 flex justify-center">
            <img
              src={courtlabLogo}
              alt="Court Lab Logo"
              className="h-14 w-auto"
            />
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900 mb-1">
            Welcome Back!
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            Sign in to access the Court Lab admin dashboard. For account access,
            please contact your administrator.
          </p>

          <div className="space-y-4">
            {/* Email */}
            <div>
              <DefaultTextField
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(val) => setEmail(val)}
              />
            </div>

            {/* Password */}
            <div>
              <DefaultTextField
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(val) => setPassword(val)}
                endIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="p-1 hover:text-gray-700 focus:outline-none"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
              />
            </div>

            {/* Error */}
            {errorMsg && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{errorMsg}</p>
              </div>
            )}

            {/* Primary CTA */}
            <div className="flex w-full [&>button]:w-full [&>button]:justify-center pt-1 mb-20">
              <DefaultButton
                variant="primary"
                handleClick={handleLogin}
                disabled={submitting || isFormEmpty}
              >
                {submitting ? "Signing in..." : "Login Now"}
              </DefaultButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
