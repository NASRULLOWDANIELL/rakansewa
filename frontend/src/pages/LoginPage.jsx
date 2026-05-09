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

  // Handle redirect messages
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
          // New Google user — redirect to profile completion
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
    <div className="min-h-screen flex items-center justify-center pt-24 pb-20 px-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-tertiary/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="w-full max-w-md glass p-10 rounded-2xl shadow-[0_40px_60px_-10px_rgba(25,28,30,0.08)] border border-white/40 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold font-headline tracking-tighter text-on-surface mb-2">Welcome Back</h1>
          <p className="text-on-surface-variant text-sm">Please enter your details to sign in.</p>
        </div>
        
        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-green-600 text-lg" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
            {successMsg}
          </div>
        )}

        {error && <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-sm">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-5">
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
          
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs text-primary font-semibold hover:underline">
              Forgot Password?
            </Link>
          </div>
          
          <button type="submit" className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-3.5 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
            Sign In
          </button>

          <div className="relative flex py-2 items-center">
             <div className="flex-grow border-t border-outline-variant/30"></div>
             <span className="flex-shrink-0 mx-4 text-on-surface-variant text-xs">OR</span>
             <div className="flex-grow border-t border-outline-variant/30"></div>
          </div>

          <button type="button" onClick={handleGoogleLogin} className="w-full bg-white border border-outline-variant/30 text-on-surface py-3.5 rounded-full font-bold hover:bg-surface-container-low transition-all flex items-center justify-center gap-2">
            <img src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA" alt="Google" className="w-5 h-5"/>
            Sign In with Google
          </button>
        </form>
        
        <p className="text-center text-sm text-on-surface-variant mt-8">
          Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
