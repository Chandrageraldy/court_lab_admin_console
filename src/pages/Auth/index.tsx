// ─────────────────────────────────────────────────────────
// Auth Page — Login Form
//
// ✏️ HOW TO CUSTOMIZE:
//   1. Replace the logo placeholder with your own logo image.
//   2. Change the "Sign in to your account" heading text.
//   3. The form uses DefaultTextField and DefaultButton from
//      src/components/ui — you can restyle those components
//      to match your brand.
//
// ✏️ HOW AUTH WORKS:
//   - Calls useAuthService().signIn(email, password)
//   - signIn uses Supabase email+password authentication
//   - Make sure "Email" provider is enabled in:
//     Supabase Dashboard → Authentication → Providers → Email
//   - If already logged in, redirects straight to /dashboard
// ─────────────────────────────────────────────────────────

import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthService } from '../../hooks/useAuthService';
import DefaultTextField from '../../components/ui/DefaultTextField';
import DefaultButton from '../../components/ui/DefaultButton';
import { Eye, EyeOff } from 'lucide-react';

export default function AuthPage() {
  const { session, isLoading, signIn } = useAuthService();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already authenticated → skip login, go straight to dashboard
  if (!isLoading && session) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async () => {
    setErrorMsg(null);

    // Basic client-side validation
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    const { error } = await signIn(email, password);
    if (error) {
      // Supabase returns descriptive error messages — display them directly
      setErrorMsg(error.message);
    }
    setSubmitting(false);
  };

  const isFormEmpty = !email || !password;

  return (
    <div className="min-h-screen bg-[#f6f6f6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">

        {/* ─── Logo Area ───────────────────────────────── */}
        <div className="flex flex-col items-center">
          {/* ✏️ Replace this placeholder with your logo */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#3a40d7] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            {/* ✏️ Change "My Admin" to your app name */}
            <span className="text-2xl font-bold text-gray-900">Court Lab</span>
          </div>
        </div>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {/* ✏️ Change this heading text if needed */}
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6 flex flex-col gap-2">

            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <DefaultTextField
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(val) => setEmail(val)}
              />
            </div>

            {/* Password field with show/hide toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <DefaultTextField
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(val) => setPassword(val)}
                endIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="p-1 hover:text-gray-700 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>

            {/* Error message from Supabase or client validation */}
            {errorMsg && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{errorMsg}</p>
              </div>
            )}

            {/* Submit button */}
            <div>
              <div className="flex w-full [&>button]:w-full [&>button]:justify-center">
                <DefaultButton
                  variant="primary"
                  handleClick={handleLogin}
                  disabled={submitting || isFormEmpty}
                >
                  {submitting ? 'Signing in...' : 'Sign In'}
                </DefaultButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
