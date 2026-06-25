import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/api';
import { MailCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const ForgotPasswordPage = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setError('');

    const trimmedEmail = email.trim();
    const tempErrors = {};
    if (!trimmedEmail) {
      tempErrors.email = t('val_err_required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      tempErrors.email = t('val_err_email_invalid');
    } else if (trimmedEmail.length > 100) {
      tempErrors.email = t('val_err_too_long', { max: 100 });
    }

    if (Object.keys(tempErrors).length > 0) {
      setFormErrors(tempErrors);
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(trimmedEmail.toLowerCase());
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
    <div className="min-h-screen flex pt-16" style={{ background: 'var(--rs-bg)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #fff 0%, transparent 60%), radial-gradient(circle at 80% 20%, #fff 0%, transparent 60%)' }}></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <span className="material-symbols-outlined text-white text-4xl">home_work</span>
            <span className="text-white font-extrabold text-2xl font-headline tracking-tight">RakanSewa</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white font-headline leading-tight mb-4">
            {t('forgot_left_title_1')}<br />{t('forgot_left_title_2')}
          </h2>
          <p className="text-white/80 text-sm leading-relaxed mb-8">
            {t('forgot_left_desc')}
          </p>
          <div className="p-5 bg-white/10 rounded-xl border border-white/20">
            <div className="flex items-center gap-3 text-white/90 text-sm">
              <span className="material-symbols-outlined text-white/70">lock</span>
              {t('forgot_left_priority')}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white dark:bg-transparent">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="material-symbols-outlined text-primary text-2xl">home_work</span>
            <span className="text-primary font-extrabold text-xl font-headline">RakanSewa</span>
          </div>

          <h1 className="text-2xl font-extrabold font-headline text-on-surface mb-1">{t('forgot_title')}</h1>
          <p className="text-on-surface-variant text-sm mb-8">{t('forgot_sub')}</p>

          {submitted ? (
            <div className="space-y-6">
              <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center">
                <MailCheck className="text-green-600 w-10 h-10 mx-auto mb-3" />
                <p className="text-sm text-green-800 font-medium leading-relaxed">
                  {t('forgot_success')}
                </p>
              </div>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 w-full bg-primary text-white py-2.5 rounded-lg font-bold hover:opacity-90 transition-opacity text-sm animate-fade-in"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                {t('forgot_back')}
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
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">{t('forgot_email')}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                    placeholder={t('forgot_email_placeholder')}
                    required
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1.5 font-medium animate-fade-in flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {formErrors.email}
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
                      {t('forgot_sending')}
                    </>
                  ) : t('forgot_send_btn')}
                </button>
              </form>
              <p className="text-center text-sm text-on-surface-variant mt-8">
                {t('forgot_remember')}{' '}
                <Link to="/login" className="text-primary font-bold hover:underline">
                  {t('forgot_signin_link')}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
