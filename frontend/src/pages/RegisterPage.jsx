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
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await register(name, email, password, role, matricNumber, uitmEmail);
      navigate('/login');
    } catch (err) {
      setError(err.message);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Matric Number</label>
                <input 
                  type="text" 
                  value={matricNumber}
                  onChange={(e) => setMatricNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body text-sm"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">UiTM Email</label>
                <input 
                  type="email" 
                  value={uitmEmail}
                  onChange={(e) => setUitmEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body text-sm"
                  placeholder="Optional"
                />
              </div>
            </div>
          )}
          
          <button type="submit" className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-3.5 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform mt-6 flex items-center justify-center gap-2">
            Create Account
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
