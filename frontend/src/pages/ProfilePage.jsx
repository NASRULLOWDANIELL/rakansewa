import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApprovedProperties, linkUserToProperty } from '../services/api';

const DEFAULT_PRIORITIES = ['Budget', 'Sleep Pattern', 'Cleanliness'];
const LIFESTYLE_OPTIONS = ['Clean', 'Quiet', 'Social', 'Studious', 'Active', 'Flexible'];

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
      setIsEditing(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!currentUser || currentUser.id === 999) return;
      try {
        const props = await getApprovedProperties();
        setApprovedProperties(props || []);
        if (currentUser.linkedProperty) {
          setLinkedProperty(currentUser.linkedProperty);
          setSelectedPropertyId(currentUser.linkedProperty.id.toString());
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
    lifestyle: currentUser?.lifestyle || '',
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

  if (!currentUser) return null;

  const getLifestyleArray = (str) => (str || '').split(',').map(s => s.trim()).filter(Boolean);

  const toggleLifestyle = (opt) => {
    const current = getLifestyleArray(formData.lifestyle);
    const updated = current.includes(opt)
      ? current.filter(l => l !== opt)
      : [...current, opt];
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

      if (currentUser.id !== 999) {
        try {
          const propId = selectedPropertyId ? parseInt(selectedPropertyId) : null;
          const result = await linkUserToProperty(currentUser.id, propId);
          if (result && result.linkedProperty) {
            setLinkedProperty(result.linkedProperty);
          } else {
            setLinkedProperty(null);
          }
        } catch (linkErr) {
          console.error('Error linking property:', linkErr);
          const errorMsg = linkErr?.response?.data?.message || linkErr?.message || 'Failed to link property.';
          setSaveError(errorMsg);
          setSaving(false);
          return;
        }
      }

      await updateProfile({
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : null,
      });

      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to save profile.';
      setSaveError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const displayLifestyles = getLifestyleArray(currentUser.lifestyle);
  const isStudent = currentUser.role === 'STUDENT' || currentUser.role === 'Student';

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8" style={{ maxWidth: '1200px', margin: '0 auto' }}>

      {/* ── Global Alerts ── */}
      {showGoogleWelcome && (
        <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3 text-blue-800 animate-[fadeIn_0.3s_ease-out]">
          <span className="material-symbols-outlined text-blue-600 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>celebration</span>
          <div>
            <span className="font-bold block">Google account created successfully!</span>
            <span className="text-sm">Please complete your profile — add your phone number, matric number, and lifestyle preferences.</span>
          </div>
          <button onClick={() => setShowGoogleWelcome(false)} className="ml-auto text-blue-400 hover:text-blue-600">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      )}

      {isStudent && !isUitmVerified() && currentUser.id !== 999 && (
        <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 animate-[fadeIn_0.3s_ease-out]">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-600 mt-0.5">warning</span>
            <div className="flex-1">
              <span className="font-bold block">Not Verified — Complete UiTM Student Verification</span>
              <span className="text-sm">Your matric number must match your UiTM student email, e.g. <strong>2022456146@student.uitm.edu.my</strong>.</span>
              <p className="text-sm mt-1">Fill in your matric number and UiTM email in your profile to get verified automatically.</p>
            </div>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-800 animate-[fadeIn_0.3s_ease-out]">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <span className="font-medium">Profile saved successfully!</span>
        </div>
      )}

      {saveError && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 animate-[fadeIn_0.3s_ease-out]">
          <span className="material-symbols-outlined mt-0.5">error</span>
          <span className="font-medium flex-1">{saveError}</span>
          <button onClick={() => setSaveError('')} className="ml-auto text-red-400 hover:text-red-600 flex-shrink-0">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      )}

      {/* ── Profile Header Banner ── */}
      <div className="glass rounded-2xl border border-white/40 shadow-lg mb-6 overflow-hidden">
        <div className="px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-primary-fixed flex items-center justify-center text-3xl text-on-primary-fixed font-bold shadow-inner uppercase flex-shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-extrabold font-headline text-on-surface truncate">{currentUser.name}</h1>
            <p className="text-on-surface-variant text-sm truncate">{currentUser.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container text-xs font-bold rounded-full uppercase tracking-wider">
                {currentUser.role}
              </span>
              {currentUser.isListedAsHousemate && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                  <span className="material-symbols-outlined text-xs">groups</span>
                  Housemate
                </span>
              )}
              {isStudent && (
                currentUser.isStudentVerified ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    Verified UiTM Student
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-surface-container-high text-on-surface-variant text-xs font-bold rounded-full uppercase tracking-wider">
                    <span className="material-symbols-outlined text-sm">info</span>
                    Not Verified
                  </span>
                )
              )}
            </div>
          </div>
          {/* Progress (students only) */}
          {isStudent && (
            <div className="w-full sm:w-48 flex-shrink-0">
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-on-surface-variant">Profile Completion</span>
                <span className="text-primary">{progress}%</span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Two-Column Dashboard Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── LEFT: Account Settings ── */}
        <div className="glass rounded-2xl border border-white/40 shadow-lg p-6 md:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-container-low">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">manage_accounts</span>
              <h2 className="text-lg font-bold text-on-surface">Account Settings</h2>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface text-sm font-bold rounded-lg transition-all border border-outline-variant/20"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1.5">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-surface-container-lowest rounded-xl font-medium focus:ring-2 focus:ring-primary/50 outline-none text-on-surface border border-outline-variant/20" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1.5">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-surface-container-lowest rounded-xl font-medium focus:ring-2 focus:ring-primary/50 outline-none text-on-surface border border-outline-variant/20" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1.5">Phone Number</label>
                  <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="e.g. 0123456789"
                    className="w-full px-4 py-2.5 bg-surface-container-lowest rounded-xl font-medium focus:ring-2 focus:ring-primary/50 outline-none text-on-surface border border-outline-variant/20" />
                </div>
                {isStudent && (
                  <>
                    <div>
                      <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1.5">Matric Number</label>
                      <input type="text" name="matricNumber" value={formData.matricNumber} onChange={handleChange} placeholder="e.g. 2022456146"
                        className="w-full px-4 py-2.5 bg-surface-container-lowest rounded-xl font-medium focus:ring-2 focus:ring-primary/50 outline-none text-on-surface border border-outline-variant/20" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1.5">UiTM Email</label>
                      <input type="email" name="uitmEmail" value={formData.uitmEmail} onChange={handleChange} placeholder="e.g. 2022456146@student.uitm.edu.my"
                        className="w-full px-4 py-2.5 bg-surface-container-lowest rounded-xl font-medium focus:ring-2 focus:ring-primary/50 outline-none text-on-surface border border-outline-variant/20" />
                      <p className="text-xs text-on-surface-variant mt-1">Must match your matric number, e.g. 2022456146@student.uitm.edu.my</p>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-surface-container-low">
                <button onClick={() => { setIsEditing(false); setSaveError(''); }}
                  className="px-5 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface text-sm font-bold rounded-lg transition-all border border-outline-variant/20">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] disabled:opacity-50">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1">Full Name</label>
                <p className="text-on-surface font-semibold truncate">{currentUser.name}</p>
              </div>
              <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1">Email Address</label>
                <p className="text-on-surface font-semibold truncate">{currentUser.email}</p>
              </div>
              <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1">Phone Number</label>
                <p className="text-on-surface font-semibold">{currentUser.phoneNumber || <span className="text-on-surface-variant italic font-normal">Not provided</span>}</p>
              </div>
              {isStudent && (
                <>
                  <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                    <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1">Matric Number</label>
                    <p className="text-on-surface font-semibold">{currentUser.matricNumber || <span className="text-on-surface-variant italic font-normal">Not provided</span>}</p>
                  </div>
                  <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10 sm:col-span-2">
                    <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1">UiTM Email</label>
                    <p className="text-on-surface font-semibold truncate">{currentUser.uitmEmail || <span className="text-on-surface-variant italic font-normal">Not provided</span>}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: Housemate Profile ── */}
        {isStudent ? (
          <div className="glass rounded-2xl border border-white/40 shadow-lg p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-container-low">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">groups</span>
                <h2 className="text-lg font-bold text-on-surface">Housemate Profile</h2>
              </div>
              <Link
                to="/profile/housemate"
                className="flex items-center gap-1.5 px-4 py-2 bg-surface-container hover:bg-primary hover:text-white text-on-surface text-sm font-bold rounded-lg transition-all border border-outline-variant/20"
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span>
                Manage
              </Link>
            </div>

            {currentUser.isListedAsHousemate ? (
              <div className="space-y-4">
                {/* Listed badge */}
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <span className="material-symbols-outlined text-green-600 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span className="text-sm font-semibold text-green-700">Listed as housemate — visible to others</span>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/10 text-center">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Budget</label>
                    <p className="text-on-surface font-bold text-base">{currentUser.budget ? `RM ${currentUser.budget}` : '—'}</p>
                  </div>
                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/10 text-center">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Sleep</label>
                    <p className="text-on-surface font-semibold text-sm">{currentUser.sleepSchedule || '—'}</p>
                  </div>
                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/10 text-center">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Lifestyle</label>
                    <p className="text-on-surface font-semibold text-sm">{displayLifestyles.length > 0 ? `${displayLifestyles.length} tag${displayLifestyles.length > 1 ? 's' : ''}` : '—'}</p>
                  </div>
                </div>

                {/* Lifestyle tags */}
                {displayLifestyles.length > 0 && (
                  <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                    <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">Lifestyle Tags</label>
                    <div className="flex flex-wrap gap-1.5">
                      {displayLifestyles.map(tag => (
                        <span key={tag} className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Priorities */}
                <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                  <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">
                    <span className="material-symbols-outlined text-[12px] align-middle mr-1">bar_chart</span>
                    Matching Priorities
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(() => {
                      const p1 = currentUser.priority1 || DEFAULT_PRIORITIES[0];
                      const p2 = currentUser.priority2 || DEFAULT_PRIORITIES[1];
                      const p3 = currentUser.priority3 || DEFAULT_PRIORITIES[2];
                      return [
                        { label: p1, weight: '40%' },
                        { label: p2, weight: '30%' },
                        { label: p3, weight: '20%' },
                      ].map((item, idx) => (
                        <span key={idx} className="flex items-center gap-1">
                          {idx > 0 && <span className="text-on-surface-variant text-xs">→</span>}
                          <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold">
                            {item.label}
                            <span className="ml-1 opacity-60">({item.weight})</span>
                          </span>
                        </span>
                      ));
                    })()}
                  </div>
                  {!currentUser.priority1 && (
                    <p className="text-[11px] text-on-surface-variant mt-1.5 italic">Using defaults — customise in Manage Housemate Profile</p>
                  )}
                </div>

                {/* Linked Property */}
                <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                  <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1">
                    <span className="material-symbols-outlined text-[12px] align-middle mr-1">home</span>
                    Linked Rental Property
                  </label>
                  {linkedProperty ? (
                    <div>
                      <p className="text-on-surface font-bold text-sm">{linkedProperty.title}</p>
                      <p className="text-xs text-on-surface-variant">{linkedProperty.address}, {linkedProperty.city}, {linkedProperty.state}</p>
                    </div>
                  ) : (
                    <p className="text-on-surface-variant text-sm italic">No linked property selected.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/20 mb-3 block">person_off</span>
                <p className="text-on-surface-variant font-semibold mb-1">Not listed as housemate</p>
                <p className="text-sm text-on-surface-variant/70 mb-5">Set up your housemate profile to appear on the listing page.</p>
                <Link
                  to="/profile/housemate"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] transition-all"
                >
                  <span className="material-symbols-outlined text-sm">manage_accounts</span>
                  Manage Housemate Profile
                </Link>
              </div>
            )}
          </div>
        ) : (
          /* Non-student: edit-mode housemate redirect */
          isEditing && (
            <div className="glass rounded-2xl border border-white/40 shadow-lg p-6 md:p-8 flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-4xl text-primary mb-3">home</span>
              <h2 className="text-lg font-bold text-on-surface mb-2">Property Owner Account</h2>
              <p className="text-sm text-on-surface-variant">Housemate features are available for student accounts only.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
