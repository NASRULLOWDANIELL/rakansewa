import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { currentUser, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || ''
  });

  if (!currentUser) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
      <div className="glass p-10 rounded-2xl shadow-xl border border-white/40">
        <div className="flex items-center gap-6 mb-10 pb-6 border-b border-surface-container-low">
          <div className="w-24 h-24 rounded-full bg-primary-fixed flex items-center justify-center text-4xl text-on-primary-fixed font-bold shadow-inner uppercase">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold font-headline text-on-surface">{currentUser.name}</h1>
            <p className="text-on-surface-variant text-lg">{currentUser.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-secondary-container text-on-secondary-container text-xs font-bold rounded-full uppercase tracking-wider">
              {currentUser.role}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-on-surface">Account Settings</h2>
          
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl font-medium focus:ring-2 focus:ring-primary/50 outline-none" />
                 </div>
                 <div>
                    <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl font-medium focus:ring-2 focus:ring-primary/50 outline-none" />
                 </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                 <button onClick={() => setIsEditing(false)} className="bg-surface-container hover:bg-surface-container-high text-on-surface px-6 py-2 rounded-lg font-bold transition-all">
                    Cancel
                 </button>
                 <button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 px-6 py-2 rounded-lg font-bold transition-all">
                    Save Changes
                 </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface-container-low p-4 rounded-lg">
                   <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1">Full Name</label>
                   <p className="text-on-surface font-medium">{currentUser.name}</p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-lg">
                   <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1">Email Address</label>
                   <p className="text-on-surface font-medium">{currentUser.email}</p>
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                 <button onClick={() => setIsEditing(true)} className="bg-surface-container hover:bg-surface-container-high text-on-surface px-6 py-2 rounded-lg font-bold transition-all">
                    Edit Profile
                 </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
