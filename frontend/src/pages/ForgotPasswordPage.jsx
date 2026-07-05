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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 lg:py-16" style={{ background: 'var(--rs-bg)', paddingTop: '80px' }}>
      <div className="w-full max-w-[1280px] bg-white dark:bg-[#0b0f17] rounded-3xl border border-gray-150/40 dark:border-gray-800/80 shadow-rs-xl overflow-hidden flex flex-col lg:flex-row min-h-[760px] items-stretch">
        
        {/* Left branding panel */}
        <div
          className="hidden lg:flex lg:w-1/3 relative overflow-hidden flex-col justify-between p-10 xl:p-12"
          style={{ background: 'linear-gradient(145deg, #0047a0 0%, #0058be 45%, #1d6fd4 100%)' }}
        >
          {/* Subtle mesh */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `
                radial-gradient(circle at 15% 85%, rgba(255,255,255,0.4) 0%, transparent 55%),
                radial-gradient(circle at 85% 15%, rgba(255,255,255,0.3) 0%, transparent 55%)
              `
            }}
          />
          {/* Decorative rings */}
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full border border-white/8 pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full border border-white/10 pointer-events-none" />

          {/* Top Section: Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>home_work</span>
            </div>
            <span className="text-white font-black text-xl font-headline tracking-tight">RakanSewa</span>
          </div>

          {/* Central Content */}
          <div className="relative z-10 space-y-6 my-auto py-8">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-white/90 text-xs font-bold">{t('forgot_left_priority')}</span>
            </div>

            <h2 className="text-3xl font-black text-white font-headline leading-tight">
              {t('forgot_left_title_1')}<br />
              <span className="text-white/70">{t('forgot_left_title_2')}</span>
            </h2>

            <p className="text-white/75 text-sm leading-relaxed max-w-xs">
              {t('forgot_left_desc')}
            </p>
          </div>

          {/* Bottom Section */}
          <div className="relative z-10 space-y-6">
            <p className="text-white/40 text-xs pt-4 border-t border-white/10">
              {t('login_hero_footer')}
            </p>
          </div>
        </div>

        {/* Right form panel */}
        <div
          className="w-full lg:w-2/3 flex items-center justify-center px-6 py-12 lg:px-16 relative overflow-hidden"
          style={{ background: 'var(--rs-card)' }}
        >
          {/* Background dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: 'radial-gradient(circle, #0058be 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          <div className="relative z-10 w-full max-w-[440px] mx-auto py-8">
            {/* Mobile logo */}
            <div className="flex items-center gap-2.5 mb-8 lg:hidden">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-rs-blue">
                <span className="material-symbols-outlined text-white text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>home_work</span>
              </div>
              <span className="text-primary font-black text-xl font-headline">RakanSewa</span>
            </div>

            <h1 className="text-3xl font-black font-headline text-on-surface mb-1.5">{t('forgot_title')}</h1>
            <p className="text-on-surface-variant text-sm mb-8">{t('forgot_sub')}</p>

            {submitted ? (
              <div className="space-y-6">
                <div className="p-6 bg-green-50 border border-green-200 dark:bg-emerald-950/20 dark:border-emerald-800/50 rounded-2xl text-center">
                  <MailCheck className="text-green-600 dark:text-emerald-400 w-12 h-12 mx-auto mb-3" />
                  <p className="text-sm text-green-800 dark:text-emerald-200 font-semibold leading-relaxed">
                    {t('forgot_success')}
                  </p>
                </div>
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 rs-btn-primary py-3 text-sm"
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  {t('forgot_back')}
                </Link>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-red-500 text-[18px] mt-0.5 flex-shrink-0">error</span>
                    <span>{error}</span>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">{t('forgot_email')}</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50 text-[18px]">mail</span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rs-input text-sm"
                        style={{ paddingLeft: '40px' }}
                        placeholder={t('forgot_email_placeholder')}
                        required
                      />
                    </div>
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
                    className="w-full rs-btn-primary py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <>
                        <span className="btn-spinner" />
                        {t('forgot_sending')}
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">send</span>
                        {t('forgot_send_btn')}
                      </>
                    )}
                  </button>
                </form>
                <p className="text-center text-sm text-on-surface-variant mt-8">
                  {t('forgot_remember')}{' '}
                  <Link to="/login" className="text-primary font-bold hover:text-primary/80 transition-colors">
                    {t('forgot_signin_link')}
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
