import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { resetPassword } from '../services/api';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to reset password. The link may be invalid or expired.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const LeftPanel = () => (
    <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-center px-16 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #fff 0%, transparent 60%), radial-gradient(circle at 80% 20%, #fff 0%, transparent 60%)' }}></div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-12">
          <span className="material-symbols-outlined text-white text-4xl">home_work</span>
          <span className="text-white font-extrabold text-2xl font-headline tracking-tight">RakanSewa</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white font-headline leading-tight mb-4">
          Set a new password<br />for your account.
        </h2>
        <p className="text-white/80 text-sm leading-relaxed mb-8">
          Choose a strong password to keep your RakanSewa account secure. Your password should be at least 6 characters long.
        </p>
        <div className="p-5 bg-white/10 rounded-xl border border-white/20">
          <div className="flex items-center gap-3 text-white/90 text-sm">
            <span className="material-symbols-outlined text-white/70">shield</span>
            Use a unique password you don&apos;t use on other websites.
          </div>
        </div>
      </div>
    </div>
  );

  // No token in URL
  if (!token) {
    return (
      <div className="min-h-screen flex pt-16">
        <LeftPanel />
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
          <div className="w-full max-w-md text-center">
            <span className="material-symbols-outlined text-error text-5xl mb-4 block">link_off</span>
            <h1 className="text-2xl font-extrabold font-headline text-on-surface mb-2">Invalid Reset Link</h1>
            <p className="text-on-surface-variant text-sm mb-8">
              This password reset link is missing or invalid. Please request a new reset link.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 bg-primary text-white py-2.5 px-8 rounded-lg font-bold hover:opacity-90 transition-opacity text-sm"
            >
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex pt-16">
      <LeftPanel />

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="material-symbols-outlined text-primary text-2xl">home_work</span>
            <span className="text-primary font-extrabold text-xl font-headline">RakanSewa</span>
          </div>

          <h1 className="text-2xl font-extrabold font-headline text-on-surface mb-1">Reset Password</h1>
          <p className="text-on-surface-variant text-sm mb-8">Enter your new password below.</p>

          {success ? (
            <div className="space-y-6">
              <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center">
                <span className="material-symbols-outlined text-green-600 text-4xl block mb-3">check_circle</span>
                <p className="text-sm text-green-800 font-medium">
                  Your password has been reset successfully!
                </p>
              </div>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 w-full bg-primary text-white py-2.5 rounded-lg font-bold hover:opacity-90 transition-opacity text-sm"
              >
                <span className="material-symbols-outlined text-[16px]">login</span>
                Sign In
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm pr-11"
                      placeholder="At least 6 characters"
                      required
                      minLength={6}
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary">
                      <span className="material-symbols-outlined text-[18px]">{showNew ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm pr-11"
                      placeholder="Re-enter your password"
                      required
                      minLength={6}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary">
                      <span className="material-symbols-outlined text-[18px]">{showConfirm ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      Passwords do not match.
                    </p>
                  )}
                  {confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
                    <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Passwords match.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-2.5 rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm shadow-sm disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                      Resetting...
                    </>
                  ) : 'Reset Password'}
                </button>
              </form>
              <p className="text-center text-sm text-on-surface-variant mt-8">
                <Link to="/login" className="text-primary font-bold hover:underline flex items-center gap-1 justify-center">
                  <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                  Back to Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
