import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

/* ─── Left Branding Panel (Register variant) ─── */
const BrandPanel = () => {
  const { t } = useLanguage();
  return (
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
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white/90 text-xs font-bold">{t('reg_free_account')}</span>
        </div>

        <h2 className="text-3xl font-black text-white font-headline leading-tight">
          {t('reg_hero_title')}<br />
          <span className="text-white/70">{t('reg_hero_subtitle')}</span>
        </h2>

        <p className="text-white/75 text-sm leading-relaxed max-w-xs">
          {t('reg_hero_desc')}
        </p>

        {/* Feature list */}
        <div className="space-y-3 pt-2">
          {[
            { icon: 'home_work', text: t('reg_feat_listings') },
            { icon: 'group_add', text: t('reg_feat_matching') },
            { icon: 'shield', text: t('reg_feat_safety') },
          ].map(item => (
            <div key={item.icon} className="flex items-center gap-3">
              <div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-white/80 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
              </div>
              <span className="text-white/85 text-sm font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="relative z-10 space-y-6">
        <p className="text-white/40 text-xs pt-4 border-t border-white/10">
          {t('login_hero_footer')}
        </p>
      </div>
    </div>
  );
};

/* ─── Reusable field input ─── */
const Field = ({ label, icon, children, hint, error }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">{label}</label>
    <div className="relative">
      {icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50 text-[18px] pointer-events-none z-10">{icon}</span>
      )}
      {children}
    </div>
    {error && (
      <p className="text-red-500 text-xs mt-1.5 font-medium animate-fade-in flex items-center gap-1">
        <span className="material-symbols-outlined text-sm">error</span>
        {error}
      </p>
    )}
    {hint && !error && <p className="mt-1 text-xs text-on-surface-variant">{hint}</p>}
  </div>
);

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [matricNumber, setMatricNumber] = useState('');
  const [uitmEmail, setUitmEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const isUitmEmail = email.toLowerCase().endsWith('@student.uitm.edu.my');

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormErrors({});
    const tempErrors = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const finalUitmEmail = isUitmEmail ? email : uitmEmail;
    const trimmedUitmEmail = finalUitmEmail.trim();
    const trimmedMatric = matricNumber.trim();

    if (!trimmedName) {
      tempErrors.name = t('val_err_required');
    } else if (trimmedName.length > 100) {
      tempErrors.name = t('val_err_too_long', { max: 100 });
    }

    if (!trimmedEmail) {
      tempErrors.email = t('val_err_required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      tempErrors.email = t('val_err_email_invalid');
    } else if (trimmedEmail.length > 100) {
      tempErrors.email = t('val_err_too_long', { max: 100 });
    }

    if (!password) {
      tempErrors.password = t('val_err_required');
    } else if (password.length < 6) {
      tempErrors.password = t('val_err_password_len');
    } else if (password.length > 100) {
      tempErrors.password = t('val_err_too_long', { max: 100 });
    }

    if (role === 'Student') {
      if (!trimmedMatric) {
        tempErrors.matricNumber = t('val_err_required');
      } else if (!/^[0-9]+$/.test(trimmedMatric)) {
        tempErrors.matricNumber = t('val_err_phone_numeric');
      } else if (trimmedMatric.length > 20) {
        tempErrors.matricNumber = t('val_err_too_long', { max: 20 });
      }

      if (!trimmedUitmEmail) {
        tempErrors.uitmEmail = t('val_err_required');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedUitmEmail)) {
        tempErrors.uitmEmail = t('val_err_email_invalid');
      } else if (!trimmedUitmEmail.toLowerCase().endsWith('@student.uitm.edu.my')) {
        tempErrors.uitmEmail = t('reg_uitm_email_placeholder');
      } else if (trimmedUitmEmail.length > 100) {
        tempErrors.uitmEmail = t('val_err_too_long', { max: 100 });
      }

      if (trimmedMatric && trimmedUitmEmail && trimmedUitmEmail.toLowerCase().endsWith('@student.uitm.edu.my')) {
        const prefix = trimmedUitmEmail.toLowerCase().split('@')[0];
        if (trimmedMatric.toLowerCase() !== prefix) {
          tempErrors.matricNumber = t('reg_warning_mismatch');
        }
      }
    }

    if (Object.keys(tempErrors).length > 0) {
      setFormErrors(tempErrors);
      return;
    }

    try {
      setError('');
      setIsSubmitting(true);
      await register(trimmedName, trimmedEmail, password, role, trimmedMatric, trimmedUitmEmail);
      navigate('/login?registered=true');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const matchWarning = (() => {
    const effectiveUitmEmail = isUitmEmail ? email : uitmEmail;
    if (matricNumber.trim() && effectiveUitmEmail.trim()) {
      const emailLower = effectiveUitmEmail.trim().toLowerCase();
      if (emailLower.endsWith('@student.uitm.edu.my')) {
        const emailPrefix = emailLower.split('@')[0];
        if (matricNumber.trim().toLowerCase() !== emailPrefix) {
          return { type: 'error', msg: t('reg_warning_mismatch') };
        }
        return { type: 'success', msg: t('reg_warning_match') };
      }
    }
    return null;
  })();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 lg:py-16" style={{ background: 'var(--rs-bg)', paddingTop: '80px' }}>
      <div className="w-full max-w-[1280px] bg-white dark:bg-[#0b0f17] rounded-3xl border border-gray-150/40 dark:border-gray-800/80 shadow-rs-xl overflow-hidden flex flex-col lg:flex-row min-h-[760px] items-stretch">
        {/* Left branding */}
        <BrandPanel />

        {/* Right form */}
        <div
          className="w-full lg:w-2/3 flex items-start justify-center px-6 py-10 lg:px-16 overflow-y-auto relative"
          style={{ background: 'var(--rs-card)' }}
        >
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #0058be 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative z-10 w-full max-w-[460px] mx-auto py-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-rs-blue">
              <span className="material-symbols-outlined text-white text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>home_work</span>
            </div>
            <span className="text-primary font-black text-xl font-headline">RakanSewa</span>
          </div>

          {/* Form Title */}
          <div className="mb-6">
            <h1 className="text-3xl font-black font-headline text-on-surface mb-1.5">{t('reg_title')}</h1>
            <p className="text-on-surface-variant text-sm">{t('reg_sub')}</p>
          </div>

            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex items-start gap-2.5">
                <span className="material-symbols-outlined text-red-500 text-[18px] mt-0.5 flex-shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">

              {/* Full Name */}
              <Field label={t('reg_fullname')} icon="person" error={formErrors.name}>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="rs-input pl-10 text-sm"
                  style={{ paddingLeft: '40px' }}
                  placeholder={t('reg_fullname_placeholder')}
                  required
                  autoComplete="name"
                />
              </Field>

              {/* Email */}
              <Field label={t('login_email')} icon="mail" error={formErrors.email}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="rs-input pl-10 text-sm"
                  style={{ paddingLeft: '40px' }}
                  placeholder={t('login_email_placeholder')}
                  required
                  autoComplete="email"
                />
              </Field>
              {isUitmEmail && role === 'Student' && !formErrors.email && (
                <p className="mt-1.5 text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  {t('reg_email_detected')}
                </p>
              )}

              {/* Password */}
              <Field label={t('login_password')} icon="lock" error={formErrors.password}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="rs-input pl-10 pr-11 text-sm"
                  style={{ paddingLeft: '40px', paddingRight: '44px' }}
                  placeholder={t('reg_password_placeholder')}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-primary transition-colors z-20"
                  title={showPassword ? t('login_hide_pwd') : t('login_show_pwd')}
                >
                  <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </Field>

              {/* Role selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">{t('reg_iam')}</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'Student', icon: 'school', desc: t('reg_role_student') },
                    { value: 'Owner', icon: 'home', desc: t('reg_role_owner') },
                  ].map(opt => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer border-2 transition-all ${
                        role === opt.value
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <input type="radio" value={opt.value} checked={role === opt.value} onChange={e => setRole(e.target.value)} className="hidden" />
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${role === opt.value ? 'bg-primary text-white' : 'bg-gray-100 text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>{opt.icon}</span>
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${role === opt.value ? 'text-primary' : 'text-on-surface'}`}>{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Student verification fields */}
              {role === 'Student' && (
                <div className="space-y-3 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>badge</span>
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">{t('reg_verification_title')}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">{t('reg_matric')}</label>
                      <input
                        type="text"
                        value={matricNumber}
                        onChange={e => setMatricNumber(e.target.value)}
                        className="rs-input text-sm bg-white"
                        placeholder={t('reg_matric_placeholder')}
                      />
                      {formErrors.matricNumber && (
                        <p className="text-red-500 text-xs mt-1.5 font-medium animate-fade-in flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">error</span>
                          {formErrors.matricNumber}
                        </p>
                      )}
                    </div>
                    {!isUitmEmail && (
                      <div>
                        <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">{t('reg_uitm_email')}</label>
                        <input
                          type="email"
                          value={uitmEmail}
                          onChange={e => setUitmEmail(e.target.value)}
                          className="rs-input text-sm bg-white"
                          placeholder={t('reg_uitm_email_placeholder')}
                        />
                        {formErrors.uitmEmail && (
                          <p className="text-red-500 text-xs mt-1.5 font-medium animate-fade-in flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">error</span>
                            {formErrors.uitmEmail}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {matchWarning && !formErrors.matricNumber && !formErrors.uitmEmail && (
                    <p className={`text-xs font-semibold flex items-center gap-1.5 mt-1 ${matchWarning.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {matchWarning.type === 'error' ? 'error' : 'check_circle'}
                      </span>
                      {matchWarning.msg}
                    </p>
                  )}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rs-btn-primary py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="btn-spinner" />
                    {t('reg_btn_creating')}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">person_add</span>
                    {t('reg_btn_create')}
                  </>
                )}
              </button>
            </form>

        </div>
      </div>
    </div>
  </div>
);
};

export default RegisterPage;
