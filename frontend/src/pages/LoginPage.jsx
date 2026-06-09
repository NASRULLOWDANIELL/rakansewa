import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      const user = await login(email, password);
      handleRoleRedirect(user);
    } catch (err) {
      setError(err.message);
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
        setError(err.message || 'Failed to fetch Google profile or login.');
        console.error(err);
      }
    },
    onError: errorResponse => {
      setError('Google Login Failed');
      console.error(errorResponse);
    },
  });

  const handleGoogleLogin = (e) => {
    e.preventDefault();
    loginWithGoogle();
  };

  return (
    <div className="min-h-screen flex pt-16">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #fff 0%, transparent 60%), radial-gradient(circle at 80% 20%, #fff 0%, transparent 60%)' }}></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <span className="material-symbols-outlined text-white text-4xl">home_work</span>
            <span className="text-white font-extrabold text-2xl font-headline tracking-tight">RakanSewa</span>
          </div>
          <h2 className="text-4xl font-extrabold text-white font-headline leading-tight mb-4">
            Find your perfect home<br />and housemates.
          </h2>
          <p className="text-white/80 text-lg leading-relaxed mb-10">
            The trusted platform for UiTM Jasin students to discover verified rental listings and compatible housemates.
          </p>
          <div className="space-y-4">
            {[
              { icon: 'verified', text: 'UiTM student verified listings' },
              { icon: 'people', text: 'Smart housemate matching system' },
              { icon: 'location_on', text: 'Properties near UiTM Jasin campus' },
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
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="material-symbols-outlined text-primary text-2xl">home_work</span>
            <span className="text-primary font-extrabold text-xl font-headline">RakanSewa</span>
          </div>

          <h1 className="text-2xl font-extrabold font-headline text-on-surface mb-1">Welcome back</h1>
          <p className="text-on-surface-variant text-sm mb-8">Enter your credentials to access your account.</p>

          {successMsg && (
            <div className="mb-5 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm flex items-start gap-2">
              <span className="material-symbols-outlined text-green-600 text-[18px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              {successMsg}
            </div>
          )}
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
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
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary font-semibold hover:underline">Forgot Password?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm pr-11"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-2.5 rounded-lg font-bold hover:opacity-90 transition-opacity text-sm shadow-sm"
            >
              Sign In
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-outline-variant/30"></div>
              <span className="flex-shrink-0 mx-4 text-on-surface-variant text-xs">OR</span>
              <div className="flex-grow border-t border-outline-variant/30"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white border border-outline-variant/30 text-on-surface py-2.5 rounded-lg font-bold hover:bg-surface-container-lowest transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <img src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA" alt="Google" className="w-5 h-5" />
              Sign In with Google
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-8">
            Don&apos;t have an account? <Link to="/register" className="text-primary font-bold hover:underline">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
