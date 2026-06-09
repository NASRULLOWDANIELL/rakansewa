import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApprovedProperties, linkUserToProperty } from '../services/api';

const LIFESTYLE_OPTIONS = ['Clean', 'Quiet', 'Social', 'Studious', 'Active', 'Flexible'];
const SLEEP_OPTIONS = ['Early Bird', 'Night Owl', 'Flexible'];

const PRIORITY_OPTIONS = [
  { value: 'Budget', label: 'Budget', icon: 'payments', desc: 'Monthly rent affordability' },
  { value: 'Sleep Pattern', label: 'Sleep Pattern', icon: 'bedtime', desc: 'Early bird or night owl' },
  { value: 'Cleanliness', label: 'Cleanliness', icon: 'cleaning_services', desc: 'Tidiness & hygiene habits' },
  { value: 'Quietness', label: 'Quietness', icon: 'volume_off', desc: 'Noise level preference' },
  { value: 'Social Style', label: 'Social Style', icon: 'groups', desc: 'Social or introverted' },
  { value: 'Study Habit', label: 'Study Habit', icon: 'school', desc: 'Study environment needs' },
  { value: 'Activity Level', label: 'Activity Level', icon: 'fitness_center', desc: 'Active lifestyle match' },
  { value: 'Flexibility', label: 'Flexibility', icon: 'tune', desc: 'Adaptability to schedules' },
];

const DEFAULT_PRIORITIES = ['Budget', 'Sleep Pattern', 'Cleanliness'];

const ManageHousemateProfilePage = () => {
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [saving, setSaving]           = useState(false);
  const [saveSuccess, setSaveSuccess]  = useState(false);
  const [saveError, setSaveError]      = useState('');
  const [priorityError, setPriorityError] = useState('');

  const [approvedProperties, setApprovedProperties] = useState([]);
  const [linkedProperty, setLinkedProperty]         = useState(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');

  const formSeeded = useRef(false);

  const getLifestyleArray = (str) =>
    (str || '').split(',').map(s => s.trim()).filter(Boolean);

  const resolvePriorities = (user) => {
    const p1 = user?.priority1;
    const p2 = user?.priority2;
    const p3 = user?.priority3;
    return (p1 && p2 && p3) ? [p1, p2, p3] : [...DEFAULT_PRIORITIES];
  };

  const [form, setForm] = useState(() => {
    const [p1, p2, p3] = resolvePriorities(currentUser);
    return {
      isListedAsHousemate: currentUser?.isListedAsHousemate ?? false,
      budget:              currentUser?.budget              ?? '',
      sleepSchedule:       currentUser?.sleepSchedule       ?? '',
      lifestyle:           currentUser?.lifestyle            ?? '',
      priority1:           p1,
      priority2:           p2,
      priority3:           p3,
    };
  });

  useEffect(() => {
    if (!currentUser || formSeeded.current) return;
    formSeeded.current = true;
    const [p1, p2, p3] = resolvePriorities(currentUser);
    setForm({
      isListedAsHousemate: currentUser.isListedAsHousemate ?? false,
      budget:              currentUser.budget              ?? '',
      sleepSchedule:       currentUser.sleepSchedule       ?? '',
      lifestyle:           currentUser.lifestyle            ?? '',
      priority1:           p1,
      priority2:           p2,
      priority3:           p3,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  useEffect(() => {
    const fetchProps = async () => {
      if (!currentUser || currentUser.id === 999) return;
      try {
        const props = await getApprovedProperties();
        setApprovedProperties(props || []);
        if (currentUser.linkedProperty) {
          setLinkedProperty(currentUser.linkedProperty);
          setSelectedPropertyId(currentUser.linkedProperty.id.toString());
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
      }
    };
    fetchProps();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleLifestyle = (opt) => {
    const current = getLifestyleArray(form.lifestyle);
    const updated = current.includes(opt)
      ? current.filter(l => l !== opt)
      : [...current, opt];
    setForm(prev => ({ ...prev, lifestyle: updated.join(', ') }));
  };

  const setPriority = (slot, value) => {
    setPriorityError('');
    setForm(prev => {
      const next = { ...prev, [slot]: value };
      if (slot !== 'priority1' && next.priority1 === value) next.priority1 = '';
      if (slot !== 'priority2' && next.priority2 === value) next.priority2 = '';
      if (slot !== 'priority3' && next.priority3 === value) next.priority3 = '';
      next[slot] = value;
      return next;
    });
  };

  const availableFor = (slot) =>
    PRIORITY_OPTIONS.filter(opt => {
      const others = ['priority1', 'priority2', 'priority3'].filter(s => s !== slot);
      return !others.map(s => form[s]).includes(opt.value);
    });

  const getPriorityMeta = (value) =>
    PRIORITY_OPTIONS.find(o => o.value === value);

  const handleSave = async () => {
    setSaveError('');
    setPriorityError('');

    if (!form.priority1 || !form.priority2 || !form.priority3) {
      setPriorityError('Please select exactly 3 different priorities before saving.');
      return;
    }
    if (new Set([form.priority1, form.priority2, form.priority3]).size !== 3) {
      setPriorityError('Each priority must be different. Please resolve the duplicate.');
      return;
    }

    try {
      setSaving(true);

      if (currentUser.id !== 999) {
        try {
          const propId = selectedPropertyId ? parseInt(selectedPropertyId, 10) : null;
          const linkResult = await linkUserToProperty(currentUser.id, propId);
          setLinkedProperty(linkResult?.linkedProperty || null);
        } catch (linkErr) {
          console.warn('Property link failed (non-fatal):', linkErr);
          setSaveError('Note: property link could not be updated, but your other settings will still be saved.');
        }
      }

      const savedUser = await updateProfile({
        name:                currentUser.name,
        email:               currentUser.email,
        role:                currentUser.role,
        phoneNumber:         currentUser.phoneNumber,
        matricNumber:        currentUser.matricNumber,
        uitmEmail:           currentUser.uitmEmail,
        authProvider:        currentUser.authProvider,
        isListedAsHousemate: form.isListedAsHousemate,
        budget:              form.budget ? parseFloat(form.budget) : null,
        sleepSchedule:       form.sleepSchedule  || null,
        lifestyle:           form.lifestyle       || null,
        priority1:           form.priority1,
        priority2:           form.priority2,
        priority3:           form.priority3,
      });

      if (savedUser) {
        const [p1, p2, p3] = resolvePriorities(savedUser);
        setForm(prev => ({
          ...prev,
          priority1: p1,
          priority2: p2,
          priority3: p3,
        }));
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        navigate('/profile');
      }, 1800);
    } catch (err) {
      console.error('Save failed:', err);
      setSaveError(err?.response?.data?.message || err?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) return null;

  const selectedLifestyles = getLifestyleArray(form.lifestyle);
  const isStudent = currentUser.role === 'STUDENT' || currentUser.role === 'Student';

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-6">
        <Link to="/profile" className="hover:text-primary transition-colors">Account</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="font-semibold text-on-surface">Manage Housemate Profile</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* ── LEFT COLUMN: Profile Summary Sidebar ── */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card 1: Avatar & Identity */}
          <div className="glass p-6 rounded-2xl shadow-xl border border-white/40 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-primary-fixed flex items-center justify-center text-3xl text-on-primary-fixed font-bold shadow-inner uppercase mb-3">
              {currentUser.name.charAt(0)}
            </div>
            <h2 className="text-lg font-extrabold font-headline text-on-surface break-all">{currentUser.name}</h2>
            <p className="text-on-surface-variant text-xs break-all mb-3">{currentUser.email}</p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              <span className="inline-block px-2.5 py-0.5 bg-secondary-container text-on-secondary-container text-[11px] font-bold rounded-full uppercase tracking-wider">
                {currentUser.role}
              </span>
              {isStudent && currentUser.isStudentVerified && (
                <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 bg-green-100 text-green-700 text-[11px] font-bold rounded-full uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  Verified
                </span>
              )}
            </div>
          </div>

          {/* Card 2: Profile Status Summary */}
          <div className="glass p-5 rounded-2xl shadow-md border border-white/40 space-y-3">
            <h3 className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2 pb-1 border-b border-surface-container-low">
              Profile Status
            </h3>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-surface-variant">Listing Visibility</span>
              {form.isListedAsHousemate ? (
                <span className="inline-flex items-center gap-1 text-green-600 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                  Listed & Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-on-surface-variant font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-outline-variant"></span>
                  Hidden / Private
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-on-surface-variant">Verification</span>
              {isStudent && currentUser.isStudentVerified ? (
                <span className="text-green-600 font-bold inline-flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  Verified Student
                </span>
              ) : (
                <span className="text-on-surface-variant font-medium inline-flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  Unverified
                </span>
              )}
            </div>
          </div>

          {/* Card 3: Priority Summary (Real-time update) */}
          <div className="glass p-5 rounded-2xl shadow-md border border-white/40 space-y-3">
            <h3 className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2 pb-1 border-b border-surface-container-low">
              Priority Summary
            </h3>
            <div className="space-y-2">
              {[
                { key: 'priority1', label: '1st Priority (40%)', bg: 'bg-primary/10 text-primary' },
                { key: 'priority2', label: '2nd Priority (30%)', bg: 'bg-primary/5 text-primary/85' },
                { key: 'priority3', label: '3rd Priority (20%)', bg: 'bg-surface-container-high text-on-surface-variant' }
              ].map(({ key, label, bg }) => {
                const val = form[key];
                const meta = val ? getPriorityMeta(val) : null;
                return (
                  <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low/50 text-sm">
                    <span className="text-xs text-on-surface-variant font-medium">{label}</span>
                    {meta ? (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold ${bg}`}>
                        <span className="material-symbols-outlined text-[12px]">{meta.icon}</span>
                        {meta.label}
                      </span>
                    ) : (
                      <span className="text-xs text-on-surface-variant italic">Not selected</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 4: Linked Property Summary (Real-time update) */}
          <div className="glass p-5 rounded-2xl shadow-md border border-white/40 space-y-3">
            <h3 className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2 pb-1 border-b border-surface-container-low">
              Linked Property
            </h3>
            {(() => {
              const matchedProp = approvedProperties.find(p => p.id.toString() === selectedPropertyId);
              if (matchedProp) {
                return (
                  <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-primary">
                      <span className="material-symbols-outlined text-sm">home</span>
                      <span className="font-bold text-xs uppercase tracking-wider">Linked</span>
                    </div>
                    <p className="text-sm font-bold text-on-surface line-clamp-1">{matchedProp.title}</p>
                    <p className="text-xs text-on-surface-variant line-clamp-1">{matchedProp.city}, {matchedProp.state}</p>
                    <p className="text-xs font-semibold text-primary">RM {matchedProp.monthlyRent}/month</p>
                  </div>
                );
              }
              return (
                <div className="p-3 bg-surface-container-low/50 border border-outline-variant/10 rounded-xl text-center">
                  <span className="material-symbols-outlined text-on-surface-variant/30 text-lg mb-1 block">home_work</span>
                  <p className="text-xs text-on-surface-variant italic">No property linked</p>
                </div>
              );
            })()}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Preferences Forms ── */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold font-headline text-on-surface mb-1">Housemate Profile</h1>
            <p className="text-sm text-on-surface-variant">
              Control how you appear on the housemate listing and how compatibility is calculated for you.
            </p>
          </div>

          {/* Alerts */}
          {saveSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-800 animate-[fadeIn_0.3s_ease-out]">
              <span className="material-symbols-outlined text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="font-medium text-sm">Saved! Redirecting to your profile…</span>
            </div>
          )}
          {saveError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 animate-[fadeIn_0.3s_ease-out]">
              <span className="material-symbols-outlined mt-0.5 text-red-600">error</span>
              <span className="flex-1 text-sm">{saveError}</span>
              <button onClick={() => setSaveError('')}>
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          )}

          {/* Section 1: Listing Status */}
          <div className="glass p-6 md:p-8 rounded-2xl border border-white/40 shadow-lg">
            <h2 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">visibility</span>
              Listing Status
            </h2>
            <label className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl cursor-pointer hover:bg-surface-container-high transition-colors border border-outline-variant/10">
              <input
                type="checkbox"
                checked={form.isListedAsHousemate}
                onChange={e => setForm({ ...form, isListedAsHousemate: e.target.checked })}
                className="w-5 h-5 accent-primary rounded border-2 border-primary cursor-pointer"
              />
              <div>
                <span className="font-bold text-on-surface block text-sm">List me as a housemate</span>
                <span className="text-xs text-on-surface-variant">You'll appear on the housemate listing page for others to find</span>
              </div>
              {form.isListedAsHousemate && (
                <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Listed</span>
              )}
            </label>
          </div>

          {/* Section 2: Basic Preferences */}
          <div className="glass p-6 md:p-8 rounded-2xl border border-white/40 shadow-lg">
            <h2 className="text-base font-bold text-on-surface mb-5 flex items-center gap-2 pb-3 border-b border-surface-container-low">
              <span className="material-symbols-outlined text-primary">person</span>
              Basic Preferences
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">
                  Monthly Budget (RM)
                </label>
                <input
                  type="number"
                  value={form.budget}
                  onChange={e => setForm({ ...form, budget: e.target.value })}
                  placeholder="e.g. 500"
                  className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl font-medium focus:ring-2 focus:ring-primary/50 outline-none text-on-surface border border-outline-variant/20"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">
                  Sleep Pattern
                </label>
                <select
                  value={form.sleepSchedule}
                  onChange={e => setForm({ ...form, sleepSchedule: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl font-medium focus:ring-2 focus:ring-primary/50 outline-none text-on-surface border border-outline-variant/20"
                >
                  <option value="">Select…</option>
                  {SLEEP_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {/* Lifestyle tags */}
            <div className="mt-6 pt-4 border-t border-surface-container-low">
              <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-3">
                Lifestyle Tags <span className="normal-case font-normal">(describes you)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {LIFESTYLE_OPTIONS.map(opt => {
                  const selected = selectedLifestyles.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleLifestyle(opt)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${selected
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {selected && <span className="mr-1">✓</span>}
                      {opt}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-on-surface-variant mt-2 italic">
                These tags <strong>describe your lifestyle</strong>, not your matching priorities.
              </p>
            </div>
          </div>

          {/* Section 3: Compatibility Priorities */}
          <div className="glass p-6 md:p-8 rounded-2xl border border-white/40 shadow-lg">
            <h2 className="text-base font-bold text-on-surface mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">bar_chart</span>
              Compatibility Priorities
            </h2>
            <p className="text-xs text-on-surface-variant mb-5">
              Select <strong>exactly 3 different priorities</strong> in order of importance.
              These drive how your compatibility score is calculated.
            </p>

            {/* Weight legend */}
            <div className="flex flex-wrap gap-2 mb-5">
              {[['P1', '40%', 'bg-primary'], ['P2', '30%', 'bg-primary/70'], ['P3', '20%', 'bg-primary/40'], ['Rest', '10%', 'bg-surface-container-high']].map(([label, pct, bg]) => (
                <div key={label} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${bg} ${label === 'Rest' ? 'text-on-surface-variant' : 'text-white'}`}>
                  <span className="text-[10px] font-black">{label}</span>
                  <span className="text-[10px] font-bold opacity-80">{pct}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {[
                { slot: 'priority1', label: 'Priority 1', weight: '40%', accent: 'border-primary/40 bg-primary/5', badge: 'bg-primary text-white' },
                { slot: 'priority2', label: 'Priority 2', weight: '30%', accent: 'border-primary/30 bg-surface-container-low', badge: 'bg-primary/70 text-white' },
                { slot: 'priority3', label: 'Priority 3', weight: '20%', accent: 'border-outline-variant bg-surface-container-low', badge: 'bg-primary/40 text-white' },
              ].map(({ slot, label, weight, accent, badge }) => {
                const selected = form[slot];
                const meta = selected ? getPriorityMeta(selected) : null;
                return (
                  <div key={slot} className={`p-4 rounded-xl border ${accent} transition-all`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${badge}`}>
                        {label}
                      </span>
                      <span className="text-[11px] text-on-surface-variant font-medium">= {weight} of score</span>
                      {meta && (
                        <span className="ml-auto flex items-center gap-1 text-[11px] text-primary font-bold">
                          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>{meta.icon}</span>
                          {meta.label}
                        </span>
                      )}
                    </div>
                    <select
                      value={form[slot]}
                      onChange={e => setPriority(slot, e.target.value)}
                      className="w-full px-3 py-2.5 bg-surface-container-lowest rounded-lg font-medium focus:ring-2 focus:ring-primary/50 outline-none text-on-surface border border-outline-variant/20 text-sm"
                    >
                      <option value="">Select a priority…</option>
                      {availableFor(slot).map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label} — {opt.desc}</option>
                      ))}
                      {/* Always show currently selected even if "taken" by another slot */}
                      {selected && !availableFor(slot).find(o => o.value === selected) && (
                        <option value={selected}>{selected}</option>
                      )}
                    </select>
                  </div>
                );
              })}
            </div>

            {priorityError && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                {priorityError}
              </div>
            )}

            {form.priority1 && form.priority2 && form.priority3 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-xs flex items-center gap-2 font-medium">
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span>
                  Your priorities: <strong>{form.priority1}</strong> → <strong>{form.priority2}</strong> → <strong>{form.priority3}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Section 4: Linked Property */}
          <div className="glass p-6 md:p-8 rounded-2xl border border-white/40 shadow-lg">
            <h2 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">home</span>
              Linked Rental Property
            </h2>
            <select
              value={selectedPropertyId}
              onChange={e => setSelectedPropertyId(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl font-medium focus:ring-2 focus:ring-primary/50 outline-none text-on-surface border border-outline-variant/20 text-sm"
            >
              <option value="">No linked property</option>
              {approvedProperties.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title} — {p.city}, {p.state} (RM {p.monthlyRent}/mo)
                </option>
              ))}
            </select>
            {linkedProperty && (
              <p className="mt-2 text-xs text-on-surface-variant font-medium">
                Currently linked: <strong>{linkedProperty.title}</strong>
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Link
              to="/profile"
              className="bg-surface-container hover:bg-surface-container-high text-on-surface px-5 py-2.5 rounded-lg text-sm font-bold transition-all border border-outline-variant/20"
            >
              Cancel
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 px-6 py-2.5 rounded-lg text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  Saving…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">save</span>
                  Save Housemate Profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageHousemateProfilePage;
