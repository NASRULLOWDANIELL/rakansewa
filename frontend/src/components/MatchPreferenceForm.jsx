const MatchPreferenceForm = ({
  alwaysOpen = false,
  showForm,
  setShowForm,
  preferences,
  onPreferenceChange,
  onSubmit,
  isLoading,
}) => {
  const isFormVisible = alwaysOpen || showForm;

  return (
    <div className={`transition-all duration-300 ${alwaysOpen ? 'block' : ''}`}>
      {!alwaysOpen && (
        <div
          className="bg-surface-container-low p-6 rounded-t-lg flex justify-between items-center cursor-pointer border-b border-surface-container-high transition-colors hover:bg-surface-container"
          onClick={() => setShowForm(!showForm)}
          role="button"
          tabIndex={0}
          aria-expanded={showForm}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowForm(!showForm); }}
        >
          <div className="flex items-center gap-3 text-primary font-headline font-bold text-xl">
             <span className="material-symbols-outlined">psychology</span>
             <h3>Find Your Best Housemate Match</h3>
          </div>
          <button className="text-on-surface-variant flex items-center justify-center p-2 rounded-full hover:bg-surface-container-high transition-colors" aria-label="Toggle matching form">
            <span className="material-symbols-outlined">{showForm ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}</span>
          </button>
        </div>
      )}

      {isFormVisible && (
        <div className={`bg-surface-container-lowest p-8 ${!alwaysOpen ? 'rounded-b-lg border border-t-0 border-surface-container-low' : 'rounded-lg shadow-[0_20px_40px_-10px_rgba(25,28,30,0.04)]'} space-y-8`}>
          {!alwaysOpen && (
            <p className="text-on-surface-variant text-sm mb-6 leading-relaxed max-w-2xl">
              Tell us about your living preferences and we'll analyze compatibility metrics to find the most suitable housemates for this property.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Gender */}
            <div className="space-y-3">
              <label htmlFor="pref-gender" className="block text-sm font-bold text-on-surface-variant uppercase tracking-wider">Your Gender</label>
              <select
                id="pref-gender"
                value={preferences.gender}
                onChange={(e) => onPreferenceChange('gender', e.target.value)}
                className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 cursor-pointer text-on-surface"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Preferred Gender */}
            <div className="space-y-3">
              <label htmlFor="pref-preferred-gender" className="block text-sm font-bold text-on-surface-variant uppercase tracking-wider">Preferred Housemate Gender</label>
              <select
                id="pref-preferred-gender"
                value={preferences.preferredGender}
                onChange={(e) => onPreferenceChange('preferredGender', e.target.value)}
                className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 cursor-pointer text-on-surface"
              >
                <option value="Any">Any</option>
                <option value="Male Only">Male Only</option>
                <option value="Female Only">Female Only</option>
              </select>
            </div>

            {/* Budget */}
            <div className="space-y-3">
              <label htmlFor="pref-budget" className="block text-sm font-bold text-on-surface-variant uppercase tracking-wider">Max Budget (RM/mo)</label>
              <input
                id="pref-budget"
                type="number"
                placeholder="e.g. 800"
                value={preferences.maxBudget}
                onChange={(e) => onPreferenceChange('maxBudget', e.target.value)}
                className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-on-surface-variant/50"
              />
            </div>

            {/* Smoking */}
            <div className="space-y-3">
              <label htmlFor="pref-smoking" className="block text-sm font-bold text-on-surface-variant uppercase tracking-wider">Smoking Preference</label>
              <select
                id="pref-smoking"
                value={preferences.smokingPreference}
                onChange={(e) => onPreferenceChange('smokingPreference', e.target.value)}
                className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 cursor-pointer text-on-surface"
              >
                <option value="Non-Smoker">Non-Smoker</option>
                <option value="Smoker">Smoker</option>
                <option value="No Preference">No Preference</option>
              </select>
            </div>

            {/* Cleanliness */}
            <div className="space-y-3">
              <label htmlFor="pref-cleanliness" className="flex justify-between items-center text-sm font-bold text-on-surface-variant uppercase tracking-wider">
                <span>Cleanliness Level</span>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md">{preferences.cleanlinessLevel}/5</span>
              </label>
              <input
                id="pref-cleanliness"
                type="range"
                min="1"
                max="5"
                value={preferences.cleanlinessLevel}
                onChange={(e) => onPreferenceChange('cleanlinessLevel', e.target.value)}
                className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] uppercase font-bold text-on-surface-variant/70 tracking-widest mt-1">
                <span>Flexible</span><span>Strict</span>
              </div>
            </div>

            {/* Sleep Schedule */}
            <div className="space-y-3">
              <label htmlFor="pref-sleep" className="block text-sm font-bold text-on-surface-variant uppercase tracking-wider">Sleep Schedule</label>
              <select
                id="pref-sleep"
                value={preferences.sleepSchedule}
                onChange={(e) => onPreferenceChange('sleepSchedule', e.target.value)}
                className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 cursor-pointer text-on-surface"
              >
                <option value="Early Bird">Early Bird</option>
                <option value="Night Owl">Night Owl</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>

            {/* Social Level */}
            <div className="space-y-3">
              <label htmlFor="pref-social" className="flex justify-between items-center text-sm font-bold text-on-surface-variant uppercase tracking-wider">
                <span>Social Level</span>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md">{preferences.socialLevel}/5</span>
              </label>
              <input
                id="pref-social"
                type="range"
                min="1"
                max="5"
                value={preferences.socialLevel}
                onChange={(e) => onPreferenceChange('socialLevel', e.target.value)}
                className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] uppercase font-bold text-on-surface-variant/70 tracking-widest mt-1">
                <span>Introvert</span><span>Extrovert</span>
              </div>
            </div>

            {/* Occupation */}
            <div className="space-y-3">
              <label htmlFor="pref-occupation" className="block text-sm font-bold text-on-surface-variant uppercase tracking-wider">Occupation</label>
              <select
                id="pref-occupation"
                value={preferences.occupationType}
                onChange={(e) => onPreferenceChange('occupationType', e.target.value)}
                className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 cursor-pointer text-on-surface"
              >
                <option value="Student">Student</option>
                <option value="Working Professional">Working Professional</option>
              </select>
            </div>

            {/* Guest Tolerance */}
            <div className="space-y-3">
              <label htmlFor="pref-guests" className="block text-sm font-bold text-on-surface-variant uppercase tracking-wider">Guest Tolerance</label>
              <select
                id="pref-guests"
                value={preferences.guestTolerance}
                onChange={(e) => onPreferenceChange('guestTolerance', e.target.value)}
                className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 cursor-pointer text-on-surface"
              >
                <option value="Rarely">Rarely</option>
                <option value="Sometimes">Sometimes</option>
                <option value="Often">Often</option>
              </select>
            </div>

            {/* Noise Preference */}
            <div className="space-y-3">
              <label htmlFor="pref-noise" className="block text-sm font-bold text-on-surface-variant uppercase tracking-wider">Noise Preference</label>
              <select
                id="pref-noise"
                value={preferences.studyNoisePreference}
                onChange={(e) => onPreferenceChange('studyNoisePreference', e.target.value)}
                className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 cursor-pointer text-on-surface"
              >
                <option value="Silent">Silent</option>
                <option value="Low Noise">Low Noise</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-surface-container-low flex justify-end">
            <button
              className={`px-8 py-4 rounded-full font-headline font-bold text-lg tracking-tight transition-all duration-300 flex items-center gap-2 ${isLoading || !preferences.gender ? 'bg-surface-container-high text-on-surface-variant/50 cursor-not-allowed' : 'bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] hover:bg-primary-container hover:text-on-primary-container'}`}
              onClick={onSubmit}
              disabled={isLoading || !preferences.gender}
            >
              <span className="material-symbols-outlined">{isLoading ? 'hourglass_empty' : 'psychology'}</span>
              {isLoading ? 'Analyzing Profiles...' : 'Calculate Compatibility'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchPreferenceForm;
