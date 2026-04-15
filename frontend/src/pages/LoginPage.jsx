import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const user = await login(email, password);
      if (user.role === 'Admin') navigate('/admin');
      else if (user.role === 'Owner') navigate('/owner');
      else navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = (e) => {
    e.preventDefault();
    // mock google login
    setError('Google login mock not implemented. Use regular login.');
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
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body text-sm"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button type="submit" className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-3.5 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
            Sign In
          </button>

          <div className="relative flex py-2 items-center">
             <div className="flex-grow border-t border-outline-variant/30"></div>
             <span className="flex-shrink-0 mx-4 text-on-surface-variant text-xs">OR</span>
             <div className="flex-grow border-t border-outline-variant/30"></div>
          </div>

          <button onClick={handleGoogleLogin} className="w-full bg-white border border-outline-variant/30 text-on-surface py-3.5 rounded-full font-bold hover:bg-surface-container-low transition-all flex items-center justify-center gap-2">
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
