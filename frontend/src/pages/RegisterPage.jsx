import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ─── Left Branding Panel (Register variant) ─── */
const BrandPanel = () => (
  <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col">
    <div
      className="absolute inset-0"
      style={{ background: 'linear-gradient(145deg, #0047a0 0%, #0058be 45%, #1d6fd4 100%)' }}
    />
    <div
      className="absolute inset-0 opacity-15"
      style={{
        backgroundImage: `
          radial-gradient(circle at 15% 85%, rgba(255,255,255,0.4) 0%, transparent 55%),
          radial-gradient(circle at 85% 15%, rgba(255,255,255,0.3) 0%, transparent 55%)
        `
      }}
    />
    <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full border border-white/10" />
    <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full border border-white/8" />
    <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full border border-white/10" />

    <div className="relative z-10 flex flex-col justify-center h-full px-12 py-14 gap-12">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
          <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>home_work</span>
        </div>
        <span className="text-white font-black text-xl font-headline tracking-tight">RakanSewa</span>
      </div>

      {/* Central content */}
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white/90 text-xs font-bold">Free Student Account</span>
        </div>

        <h2 className="text-3xl font-black text-white font-headline leading-tight">
          Join the UiTM Jasin<br />
          <span className="text-white/70">student community.</span>
        </h2>

        <p className="text-white/75 text-sm leading-relaxed max-w-xs">
          Create your free account today. Browse verified listings, find compatible housemates, and secure your ideal home near campus.
        </p>

        {/* Feature list */}
        <div className="space-y-3 pt-2">
          {[
            { icon: 'home_work', text: 'Browse verified property listings' },
            { icon: 'group_add', text: 'Match with compatible housemates' },
            { icon: 'shield', text: 'Safe, student-only community' },
          ].map(item => (
            <div key={item.text} className="flex items-center gap-3">
              <div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-white/80 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
              </div>
              <span className="text-white/85 text-sm font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-white/40 text-xs">
        Free for all UiTM Jasin students &amp; verified landlords.
      </p>
    </div>
  </div>
);

/* ─── Reusable field input ─── */
const Field = ({ label, icon, children, hint }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">{label}</label>
    <div className="relative">
      {icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50 text-[18px] pointer-events-none z-10">{icon}</span>
      )}
      {children}
    </div>
    {hint && <p className="mt-1 text-xs text-on-surface-variant">{hint}</p>}
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
  const { register } = useAuth();
  const navigate = useNavigate();

  const isUitmEmail = email.toLowerCase().endsWith('@student.uitm.edu.my');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setIsSubmitting(true);
      const finalUitmEmail = isUitmEmail ? email : uitmEmail;
      await register(name, email, password, role, matricNumber, finalUitmEmail);
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
          return { type: 'error', msg: 'Matric number must match your UiTM student email.' };
        }
        return { type: 'success', msg: 'Matric number matches UiTM email — auto-verification will apply!' };
      }
    }
    return null;
  })();

  return (
    <div className="min-h-screen flex" style={{ paddingTop: '64px' }}>
      {/* Left branding */}
      <BrandPanel />

      {/* Right form */}
      <div
        className="w-full lg:w-7/12 flex items-start justify-center px-6 py-10 overflow-y-auto relative"
        style={{ background: 'linear-gradient(135deg, #f7f9fb 0%, #f0f4ff 50%, #f7f9fb 100%)' }}
      >
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #0058be 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative z-10 w-full max-w-lg">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-rs-blue">
              <span className="material-symbols-outlined text-white text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>home_work</span>
            </div>
            <span className="text-primary font-black text-xl font-headline">RakanSewa</span>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-rs-lg p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-black font-headline text-on-surface mb-1">Create your account</h1>
              <p className="text-on-surface-variant text-sm">Join RakanSewa and start finding your perfect place.</p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex items-start gap-2.5">
                <span className="material-symbols-outlined text-red-500 text-[18px] mt-0.5 flex-shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">

              {/* Full Name */}
              <Field label="Full Name" icon="person">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="rs-input pl-10 text-sm"
                  style={{ paddingLeft: '40px' }}
                  placeholder="Enter your full name"
                  required
                  autoComplete="name"
                />
              </Field>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Email</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50 text-[18px] pointer-events-none">mail</span>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="rs-input pl-10 text-sm"
                    style={{ paddingLeft: '40px' }}
                    placeholder="your@email.com"
                    required
                    autoComplete="email"
                  />
                </div>
                {isUitmEmail && role === 'Student' && (
                  <p className="mt-1.5 text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    UiTM student email detected — auto-verification will apply!
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Password</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50 text-[18px] pointer-events-none">lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="rs-input pl-10 pr-11 text-sm"
                    style={{ paddingLeft: '40px', paddingRight: '44px' }}
                    placeholder="Create a strong password"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-primary transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {/* Role selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">I am a…</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'Student', icon: 'school', desc: 'UiTM Student' },
                    { value: 'Owner', icon: 'home', desc: 'Property Owner' },
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
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">UiTM Student Verification</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Matric Number</label>
                      <input
                        type="text"
                        value={matricNumber}
                        onChange={e => setMatricNumber(e.target.value)}
                        className="rs-input text-sm bg-white"
                        placeholder="e.g. 2022456146"
                      />
                    </div>
                    {!isUitmEmail && (
                      <div>
                        <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">UiTM Student Email</label>
                        <input
                          type="email"
                          value={uitmEmail}
                          onChange={e => setUitmEmail(e.target.value)}
                          className="rs-input text-sm bg-white"
                          placeholder="2022456146@student.uitm.edu.my"
                        />
                      </div>
                    )}
                  </div>

                  {matchWarning && (
                    <p className={`text-xs font-semibold flex items-center gap-1.5 mt-1 ${matchWarning.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {matchWarning.type === 'error' ? 'error' : 'check_circle'}
                      </span>
                      {matchWarning.msg}
                    </p>
                  )}
                </div>
              )}

              {/* Info note — only relevant for students */}
              {role === 'Student' && (
                <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-blue-500 text-[16px] mt-0.5 flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                  <span>
                    After registering, verify your UiTM student identity by ensuring your matric number matches your UiTM email
                    (e.g. <strong>2022456146</strong> → <strong>2022456146@student.uitm.edu.my</strong>). Some features require verification.
                  </span>
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
                    Creating Account…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">person_add</span>
                    Create Account
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-on-surface-variant mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:text-primary/80 transition-colors">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
