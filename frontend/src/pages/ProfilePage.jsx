import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApprovedProperties, linkUserToProperty, getPropertiesByOwner, getProperties, getAllUsers } from '../services/api';

const DEFAULT_PRIORITIES = ['Budget', 'Sleep Pattern', 'Cleanliness'];

const ProfilePage = () => {
  const { currentUser, updateProfile, isUitmVerified } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchParams] = useSearchParams();
  const [showGoogleWelcome, setShowGoogleWelcome] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Property linking state (Student)
  const [approvedProperties, setApprovedProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [linkedProperty, setLinkedProperty] = useState(null);

  // Owner property summary state
  const [ownerProperties, setOwnerProperties] = useState([]);

  // Admin system summary state
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminProperties, setAdminProperties] = useState([]);

  useEffect(() => {
    if (searchParams.get('newGoogleUser') === 'true') {
      setShowGoogleWelcome(true);
      setIsEditing(true);
    }
  }, [searchParams]);

  // Fetch approved properties for student property linking
  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!currentUser || currentUser.id === 999) return;
      if (currentUser.role !== 'Student' && currentUser.role !== 'STUDENT') return;
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

  // Fetch Owner properties for summary card
  useEffect(() => {
    const fetchOwnerData = async () => {
      if (!currentUser?.id || currentUser.role !== 'Owner') return;
      try {
        const data = await getPropertiesByOwner(currentUser.id);
        setOwnerProperties(data || []);
      } catch (err) {
        console.error('Error fetching owner properties:', err);
      }
    };
    fetchOwnerData();
  }, [currentUser?.id, currentUser?.role]);

  // Fetch Admin stats for summary card
  useEffect(() => {
    const fetchAdminData = async () => {
      if (!currentUser || currentUser.role !== 'Admin' || currentUser.id === 999) return;
      try {
        const [usrs, props] = await Promise.all([getAllUsers(), getProperties()]);
        setAdminUsers(usrs || []);
        setAdminProperties(props || []);
      } catch (err) {
        console.error('Error fetching admin data:', err);
      }
    };
    fetchAdminData();
  }, [currentUser?.id, currentUser?.role]);

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

  if (!currentUser) return null;

  const getLifestyleArray = (str) => (str || '').split(',').map(s => s.trim()).filter(Boolean);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveSuccess(false);
      setSaveError('');

      if (currentUser.id !== 999 && isStudent) {
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
  const isOwner = currentUser.role === 'Owner';
  const isAdmin = currentUser.role === 'Admin';

  // Owner stats derived from fetched properties
  const ownerApproved = ownerProperties.filter(p => p.approvalStatus === 'Approved').length;
  const ownerPending = ownerProperties.filter(p => p.approvalStatus === 'Pending').length;
  const ownerRejected = ownerProperties.filter(p => p.approvalStatus === 'Rejected').length;

  // Admin stats derived from fetched data
  const adminStudents = adminUsers.filter(u => u.role === 'Student' || u.role === 'STUDENT').length;
  const adminOwners = adminUsers.filter(u => u.role === 'Owner').length;
  const adminPending = adminProperties.filter(p => p.approvalStatus === 'Pending').length;

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto space-y-6">

      {/* ── Global Alerts ── */}
      {showGoogleWelcome && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3 text-blue-800 animate-[fadeIn_0.3s_ease-out]">
          <span className="material-symbols-outlined text-blue-600 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>celebration</span>
          <div>
            <span className="font-bold block text-sm">Google account created successfully!</span>
            <span className="text-xs">Please complete your profile — add your phone number, matric number, and lifestyle preferences.</span>
          </div>
          <button onClick={() => setShowGoogleWelcome(false)} className="ml-auto text-blue-400 hover:text-blue-600">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      )}

      {isStudent && !isUitmVerified() && currentUser.id !== 999 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 animate-[fadeIn_0.3s_ease-out]">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-600 mt-0.5">warning</span>
            <div className="flex-1">
              <span className="font-bold block text-sm">Not Verified — Complete UiTM Student Verification</span>
              <span className="text-xs">Your matric number must match your UiTM student email, e.g. <strong>2022456146@student.uitm.edu.my</strong>.</span>
              <p className="text-xs mt-1">Fill in your matric number and UiTM email in your profile to get verified automatically.</p>
            </div>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-800 animate-[fadeIn_0.3s_ease-out]">
          <span className="material-symbols-outlined text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <span className="font-medium text-sm">Profile saved successfully!</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 animate-[fadeIn_0.3s_ease-out]">
          <span className="material-symbols-outlined mt-0.5 text-red-600">error</span>
          <span className="font-medium text-sm flex-1">{saveError}</span>
          <button onClick={() => setSaveError('')} className="ml-auto text-red-400 hover:text-red-600 flex-shrink-0">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      )}

      {/* ── SECTION 1: Profile Header Card ── */}
      <div className="bg-white border border-outline-variant/20 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-5">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-2xl text-on-primary-fixed font-black shadow-inner uppercase flex-shrink-0">
          {currentUser.name.charAt(0)}
        </div>
        {/* Name + details */}
        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <h1 className="text-xl font-extrabold font-headline text-on-surface truncate">{currentUser.name}</h1>
            <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mt-1 sm:mt-0">
              <span className="inline-block px-2.5 py-0.5 bg-secondary-container text-on-secondary-container text-[11px] font-bold rounded-full uppercase tracking-wider">
                {currentUser.role}
              </span>
              {currentUser.isListedAsHousemate && (
                <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 bg-primary/10 text-primary text-[11px] font-bold rounded-full uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[12px]">groups</span>
                  Housemate
                </span>
              )}
              {isStudent && (
                currentUser.isStudentVerified ? (
                  <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 bg-green-100 text-green-700 text-[11px] font-bold rounded-full uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    Verified Student
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 bg-surface-container-high text-on-surface-variant text-[11px] font-bold rounded-full uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[12px]">info</span>
                    Not Verified
                  </span>
                )
              )}
            </div>
          </div>
          <p className="text-on-surface-variant text-sm truncate mt-1">{currentUser.email}</p>
        </div>
      </div>

      {/* ── SECTION 2: Account Information Card ── */}
      <div className="bg-white border border-outline-variant/20 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-surface-container-low">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">manage_accounts</span>
            <h2 className="text-base font-bold text-on-surface font-headline">Account Information</h2>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-surface-container hover:bg-primary/10 hover:text-primary text-on-surface text-xs font-bold rounded-lg transition-all border border-outline-variant/20"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => { setIsEditing(false); setSaveError(''); }}
                className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold rounded-lg transition-all border border-outline-variant/20"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-lg shadow-sm transition-all disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    Saving...
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          // ── EDIT MODE: existing form layout unchanged ──
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1.5">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none text-on-surface border border-outline-variant/20" />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1.5">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none text-on-surface border border-outline-variant/20" />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1.5">Phone Number</label>
              <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="e.g. 0123456789"
                className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none text-on-surface border border-outline-variant/20" />
            </div>
            {isStudent && (
              <>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1.5">Matric Number</label>
                  <input type="text" name="matricNumber" value={formData.matricNumber} onChange={handleChange} placeholder="e.g. 2022456146"
                    className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none text-on-surface border border-outline-variant/20" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1.5">UiTM Email</label>
                  <input type="email" name="uitmEmail" value={formData.uitmEmail} onChange={handleChange} placeholder="e.g. 2022456146@student.uitm.edu.my"
                    className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none text-on-surface border border-outline-variant/20" />
                  <p className="text-[10px] text-on-surface-variant mt-1">Must match your matric number, e.g. 2022456146@student.uitm.edu.my</p>
                </div>
              </>
            )}
          </div>
        ) : (
          // ── VIEW MODE: Mini Info Cards ──
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {/* Full Name — spans full width */}
            <div className="md:col-span-2 p-3.5 bg-surface-container-lowest rounded-xl border border-outline-variant/20 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-on-surface-variant">badge</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Full Name</span>
              </div>
              <span className="text-sm font-bold text-on-surface">{currentUser.name}</span>
            </div>

            {/* Email Address */}
            <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-outline-variant/20 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-on-surface-variant">mail</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Email Address</span>
              </div>
              <span className="text-sm font-bold text-on-surface truncate">{currentUser.email}</span>
            </div>

            {/* Phone Number */}
            <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-outline-variant/20 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-on-surface-variant">phone</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Phone Number</span>
              </div>
              <span className="text-sm font-bold text-on-surface">
                {currentUser.phoneNumber || <span className="text-on-surface-variant italic font-normal text-xs">Not provided</span>}
              </span>
            </div>

            {/* Role — Owner & Admin only */}
            {(isOwner || isAdmin) && (
              <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-outline-variant/20 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-on-surface-variant">verified_user</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Account Role</span>
                </div>
                <span className="text-sm font-bold text-primary">{currentUser.role}</span>
              </div>
            )}

            {/* Student-only fields */}
            {isStudent && (
              <>
                <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-outline-variant/20 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-on-surface-variant">tag</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Matric Number</span>
                  </div>
                  <span className="text-sm font-bold text-on-surface">
                    {currentUser.matricNumber || <span className="text-on-surface-variant italic font-normal text-xs">Not provided</span>}
                  </span>
                </div>
                <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-outline-variant/20 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-on-surface-variant">school</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">UiTM Email</span>
                  </div>
                  <span className="text-sm font-bold text-on-surface truncate">
                    {currentUser.uitmEmail || <span className="text-on-surface-variant italic font-normal text-xs">Not provided</span>}
                  </span>
                </div>
              </>
            )}

          </div>
        )}
      </div>

      {/* ── SECTION 3: Housemate Profile Card (Student only) ── */}
      {isStudent && (
        <div className="bg-white border border-outline-variant/20 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-container-low">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">groups</span>
              <h2 className="text-base font-bold text-on-surface font-headline">Housemate Profile</h2>
            </div>
            <Link
              to="/profile/housemate"
              className="flex items-center gap-1.5 px-4 py-2 bg-surface-container hover:bg-primary/10 hover:text-primary text-on-surface text-xs font-bold rounded-lg transition-all border border-outline-variant/20"
            >
              <span className="material-symbols-outlined text-sm">manage_accounts</span>
              Manage Housemate Profile
            </Link>
          </div>

          {currentUser.isListedAsHousemate ? (
            <div className="space-y-6">
              {/* Top Row: Listing Status, Budget, Sleep Pattern, Total Lifestyles */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <span className="block text-xs text-on-surface-variant font-medium uppercase tracking-wider">Listing Status</span>
                  <span className="inline-flex items-center gap-1 mt-1.5 text-sm font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                    Listed & Visible
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-on-surface-variant font-medium uppercase tracking-wider">Monthly Budget</span>
                  <span className="text-sm font-bold text-on-surface block mt-1.5">
                    {currentUser.budget ? `RM ${currentUser.budget}` : '—'}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-on-surface-variant font-medium uppercase tracking-wider">Sleep Schedule</span>
                  <span className="text-sm font-bold text-on-surface block mt-1.5">
                    {currentUser.sleepSchedule || '—'}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-on-surface-variant font-medium uppercase tracking-wider">Total Lifestyles</span>
                  <span className="text-sm font-bold text-on-surface block mt-1.5">
                    {displayLifestyles.length > 0 ? `${displayLifestyles.length} tag(s)` : '—'}
                  </span>
                </div>
              </div>

              {/* Middle Row: Lifestyle Tags */}
              {displayLifestyles.length > 0 && (
                <div className="pt-4 border-t border-surface-container-low">
                  <span className="block text-xs text-on-surface-variant font-medium uppercase tracking-wider mb-2.5">Lifestyle Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {displayLifestyles.map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-primary/5 text-primary text-xs font-semibold rounded-lg border border-primary/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Row: Matching Priorities */}
              <div className="pt-4 border-t border-surface-container-low">
                <span className="block text-xs text-on-surface-variant font-medium uppercase tracking-wider mb-3">Matching Priorities</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(() => {
                    const p1 = currentUser.priority1 || DEFAULT_PRIORITIES[0];
                    const p2 = currentUser.priority2 || DEFAULT_PRIORITIES[1];
                    const p3 = currentUser.priority3 || DEFAULT_PRIORITIES[2];
                    return [
                      { label: p1, title: 'Priority 1 (40%)', icon: 'looks_one' },
                      { label: p2, title: 'Priority 2 (30%)', icon: 'looks_two' },
                      { label: p3, title: 'Priority 3 (20%)', icon: 'looks_3' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg border border-outline-variant/10">
                        <span className="material-symbols-outlined text-primary text-lg">{item.icon}</span>
                        <div>
                          <span className="block text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">{item.title}</span>
                          <span className="text-sm font-bold text-on-surface">{item.label}</span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/20 mb-2 block">person_off</span>
              <p className="text-on-surface-variant font-semibold text-sm">Not listed as a housemate</p>
              <p className="text-xs text-on-surface-variant/60 mt-1">Your profile is currently hidden from housemate searches.</p>
            </div>
          )}
        </div>
      )}

      {/* ── SECTION 3 (Owner): Property Summary Card ── */}
      {isOwner && (
        <div className="bg-white border border-outline-variant/20 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-surface-container-low">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">home_work</span>
              <h2 className="text-base font-bold text-on-surface font-headline">Property Summary</h2>
            </div>
            <Link
              to="/owner"
              className="flex items-center gap-1.5 px-4 py-2 bg-surface-container hover:bg-primary/10 hover:text-primary text-on-surface text-xs font-bold rounded-lg transition-all border border-outline-variant/20"
            >
              <span className="material-symbols-outlined text-sm">tune</span>
              Manage Properties
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20 text-center">
              <span className="block text-2xl font-extrabold text-on-surface">{ownerProperties.length}</span>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Total</span>
            </div>
            <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
              <span className="block text-2xl font-extrabold text-green-600">{ownerApproved}</span>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-green-700 mt-1">Approved</span>
            </div>
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-200 text-center">
              <span className="block text-2xl font-extrabold text-orange-500">{ownerPending}</span>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-orange-600 mt-1">Pending</span>
            </div>
            <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-center">
              <span className="block text-2xl font-extrabold text-red-500">{ownerRejected}</span>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-red-600 mt-1">Rejected</span>
            </div>
          </div>

          {ownerProperties.length === 0 && (
            <div className="text-center py-6 mt-4 border-t border-surface-container-low">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant/20 mb-2 block">home_work</span>
              <p className="text-xs text-on-surface-variant italic">No listings yet. Go to Manage Properties to add your first property.</p>
            </div>
          )}
        </div>
      )}

      {/* ── SECTION 3 (Admin): System Summary Card ── */}
      {isAdmin && (
        <div className="bg-white border border-outline-variant/20 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-surface-container-low">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
              <h2 className="text-base font-bold text-on-surface font-headline">System Summary</h2>
            </div>
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-4 py-2 bg-surface-container hover:bg-primary/10 hover:text-primary text-on-surface text-xs font-bold rounded-lg transition-all border border-outline-variant/20"
            >
              <span className="material-symbols-outlined text-sm">dashboard</span>
              Open Admin Dashboard
            </Link>
          </div>

          {currentUser.id === 999 ? (
            // Mock admin — show action shortcuts instead of live stats
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link to="/admin" className="flex items-center gap-3 p-4 bg-primary/5 hover:bg-primary/10 rounded-xl border border-primary/10 transition-colors group">
                <span className="material-symbols-outlined text-primary text-xl">home_work</span>
                <div>
                  <span className="block text-xs font-bold text-primary">Property Approvals</span>
                  <span className="block text-[10px] text-on-surface-variant mt-0.5">Review pending listings</span>
                </div>
              </Link>
              <Link to="/admin" className="flex items-center gap-3 p-4 bg-surface-container-lowest hover:bg-primary/10 rounded-xl border border-outline-variant/20 transition-colors group">
                <span className="material-symbols-outlined text-on-surface-variant text-xl group-hover:text-primary">people</span>
                <div>
                  <span className="block text-xs font-bold text-on-surface group-hover:text-primary">User Management</span>
                  <span className="block text-[10px] text-on-surface-variant mt-0.5">View all registered users</span>
                </div>
              </Link>
              <Link to="/admin" className="flex items-center gap-3 p-4 bg-surface-container-lowest hover:bg-primary/10 rounded-xl border border-outline-variant/20 transition-colors group">
                <span className="material-symbols-outlined text-on-surface-variant text-xl group-hover:text-primary">feedback</span>
                <div>
                  <span className="block text-xs font-bold text-on-surface group-hover:text-primary">User Feedback</span>
                  <span className="block text-[10px] text-on-surface-variant mt-0.5">Manage reports & suggestions</span>
                </div>
              </Link>
            </div>
          ) : (
            // Real admin with live stats
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 text-center">
                <span className="block text-2xl font-extrabold text-primary">{adminUsers.length}</span>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-primary/70 mt-1">Total Users</span>
              </div>
              <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20 text-center">
                <span className="block text-2xl font-extrabold text-on-surface">{adminStudents}</span>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Students</span>
              </div>
              <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20 text-center">
                <span className="block text-2xl font-extrabold text-on-surface">{adminOwners}</span>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Owners</span>
              </div>
              <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20 text-center">
                <span className="block text-2xl font-extrabold text-on-surface">{adminProperties.length}</span>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Total Listings</span>
              </div>
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-200 text-center">
                <span className="block text-2xl font-extrabold text-orange-500">{adminPending}</span>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-orange-600 mt-1">Pending Approvals</span>
              </div>
              <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20 text-center">
                <span className="block text-2xl font-extrabold text-on-surface">{adminProperties.filter(p => p.approvalStatus !== 'Pending').length}</span>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Processed</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SECTION 4: Linked Rental Property Card (Student only) ── */}
      {isStudent && (
        <div className="bg-white border border-outline-variant/20 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-surface-container-low">
            <span className="material-symbols-outlined text-primary">home</span>
            <h2 className="text-base font-bold text-on-surface font-headline">Linked Rental Property</h2>
          </div>

          {linkedProperty ? (
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-sm font-bold text-on-surface">{linkedProperty.title}</h3>
                <p className="text-xs text-on-surface-variant flex items-start gap-1 mt-1">
                  <span className="material-symbols-outlined text-[14px] mt-0.5">location_on</span>
                  <span>{linkedProperty.address}, {linkedProperty.city}, {linkedProperty.state}</span>
                </p>
              </div>
              <div className="flex items-center gap-6 self-stretch md:self-auto justify-between border-t md:border-t-0 pt-3 md:pt-0 border-surface-container-low">
                <div>
                  <span className="block text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Monthly Rent</span>
                  <span className="text-sm font-extrabold text-primary">RM {linkedProperty.monthlyRent || '—'}</span>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                  Linked
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant/20 mb-2 block">home_work</span>
              <p className="text-xs text-on-surface-variant italic">No property linked currently</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default ProfilePage;
