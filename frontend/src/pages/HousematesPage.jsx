import { useEffect, useState } from 'react';
import { getAllHousemates } from '../services/api';
import MatchPreferenceForm from '../components/MatchPreferenceForm';
import MatchResultCard from '../components/MatchResultCard';
import { calculateCompatibility } from '../utils/matchingLogic';

const HousematesPage = () => {
  const defaultPreferences = {
    gender: '',
    preferredGender: 'Any',
    maxBudget: '',
    smokingPreference: 'No Preference',
    cleanlinessLevel: '3',
    sleepSchedule: 'Flexible',
    socialLevel: '3',
    occupationType: 'Student',
    guestTolerance: 'Sometimes',
    studyNoisePreference: 'Flexible',
  };

  const [housemates, setHousemates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [showPreferences, setShowPreferences] = useState(true);
  const [calculatedMatches, setCalculatedMatches] = useState(null);

  useEffect(() => {
    const fetchHousemates = async () => {
      try {
        const data = await getAllHousemates();
        setHousemates(data || []);
        
        // Show by default without hard filtering if no manual calculate yet
        const initialMatches = (data || []).map(hm => calculateCompatibility(defaultPreferences, hm) || {
           housemateProfile: hm,
           compatibilityScore: null,
           matchLabel: 'Unmatched',
           reasons: []
        });
        setCalculatedMatches(initialMatches);
      } catch (err) {
        console.error('Error fetching housemates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHousemates();
  }, []);

  const handlePreferenceChange = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handleCalculate = () => {
    
    const matches = [];
    housemates.forEach(hm => {
      const matchData = calculateCompatibility(preferences, hm) || {
         housemateProfile: hm,
         compatibilityScore: null,
         matchLabel: 'Unmatched',
         reasons: []
      };
      matches.push(matchData);
    });
    
    // Sort automatically by compatibility score (nulls at bottom)
    matches.sort((a, b) => {
       const scoreA = a.compatibilityScore || 0;
       const scoreB = b.compatibilityScore || 0;
       return scoreB - scoreA;
    });
    setCalculatedMatches(matches);
    setShowPreferences(false);
  };

  if (loading) return <div className="text-center py-32 text-on-surface text-lg font-medium">Loading housemates...</div>;

  return (
    <div className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface mb-4">Find Compatible Housemates</h1>
        <p className="text-on-surface-variant text-lg">Set your preferences to see who matches your lifestyle best.</p>
      </div>

      <div className="mb-12">
        <MatchPreferenceForm
          alwaysOpen={false}
          showForm={showPreferences}
          setShowForm={setShowPreferences}
          preferences={preferences}
          onPreferenceChange={handlePreferenceChange}
          onSubmit={handleCalculate}
          isLoading={false}
        />
      </div>

      <div>
        {calculatedMatches === null ? (
          <div className="text-center py-20 glass rounded-xl border border-white/40">
            <span className="material-symbols-outlined text-6xl text-primary/30 mb-4 block">groups</span>
            <h3 className="text-xl font-bold text-on-surface mb-2">Configure Preferences</h3>
            <p className="text-on-surface-variant">Update your matching preferences above to filter and rank housemates.</p>
          </div>
        ) : (
          <div>
            <div className="mb-6 flex justify-between items-end border-b border-surface-container-low pb-4">
              <h2 className="text-2xl font-bold font-headline text-on-surface">Compatibile Housemates</h2>
              <span className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">{calculatedMatches.length} Found</span>
            </div>
            
            {calculatedMatches.length === 0 ? (
              <div className="text-center py-16 bg-surface-container-lowest rounded-xl border-2 border-dashed border-outline-variant/30">
                <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">search_off</span>
                <p className="text-on-surface-variant font-medium">No housemates perfectly match your strict preferences.</p>
                <button onClick={() => setShowPreferences(true)} className="mt-4 text-primary font-bold hover:underline">Adjust Criteria</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {calculatedMatches.map((match) => (
                  <MatchResultCard key={match.housemateProfile.id} result={match} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HousematesPage;
