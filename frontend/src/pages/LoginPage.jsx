import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';

/* ─── Left Branding Panel ─── */
const BrandPanel = () => (
  <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col">
    {/* Gradient background */}
    <div
      className="absolute inset-0"
      style={{ background: 'linear-gradient(145deg, #0047a0 0%, #0058be 45%, #1d6fd4 100%)' }}
    />
    {/* Subtle mesh */}
    <div
      className="absolute inset-0 opacity-15"
      style={{
        backgroundImage: `
          radial-gradient(circle at 15% 85%, rgba(255,255,255,0.4) 0%, transparent 55%),
          radial-gradient(circle at 85% 15%, rgba(255,255,255,0.3) 0%, transparent 55%)
        `
      }}
    />
    {/* Decorative rings */}
    <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full border border-white/10" />
    <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full border border-white/8" />
    <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full border border-white/10" />

    {/* Content */}
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
          <span className="text-white/90 text-xs font-bold">UiTM Jasin Platform</span>
        </div>

        <h2 className="text-3xl font-black text-white font-headline leading-tight">
          Find your perfect home<br />
          <span className="text-white/70">and compatible housemates.</span>
        </h2>

        <p className="text-white/75 text-sm leading-relaxed max-w-xs">
          The trusted platform for UiTM Jasin students to discover verified rental listings and compatible roommates.
        </p>

        {/* Feature list */}
        <div className="space-y-3 pt-2">
          {[
            { icon: 'verified', text: 'UiTM student-verified listings' },
            { icon: 'diversity_3', text: 'Smart housemate compatibility score' },
            { icon: 'location_on', text: 'Properties near UiTM Jasin campus' },
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

      {/* Footer text */}
      <p className="text-white/40 text-xs">
        Free for all UiTM Jasin students &amp; verified landlords.
      </p>
    </div>
  </div>
);

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const registered = searchParams.get('registered');
    if (registered === 'true') {
      setSuccessMsg('Registration successful! Sign in and complete your UiTM student verification in your profile.');
    }
  }, [searchParams]);

  const handleRoleRedirect = (user) => {
    if (user.role === 'Admin') navigate('/admin');
    else if (user.role === 'Owner') navigate('/owner');
    else navigate('/');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccessMsg('');
      setIsLoading(true);
      const user = await login(email, password);
      handleRoleRedirect(user);
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setError('');
        setSuccessMsg('');
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const googleUser = await userInfoRes.json();
        const result = await googleLogin(googleUser);
        if (result.isNewUser) {
          navigate('/profile?newGoogleUser=true');
        } else {
          handleRoleRedirect(result.user);
        }
      } catch (err) {
        setError(err.message || 'Failed to sign in with Google. Please try again.');
        console.error(err);
      }
    },
    onError: errorResponse => {
      setError('Google Sign-In failed. Please try again.');
      console.error(errorResponse);
    },
  });

  const handleGoogleLogin = (e) => {
    e.preventDefault();
    loginWithGoogle();
  };

  return (
    <div className="min-h-screen flex" style={{ paddingTop: '64px' }}>
      {/* Left branding panel */}
      <BrandPanel />

      {/* Right form panel */}
      <div
        className="w-full lg:w-7/12 flex items-center justify-center px-6 py-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #f7f9fb 0%, #f0f4ff 50%, #f7f9fb 100%)' }}
      >
        {/* Background dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'radial-gradient(circle, #0058be 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative z-10 w-full max-w-md">
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
              <h1 className="text-2xl font-black font-headline text-on-surface mb-1">Welcome back</h1>
              <p className="text-on-surface-variant text-sm">Sign in to your RakanSewa account.</p>
            </div>

            {/* Success / Error alerts */}
            {successMsg && (
              <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-start gap-2.5">
                <span className="material-symbols-outlined text-emerald-500 text-[18px] mt-0.5 flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span>{successMsg}</span>
              </div>
            )}
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex items-start gap-2.5">
                <span className="material-symbols-outlined text-red-500 text-[18px] mt-0.5 flex-shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Email</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50 text-[18px]">mail</span>
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
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Password</label>
                  <Link to="/forgot-password" className="text-xs text-primary font-semibold hover:text-primary/70 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50 text-[18px]">lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="rs-input pl-10 pr-11 text-sm"
                    style={{ paddingLeft: '40px', paddingRight: '44px' }}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
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

              {/* Sign In button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rs-btn-primary py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <span className="btn-spinner" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">login</span>
                    Sign In
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-gray-200" />
                <span className="flex-shrink-0 mx-4 text-on-surface-variant text-xs font-semibold uppercase tracking-wider">or</span>
                <div className="flex-grow border-t border-gray-200" />
              </div>

              {/* Google login */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2.5 py-3 bg-white border border-gray-200 text-on-surface rounded-xl font-bold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-rs-sm hover:shadow-rs-md"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-on-surface-variant mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-bold hover:text-primary/80 transition-colors">
              Register free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
