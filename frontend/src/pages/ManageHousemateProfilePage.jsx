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

const MATCHING_TIPS = [
  'Honest preferences lead to better matches.',
  'Setting a realistic budget improves compatibility.',
  'Sleep schedule is the #1 source of housemate conflict.',
  'More lifestyle tags = more precise matching.',
  'Linked property helps others find you faster.',
];

const ManageHousemateProfilePage = () => {
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [priorityError, setPriorityError] = useState('');
  const [approvedProperties, setApprovedProperties] = useState([]);
  const [linkedProperty, setLinkedProperty] = useState(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [activeTip] = useState(() => Math.floor(Math.random() * MATCHING_TIPS.length));

  const formSeeded = useRef(false);

  const getLifestyleArray = (str) => (str || '').split(',').map(s => s.trim()).filter(Boolean);

  const resolvePriorities = (user) => {
    const p1 = user?.priority1, p2 = user?.priority2, p3 = user?.priority3;
    return (p1 && p2 && p3) ? [p1, p2, p3] : [...DEFAULT_PRIORITIES];
  };

  const [form, setForm] = useState(() => {
    const [p1, p2, p3] = resolvePriorities(currentUser);
    return {
      isListedAsHousemate: currentUser?.isListedAsHousemate ?? false,
      budget: currentUser?.budget ?? '',
      sleepSchedule: currentUser?.sleepSchedule ?? '',
      lifestyle: currentUser?.lifestyle ?? '',
      priority1: p1, priority2: p2, priority3: p3,
    };
  });

  useEffect(() => {
    if (!currentUser || formSeeded.current) return;
    formSeeded.current = true;
    const [p1, p2, p3] = resolvePriorities(currentUser);
    setForm({
      isListedAsHousemate: currentUser.isListedAsHousemate ?? false,
      budget: currentUser.budget ?? '',
      sleepSchedule: currentUser.sleepSchedule ?? '',
      lifestyle: currentUser.lifestyle ?? '',
      priority1: p1, priority2: p2, priority3: p3,
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
    const updated = current.includes(opt) ? current.filter(l => l !== opt) : [...current, opt];
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

  const getPriorityMeta = (value) => PRIORITY_OPTIONS.find(o => o.value === value);

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
          setSaveError('Note: property link could not be updated, but other settings will be saved.');
        }
      }

      const savedUser = await updateProfile({
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        phoneNumber: currentUser.phoneNumber,
        matricNumber: currentUser.matricNumber,
        uitmEmail: currentUser.uitmEmail,
        authProvider: currentUser.authProvider,
        isListedAsHousemate: form.isListedAsHousemate,
        budget: form.budget ? parseFloat(form.budget) : null,
        sleepSchedule: form.sleepSchedule || null,
        lifestyle: form.lifestyle || null,
        priority1: form.priority1,
        priority2: form.priority2,
        priority3: form.priority3,
      });

      if (savedUser) {
        const [p1, p2, p3] = resolvePriorities(savedUser);
        setForm(prev => ({ ...prev, priority1: p1, priority2: p2, priority3: p3 }));
      }

      setSaveSuccess(true);
      setTimeout(() => { setSaveSuccess(false); navigate('/profile'); }, 1800);
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
  const matchedProp = approvedProperties.find(p => p.id.toString() === selectedPropertyId);

  const PRIORITY_SLOTS = [
    { slot: 'priority1', label: 'Priority 1', weight: '40%', barWidth: 'w-full', barColor: 'bg-primary' },
    { slot: 'priority2', label: 'Priority 2', weight: '30%', barWidth: 'w-3/4', barColor: 'bg-primary/70' },
    { slot: 'priority3', label: 'Priority 3', weight: '20%', barWidth: 'w-1/2', barColor: 'bg-primary/40' },
  ];

  return (
    <div className="rs-page pb-20">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-6">
          <Link to="/profile" className="hover:text-primary transition-colors font-medium">Account</Link>
          <span className="material-symbols-outlined text-sm text-gray-300">chevron_right</span>
          <span className="font-semibold text-on-surface">Housemate Profile</span>
        </nav>

        {/* Alerts */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 animate-fade-in">
            <span className="material-symbols-outlined text-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <span className="font-semibold text-sm">Saved! Redirecting to your profile…</span>
          </div>
        )}
        {saveError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 animate-fade-in">
            <span className="material-symbols-outlined text-red-500 mt-0.5">error</span>
            <span className="flex-1 text-sm">{saveError}</span>
            <button onClick={() => setSaveError('')} className="text-red-500 hover:text-red-700">
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── RIGHT COLUMN: Live Preview Card ── */}
          <div className="lg:col-span-1 lg:order-2 space-y-4">

            {/* Live Profile Preview Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-rs-md overflow-hidden">
              {/* Card top gradient */}
              <div className="bg-gradient-to-br from-primary to-blue-600 p-5 pb-8 relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">Live Preview</p>
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl font-black border border-white/30">
                      {currentUser.name.charAt(0)}
                    </div>
                  </div>
                  {form.isListedAsHousemate ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-400/30 border border-emerald-300/50 text-white text-[10px] font-bold rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 border border-white/20 text-white/70 text-[10px] font-bold rounded-full">
                      Hidden
                    </span>
                  )}
                </div>
              </div>

              {/* Card body */}
              <div className="px-5 -mt-4 pb-5">
                <div className="bg-white rounded-xl border border-gray-100 shadow-rs-sm px-4 py-3 mb-4">
                  <h3 className="font-bold text-on-surface text-base font-headline">{currentUser.name}</h3>
                  <p className="text-xs text-on-surface-variant">{currentUser.email}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="text-[10px] px-2 py-0.5 bg-primary/8 text-primary rounded-full font-bold" style={{ background: 'rgba(0,88,190,0.06)' }}>{currentUser.role}</span>
                    {isStudent && currentUser.isStudentVerified && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-bold border border-emerald-200">
                        <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Budget */}
                {form.budget && (
                  <div className="text-center py-2 mb-3 bg-primary/5 rounded-lg border border-primary/10">
                    <span className="text-lg font-black text-primary">RM {form.budget}</span>
                    <span className="text-xs text-on-surface-variant font-medium">/month budget</span>
                  </div>
                )}

                {/* Lifestyle tags preview */}
                {selectedLifestyles.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {selectedLifestyles.map(tag => (
                      <span key={tag} className="text-[10px] px-2.5 py-1 bg-primary/8 text-primary rounded-full font-bold" style={{ background: 'rgba(0,88,190,0.06)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Sleep schedule */}
                {form.sleepSchedule && (
                  <div className="flex items-center gap-1.5 mb-3 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-xs">bedtime</span>
                    <span className="font-medium">{form.sleepSchedule}</span>
                  </div>
                )}

                {/* Priorities */}
                <div className="space-y-1.5 mb-3">
                  {PRIORITY_SLOTS.map(({ slot, label, barColor }) => {
                    const val = form[slot];
                    const meta = val ? getPriorityMeta(val) : null;
                    return meta ? (
                      <div key={slot} className="flex items-center gap-2 text-xs">
                        <span className="material-symbols-outlined text-primary text-[12px]">{meta.icon}</span>
                        <span className="text-on-surface-variant flex-1">{meta.label}</span>
                        <div className={`w-8 h-1 rounded-full ${barColor}`} />
                      </div>
                    ) : null;
                  })}
                </div>

                {/* Linked property */}
                {matchedProp ? (
                  <div className="p-2.5 bg-primary/5 border border-primary/10 rounded-lg">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[10px]">home</span> Linked
                    </p>
                    <p className="text-xs font-semibold text-on-surface line-clamp-1">{matchedProp.title}</p>
                    <p className="text-[10px] text-on-surface-variant">{matchedProp.city}</p>
                  </div>
                ) : (
                  <p className="text-xs text-on-surface-variant italic text-center py-1">No property linked</p>
                )}
              </div>
            </div>

            {/* Profile Status Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-rs-sm">
              <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Profile Status</h4>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant">Visibility</span>
                  {form.isListedAsHousemate ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Listed & Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-on-surface-variant">
                      <span className="w-2 h-2 rounded-full bg-gray-300" />
                      Hidden
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant">Verification</span>
                  {isStudent && currentUser.isStudentVerified ? (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      UiTM Verified
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">info</span>
                      Unverified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Matching Tips */}
            <div className="bg-gradient-to-br from-primary/5 to-blue-50 rounded-2xl border border-primary/15 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                <p className="text-xs font-bold text-primary uppercase tracking-widest">Matching Tip</p>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {MATCHING_TIPS[activeTip]}
              </p>
            </div>
          </div>

          {/* ── LEFT COLUMN: Forms ── */}
          <div className="lg:col-span-2 lg:order-1 space-y-5">

            <div>
              <h1 className="text-2xl font-black font-headline text-on-surface mb-1">Housemate Profile</h1>
              <p className="text-sm text-on-surface-variant">
                Control how you appear in the matching system and set your compatibility criteria.
              </p>
            </div>

            {/* Section 1: Listing Visibility */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-rs-sm p-6">
              <h2 className="font-bold text-on-surface mb-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">visibility</span>
                Listing Visibility
              </h2>
              <p className="text-xs text-on-surface-variant mb-4">Toggle this to appear on the housemate listing page.</p>
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors border border-gray-100">
                <div>
                  <p className="font-semibold text-on-surface text-sm">List me as a housemate</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">You'll appear in the housemate listing for others to find</p>
                </div>
                <div className="flex items-center gap-2">
                  {form.isListedAsHousemate && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Active</span>
                  )}
                  <label className="rs-toggle">
                    <input
                      type="checkbox"
                      checked={form.isListedAsHousemate}
                      onChange={e => setForm({ ...form, isListedAsHousemate: e.target.checked })}
                    />
                    <span className="rs-toggle-slider" />
                  </label>
                </div>
              </label>
            </div>

            {/* Section 2: Basic Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-rs-sm p-6">
              <h2 className="font-bold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">person</span>
                Basic Preferences
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                    Monthly Budget (RM)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-on-surface-variant">RM</span>
                    <input
                      type="number"
                      value={form.budget}
                      onChange={e => setForm({ ...form, budget: e.target.value })}
                      placeholder="e.g. 500"
                      className="rs-input pl-10 text-sm"
                      style={{ paddingLeft: '40px' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                    Sleep Pattern
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {SLEEP_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setForm({ ...form, sleepSchedule: form.sleepSchedule === opt ? '' : opt })}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                          form.sleepSchedule === opt
                            ? 'bg-primary text-white shadow-rs-blue'
                            : 'bg-gray-100 text-on-surface-variant hover:bg-gray-200'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">
                  Lifestyle Tags <span className="normal-case font-normal text-on-surface-variant">(select all that describe you)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {LIFESTYLE_OPTIONS.map(opt => {
                    const selected = selectedLifestyles.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleLifestyle(opt)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                          selected
                            ? 'bg-primary text-white shadow-rs-blue'
                            : 'bg-gray-100 text-on-surface-variant hover:bg-gray-200'
                        }`}
                      >
                        {selected && <span className="mr-1">✓</span>}
                        {opt}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-on-surface-variant mt-2 italic">
                  These tags describe your lifestyle, not your matching priorities.
                </p>
              </div>
            </div>

            {/* Section 3: Matching Priorities */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-rs-sm p-6">
              <h2 className="font-bold text-on-surface mb-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">bar_chart</span>
                Compatibility Priorities
              </h2>
              <p className="text-xs text-on-surface-variant mb-5">
                Choose 3 things in order of importance. These drive how your match score is calculated.
              </p>

              {/* Weight visual */}
              <div className="flex gap-2 mb-5 flex-wrap">
                {[['P1', '40%', 'bg-primary text-white'], ['P2', '30%', 'bg-primary/70 text-white'], ['P3', '20%', 'bg-primary/40 text-white'], ['Others', '10%', 'bg-gray-100 text-on-surface-variant']].map(([label, pct, style]) => (
                  <div key={label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${style}`}>
                    <span className="text-[10px] font-black">{label}</span>
                    <span className="text-[10px] font-bold opacity-80">{pct}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {PRIORITY_SLOTS.map(({ slot, label, weight }) => {
                  const selected = form[slot];
                  const meta = selected ? getPriorityMeta(selected) : null;
                  const colors = {
                    priority1: 'border-primary/30 bg-primary/4',
                    priority2: 'border-primary/20 bg-primary/2',
                    priority3: 'border-gray-200 bg-gray-50/50',
                  };
                  const badgeColors = {
                    priority1: 'bg-primary text-white',
                    priority2: 'bg-primary/70 text-white',
                    priority3: 'bg-primary/40 text-white',
                  };
                  return (
                    <div
                      key={slot}
                      className={`p-4 rounded-xl border transition-all`}
                      style={{
                        borderColor: slot === 'priority1' ? 'rgba(0,88,190,0.3)' : slot === 'priority2' ? 'rgba(0,88,190,0.2)' : '#e5e7eb',
                        background: slot === 'priority1' ? 'rgba(0,88,190,0.03)' : '#f9fafb',
                      }}
                    >
                      <div className="flex items-center gap-3 mb-2.5">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${badgeColors[slot]}`}>
                          {label}
                        </span>
                        <span className="text-[11px] text-on-surface-variant font-medium">= {weight} of score</span>
                        {meta && (
                          <span className="ml-auto flex items-center gap-1 text-[11px] text-primary font-bold">
                            <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>{meta.icon}</span>
                            {meta.label}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <select
                          value={form[slot]}
                          onChange={e => setPriority(slot, e.target.value)}
                          className="rs-select text-sm pr-8"
                          style={{ paddingRight: '32px' }}
                        >
                          <option value="">Select a priority…</option>
                          {availableFor(slot).map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label} — {opt.desc}</option>
                          ))}
                          {selected && !availableFor(slot).find(o => o.value === selected) && (
                            <option value={selected}>{selected}</option>
                          )}
                        </select>
                        <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant pointer-events-none">expand_more</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {priorityError && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold animate-fade-in">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  {priorityError}
                </div>
              )}

              {form.priority1 && form.priority2 && form.priority3 && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-medium animate-fade-in">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span>Priorities set: <strong>{form.priority1}</strong> → <strong>{form.priority2}</strong> → <strong>{form.priority3}</strong></span>
                </div>
              )}
            </div>

            {/* Section 4: Linked Property */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-rs-sm p-6">
              <h2 className="font-bold text-on-surface mb-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">home</span>
                Linked Rental Property
              </h2>
              <p className="text-xs text-on-surface-variant mb-4">
                Link your profile to the property where you currently live or plan to stay.
              </p>
              <div className="relative">
                <select
                  value={selectedPropertyId}
                  onChange={e => setSelectedPropertyId(e.target.value)}
                  className="rs-select text-sm pr-8"
                  style={{ paddingRight: '32px' }}
                >
                  <option value="">No linked property</option>
                  {approvedProperties.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} — {p.city}, {p.state} (RM {p.monthlyRent}/mo)
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant pointer-events-none">expand_more</span>
              </div>

              {matchedProp && (
                <div className="mt-3 flex items-center gap-3 p-3 bg-primary/5 border border-primary/15 rounded-xl">
                  <span className="material-symbols-outlined text-primary text-base">home</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-on-surface truncate">{matchedProp.title}</p>
                    <p className="text-xs text-on-surface-variant">{matchedProp.city}, {matchedProp.state} · RM {matchedProp.monthlyRent}/mo</p>
                  </div>
                </div>
              )}
            </div>

            {/* Save Actions */}
            <div className="flex items-center justify-between pt-2">
              <Link
                to="/profile"
                className="rs-btn-ghost text-sm py-2.5 px-5"
              >
                Discard Changes
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rs-btn-primary text-sm py-2.5 px-6 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="btn-spinner" />
                    Saving…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">save</span>
                    Save Preferences
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageHousemateProfilePage;
