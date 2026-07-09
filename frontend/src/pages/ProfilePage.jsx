import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useBlocker } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApprovedProperties, linkUserToProperty, getPropertiesByOwner, getProperties, getAllUsers, uploadProfileImage, API_BASE_URL } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import UnsavedChangesModal from '../components/UnsavedChangesModal';

const DEFAULT_PRIORITIES = ['Budget', 'Sleep Pattern', 'Cleanliness'];

const ProfilePage = () => {
  const { currentUser, updateProfile, isUitmVerified } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchParams] = useSearchParams();
  const [showGoogleWelcome, setShowGoogleWelcome] = useState(false);
  const [saveError, setSaveError] = useState('');
  const { t } = useLanguage();
  const [isDirty, setIsDirty] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const blocker = useBlocker(
    ({ nextLocation }) => isDirty && isEditing && !saving
  );

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty && isEditing) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, isEditing]);

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
    allowContact: currentUser?.allowContact || false,
    showWhatsapp: currentUser?.showWhatsapp || false,
  });

  /* ── Avatar upload state ── */
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(currentUser?.profileImageUrl || null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const avatarInputRef = useRef(null);

  if (!currentUser) return null;

  const getLifestyleArray = (str) => (str || '').split(',').map(s => s.trim()).filter(Boolean);

  /* ── Avatar file change handler ── */
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError('');

    // Validate type
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file (JPG, PNG, WebP).');
      return;
    }
    // Validate size (2 MB)
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Image must be under 2 MB.');
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setIsDirty(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    setIsDirty(true);
  };

  const handleSave = async (proceedAfterSave = null) => {
    setFormErrors({});
    const tempErrors = {};
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedPhone = formData.phoneNumber.trim();
    const trimmedMatric = formData.matricNumber.trim();
    const trimmedUitmEmail = formData.uitmEmail.trim();

    if (!trimmedName) {
      tempErrors.name = t('val_err_required');
    } else if (trimmedName.length > 100) {
      tempErrors.name = t('val_err_too_long', { max: 100 });
    }

    if (!trimmedEmail) {
      tempErrors.email = t('val_err_required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      tempErrors.email = t('val_err_email_invalid');
    } else if (trimmedEmail.length > 100) {
      tempErrors.email = t('val_err_too_long', { max: 100 });
    }

    if (!trimmedPhone) {
      tempErrors.phoneNumber = t('val_err_phone_empty');
    } else if (!/^[0-9]+$/.test(trimmedPhone)) {
      tempErrors.phoneNumber = t('val_err_phone_numeric');
    } else if (trimmedPhone.length > 15) {
      tempErrors.phoneNumber = t('val_err_too_long', { max: 15 });
    }

    if (isStudent) {
      if (!trimmedMatric) {
        tempErrors.matricNumber = t('val_err_required');
      } else if (!/^[0-9]+$/.test(trimmedMatric)) {
        tempErrors.matricNumber = t('val_err_phone_numeric');
      } else if (trimmedMatric.length > 20) {
        tempErrors.matricNumber = t('val_err_too_long', { max: 20 });
      }

      if (!trimmedUitmEmail) {
        tempErrors.uitmEmail = t('val_err_required');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedUitmEmail)) {
        tempErrors.uitmEmail = t('val_err_email_invalid');
      } else if (!trimmedUitmEmail.toLowerCase().endsWith('@student.uitm.edu.my')) {
        tempErrors.uitmEmail = t('reg_uitm_email_placeholder');
      } else if (trimmedUitmEmail.length > 100) {
        tempErrors.uitmEmail = t('val_err_too_long', { max: 100 });
      }

      if (trimmedMatric && trimmedUitmEmail && trimmedUitmEmail.toLowerCase().endsWith('@student.uitm.edu.my')) {
        const prefix = trimmedUitmEmail.toLowerCase().split('@')[0];
        if (trimmedMatric.toLowerCase() !== prefix) {
          tempErrors.matricNumber = t('reg_warning_mismatch');
        }
      }
    }

    if (Object.keys(tempErrors).length > 0) {
      setFormErrors(tempErrors);
      return;
    }

    try {
      setSaving(true);
      setSaveSuccess(false);
      setSaveError('');

      // ── Upload avatar first if a new file was selected ──────────────────
      let resolvedProfileImageUrl = currentUser.profileImageUrl || null;
      if (avatarFile) {
        setAvatarUploading(true);
        try {
          const uploadResult = await uploadProfileImage(avatarFile);
          resolvedProfileImageUrl = uploadResult.imageUrl;
          setAvatarFile(null); // clear pending file
        } catch {
          setSaveError('Profile image upload failed. Your other changes were not saved.');
          setSaving(false);
          setAvatarUploading(false);
          return;
        } finally {
          setAvatarUploading(false);
        }
      }

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
        name: trimmedName,
        email: trimmedEmail,
        phoneNumber: trimmedPhone,
        matricNumber: isStudent ? trimmedMatric : '',
        uitmEmail: isStudent ? trimmedUitmEmail : '',
        budget: formData.budget ? parseFloat(formData.budget) : null,
        profileImageUrl: resolvedProfileImageUrl,
      });

      setIsEditing(false);
      setSaveSuccess(true);
      setIsDirty(false);

      if (proceedAfterSave && typeof proceedAfterSave === 'function') {
        proceedAfterSave();
      } else {
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Save failed:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to save profile.';
      setSaveError(errorMsg);
      if (blocker && blocker.state === 'blocked') {
        blocker.reset();
      }
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
    <div className="pt-28 pb-20 px-6 md:px-10 lg:px-16 w-full mx-auto space-y-6">

      {/* ── Global Alerts ── */}
      {showGoogleWelcome && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3 text-blue-800 animate-[fadeIn_0.3s_ease-out]">
          <span className="material-symbols-outlined text-blue-600 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>celebration</span>
          <div>
            <span className="font-bold block text-sm">{t('profile_google_success')}</span>
            <span className="text-xs">{t('profile_google_success_sub')}</span>
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
              <span className="font-bold block text-sm">{t('profile_not_verified')}</span>
              <span className="text-xs">{t('profile_not_verified_sub')}</span>
              <p className="text-xs mt-1">{t('profile_not_verified_hint')}</p>
            </div>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-800 animate-[fadeIn_0.3s_ease-out]">
          <span className="material-symbols-outlined text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <span className="font-medium text-sm">{t('profile_saved')}</span>
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

      {/* ── SECTION 1: Profile Header Card (Full-width Banner) ── */}
      <div className="bg-white bg-gradient-to-l from-blue-100/70 via-white to-white dark:from-blue-900/35 dark:via-[#111827] dark:to-[#111827] border border-outline-variant/20 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6">

            {/* ── Avatar with upload ── */}
            <div className="relative flex-shrink-0 mx-auto sm:mx-0">
              {/* Hidden file input */}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={!isEditing}
              />

              {/* Avatar circle */}
              <div
                className={`w-20 h-20 rounded-full overflow-hidden shadow-md flex-shrink-0 relative ${isEditing ? 'cursor-pointer group' : ''}`}
                onClick={() => isEditing && avatarInputRef.current?.click()}
                title={isEditing ? 'Click to change profile photo' : ''}
              >
                {avatarPreview
                  ? (
                    <img
                      src={avatarPreview.startsWith('/uploads')
                        ? `${API_BASE_URL}${avatarPreview}`
                        : avatarPreview}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary-fixed flex items-center justify-center text-3xl text-on-primary-fixed font-black uppercase">
                      {currentUser.name.charAt(0)}
                    </div>
                  )
                }

                {/* Edit overlay (edit mode only) */}
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    {avatarUploading ? (
                      <span className="material-symbols-outlined text-white text-xl animate-spin">progress_activity</span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-white text-xl">photo_camera</span>
                        <span className="text-white text-[9px] font-bold mt-0.5">CHANGE</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Avatar error */}
              {avatarError && (
                <p className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-red-500 font-medium">{avatarError}</p>
              )}
            </div>

            {/* Name + details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h1 className="text-xl font-extrabold font-headline text-on-surface truncate">{currentUser.name}</h1>
                <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mt-1 sm:mt-0">
                  <span className="inline-block px-2.5 py-0.5 bg-secondary-container text-on-secondary-container text-[11px] font-bold rounded-full uppercase tracking-wider">
                    {currentUser.role === 'Owner' ? t('common_owner') : currentUser.role === 'Admin' ? t('nav_admin') : t('common_student')}
                  </span>
                  {currentUser.isListedAsHousemate && (
                    <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 bg-primary/10 text-primary text-[11px] font-bold rounded-full uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[12px]">groups</span>
                      {t('profile_role_housemate')}
                    </span>
                  )}
                  {isStudent && (
                    currentUser.isStudentVerified ? (
                      <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 bg-green-100 text-green-700 text-[11px] font-bold rounded-full uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        {t('profile_role_verified_student')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 bg-surface-container-high text-on-surface-variant text-[11px] font-bold rounded-full uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[12px]">info</span>
                        {t('profile_role_not_verified')}
                      </span>
                    )
                  )}
                </div>
              </div>
              <p className="text-on-surface-variant text-sm truncate mt-1">{currentUser.email}</p>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                  disabled={avatarUploading}
                >
                  <span className="material-symbols-outlined text-[13px]">photo_camera</span>
                  {avatarPreview ? 'Change photo' : 'Add profile photo'}
                </button>
              )}
          </div>

      </div> {/* End SECTION 1 */}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* Left Column: Account Info (40% width) */}
        <div className="lg:col-span-2 space-y-6">


      {/* ── SECTION 2: Account Information Card ── */}
      <div className="bg-white border border-outline-variant/20 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-surface-container-low">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">manage_accounts</span>
            <h2 className="text-base font-bold text-on-surface font-headline">{t('profile_acc_info')}</h2>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-surface-container hover:bg-primary/10 hover:text-primary text-on-surface text-xs font-bold rounded-lg transition-all border border-outline-variant/20"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              {t('profile_btn_edit')}
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => { setIsEditing(false); setSaveError(''); setIsDirty(false); }}
                className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold rounded-lg transition-all border border-outline-variant/20"
              >
                {t('profile_btn_cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-lg shadow-sm transition-all disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    {t('profile_btn_saving')}
                  </>
                ) : t('profile_btn_save')}
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          // ── EDIT MODE: 2-column layout for sidebar ──
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1.5">{t('profile_label_fullname')}</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none text-on-surface border border-outline-variant/20" />
              {formErrors.name && (
                <p className="text-red-500 text-xs mt-1.5 font-medium animate-fade-in flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {formErrors.name}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1.5">{t('profile_label_email')}</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none text-on-surface border border-outline-variant/20" />
              {formErrors.email && (
                <p className="text-red-500 text-xs mt-1.5 font-medium animate-fade-in flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {formErrors.email}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1.5">{t('profile_label_phone')}</label>
              <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder={t('profile_label_phone_placeholder')}
                className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none text-on-surface border border-outline-variant/20" />
              {formErrors.phoneNumber && (
                <p className="text-red-500 text-xs mt-1.5 font-medium animate-fade-in flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {formErrors.phoneNumber}
                </p>
              )}
            </div>
            {isStudent && (
              <>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1.5">{t('profile_label_matric')}</label>
                  <input type="text" name="matricNumber" value={formData.matricNumber} onChange={handleChange} placeholder={t('profile_label_matric_placeholder')}
                    className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none text-on-surface border border-outline-variant/20" />
                  {formErrors.matricNumber && (
                    <p className="text-red-500 text-xs mt-1.5 font-medium animate-fade-in flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {formErrors.matricNumber}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1.5">{t('profile_label_uitm_email')}</label>
                  <input type="email" name="uitmEmail" value={formData.uitmEmail} onChange={handleChange} placeholder={t('profile_label_uitm_email_placeholder')}
                    className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none text-on-surface border border-outline-variant/20" />
                  {formErrors.uitmEmail && (
                    <p className="text-red-500 text-xs mt-1.5 font-medium animate-fade-in flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {formErrors.uitmEmail}
                    </p>
                  )}
                  {!formErrors.uitmEmail && <p className="text-[10px] text-on-surface-variant mt-1">{t('profile_uitm_email_hint')}</p>}
                </div>
              </>
            )}
            {/* Contact Privacy Settings (Edit Mode) */}
            <div className="sm:col-span-2 border-t border-surface-container-low pt-5 mt-2">
              <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-base">security</span>
                {t('profile_label_contact_settings')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="allowContact"
                    checked={formData.allowContact}
                    onChange={handleChange}
                    className="w-4 h-4 mt-0.5 rounded text-primary focus:ring-primary border-outline-variant/30"
                  />
                  <div>
                    <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                      {t('profile_label_allow_contact')}
                    </span>
                    <span className="block text-xs text-on-surface-variant mt-0.5">
                      {t('profile_allow_contact_hint')}
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="showWhatsapp"
                    checked={formData.showWhatsapp}
                    onChange={handleChange}
                    className="w-4 h-4 mt-0.5 rounded text-primary focus:ring-primary border-outline-variant/30"
                  />
                  <div>
                    <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                      {t('profile_label_show_whatsapp')}
                    </span>
                    <span className="block text-xs text-on-surface-variant mt-0.5">
                      {t('profile_show_whatsapp_hint')}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        ) : (
          // ── VIEW MODE: Mini Info Cards ──
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {/* Full Name — spans full width */}
            <div className="md:col-span-2 p-3.5 bg-surface-container-lowest rounded-xl border border-outline-variant/20 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-on-surface-variant">badge</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t('profile_label_fullname')}</span>
              </div>
              <span className="text-sm font-bold text-on-surface">{currentUser.name}</span>
            </div>

            {/* Email Address */}
            <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-outline-variant/20 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-on-surface-variant">mail</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t('profile_label_email')}</span>
              </div>
              <span className="text-sm font-bold text-on-surface truncate">{currentUser.email}</span>
            </div>

            {/* Phone Number */}
            <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-outline-variant/20 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-on-surface-variant">phone</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t('profile_label_phone')}</span>
              </div>
              <span className="text-sm font-bold text-on-surface">
                {currentUser.phoneNumber || <span className="text-on-surface-variant italic font-normal text-xs">{t('profile_not_provided')}</span>}
              </span>
            </div>

            {/* Role — Owner & Admin only */}
            {(isOwner || isAdmin) && (
              <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-outline-variant/20 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-on-surface-variant">verified_user</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t('profile_acc_role')}</span>
                </div>
                <span className="text-sm font-bold text-primary">
                  {currentUser.role === 'Owner' ? t('common_owner') : currentUser.role === 'Admin' ? t('nav_admin') : currentUser.role}
                </span>
              </div>
            )}

            {/* Student-only fields */}
            {isStudent && (
              <>
                <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-outline-variant/20 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-on-surface-variant">tag</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t('profile_label_matric')}</span>
                  </div>
                  <span className="text-sm font-bold text-on-surface">
                    {currentUser.matricNumber || <span className="text-on-surface-variant italic font-normal text-xs">{t('profile_not_provided')}</span>}
                  </span>
                </div>
                <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-outline-variant/20 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-on-surface-variant">school</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t('profile_label_uitm_email')}</span>
                  </div>
                  <span className="text-sm font-bold text-on-surface truncate">
                    {currentUser.uitmEmail || <span className="text-on-surface-variant italic font-normal text-xs">{t('profile_not_provided')}</span>}
                  </span>
                </div>
              </>
            )}

            {/* Contact Privacy Settings (View Mode) */}
            <div className="md:col-span-2 border-t border-surface-container-low pt-5 mt-4">
              <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-base">security</span>
                {t('profile_label_contact_settings')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-outline-variant/20 flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t('profile_label_allow_contact')}</span>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-on-surface mt-0.5">
                    {currentUser.allowContact ? (
                      <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                        {t('pref_active') || 'Enabled'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-on-surface-variant bg-surface-container px-2 py-0.5 rounded border border-outline-variant/20 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/40"></span>
                        {t('pref_hidden') || 'Disabled'}
                      </span>
                    )}
                  </span>
                </div>
                <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-outline-variant/20 flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t('profile_label_show_whatsapp')}</span>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-on-surface mt-0.5">
                    {currentUser.showWhatsapp ? (
                      <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                        {t('pref_active') || 'Enabled'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-on-surface-variant bg-surface-container px-2 py-0.5 rounded border border-outline-variant/20 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/40"></span>
                        {t('pref_hidden') || 'Disabled'}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
        </div> {/* End Left Column */}

        {/* Right Column: Detailed Profiles & Summaries (60% width) */}
        <div className="lg:col-span-3 space-y-6">

      {/* ── SECTION 3: Housemate Profile Card (Student only) ── */}
      {isStudent && (
        <div className="bg-white border border-outline-variant/20 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-container-low">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">groups</span>
              <h2 className="text-base font-bold text-on-surface font-headline">{t('profile_housemate_profile')}</h2>
            </div>
            <Link
              to="/profile/housemate"
              className="flex items-center gap-1.5 px-4 py-2 bg-surface-container hover:bg-primary/10 hover:text-primary text-on-surface text-xs font-bold rounded-lg transition-all border border-outline-variant/20"
            >
              <span className="material-symbols-outlined text-sm">manage_accounts</span>
              {t('profile_btn_manage_housemate')}
            </Link>
          </div>

          {currentUser.isListedAsHousemate ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Side: General Profile Details & Lifestyle Tags */}
              <div className="space-y-6">
                
                {/* Vertical key-value layout */}
                <div className="flex flex-col gap-3.5 w-full">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800/40">
                    <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">{t('pref_section_visibility')}</span>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                      {t('profile_status_visible')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800/40">
                    <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">{t('profile_label_budget')}</span>
                    <span className="text-sm font-bold text-on-surface">
                      {currentUser.budget ? `RM ${currentUser.budget}` : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800/40">
                    <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">{t('profile_label_sleep')}</span>
                    <span className="text-sm font-bold text-on-surface">
                      {currentUser.sleepSchedule ? t(currentUser.sleepSchedule) : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">{t('profile_label_lifestyles')}</span>
                    <span className="text-sm font-bold text-on-surface">
                      {displayLifestyles.length > 0 ? t('profile_lifestyles_tags', { count: displayLifestyles.length }) : '—'}
                    </span>
                  </div>
                </div>

                {/* Lifestyle Tags */}
                {displayLifestyles.length > 0 && (
                  <div className="pt-4 border-t border-surface-container-low">
                    <span className="block text-xs text-on-surface-variant font-medium uppercase tracking-wider mb-2.5">{t('profile_label_lifestyle_tags_section')}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {displayLifestyles.map(tag => (
                        <span key={tag} className="px-2.5 py-1 bg-primary/5 text-primary text-xs font-semibold rounded-lg border border-primary/10">
                          {t(tag)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Side: Matching Priorities (Vertical stack) */}
              <div className="space-y-4 md:border-l md:border-surface-container-low md:pl-8">
                <span className="block text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-1">{t('profile_label_priorities_section')}</span>
                <div className="flex flex-col gap-3">
                  {(() => {
                    const p1 = currentUser.priority1 || DEFAULT_PRIORITIES[0];
                    const p2 = currentUser.priority2 || DEFAULT_PRIORITIES[1];
                    const p3 = currentUser.priority3 || DEFAULT_PRIORITIES[2];
                    return [
                      { label: p1, title: `${t('pref_priority_1')} (40%)`, icon: 'looks_one' },
                      { label: p2, title: `${t('pref_priority_2')} (30%)`, icon: 'looks_two' },
                      { label: p3, title: `${t('pref_priority_3')} (20%)`, icon: 'looks_3' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg border border-outline-variant/10">
                        <span className="material-symbols-outlined text-primary text-lg">{item.icon}</span>
                        <div>
                          <span className="block text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">{item.title}</span>
                          <span className="text-sm font-bold text-on-surface">{t(item.label)}</span>
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
              <p className="text-on-surface-variant font-semibold text-sm">{t('profile_not_listed')}</p>
              <p className="text-xs text-on-surface-variant/60 mt-1">{t('profile_not_listed_desc')}</p>
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
              <h2 className="text-base font-bold text-on-surface font-headline">{t('profile_property_summary')}</h2>
            </div>
            <Link
              to="/owner"
              className="flex items-center gap-1.5 px-4 py-2 bg-surface-container hover:bg-primary/10 hover:text-primary text-on-surface text-xs font-bold rounded-lg transition-all border border-outline-variant/20"
            >
              <span className="material-symbols-outlined text-sm">tune</span>
              {t('profile_btn_manage_properties')}
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20 text-center">
              <span className="block text-2xl font-extrabold text-on-surface">{ownerProperties.length}</span>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">{t('profile_total')}</span>
            </div>
            <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
              <span className="block text-2xl font-extrabold text-green-600">{ownerApproved}</span>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-green-700 mt-1">{t('profile_approved')}</span>
            </div>
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-200 text-center">
              <span className="block text-2xl font-extrabold text-orange-500">{ownerPending}</span>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-orange-600 mt-1">{t('profile_pending')}</span>
            </div>
            <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-center">
              <span className="block text-2xl font-extrabold text-red-500">{ownerRejected}</span>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-red-600 mt-1">{t('profile_rejected')}</span>
            </div>
          </div>

          {ownerProperties.length === 0 && (
            <div className="text-center py-6 mt-4 border-t border-surface-container-low">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant/20 mb-2 block">home_work</span>
              <p className="text-xs text-on-surface-variant italic">{t('profile_no_listings_yet')}</p>
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
              <h2 className="text-base font-bold text-on-surface font-headline">{t('profile_system_summary')}</h2>
            </div>
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-4 py-2 bg-surface-container hover:bg-primary/10 hover:text-primary text-on-surface text-xs font-bold rounded-lg transition-all border border-outline-variant/20"
            >
              <span className="material-symbols-outlined text-sm">dashboard</span>
              {t('profile_btn_open_admin')}
            </Link>
          </div>

          {currentUser.id === 999 ? (
            // Mock admin — show action shortcuts instead of live stats
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link to="/admin" className="flex items-center gap-3 p-4 bg-primary/5 hover:bg-primary/10 rounded-xl border border-primary/10 transition-colors group">
                <span className="material-symbols-outlined text-primary text-xl">home_work</span>
                <div>
                  <span className="block text-xs font-bold text-primary">{t('profile_admin_prop_approvals')}</span>
                  <span className="block text-[10px] text-on-surface-variant mt-0.5">{t('profile_admin_prop_approvals_sub')}</span>
                </div>
              </Link>
              <Link to="/admin" className="flex items-center gap-3 p-4 bg-surface-container-lowest hover:bg-primary/10 rounded-xl border border-outline-variant/20 transition-colors group">
                <span className="material-symbols-outlined text-on-surface-variant text-xl group-hover:text-primary">people</span>
                <div>
                  <span className="block text-xs font-bold text-on-surface group-hover:text-primary">{t('profile_admin_user_mgmt')}</span>
                  <span className="block text-[10px] text-on-surface-variant mt-0.5">{t('profile_admin_user_mgmt_sub')}</span>
                </div>
              </Link>
              <Link to="/admin" className="flex items-center gap-3 p-4 bg-surface-container-lowest hover:bg-primary/10 rounded-xl border border-outline-variant/20 transition-colors group">
                <span className="material-symbols-outlined text-on-surface-variant text-xl group-hover:text-primary">feedback</span>
                <div>
                  <span className="block text-xs font-bold text-on-surface group-hover:text-primary">{t('profile_admin_feedback')}</span>
                  <span className="block text-[10px] text-on-surface-variant mt-0.5">{t('profile_admin_feedback_sub')}</span>
                </div>
              </Link>
            </div>
          ) : (
            // Real admin with live stats
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 text-center">
                <span className="block text-2xl font-extrabold text-primary">{adminUsers.length}</span>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-primary/70 mt-1">{t('profile_admin_total_users')}</span>
              </div>
              <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20 text-center">
                <span className="block text-2xl font-extrabold text-on-surface">{adminStudents}</span>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">{t('profile_admin_students')}</span>
              </div>
              <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20 text-center">
                <span className="block text-2xl font-extrabold text-on-surface">{adminOwners}</span>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">{t('profile_admin_owners')}</span>
              </div>
              <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20 text-center">
                <span className="block text-2xl font-extrabold text-on-surface">{adminProperties.length}</span>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">{t('profile_admin_total_listings')}</span>
              </div>
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-200 text-center">
                <span className="block text-2xl font-extrabold text-orange-500">{adminPending}</span>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-orange-600 mt-1">{t('profile_admin_pending_approvals')}</span>
              </div>
              <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20 text-center">
                <span className="block text-2xl font-extrabold text-on-surface">{adminProperties.filter(p => p.approvalStatus !== 'Pending').length}</span>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">{t('profile_admin_processed')}</span>
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
            <h2 className="text-base font-bold text-on-surface font-headline">{t('profile_linked_property')}</h2>
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
                  <span className="block text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">{t('detail_rent')}</span>
                  <span className="text-sm font-extrabold text-primary">RM {linkedProperty.monthlyRent || '—'}</span>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                  {t('pref_linked')}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant/20 mb-2 block">home_work</span>
              <p className="text-xs text-on-surface-variant italic">{t('profile_no_property_linked')}</p>
            </div>
          )}
        </div>
      )}

        </div> {/* End Right Column */}
      </div> {/* End Grid */}

      <UnsavedChangesModal
        isOpen={blocker.state === 'blocked'}
        onSave={() => handleSave(() => blocker.proceed())}
        onDiscard={() => {
          setIsDirty(false);
          blocker.proceed();
        }}
        onCancel={() => blocker.reset()}
      />
    </div>
  );
};

export default ProfilePage;
