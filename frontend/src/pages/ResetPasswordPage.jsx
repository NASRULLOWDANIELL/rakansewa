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

  // No token in URL
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-tertiary/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md glass p-10 rounded-2xl shadow-[0_40px_60px_-10px_rgba(25,28,30,0.08)] border border-white/40 relative z-10 text-center">
          <span className="material-symbols-rounded text-error text-4xl mb-3 block">error</span>
          <h1 className="text-2xl font-extrabold font-headline tracking-tighter text-on-surface mb-2">
            Invalid Link
          </h1>
          <p className="text-on-surface-variant text-sm mb-6">
            This password reset link is missing a token. Please request a new reset link.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block bg-gradient-to-br from-primary to-primary-container text-white py-3 px-8 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-20 px-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-tertiary/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md glass p-10 rounded-2xl shadow-[0_40px_60px_-10px_rgba(25,28,30,0.08)] border border-white/40 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold font-headline tracking-tighter text-on-surface mb-2">
            Reset Password
          </h1>
          <p className="text-on-surface-variant text-sm">
            Enter your new password below.
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-6">
            <div className="p-4 bg-primary/10 text-on-surface rounded-xl text-sm leading-relaxed">
              <span className="material-symbols-rounded text-primary text-3xl block mb-2">check_circle</span>
              Your password has been reset successfully!
            </div>
            <Link
              to="/login"
              className="inline-block bg-gradient-to-br from-primary to-primary-container text-white py-3 px-8 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body text-sm"
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body text-sm"
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-3.5 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-60 disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>

            <p className="text-center text-sm text-on-surface-variant mt-8">
              <Link to="/login" className="text-primary font-bold hover:underline">
                ← Back to Login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
