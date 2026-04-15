const MatchResultCard = ({ result }) => {
  if (!result || !result.housemateProfile) return null;
  const match = result.housemateProfile;
  const isBest = result.matchLabel === 'Best Match';

  // Array of random placeholders since we don't have user images uploaded
  const placeholders = [
     "https://lh3.googleusercontent.com/aida-public/AB6AXuCPtiXK1B0J_8BPTtx2x8wxlc6cGhiIdNqG677lZ8Fp1JCpuI_0-Ub8JUz7BXQBmlc0tDybVnKioM6bkqskoBVVlaUGf2X5pYwN103hpyoV5IR_EmEXw25hp1rpjvuhBwcVzIicJOKBF44_7gp9Ed1wgvl2Cj9GkHH0g5usclaBmSPzvg5cnr3gnv_yfvdWwth8CYXp82FvJ7IKU4kNVWflbpEOnl56EI0aNzOXZR0LURfagmmgKxL1pCjoFLuz9dgW_RKNeaCkulva",
     "https://lh3.googleusercontent.com/aida-public/AB6AXuAkuhydBvn4-Tfn6sSZtJ99y_OWRcRU-9twmS7Qe97qm0RxkBpyKvhKEe7snzOnVULeI2ysLDOADAsTu4KRJp-HXDnTTXqa40Y58E72UmOg9DTT94goqhLII4N6T9W_AhfrRKY6YNA-CuPlKrDEHaQb2EtE5J8z4D0-TWMSuobfh2P6WWL8I2YsHCDL9MUqjgdo7F4OJ_TTlEJbkBwnV6PChGAsTLnf2LUd9E5Np6ccndqG7NY0czqX46wqzbU3MJtKqbdCOL51Imqd",
     "https://lh3.googleusercontent.com/aida-public/AB6AXuAKu6GLAi5J5eBvyAj3R1TdGAkIusUC6Zmy4J5PrQlsIELTE6As-Y94Czq1elqtJxua5xKPaELztsWIHj0LskD3p2EOGfKT4FxVDqW9gfzQyARY9xRZXQsGCXTAL3jd0u19FjRQrzOv6Yi_bL-QPr3qMDNCZKu0kHPYxgpO4lv3kdGrHjMevFzgjrLX49gzWNqldWzzN_JmwAi_71QI9ySh_hIpaaz5i1hsoJsrUS17YJKV3YJrsH_T9AVQW7mqlvUABKsqWpGCyNPX"
  ];
  const placeholderImage = placeholders[match.id % placeholders.length] || placeholders[0];

  return (
    <div className={`group relative flex flex-col bg-surface-container-lowest rounded-lg overflow-hidden shadow-[0_40px_60px_-10px_rgba(25,28,30,0.04)] hover:shadow-[0_50px_80px_-15px_rgba(0,88,190,0.08)] transition-all duration-500 ${isBest ? 'ring-4 ring-primary-container' : ''}`}>
      <div className="relative aspect-[4/3] overflow-hidden flex-shrink-0">
        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={match.name} src={placeholderImage} />
        
        {/* Adjusted badge for showing the compatibility score natively */}
        {result.compatibilityScore !== undefined && result.compatibilityScore !== null && (
          <div className="absolute top-4 right-4 bg-white/70 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-tertiary text-sm" style={{fontVariationSettings: "'FILL' 1"}}>favorite</span>
            <span className="font-headline font-bold text-on-surface text-sm">{result.compatibilityScore}%</span>
          </div>
        )}
        
        {isBest && (
          <div className="absolute top-4 left-4 bg-primary text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
             <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
             <span className="font-headline font-bold text-xs uppercase tracking-widest">{result.matchLabel}</span>
          </div>
        )}
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-1 flex items-center gap-2">
               {match.name} 
               <span className="text-xs font-medium text-on-surface-variant bg-surface-container py-1 px-2 rounded-md">{match.gender}, {match.age}</span>
            </h3>
            
            {match.property && match.property.title && (
              <p className="text-sm font-semibold text-primary mb-1 flex items-center gap-1">
                 <span className="material-symbols-outlined text-sm">home</span>
                 Staying at: {match.property.title}
              </p>
            )}

            <p className="text-on-surface-variant flex items-center gap-1 text-sm font-medium">
               <span className="material-symbols-outlined text-sm">payments</span>
               RM {match.budget} budget max
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-xs font-medium">
               <span className="material-symbols-outlined text-[14px]">work</span> {match.occupationType}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-xs font-medium">
               <span className="material-symbols-outlined text-[14px]">clean_hands</span> Clean: {match.cleanlinessLevel}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-xs font-medium">
               <span className="material-symbols-outlined text-[14px]">bedtime</span> {match.sleepSchedule}
            </div>
        </div>

        {result.reasons && result.reasons.length > 0 && (
           <div className="mb-6 space-y-1.5 border-t border-surface-container-low pt-4">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Why it's a match</p>
              <div className="flex flex-col gap-1">
                 {result.reasons.slice(0,3).map((reason, idx) => (
                    <span key={idx} className="flex items-center gap-2 text-sm text-primary">
                       <span className="material-symbols-outlined text-[14px]">check_circle</span> {reason}
                    </span>
                 ))}
                 {result.reasons.length > 3 && (
                   <span className="text-xs text-on-surface-variant pl-6">+{result.reasons.length - 3} more reasons</span>
                 )}
              </div>
           </div>
        )}

        <button className="mt-auto w-full py-3 bg-surface-container-high hover:bg-primary hover:text-white text-on-surface rounded-full font-bold transition-all duration-200">
             View Profile
        </button>
      </div>
    </div>
  );
};

export default MatchResultCard;
