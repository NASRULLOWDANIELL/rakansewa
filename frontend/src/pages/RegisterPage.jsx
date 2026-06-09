import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

  // Matric vs email match check
  const matchWarning = (() => {
    const effectiveUitmEmail = isUitmEmail ? email : uitmEmail;
    if (matricNumber.trim() && effectiveUitmEmail.trim()) {
      const emailLower = effectiveUitmEmail.trim().toLowerCase();
      if (emailLower.endsWith('@student.uitm.edu.my')) {
        const emailPrefix = emailLower.split('@')[0];
        if (matricNumber.trim().toLowerCase() !== emailPrefix) {
          return { type: 'error', msg: 'Matric number must match your UiTM student email.' };
        }
        return { type: 'success', msg: 'Matric number matches UiTM email — verification will apply!' };
      }
    }
    return null;
  })();

  return (
    <div className="min-h-screen flex pt-16">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-2/5 bg-primary flex-col justify-center px-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #fff 0%, transparent 60%), radial-gradient(circle at 80% 20%, #fff 0%, transparent 60%)' }}></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <span className="material-symbols-outlined text-white text-4xl">home_work</span>
            <span className="text-white font-extrabold text-2xl font-headline tracking-tight">RakanSewa</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white font-headline leading-tight mb-4">
            Join thousands of<br />UiTM students.
          </h2>
          <p className="text-white/80 leading-relaxed mb-10 text-sm">
            Create your free account today and start finding safe, verified housing near UiTM Jasin campus.
          </p>
          <div className="space-y-4">
            {[
              { icon: 'home_work', text: 'Browse verified property listings' },
              { icon: 'group_add', text: 'Match with compatible housemates' },
              { icon: 'shield', text: 'Safe, student-only platform' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3 text-white/90">
                <span className="material-symbols-outlined text-white/70 text-[20px]">{item.icon}</span>
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-3/5 flex items-start justify-center px-6 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="material-symbols-outlined text-primary text-2xl">home_work</span>
            <span className="text-primary font-extrabold text-xl font-headline">RakanSewa</span>
          </div>

          <h1 className="text-2xl font-extrabold font-headline text-on-surface mb-1">Create your account</h1>
          <p className="text-on-surface-variant text-sm mb-8">Join RakanSewa to find your perfect place to stay.</p>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                placeholder="Enter your email"
                required
              />
              {isUitmEmail && role === 'Student' && (
                <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  UiTM student email detected — auto-verification will apply!
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm pr-11"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">I am a...</label>
              <div className="flex gap-3">
                <label className={`flex-1 text-center py-2.5 rounded-lg cursor-pointer border-2 transition-all text-sm font-bold ${role === 'Student' ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant/30 text-on-surface-variant'}`}>
                  <input type="radio" value="Student" checked={role === 'Student'} onChange={(e) => setRole(e.target.value)} className="hidden" />
                  Student
                </label>
                <label className={`flex-1 text-center py-2.5 rounded-lg cursor-pointer border-2 transition-all text-sm font-bold ${role === 'Owner' ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant/30 text-on-surface-variant'}`}>
                  <input type="radio" value="Owner" checked={role === 'Owner'} onChange={(e) => setRole(e.target.value)} className="hidden" />
                  Landlord
                </label>
              </div>
            </div>

            {/* Student-specific fields */}
            {role === 'Student' && (
              <div className="space-y-4 p-4 bg-surface-container-lowest border border-outline-variant/20 rounded-lg">
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Student Verification</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Matric Number</label>
                    <input
                      type="text"
                      value={matricNumber}
                      onChange={(e) => setMatricNumber(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                      placeholder="e.g. 2022456146"
                    />
                  </div>
                  {!isUitmEmail && (
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">UiTM Email</label>
                      <input
                        type="email"
                        value={uitmEmail}
                        onChange={(e) => setUitmEmail(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                        placeholder="2022456146@student.uitm.edu.my"
                      />
                    </div>
                  )}
                </div>
                {matchWarning && (
                  <p className={`text-xs flex items-center gap-1 ${matchWarning.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                    <span className="material-symbols-outlined text-[14px]">{matchWarning.type === 'error' ? 'error' : 'verified'}</span>
                    {matchWarning.msg}
                  </p>
                )}
              </div>
            )}

            {/* Info note */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-500 text-[16px] mt-0.5">info</span>
              <span>After registering, complete your UiTM student verification by ensuring your matric number matches your UiTM email (e.g. <strong>2022456146</strong> → <strong>2022456146@student.uitm.edu.my</strong>). Some features require verification.</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-white py-2.5 rounded-lg font-bold hover:opacity-90 transition-opacity text-sm shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                  Creating Account...
                </>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-8">
            Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
