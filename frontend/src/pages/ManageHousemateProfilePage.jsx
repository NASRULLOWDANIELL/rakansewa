import { useState, useEffect } from 'react';
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

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [priorityError, setPriorityError] = useState('');

  const [approvedProperties, setApprovedProperties] = useState([]);
  const [linkedProperty, setLinkedProperty] = useState(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');

  const getUserPriorities = () => {
    const p1 = currentUser?.priority1;
    const p2 = currentUser?.priority2;
    const p3 = currentUser?.priority3;
    if (p1 && p2 && p3) return [p1, p2, p3];
    return [...DEFAULT_PRIORITIES];
  };

  const getLifestyleArray = (str) =>
    (str || '').split(',').map(s => s.trim()).filter(Boolean);

  const [form, setForm] = useState({
    isListedAsHousemate: currentUser?.isListedAsHousemate || false,
    budget: currentUser?.budget || '',
    sleepSchedule: currentUser?.sleepSchedule || '',
    lifestyle: currentUser?.lifestyle || '',
    priority1: '',
    priority2: '',
    priority3: '',
  });

  // Initialise priorities from user after mount
  useEffect(() => {
    const [p1, p2, p3] = getUserPriorities();
    setForm(f => ({ ...f, priority1: p1, priority2: p2, priority3: p3 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Fetch approved properties
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
  }, [currentUser]);

  const toggleLifestyle = (opt) => {
    const current = getLifestyleArray(form.lifestyle);
    const updated = current.includes(opt)
      ? current.filter(l => l !== opt)
      : [...current, opt];
    setForm({ ...form, lifestyle: updated.join(', ') });
  };

  /* ---- Priority selection helpers ---- */

  const setPriority = (slot, value) => {
    setPriorityError('');
    setForm(prev => {
      const next = { ...prev, [slot]: value };
      // Clear duplicates: if this value was already used in another slot, clear that slot
      if (slot !== 'priority1' && next.priority1 === value) next.priority1 = '';
      if (slot !== 'priority2' && next.priority2 === value) next.priority2 = '';
      if (slot !== 'priority3' && next.priority3 === value) next.priority3 = '';
      // Re-apply the selected value in the correct slot
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

  /* ---- Save ---- */

  const handleSave = async () => {
    setSaveError('');
    setPriorityError('');

    // Validate priorities
    if (!form.priority1 || !form.priority2 || !form.priority3) {
      setPriorityError('Please select exactly 3 different priorities before saving.');
      return;
    }
    const chosen = [form.priority1, form.priority2, form.priority3];
    if (new Set(chosen).size !== 3) {
      setPriorityError('Each priority must be different. Please resolve the duplicate.');
      return;
    }

    try {
      setSaving(true);

      // Link property first
      if (currentUser.id !== 999) {
        const propId = selectedPropertyId ? parseInt(selectedPropertyId) : null;
        const result = await linkUserToProperty(currentUser.id, propId);
        setLinkedProperty(result?.linkedProperty || null);
      }

      // Save profile (including priority fields)
      await updateProfile({
        ...currentUser,
        isListedAsHousemate: form.isListedAsHousemate,
        budget: form.budget ? parseFloat(form.budget) : null,
        sleepSchedule: form.sleepSchedule,
        lifestyle: form.lifestyle,
        priority1: form.priority1,
        priority2: form.priority2,
        priority3: form.priority3,
      });

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

  return (
    <div className="pt-28 pb-24 px-6 max-w-3xl mx-auto">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-8">
        <Link to="/profile" className="hover:text-primary transition-colors">Account</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="font-semibold text-on-surface">Manage Housemate Profile</span>
      </div>

      <h1 className="text-3xl font-extrabold font-headline text-on-surface mb-2">Housemate Profile</h1>
      <p className="text-on-surface-variant mb-10">
        Control how you appear on the housemate listing and how compatibility is calculated for you.
      </p>

      {/* Alerts */}
      {saveSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-800 animate-[fadeIn_0.3s_ease-out]">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <span className="font-medium">Saved! Redirecting to your profile…</span>
        </div>
      )}
      {saveError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 animate-[fadeIn_0.3s_ease-out]">
          <span className="material-symbols-outlined mt-0.5">error</span>
          <span className="flex-1">{saveError}</span>
          <button onClick={() => setSaveError('')}>
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      )}

      <div className="space-y-8">

        {/* ── Section 1: Listing Status ── */}
        <div className="glass p-8 rounded-2xl border border-white/40 shadow-lg">
          <h2 className="text-lg font-bold text-on-surface mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">visibility</span>
            Listing Status
          </h2>
          <label className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl cursor-pointer hover:bg-surface-container-high transition-colors">
            <input
              type="checkbox"
              checked={form.isListedAsHousemate}
              onChange={e => setForm({ ...form, isListedAsHousemate: e.target.checked })}
              className="w-5 h-5 accent-primary rounded border-2 border-primary cursor-pointer"
            />
            <div>
              <span className="font-bold text-on-surface block">List me as a housemate</span>
              <span className="text-xs text-on-surface-variant">You'll appear on the housemate listing page for others to find</span>
            </div>
            {form.isListedAsHousemate && (
              <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Listed</span>
            )}
          </label>
        </div>

        {/* ── Section 2: Basic Info ── */}
        <div className="glass p-8 rounded-2xl border border-white/40 shadow-lg">
          <h2 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
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
                className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl font-medium focus:ring-2 focus:ring-primary/50 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">
                Sleep Pattern
              </label>
              <select
                value={form.sleepSchedule}
                onChange={e => setForm({ ...form, sleepSchedule: e.target.value })}
                className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl font-medium focus:ring-2 focus:ring-primary/50 outline-none text-on-surface"
              >
                <option value="">Select…</option>
                {SLEEP_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Lifestyle tags */}
          <div className="mt-6">
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
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${selected
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
            <p className="text-xs text-on-surface-variant mt-2">
              These tags <strong>describe your lifestyle</strong>, not your matching priorities.
            </p>
          </div>
        </div>

        {/* ── Section 3: Compatibility Priorities ── */}
        <div className="glass p-8 rounded-2xl border border-white/40 shadow-lg">
          <h2 className="text-lg font-bold text-on-surface mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">bar_chart</span>
            Compatibility Priorities
          </h2>
          <p className="text-sm text-on-surface-variant mb-6">
            Select <strong>exactly 3 different priorities</strong> in order of importance.
            These drive how your compatibility score is calculated.
          </p>

          {/* Weight legend */}
          <div className="flex flex-wrap gap-3 mb-7">
            {[['P1', '40%', 'bg-primary/90'], ['P2', '30%', 'bg-primary/60'], ['P3', '20%', 'bg-primary/30'], ['Rest', '10%', 'bg-surface-container-high']].map(([label, pct, bg]) => (
              <div key={label} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${bg} ${label === 'Rest' ? 'text-on-surface-variant' : 'text-white'}`}>
                <span className="text-xs font-black">{label}</span>
                <span className="text-xs font-bold opacity-80">{pct}</span>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {[
              { slot: 'priority1', label: 'Priority 1', weight: '40%', accent: 'border-primary bg-primary/5', badge: 'bg-primary text-white' },
              { slot: 'priority2', label: 'Priority 2', weight: '30%', accent: 'border-primary/50 bg-primary/3', badge: 'bg-primary/70 text-white' },
              { slot: 'priority3', label: 'Priority 3', weight: '20%', accent: 'border-primary/30 bg-surface-container-low', badge: 'bg-primary/40 text-white' },
            ].map(({ slot, label, weight, accent, badge }) => {
              const selected = form[slot];
              const meta = selected ? getPriorityMeta(selected) : null;
              return (
                <div key={slot} className={`p-4 rounded-2xl border-2 ${accent} transition-all`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${badge}`}>
                      {label}
                    </span>
                    <span className="text-xs text-on-surface-variant font-medium">= {weight} of score</span>
                    {meta && (
                      <span className="ml-auto flex items-center gap-1.5 text-xs text-primary font-bold">
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>{meta.icon}</span>
                        {meta.label}
                      </span>
                    )}
                  </div>
                  <select
                    value={form[slot]}
                    onChange={e => setPriority(slot, e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl font-medium focus:ring-2 focus:ring-primary/50 outline-none text-on-surface"
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
            <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              {priorityError}
            </div>
          )}

          {form.priority1 && form.priority2 && form.priority3 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span>
                Your priorities: <strong>{form.priority1}</strong> → <strong>{form.priority2}</strong> → <strong>{form.priority3}</strong>
              </span>
            </div>
          )}
        </div>

        {/* ── Section 4: Linked Property ── */}
        <div className="glass p-8 rounded-2xl border border-white/40 shadow-lg">
          <h2 className="text-lg font-bold text-on-surface mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">home</span>
            Linked Rental Property
          </h2>
          <select
            value={selectedPropertyId}
            onChange={e => setSelectedPropertyId(e.target.value)}
            className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl font-medium focus:ring-2 focus:ring-primary/50 outline-none text-on-surface"
          >
            <option value="">No linked property</option>
            {approvedProperties.map(p => (
              <option key={p.id} value={p.id}>
                {p.title} — {p.city}, {p.state} (RM {p.monthlyRent}/mo)
              </option>
            ))}
          </select>
          {linkedProperty && (
            <p className="mt-2 text-xs text-on-surface-variant">
              Currently linked: <strong>{linkedProperty.title}</strong>
            </p>
          )}
        </div>

        {/* ── Actions ── */}
        <div className="flex justify-end gap-3 pt-2">
          <Link
            to="/profile"
            className="bg-surface-container hover:bg-surface-container-high text-on-surface px-6 py-3 rounded-full font-bold transition-all"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 px-8 py-3 rounded-full font-bold transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center gap-2"
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
  );
};

export default ManageHousemateProfilePage;
