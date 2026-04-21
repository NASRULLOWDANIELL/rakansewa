import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email.trim().toLowerCase());
      setSubmitted(true);
    } catch (err) {
      // Even on network error, show the neutral message for security
      console.error(err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-20 px-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-tertiary/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md glass p-10 rounded-2xl shadow-[0_40px_60px_-10px_rgba(25,28,30,0.08)] border border-white/40 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold font-headline tracking-tighter text-on-surface mb-2">
            Forgot Password
          </h1>
          <p className="text-on-surface-variant text-sm">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {submitted ? (
          <div className="text-center space-y-6">
            <div className="p-4 bg-primary/10 text-on-surface rounded-xl text-sm leading-relaxed">
              <span className="material-symbols-rounded text-primary text-3xl block mb-2">mark_email_read</span>
              If an account with that email exists, a password reset link has been sent. Please check your inbox.
            </div>
            <Link
              to="/login"
              className="inline-block text-primary font-bold hover:underline text-sm"
            >
              ← Back to Login
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
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body text-sm"
                  placeholder="Enter your registered email"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-3.5 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-60 disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-rounded animate-spin text-lg">progress_activity</span>
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <p className="text-center text-sm text-on-surface-variant mt-8">
              Remember your password?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
