import { useEffect, useState } from 'react';
import { getProperties, approveProperty, rejectProperty, getAllUsers, getAllFeedbacks, resolveFeedback } from '../services/api';
import RejectModal from '../components/RejectModal';

const AdminDashboard = () => {
   const [properties, setProperties] = useState([]);
   const [users, setUsers] = useState([]);
   const [feedbacks, setFeedbacks] = useState([]);
   const [loading, setLoading] = useState(true);
   const [activeTab, setActiveTab] = useState('properties');
   const [rejectTarget, setRejectTarget] = useState(null); // property being rejected
   const [expandedFeedbacks, setExpandedFeedbacks] = useState({}); // track expanded feedback messages

   useEffect(() => {
      fetchData();
   }, []);

   const fetchData = async () => {
      try {
         const [props, usrs, fdks] = await Promise.all([getProperties(), getAllUsers(), getAllFeedbacks()]);
         setProperties(props || []);
         setUsers(usrs || []);
         setFeedbacks(fdks || []);
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
   };

   const handleApprove = async (property) => {
      try {
         await approveProperty(property.id);
         fetchData();
      } catch (error) {
         console.error(error);
      }
   };

   const handleRejectConfirm = async (reason) => {
      if (!rejectTarget) return;
      try {
         await rejectProperty(rejectTarget.id, reason);
         fetchData();
      } catch (error) {
         console.error(error);
      }
      setRejectTarget(null);
   };

   const handleResolveFeedback = async (id) => {
      try {
         await resolveFeedback(id);
         fetchData();
      } catch (err) {
         console.error(err);
      }
   };

   const toggleFeedbackExpand = (id) => {
      setExpandedFeedbacks(prev => ({
         ...prev,
         [id]: !prev[id]
      }));
   };

   // Build user map for feedback enrichment
   const userMap = {};
   users.forEach(u => { userMap[u.id] = u; });

   if (loading) return <div className="text-center py-32 text-on-surface">Loading data...</div>;

   const pendingApprovals = properties.filter(p => p.approvalStatus === 'Pending');

   return (
      <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto space-y-8">
         {/* Rejection Modal */}
         <RejectModal
            isOpen={rejectTarget !== null}
            propertyTitle={rejectTarget?.title || ''}
            onConfirm={handleRejectConfirm}
            onCancel={() => setRejectTarget(null)}
         />

         <div>
            <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface mb-2">Admin Dashboard</h1>
            <p className="text-on-surface-variant">System overview and approval queue.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass p-6 rounded-2xl shadow-sm border border-white/40 border-l-4 border-l-primary">
               <h3 className="text-on-surface-variant font-bold uppercase tracking-widest text-xs mb-2">Total Users</h3>
               <p className="text-4xl font-extrabold text-on-surface">{users.length}</p>
            </div>
            <div className="glass p-6 rounded-2xl shadow-sm border border-white/40 border-l-4 border-l-tertiary">
               <h3 className="text-on-surface-variant font-bold uppercase tracking-widest text-xs mb-2">Total Listings</h3>
               <p className="text-4xl font-extrabold text-on-surface">{properties.length}</p>
            </div>
            <div className="glass p-6 rounded-2xl shadow-sm border border-white/40 border-l-4 border-l-orange-500">
               <h3 className="text-on-surface-variant font-bold uppercase tracking-widest text-xs mb-2">Pending Approvals</h3>
               <p className="text-4xl font-extrabold text-on-surface">{pendingApprovals.length}</p>
            </div>
         </div>

         <div className="flex gap-4 border-b border-surface-container-low overflow-x-auto">
            <button onClick={() => setActiveTab('properties')} className={`pb-4 font-bold whitespace-nowrap ${activeTab === 'properties' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant'}`}>
               Property Listings
            </button>
            <button onClick={() => setActiveTab('users')} className={`pb-4 font-bold whitespace-nowrap ${activeTab === 'users' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant'}`}>
               User Management
            </button>
            <button onClick={() => setActiveTab('feedbacks')} className={`pb-4 font-bold whitespace-nowrap flex items-center gap-2 ${activeTab === 'feedbacks' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant'}`}>
               User Feedback
               {feedbacks.filter(f => !f.isResolved).length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-error text-white text-[10px]">{feedbacks.filter(f => !f.isResolved).length}</span>
               )}
            </button>
         </div>

         {activeTab === 'properties' && (
            <div className="space-y-6">
               <h2 className="text-2xl font-bold font-headline">Pending Approvals ({pendingApprovals.length})</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingApprovals.length === 0 && <p className="text-on-surface-variant">All caught up!</p>}
                  {pendingApprovals.map(p => (
                     <div key={p.id} className="bg-surface-container-low p-6 rounded-2xl border border-surface-container-high">
                        {/* Property image thumbnail */}
                        {p.imageUrl && (
                           <div className="h-36 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-2xl">
                              <img src={p.imageUrl.startsWith('/uploads') ? `http://localhost:8080${p.imageUrl}` : p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                           </div>
                        )}
                        <h3 className="text-xl font-bold mb-1">{p.title}</h3>
                        <p className="text-sm text-on-surface-variant mb-2">{p.city}, {p.state}</p>
                        <p className="text-xs text-on-surface-variant mb-4 line-clamp-2">{p.description}</p>
                        <div className="bg-white p-3 rounded-lg mb-4 text-sm font-medium flex justify-between items-center">
                           <span>RM {p.monthlyRent}</span>
                           <span className="text-on-surface-variant">{p.propertyType} · {p.roomType}</span>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => handleApprove(p)} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-colors">Approve</button>
                           <button onClick={() => setRejectTarget(p)} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition-colors">Reject</button>
                        </div>
                     </div>
                  ))}
               </div>

               <h2 className="text-2xl font-bold font-headline mt-12">All Properties</h2>
               <div className="bg-white rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden text-sm">
                  <table className="w-full text-left">
                     <thead className="bg-surface-container-low text-on-surface-variant uppercase text-xs font-bold tracking-widest border-b border-outline-variant/20">
                        <tr>
                           <th className="px-6 py-4">Title</th>
                           <th className="px-6 py-4">Location</th>
                           <th className="px-6 py-4">Rent</th>
                           <th className="px-6 py-4">Status</th>
                           <th className="px-6 py-4">Reason</th>
                        </tr>
                     </thead>
                     <tbody>
                        {properties.map(p => (
                           <tr key={p.id} className="border-b border-outline-variant/10 hover:bg-surface-container-lowest">
                              <td className="px-6 py-4 font-medium">{p.title}</td>
                              <td className="px-6 py-4">{p.city}, {p.state}</td>
                              <td className="px-6 py-4 text-primary font-bold">RM{p.monthlyRent}</td>
                              <td className="px-6 py-4">
                                 <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${p.approvalStatus === 'Pending' ? 'bg-orange-100 text-orange-700' :
                                       p.approvalStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                                          'bg-red-100 text-red-700'
                                    }`}>
                                    {p.approvalStatus}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-on-surface-variant text-xs max-w-[200px] truncate">
                                 {p.rejectionReason || '—'}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {activeTab === 'users' && (
            <div className="bg-white rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden text-sm">
               <table className="w-full text-left">
                  <thead className="bg-surface-container-low text-on-surface-variant uppercase text-xs font-bold tracking-widest border-b border-outline-variant/20">
                     <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Role</th>
                     </tr>
                  </thead>
                  <tbody>
                     {users.map(u => (
                        <tr key={u.id} className="border-b border-outline-variant/10 hover:bg-surface-container-lowest">
                           <td className="px-6 py-4 font-bold">{u.name}</td>
                           <td className="px-6 py-4">{u.email}</td>
                           <td className="px-6 py-4">
                              <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-bold text-xs">
                                 {u.role}
                              </span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}

         {activeTab === 'feedbacks' && (
            <div className="space-y-4">
               {feedbacks.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-outline-variant/20">
                     <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-2 block">feedback</span>
                     <p className="text-on-surface-variant">No feedback submitted yet.</p>
                  </div>
               ) : (
                  feedbacks.map(f => {
                     const isExpanded = expandedFeedbacks[f.id] || false;
                     const isLongMessage = f.message && f.message.length > 200;
                     const feedbackUser = f.userId ? userMap[f.userId] : null;
                     
                     return (
                        <div 
                           key={f.id} 
                           className={`rounded-xl shadow-sm border overflow-hidden transition-all ${
                              f.isResolved 
                                 ? 'bg-surface-container-lowest border-outline-variant/10 opacity-75' 
                                 : 'bg-white border-outline-variant/20'
                           }`}
                        >
                           {/* Top row: category, status, date, action */}
                           <div className={`px-6 py-3 flex flex-wrap items-center gap-3 border-b ${
                              f.isResolved ? 'bg-green-50/50 border-green-100' : 'bg-surface-container-lowest border-outline-variant/10'
                           }`}>
                              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                 f.category === 'Report' ? 'bg-red-100 text-red-700' :
                                 f.category === 'Suggestion' ? 'bg-blue-100 text-blue-700' :
                                 'bg-surface-container-high text-on-surface'
                              }`}>
                                 {f.category}
                              </span>

                              <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md ${
                                 f.isResolved 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-orange-100 text-orange-700'
                              }`}>
                                 <span className="material-symbols-outlined text-[14px]">
                                    {f.isResolved ? 'check_circle' : 'pending'}
                                 </span>
                                 {f.isResolved ? 'Resolved' : 'Pending'}
                              </span>

                              <span className="text-xs text-on-surface-variant flex items-center gap-1">
                                 <span className="material-symbols-outlined text-[14px]">schedule</span>
                                 {new Date(f.createdAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                                 {' '}
                                 {new Date(f.createdAt).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })}
                              </span>

                              <div className="ml-auto">
                                 {!f.isResolved && (
                                    <button
                                       onClick={() => handleResolveFeedback(f.id)}
                                       className="text-xs bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap flex items-center gap-1.5"
                                    >
                                       <span className="material-symbols-outlined text-[14px]">check</span>
                                       Mark Resolved
                                    </button>
                                 )}
                              </div>
                           </div>

                           {/* Body */}
                           <div className="px-6 py-4">
                              {/* User info row */}
                              <div className="flex items-center gap-2 mb-3">
                                 <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-sm text-on-primary-fixed font-bold uppercase flex-shrink-0">
                                    {(f.userName || feedbackUser?.name || '?').charAt(0)}
                                 </div>
                                 <div className="min-w-0">
                                    <span className="text-sm font-bold text-on-surface block truncate">
                                       {f.userName || feedbackUser?.name || `User #${f.userId}`}
                                    </span>
                                    {(feedbackUser?.email) && (
                                       <span className="text-xs text-on-surface-variant truncate block">{feedbackUser.email}</span>
                                    )}
                                 </div>
                              </div>

                              {/* Subject */}
                              {f.subject && (
                                 <h4 className="font-bold text-on-surface mb-2">{f.subject}</h4>
                              )}

                              {/* Feedback message with Read More / Show Less */}
                              <div 
                                 className="text-sm text-on-surface-variant leading-relaxed"
                                 style={{
                                    whiteSpace: 'normal',
                                    wordBreak: 'break-word',
                                    overflowWrap: 'anywhere'
                                 }}
                              >
                                 {isLongMessage && !isExpanded ? (
                                    <>
                                       {f.message.substring(0, 200)}...
                                       <button
                                          onClick={() => toggleFeedbackExpand(f.id)}
                                          className="ml-1 text-primary font-bold hover:underline text-xs"
                                       >
                                          Read More
                                       </button>
                                    </>
                                 ) : (
                                    <>
                                       {f.message}
                                       {isLongMessage && (
                                          <button
                                             onClick={() => toggleFeedbackExpand(f.id)}
                                             className="ml-1 text-primary font-bold hover:underline text-xs"
                                          >
                                             Show Less
                                          </button>
                                       )}
                                    </>
                                 )}
                              </div>
                           </div>
                        </div>
                     );
                  })
               )}
            </div>
         )}
      </div>
   );
};

export default AdminDashboard;
