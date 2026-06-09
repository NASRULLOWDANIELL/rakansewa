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

  // Auto-detect UiTM student email and auto-fill
  const isUitmEmail = email.toLowerCase().endsWith('@student.uitm.edu.my');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setIsSubmitting(true);
      
      // If primary email is a UiTM student email, auto-fill uitmEmail
      const finalUitmEmail = isUitmEmail ? email : uitmEmail;
      
      await register(name, email, password, role, matricNumber, finalUitmEmail);
      // Redirect to login with verification message
      navigate('/login?registered=true');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-20 px-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-tertiary/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="w-full max-w-md glass p-10 rounded-2xl shadow-[0_40px_60px_-10px_rgba(25,28,30,0.08)] border border-white/40 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold font-headline tracking-tighter text-on-surface mb-2">Create Account</h1>
          <p className="text-on-surface-variant text-sm">Join RakanSewa to find your sanctuary.</p>
        </div>
        
        {error && <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-sm">{error}</div>}
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body text-sm"
              placeholder="Enter your name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body text-sm"
              placeholder="Enter your email"
              required
            />
            {isUitmEmail && role === 'Student' && (
              <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                UiTM student email detected — auto-verification will apply!
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body text-sm"
                placeholder="Enter your password"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center"
                title={showPassword ? "Hide password" : "Show password"}
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1">I am a...</label>
            <div className="flex gap-4">
              <label className={`flex-1 text-center py-3 rounded-xl cursor-pointer border-2 transition-all ${role === 'Student' ? 'border-primary bg-primary/5 font-bold text-primary' : 'border-surface-container text-on-surface-variant'}`}>
                <input type="radio" value="Student" checked={role === 'Student'} onChange={(e) => setRole(e.target.value)} className="hidden" />
                Student
              </label>
              <label className={`flex-1 text-center py-3 rounded-xl cursor-pointer border-2 transition-all ${role === 'Owner' ? 'border-primary bg-primary/5 font-bold text-primary' : 'border-surface-container text-on-surface-variant'}`}>
                <input type="radio" value="Owner" checked={role === 'Owner'} onChange={(e) => setRole(e.target.value)} className="hidden" />
                Landlord
              </label>
            </div>
          </div>
          
          {role === 'Student' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1">Matric Number</label>
                  <input 
                    type="text" 
                    value={matricNumber}
                    onChange={(e) => setMatricNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body text-sm"
                    placeholder="e.g. 2022456146"
                  />
                </div>
                {!isUitmEmail && (
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-1">UiTM Email</label>
                    <input 
                      type="email" 
                      value={uitmEmail}
                      onChange={(e) => setUitmEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body text-sm"
                      placeholder="e.g. 2022456146@student.uitm.edu.my"
                    />
                  </div>
                )}
              </div>
              {/* Matric-email mismatch warning */}
              {(() => {
                const effectiveUitmEmail = isUitmEmail ? email : uitmEmail;
                if (matricNumber.trim() && effectiveUitmEmail.trim()) {
                  const emailLower = effectiveUitmEmail.trim().toLowerCase();
                  if (emailLower.endsWith('@student.uitm.edu.my')) {
                    const emailPrefix = emailLower.split('@')[0];
                    if (matricNumber.trim().toLowerCase() !== emailPrefix) {
                      return (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">error</span>
                          Matric number must match your UiTM student email.
                        </p>
                      );
                    }
                    return (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                        Matric number matches UiTM email — verification will apply!
                      </p>
                    );
                  }
                }
                return null;
              })()}
            </div>
          )}

          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 flex items-start gap-2">
            <span className="material-symbols-outlined text-blue-500 text-sm mt-0.5">info</span>
            <span>After registering, complete your UiTM student verification by ensuring your matric number matches your UiTM email (e.g. <strong>2022456146</strong> and <strong>2022456146@student.uitm.edu.my</strong>). Some features require verification.</span>
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-3.5 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="btn-spinner"></span>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        
        <p className="text-center text-sm text-on-surface-variant mt-8">
          Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
