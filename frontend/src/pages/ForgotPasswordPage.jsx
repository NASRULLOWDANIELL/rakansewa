import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/api';
import { MailCheck } from 'lucide-react';

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
      // Show neutral message for security regardless of error
      console.error(err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex pt-16">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #fff 0%, transparent 60%), radial-gradient(circle at 80% 20%, #fff 0%, transparent 60%)' }}></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <span className="material-symbols-outlined text-white text-4xl">home_work</span>
            <span className="text-white font-extrabold text-2xl font-headline tracking-tight">RakanSewa</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white font-headline leading-tight mb-4">
            Recover your account<br />securely.
          </h2>
          <p className="text-white/80 text-sm leading-relaxed mb-8">
            Enter the email address associated with your RakanSewa account. We will send you a secure link to reset your password.
          </p>
          <div className="p-5 bg-white/10 rounded-xl border border-white/20">
            <div className="flex items-center gap-3 text-white/90 text-sm">
              <span className="material-symbols-outlined text-white/70">lock</span>
              Your account security is our priority. Reset links expire after 30 minutes.
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="material-symbols-outlined text-primary text-2xl">home_work</span>
            <span className="text-primary font-extrabold text-xl font-headline">RakanSewa</span>
          </div>

          <h1 className="text-2xl font-extrabold font-headline text-on-surface mb-1">Forgot Password</h1>
          <p className="text-on-surface-variant text-sm mb-8">Enter your email and we&apos;ll send you a reset link.</p>

          {submitted ? (
            <div className="space-y-6">
              <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center">
                <MailCheck className="text-green-600 w-10 h-10 mx-auto mb-3" />
                <p className="text-sm text-green-800 font-medium leading-relaxed">
                  If an account with that email exists, a password reset link has been sent. Please check your inbox (and spam folder).
                </p>
              </div>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 w-full bg-primary text-white py-2.5 rounded-lg font-bold hover:opacity-90 transition-opacity text-sm"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Back to Login
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
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                    placeholder="Enter your registered email"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-2.5 rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm shadow-sm disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                      Sending...
                    </>
                  ) : 'Send Reset Link'}
                </button>
              </form>
              <p className="text-center text-sm text-on-surface-variant mt-8">
                Remember your password? <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
