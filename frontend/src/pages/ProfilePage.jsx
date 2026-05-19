import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApprovedProperties, getHousemateProfileByUserId, linkHousemateToProperty } from '../services/api';

const LIFESTYLE_OPTIONS = ['Clean', 'Quiet', 'Social', 'Studious', 'Active', 'Flexible'];
const SLEEP_OPTIONS = ['Early Bird', 'Night Owl', 'Flexible'];

const ProfilePage = () => {
  const { currentUser, updateProfile, isUitmVerified } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchParams] = useSearchParams();
  const [showGoogleWelcome, setShowGoogleWelcome] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Property linking state
  const [approvedProperties, setApprovedProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [linkedProperty, setLinkedProperty] = useState(null);

  useEffect(() => {
    if (searchParams.get('newGoogleUser') === 'true') {
      setShowGoogleWelcome(true);
      setIsEditing(true); // Auto-open edit mode
    }
  }, [searchParams]);

  // Fetch approved properties and user's housemate profile
  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!currentUser || currentUser.id === 999) return;
      try {
        const [props, hmProfile] = await Promise.all([
          getApprovedProperties(),
          getHousemateProfileByUserId(currentUser.id)
        ]);
        setApprovedProperties(props || []);
        if (hmProfile && hmProfile.property) {
          setLinkedProperty(hmProfile.property);
          setSelectedPropertyId(hmProfile.property.id.toString());
        } else {
          setLinkedProperty(null);
          setSelectedPropertyId('');
        }
      } catch (err) {
        console.error('Error fetching property data:', err);
      }
    };
    fetchPropertyData();
  }, [currentUser]);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phoneNumber: currentUser?.phoneNumber || '',
    matricNumber: currentUser?.matricNumber || '',
    uitmEmail: currentUser?.uitmEmail || '',
    isListedAsHousemate: currentUser?.isListedAsHousemate || false,
    budget: currentUser?.budget || '',
    lifestyle: currentUser?.lifestyle || '', // comma-separated multi-select
    sleepSchedule: currentUser?.sleepSchedule || '',
  });

  const calculateProgress = () => {
    if (!currentUser) return 0;
    let completed = 0;
    if (currentUser.name) completed++;
    if (currentUser.email) completed++;
    if (currentUser.phoneNumber) completed++;
    if (currentUser.matricNumber) completed++;
    if (currentUser.uitmEmail) completed++;
    return (completed / 5) * 100;
  };
  const progress = calculateProgress();
  const missingStudentFields = [];
  if (!currentUser?.phoneNumber) missingStudentFields.push('Phone Number');
  if (!currentUser?.matricNumber) missingStudentFields.push('Matric Number');
  if (!currentUser?.uitmEmail) missingStudentFields.push('UiTM Email');

  if (!currentUser) return null;

  // Parse lifestyle as array for multi-select
  const getLifestyleArray = (str) => (str || '').split(',').map(s => s.trim()).filter(Boolean);

  const toggleLifestyle = (opt) => {
    const current = getLifestyleArray(formData.lifestyle);
    let updated;
    if (current.includes(opt)) {
      updated = current.filter(l => l !== opt);
    } else {
      updated = [...current, opt];
    }
    setFormData({ ...formData, lifestyle: updated.join(', ') });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveSuccess(false);
      setSaveError('');

      // Link/unlink property FIRST — to avoid race condition with context update
      if (currentUser.id !== 999) {
        try {
          const propId = selectedPropertyId ? parseInt(selectedPropertyId) : null;
          const result = await linkHousemateToProperty(currentUser.id, propId);
          if (result && result.property) {
            setLinkedProperty(result.property);
          } else {
            setLinkedProperty(null);
          }
        } catch (linkErr) {
          console.error('Error linking property:', linkErr);
          // Extract specific error message from backend response if property linking fails
          const errorMsg = linkErr?.response?.data?.message || linkErr?.message || 'Failed to link property.';
          setSaveError(errorMsg);
          setSaving(false);
          return;
        }
      }

      // Save user profile AFTER
      await updateProfile({
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : null,
      });

      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
      // Extract specific error message from backend response
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to save profile.';
      setSaveError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const displayLifestyles = getLifestyleArray(currentUser.lifestyle);
  const isStudent = currentUser.role === 'STUDENT' || currentUser.role === 'Student';

  return (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
      {/* Google welcome message */}
      {showGoogleWelcome && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3 text-blue-800 animate-[fadeIn_0.3s_ease-out]">
          <span className="material-symbols-outlined text-blue-600 mt-0.5" style={{fontVariationSettings: "'FILL' 1"}}>celebration</span>
          <div>
            <span className="font-bold block">Google account created successfully!</span>
            <span className="text-sm">Please complete your profile — add your phone number, matric number, and lifestyle preferences.</span>
          </div>
          <button onClick={() => setShowGoogleWelcome(false)} className="ml-auto text-blue-400 hover:text-blue-600">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      )}

      {/* UiTM Verification Status Banner */}
      {isStudent && !isUitmVerified() && currentUser.id !== 999 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 animate-[fadeIn_0.3s_ease-out]">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-600 mt-0.5">warning</span>
            <div className="flex-1">
              <span className="font-bold block">Not Verified — Complete UiTM Student Verification</span>
              <span className="text-sm">Your matric number must match your UiTM student email, for example <strong>2022456146@student.uitm.edu.my</strong>.</span>
              <p className="text-sm mt-1">Fill in your matric number and UiTM email in your profile to get verified automatically.</p>
            </div>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-800 animate-[fadeIn_0.3s_ease-out]">
          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
          <span className="font-medium">Profile saved successfully!</span>
        </div>
      )}

      {saveError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 animate-[fadeIn_0.3s_ease-out]">
          <span className="material-symbols-outlined mt-0.5">error</span>
          <span className="font-medium flex-1">{saveError}</span>
          <button onClick={() => setSaveError('')} className="ml-auto text-red-400 hover:text-red-600 flex-shrink-0">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      )}

      <div className="glass p-10 rounded-2xl shadow-xl border border-white/40">
        <div className="flex items-center gap-6 mb-10 pb-6 border-b border-surface-container-low">
          <div className="w-24 h-24 rounded-full bg-primary-fixed flex items-center justify-center text-4xl text-on-primary-fixed font-bold shadow-inner uppercase">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold font-headline text-on-surface">{currentUser.name}</h1>
            <p className="text-on-surface-variant text-lg">{currentUser.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container text-xs font-bold rounded-full uppercase tracking-wider">
                {currentUser.role}
              </span>
              {currentUser.isListedAsHousemate && (
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                  <span className="material-symbols-outlined text-xs align-middle mr-1">groups</span>
                  Housemate
                </span>
              )}
              {isStudent ? (
                currentUser.isStudentVerified ? (
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1 w-fit">
                    <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                    Verified UiTM Student
                  </span>
                ) : (
                  <span className="inline-block px-3 py-1 bg-surface-container-high text-on-surface-variant text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1 w-fit">
                    <span className="material-symbols-outlined text-sm">info</span>
                    Not Verified
                  </span>
                )
              ) : null}
            </div>
            {isStudent && (
              <p className="text-xs text-on-surface-variant mt-2 italic">
                {currentUser.isStudentVerified 
                  ? 'Your UiTM student identity is verified.' 
                  : 'Your matric number must match your UiTM student email to be verified.'}
              </p>
            )}
          </div>
        </div>

        {isStudent && (
          <div className="mb-10 bg-surface-container-low p-6 rounded-2xl border border-outline-variant">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-on-surface">Profile Completion: {progress}%</h3>
              <span className="text-xs font-bold text-primary">{progress === 100 ? 'Complete' : 'Incomplete'}</span>
            </div>
            <div className="w-full bg-surface-container-high rounded-full h-2.5 mb-3">
              <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
            {progress < 100 ? (
              <p className="text-sm text-on-surface-variant">
                Complete your profile to improve trust and matching.
              </p>
            ) : null}
          </div>
        )}

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-on-surface">Account Settings</h2>
          
          {isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl font-medium focus:ring-2 focus:ring-primary/50 outline-none" />
                 </div>
                 <div>
                    <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl font-medium focus:ring-2 focus:ring-primary/50 outline-none" />
                 </div>
                 <div>
                    <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">Phone Number</label>
                    <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="e.g. 0123456789" className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl font-medium focus:ring-2 focus:ring-primary/50 outline-none" />
                 </div>
                 {isStudent && (
                   <>
                     <div>
                        <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">Matric Number</label>
                        <input type="text" name="matricNumber" value={formData.matricNumber} onChange={handleChange} placeholder="e.g. 2022456146" className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl font-medium focus:ring-2 focus:ring-primary/50 outline-none" />
                     </div>
                     <div>
                        <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">UiTM Email</label>
                        <input type="email" name="uitmEmail" value={formData.uitmEmail} onChange={handleChange} placeholder="e.g. 2022456146@student.uitm.edu.my" className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl font-medium focus:ring-2 focus:ring-primary/50 outline-none" />
                        <p className="text-xs text-on-surface-variant mt-1">Must match your matric number, e.g. 2022456146@student.uitm.edu.my</p>
                     </div>
                   </>
                 )}
              </div>

              {/* Housemate Section - Only for students */}
              {isStudent && (
                <div className="mt-8 p-6 bg-gradient-to-br from-primary/5 to-tertiary/5 rounded-2xl border border-primary/10">
                  <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">groups</span>
                    Housemate Profile
                  </h3>
                  
                  <label className="flex items-center gap-3 p-3 bg-white/50 rounded-xl transition-colors mb-6 cursor-pointer hover:bg-white/80">
                    <input 
                      type="checkbox" 
                      name="isListedAsHousemate" 
                      checked={formData.isListedAsHousemate} 
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-2 border-primary text-primary focus:ring-primary cursor-pointer accent-primary"
                    />
                    <div>
                      <span className="font-bold text-on-surface">I want to be listed as a housemate</span>
                      <p className="text-xs text-on-surface-variant mt-0.5">You'll appear on the housemate listing page for others to find</p>
                    </div>
                  </label>

                  {formData.isListedAsHousemate && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-[fadeIn_0.3s_ease-out]">
                      <div>
                        <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">Monthly Budget (RM)</label>
                        <input 
                          type="number" 
                          name="budget" 
                          value={formData.budget} 
                          onChange={handleChange} 
                          placeholder="e.g. 500" 
                          className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl font-medium focus:ring-2 focus:ring-primary/50 outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">Sleep Pattern</label>
                        <select 
                          name="sleepSchedule" 
                          value={formData.sleepSchedule} 
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl font-medium focus:ring-2 focus:ring-primary/50 outline-none text-on-surface"
                        >
                          <option value="">Select...</option>
                          {SLEEP_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">Lifestyle (select multiple)</label>
                        <div className="flex flex-wrap gap-2">
                          {LIFESTYLE_OPTIONS.map(opt => {
                            const selected = getLifestyleArray(formData.lifestyle).includes(opt);
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => toggleLifestyle(opt)}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                                  selected
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
                                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                                }`}
                              >
                                {selected && <span className="mr-1">✓</span>}
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        {getLifestyleArray(formData.lifestyle).length === 0 && (
                          <p className="text-xs text-on-surface-variant mt-2">Select one or more lifestyle tags</p>
                        )}
                      </div>

                      {/* Property Linking */}
                      <div className="md:col-span-2">
                        <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">
                          <span className="material-symbols-outlined text-[12px] align-middle mr-1">home</span>
                          Link to Rental Property
                        </label>
                        <select
                          value={selectedPropertyId}
                          onChange={(e) => setSelectedPropertyId(e.target.value)}
                          className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl font-medium focus:ring-2 focus:ring-primary/50 outline-none text-on-surface"
                        >
                          <option value="">No linked property</option>
                          {approvedProperties.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.title} — {p.city}, {p.state} (RM {p.monthlyRent}/mo)
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-on-surface-variant mt-1">
                          Select the rental property where you are staying or looking for housemates.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                 <button onClick={() => { setIsEditing(false); setSaveError(''); }} className="bg-surface-container hover:bg-surface-container-high text-on-surface px-6 py-2.5 rounded-full font-bold transition-all">
                    Cancel
                 </button>
                 <button 
                   onClick={handleSave} 
                   disabled={saving} 
                   className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 px-8 py-2.5 rounded-full font-bold transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center gap-2"
                 >
                    {saving ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                        Saving...
                      </>
                    ) : 'Save Changes'}
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
                <div className="bg-surface-container-low p-4 rounded-lg">
                   <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1">Phone Number</label>
                   <p className="text-on-surface font-medium">{currentUser.phoneNumber || 'Not provided'}</p>
                </div>
                {isStudent && (
                  <>
                    <div className="bg-surface-container-low p-4 rounded-lg">
                       <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1">Matric Number</label>
                       <p className="text-on-surface font-medium">{currentUser.matricNumber || 'Not provided'}</p>
                    </div>
                    <div className="bg-surface-container-low p-4 rounded-lg">
                       <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1">UiTM Email</label>
                       <p className="text-on-surface font-medium">{currentUser.uitmEmail || 'Not provided'}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Housemate details in view mode — always shown if student */}
              {isStudent && (
                <div className="mt-6 p-6 bg-gradient-to-br from-primary/5 to-tertiary/5 rounded-2xl border border-primary/10">
                  <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">groups</span>
                    Housemate Profile
                  </h3>

                  {currentUser.isListedAsHousemate ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                        <span className="text-sm font-medium text-green-700">Listed as housemate — visible to other users</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/50 p-4 rounded-xl">
                          <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1">Budget</label>
                          <p className="text-on-surface font-bold text-lg">{currentUser.budget ? `RM ${currentUser.budget}` : 'Not set'}</p>
                        </div>
                        <div className="bg-white/50 p-4 rounded-xl">
                          <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1">Sleep Pattern</label>
                          <p className="text-on-surface font-medium">{currentUser.sleepSchedule || 'Not set'}</p>
                        </div>
                        <div className="bg-white/50 p-4 rounded-xl">
                          <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1">Lifestyle</label>
                          {displayLifestyles.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {displayLifestyles.map(tag => (
                                <span key={tag} className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">{tag}</span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-on-surface font-medium">Not set</p>
                          )}
                        </div>
                      </div>

                      {/* Linked Property Display */}
                      <div className="bg-white/50 p-4 rounded-xl mt-4">
                        <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1">
                          <span className="material-symbols-outlined text-[12px] align-middle mr-1">home</span>
                          Linked Rental Property
                        </label>
                        {linkedProperty ? (
                          <div>
                            <p className="text-on-surface font-bold">{linkedProperty.title}</p>
                            <p className="text-sm text-on-surface-variant">
                              {linkedProperty.address}, {linkedProperty.city}, {linkedProperty.state}
                            </p>
                          </div>
                        ) : (
                          <p className="text-on-surface-variant text-sm italic">No linked property selected.</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-2 block">person_off</span>
                      <p className="text-on-surface-variant text-sm mb-1">Not listed as housemate</p>
                      <p className="text-xs text-on-surface-variant/70">Edit your profile to opt in and appear on the housemate listing page.</p>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 flex justify-end">
                 <button onClick={() => setIsEditing(true)} className="bg-surface-container hover:bg-surface-container-high text-on-surface px-6 py-2.5 rounded-full font-bold transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">edit</span>
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
