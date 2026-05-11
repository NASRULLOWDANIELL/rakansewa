import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPropertyById, findHousemateMatches } from '../services/api';

import MatchPreferenceForm from '../components/MatchPreferenceForm';
import MatchResultsList from '../components/MatchResultsList';

const PropertyMatchPage = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Matching state
  const [matchResults, setMatchResults] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState(null);

  // Preference form state
  const [preferences, setPreferences] = useState({
    gender: '',
    preferredGender: 'Any',
    maxBudget: '',
    smokingPreference: 'Non-Smoker',
    cleanlinessLevel: 3,
    sleepSchedule: 'Flexible',
    socialLevel: 3,
    occupationType: 'Student',
    guestTolerance: 'Sometimes',
    studyNoisePreference: 'Low Noise',
  });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await getPropertyById(id);
        setProperty(data);
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Failed to load property details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handlePreferenceChange = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handleFindMatches = async () => {
    setMatchLoading(true);
    setMatchResults(null);
    setMatchError(null);
    try {
      const requestBody = {
        ...preferences,
        maxBudget: preferences.maxBudget ? parseFloat(preferences.maxBudget) : null,
        cleanlinessLevel: parseInt(preferences.cleanlinessLevel),
        socialLevel: parseInt(preferences.socialLevel),
      };
      const results = await findHousemateMatches(id, requestBody);
      setMatchResults(results);
    } catch (err) {
      console.error('Error finding matches:', err);
      setMatchError('Something went wrong while searching for matches. Please try again.');
      setMatchResults([]);
    } finally {
      setMatchLoading(false);
    }
  };

  const placeholderImage = `https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fHByb3BlcnR5fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60`;
  const resolveImg = (url) => url && url.startsWith('/uploads') ? `http://localhost:8080${url}` : url;
  const heroImage = resolveImg(property.imageUrl) || placeholderImage;

  // --- Loading / Error states ---
  if (loading) return <div className="text-center py-32 text-on-surface text-lg font-medium">Loading details...</div>;
  if (error || !property) return <div className="text-center py-32 text-error text-lg font-medium">{error || 'Property not found.'}</div>;

  return (
    <div className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Back navigation */}
      <header className="mb-12">
        <Link to={`/properties/${id}`} className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium mb-8">
          <span className="material-symbols-outlined">arrow_back</span> Back to Property
        </Link>
        <h1 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tighter text-on-surface mb-4">
          Find your <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-container">ideal</span> housemate.
        </h1>
        <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl leading-relaxed">
          Connect with students and young professionals based on lifestyle compatibility, not just proximity. Your academic sanctuary starts with the right partner.
        </p>
      </header>

      {/* Property summary hero card */}
      <div className="bg-surface-container-lowest p-4 rounded-xl flex flex-col md:flex-row gap-6 items-center shadow-[0_20px_40px_-5px_rgba(0,0,0,0.05)] border border-surface-container-low mb-12">
        <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
          <img src={heroImage} alt={property.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="text-xl font-bold font-headline">{property.title}</h3>
          <div className="flex items-center gap-1 text-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-base">location_on</span> {property.city}, {property.state}
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-secondary-container px-2 py-0.5 rounded-full text-xs font-semibold">{property.roomType}</span>
          </div>
        </div>
        <div className="text-right pr-4">
          <div className="text-2xl font-extrabold text-primary">RM {property.monthlyRent}</div>
          <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Per Month</div>
        </div>
      </div>

      {/* Preference form */}
      <MatchPreferenceForm
        alwaysOpen
        preferences={preferences}
        onPreferenceChange={handlePreferenceChange}
        onSubmit={handleFindMatches}
        isLoading={matchLoading}
      />

      {/* Error message */}
      {matchError && (
        <div className="bg-error-container text-on-error-container p-6 rounded-lg mt-8 flex items-center gap-3 font-semibold">
          <span className="material-symbols-outlined">error</span>
          {matchError}
        </div>
      )}

      {/* Results */}
      <MatchResultsList results={matchResults} isLoading={matchLoading} />
    </div>
  );
};

export default PropertyMatchPage;
