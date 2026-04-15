import MatchResultCard from './MatchResultCard';

/**
 * MatchResultsList — Displays the list of matching results (or empty/loading states).
 */
const MatchResultsList = ({ results, isLoading }) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4" />
        <p className="text-lg font-medium text-on-surface-variant">Analyzing compatibility metrics...</p>
      </div>
    );
  }

  // Not yet searched
  if (results === null) return null;

  // Empty results
  if (results.length === 0) {
    return (
      <div className="py-24 text-center">
        <span className="material-symbols-outlined text-6xl text-outline mb-4">search_off</span>
        <h3 className="text-2xl font-bold text-on-surface mb-2">No matches found</h3>
        <p className="text-on-surface-variant max-w-sm mx-auto">Try adjusting your preferences (like budget or smoking preference) to broaden the search pool.</p>
      </div>
    );
  }

  // Results
  return (
    <div className="mt-20">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-3xl font-headline font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl">psychology</span> Top Matches
        </h3>
        <span className="bg-primary/10 text-primary font-bold px-4 py-1.5 rounded-full text-sm">
          {results.length} Profile{results.length !== 1 ? 's' : ''} Found
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {results.map((match) => (
          <MatchResultCard key={match.housemateId} match={match} />
        ))}
      </div>
    </div>
  );
};

export default MatchResultsList;
