import { useEffect, useState } from 'react';
import { getProperties, approveProperty, rejectProperty, getAllUsers, getAllFeedbacks, resolveFeedback, getPropertyUpdates } from '../services/api';
import RejectModal from '../components/RejectModal';
import { useLanguage } from '../context/LanguageContext';

const AdminDashboard = () => {
   const { t } = useLanguage();
   const translateFieldName = (name) => {
      const map = {
         title: t('owner_field_title'),
         address: t('owner_field_address'),
         city: t('owner_field_city'),
         state: t('owner_field_state'),
         monthlyRent: t('owner_field_rent'),
         propertyType: t('owner_field_type'),
         roomType: t('owner_field_room'),
         furnishedStatus: t('owner_field_furnish'),
         description: t('owner_field_desc')
      };
      return map[name] || name;
   };
   const [properties, setProperties] = useState([]);
   const [users, setUsers] = useState([]);
   const [feedbacks, setFeedbacks] = useState([]);
   const [propertyUpdates, setPropertyUpdates] = useState([]);
   const [loading, setLoading] = useState(true);
   const [activeTab, setActiveTab] = useState('properties');
   const [rejectTarget, setRejectTarget] = useState(null);
   const [expandedFeedbacks, setExpandedFeedbacks] = useState({});

   useEffect(() => {
      fetchData();
   }, []);

   const fetchData = async () => {
      try {
         const [props, usrs, fdks, updates] = await Promise.all([
            getProperties(),
            getAllUsers(),
            getAllFeedbacks(),
            getPropertyUpdates()
         ]);
         setProperties(props || []);
         setUsers(usrs || []);
         setFeedbacks(fdks || []);
         setPropertyUpdates(updates || []);
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

   const userMap = {};
   users.forEach(u => { userMap[u.id] = u; });

   if (loading) return <div className="text-center py-32 text-on-surface">{t('common_loading')}</div>;

   const pendingApprovals = properties.filter(p => p.approvalStatus === 'Pending');
   const updatedProperties = propertyUpdates;
   const approvedCount = properties.filter(p => p.approvalStatus === 'Approved').length;
   const rejectedCount = properties.filter(p => p.approvalStatus === 'Rejected').length;
   const unresolvedFeedbacks = feedbacks.filter(f => !f.isResolved).length;

   const formatDateTime = (dateStr) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
   };

   const resolveImageSrc = (url) => {
      if (!url) return null;
      if (url.startsWith('/uploads')) return `http://localhost:8080${url}`;
      return url;
   };

   return (
      <div className="pt-24 pb-20 px-6 md:px-10 lg:px-16 w-full space-y-8">
         <RejectModal
            isOpen={rejectTarget !== null}
            propertyTitle={rejectTarget?.title || ''}
            onConfirm={handleRejectConfirm}
            onCancel={() => setRejectTarget(null)}
         />

         {/* Page header */}
         <div className="pb-2 border-b border-outline-variant/20">
            <h1 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">{t('admin_title')}</h1>
            <p className="text-on-surface-variant text-sm mt-1">{t('admin_subtitle')}</p>
         </div>

         {/* Stats row */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50/70 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-5 shadow-rs-sm transition-all duration-300 hover:shadow-rs-lg hover:-translate-y-1 hover-glow-blue cursor-default">
               <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">{t('admin_stat_users')}</p>
               <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{users.length}</p>
            </div>
            <div className="bg-purple-50/70 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-900/50 rounded-2xl p-5 shadow-rs-sm transition-all duration-300 hover:shadow-rs-lg hover:-translate-y-1 hover-glow-purple cursor-default">
               <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">{t('admin_stat_listings')}</p>
               <p className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">{properties.length}</p>
            </div>
            <div className="bg-amber-50/70 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 shadow-rs-sm transition-all duration-300 hover:shadow-rs-lg hover:-translate-y-1 hover-glow-amber cursor-default">
               <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">{t('admin_stat_pending')}</p>
               <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{pendingApprovals.length}</p>
            </div>
            <div className="bg-red-50/70 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-5 shadow-rs-sm transition-all duration-300 hover:shadow-rs-lg hover:-translate-y-1 hover-glow-red cursor-default">
               <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">{t('admin_stat_feedback')}</p>
               <p className="text-3xl font-extrabold text-red-500">{unresolvedFeedbacks}</p>
            </div>
         </div>

         {/* Tab navigation */}
         <div className="flex gap-1 border-b border-outline-variant/20 overflow-x-auto scrollbar-none whitespace-nowrap">
            {[
               { key: 'properties', label: t('admin_tab_listings'), icon: 'home_work' },
               { key: 'updated_properties', label: t('admin_tab_updated'), icon: 'update', badge: updatedProperties.length },
               { key: 'users', label: t('admin_tab_users'), icon: 'people' },
               { key: 'feedbacks', label: t('admin_tab_feedback'), icon: 'feedback', badge: unresolvedFeedbacks },
            ].map(tab => (
               <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                     activeTab === tab.key
                        ? 'text-primary border-primary'
                        : 'text-on-surface-variant border-transparent hover:text-on-surface'
                  }`}
               >
                  <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                  {tab.label}
                  {tab.badge > 0 && (
                     <span className="px-1.5 py-0.5 rounded bg-error text-white text-[10px] font-bold">{tab.badge}</span>
                  )}
               </button>
            ))}
         </div>

         {/* Properties tab */}
         {activeTab === 'properties' && (
            <div className="space-y-8">
               {/* Pending approvals section */}
               <div>
                  <h2 className="text-lg font-bold font-headline mb-4 flex items-center gap-2">
                     <span className="material-symbols-outlined text-orange-500">pending</span>
                     {t('admin_stat_pending')}
                     <span className="ml-1 px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-xs font-bold">{pendingApprovals.length}</span>
                  </h2>
                  {pendingApprovals.length === 0 ? (
                     <div className="bg-green-50 border border-green-200 rounded-lg p-5 flex items-center gap-3 text-green-700">
                        <span className="material-symbols-outlined">check_circle</span>
                        <span className="font-medium text-sm">{t('admin_caught_up')}</span>
                     </div>
                  ) : (
                     <div className="bg-white rounded-xl border border-outline-variant/20 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                           <table className="w-full text-left text-sm min-w-[650px] md:min-w-0">
                           <thead className="bg-surface-container-low border-b border-outline-variant/20">
                              <tr>
                                 <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{t('admin_table_property')}</th>
                                 <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant hidden md:table-cell">{t('admin_table_location')}</th>
                                 <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant hidden lg:table-cell">{t('admin_table_type')}</th>
                                 <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{t('admin_table_rent')}</th>
                                 <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">{t('admin_table_actions')}</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-outline-variant/10">
                              {pendingApprovals.map(p => (
                                 <tr key={p.id} className="hover:bg-surface-container-lowest transition-colors">
                                    <td className="px-6 py-4">
                                       <div className="flex items-center gap-3">
                                          {(p.images?.[0]?.imageUrl || p.imageUrl) ? (
                                             <img
                                                src={resolveImageSrc(p.images?.[0]?.imageUrl || p.imageUrl)}
                                                alt={p.title}
                                                className="w-12 h-12 object-cover rounded-lg border border-outline-variant/20 flex-shrink-0"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                             />
                                          ) : (
                                             <div className="w-12 h-12 bg-surface-container-low rounded-lg flex items-center justify-center flex-shrink-0">
                                                <span className="material-symbols-outlined text-on-surface-variant/40">home</span>
                                             </div>
                                          )}
                                          <div className="min-w-0">
                                             <p className="font-bold text-on-surface truncate max-w-[200px]">{p.title}</p>
                                             <p className="text-xs text-on-surface-variant truncate max-w-[200px] mt-0.5 line-clamp-1">{p.description}</p>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="px-6 py-4 text-on-surface-variant hidden md:table-cell">
                                       <div className="flex items-center gap-1">
                                          <span className="material-symbols-outlined text-[14px]">location_on</span>
                                          {p.city}, {p.state}
                                       </div>
                                    </td>
                                    <td className="px-6 py-4 hidden lg:table-cell">
                                       <div className="flex flex-wrap gap-1">
                                          <span className="bg-surface-container text-on-surface-variant text-xs px-2 py-0.5 rounded">{p.propertyType}</span>
                                          <span className="bg-surface-container text-on-surface-variant text-xs px-2 py-0.5 rounded">{p.roomType}</span>
                                       </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-primary">RM {p.monthlyRent}</td>
                                    <td className="px-6 py-4">
                                       <div className="flex items-center gap-2 justify-end">
                                          <button
                                             onClick={() => handleApprove(p)}
                                             className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                                          >
                                             <span className="material-symbols-outlined text-[14px]">check</span>
                                             {t('admin_action_approve')}
                                          </button>
                                          <button
                                             onClick={() => setRejectTarget(p)}
                                             className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                                          >
                                             <span className="material-symbols-outlined text-[14px]">close</span>
                                             {t('admin_action_reject')}
                                          </button>
                                       </div>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                        </div>
                     </div>
                  )}
               </div>

               {/* All properties table */}
               <div>
                  <h2 className="text-lg font-bold font-headline mb-4 flex items-center gap-2">
                     <span className="material-symbols-outlined text-on-surface-variant">list</span>
                     {t('admin_all_listings')}
                     <span className="ml-1 text-on-surface-variant font-normal text-sm">({properties.length})</span>
                  </h2>
                  <div className="bg-white rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden text-sm">
                     <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px] md:min-w-0">
                        <thead className="bg-surface-container-low text-on-surface-variant text-xs font-bold tracking-widest border-b border-outline-variant/20">
                           <tr>
                              <th className="px-6 py-4 uppercase">{t('admin_table_property')}</th>
                              <th className="px-6 py-4 uppercase hidden md:table-cell">{t('admin_table_location')}</th>
                              <th className="px-6 py-4 uppercase">{t('admin_table_rent')}</th>
                              <th className="px-6 py-4 uppercase">{t('admin_table_status')}</th>
                              <th className="px-6 py-4 uppercase hidden lg:table-cell">{t('admin_table_reason')}</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                           {properties.map(p => (
                              <tr key={p.id} className="hover:bg-surface-container-lowest transition-colors">
                                 <td className="px-6 py-4 font-medium max-w-[200px] truncate">{p.title}</td>
                                 <td className="px-6 py-4 text-on-surface-variant hidden md:table-cell">{p.city}, {p.state}</td>
                                 <td className="px-6 py-4 text-primary font-bold">RM {p.monthlyRent}</td>
                                 <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                                       p.approvalStatus === 'Pending' ? 'bg-orange-100 text-orange-700' :
                                       p.approvalStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                                       'bg-red-100 text-red-700'
                                    }`}>
                                       {p.approvalStatus}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4 text-on-surface-variant text-xs max-w-[220px] truncate hidden lg:table-cell">
                                    {p.rejectionReason || '—'}
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Updated Properties tab */}
         {activeTab === 'updated_properties' && (
            <div className="space-y-8">
               <div>
                  <h2 className="text-lg font-bold font-headline mb-4 flex items-center gap-2">
                     <span className="material-symbols-outlined text-primary">update</span>
                     {t('admin_tab_updated')}
                     <span className="ml-1 px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-bold">{updatedProperties.length}</span>
                  </h2>
                  {updatedProperties.length === 0 ? (
                     <div className="bg-green-50 border border-green-200 rounded-lg p-5 flex items-center gap-3 text-green-700">
                        <span className="material-symbols-outlined">check_circle</span>
                        <span className="font-medium text-sm">{t('admin_no_updated_listings')}</span>
                     </div>
                  ) : (
                     <div className="bg-white rounded-xl border border-outline-variant/20 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                           <table className="w-full text-left text-sm min-w-[650px] md:min-w-0">
                              <thead className="bg-surface-container-low border-b border-outline-variant/20">
                                 <tr>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{t('admin_table_property')}</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant hidden md:table-cell">{t('admin_table_location')}</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{t('admin_table_changed_at')}</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{t('admin_table_before_changes')}</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{t('admin_table_after_changes')}</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-outline-variant/10">
                                 {updatedProperties.map(p => (
                                    <tr key={p.id} className="hover:bg-surface-container-lowest transition-colors">
                                       <td className="px-6 py-4">
                                          <div className="flex items-center gap-3">
                                             {(p.images?.[0]?.imageUrl || p.imageUrl) ? (
                                                <img
                                                   src={resolveImageSrc(p.images?.[0]?.imageUrl || p.imageUrl)}
                                                   alt={p.title}
                                                   className="w-12 h-12 object-cover rounded-lg border border-outline-variant/20 flex-shrink-0"
                                                   onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                             ) : (
                                                <div className="w-12 h-12 bg-surface-container-low rounded-lg flex items-center justify-center flex-shrink-0">
                                                   <span className="material-symbols-outlined text-on-surface-variant/40">home</span>
                                                </div>
                                             )}
                                             <div className="min-w-0">
                                                <p className="font-bold text-on-surface truncate max-w-[200px]">{p.title}</p>
                                                <p className="text-xs text-on-surface-variant truncate max-w-[200px] mt-0.5 line-clamp-1">{p.description}</p>
                                             </div>
                                          </div>
                                       </td>
                                       <td className="px-6 py-4 text-on-surface-variant hidden md:table-cell">
                                          <div className="flex items-center gap-1">
                                             <span className="material-symbols-outlined text-[14px]">location_on</span>
                                             {p.city}, {p.state}
                                          </div>
                                       </td>
                                       <td className="px-6 py-4 text-on-surface-variant">
                                          <div className="flex items-center gap-1.5">
                                             <span className="material-symbols-outlined text-[14px] text-primary">event_repeat</span>
                                             {formatDateTime(p.updatedAt)}
                                          </div>
                                       </td>
                                       <td className="px-6 py-4">
                                          <div className="flex flex-col gap-1.5 max-w-[200px]">
                                             {p.changeLog ? (
                                                p.changeLog.split(';').map((change, idx) => {
                                                   const parts = change.trim().split(':');
                                                   if (parts.length >= 2) {
                                                      const fieldName = parts[0].trim();
                                                      const rest = parts.slice(1).join(':').trim();
                                                      const restParts = rest.split('→');
                                                      if (restParts.length === 2) {
                                                         return (
                                                            <div key={idx} className="bg-surface-container/60 dark:bg-slate-800/60 border border-outline-variant/10 rounded-lg p-2 flex flex-col gap-0.5 text-[10px] leading-tight">
                                                               <span className="font-bold text-[9px] uppercase tracking-wider text-primary block mb-0.5">{translateFieldName(fieldName)}</span>
                                                               <span className="line-through opacity-60">{restParts[0].trim()}</span>
                                                            </div>
                                                         );
                                                      }
                                                   }
                                                   return (
                                                      <span key={idx} className="bg-primary/5 text-primary border border-primary/10 rounded px-1.5 py-0.5 text-[10px] font-semibold block leading-tight">
                                                         {change.trim()}
                                                      </span>
                                                   );
                                                })
                                             ) : (
                                                <span className="text-xs text-on-surface-variant italic">{t('admin_no_details')}</span>
                                             )}
                                          </div>
                                       </td>
                                       <td className="px-6 py-4">
                                          <div className="flex flex-col gap-1.5 max-w-[200px]">
                                             {p.changeLog ? (
                                                p.changeLog.split(';').map((change, idx) => {
                                                   const parts = change.trim().split(':');
                                                   if (parts.length >= 2) {
                                                      const fieldName = parts[0].trim();
                                                      const rest = parts.slice(1).join(':').trim();
                                                      const restParts = rest.split('→');
                                                      if (restParts.length === 2) {
                                                         return (
                                                            <div key={idx} className="bg-surface-container/60 dark:bg-slate-800/60 border border-outline-variant/10 rounded-lg p-2 flex flex-col gap-0.5 text-[10px] leading-tight">
                                                               <span className="font-bold text-[9px] uppercase tracking-wider text-primary block mb-0.5">{fieldName}</span>
                                                               <span className="font-bold text-emerald-600 dark:text-emerald-400">{restParts[1].trim()}</span>
                                                            </div>
                                                         );
                                                      }
                                                   }
                                                   return (
                                                      <span key={idx} className="bg-primary/5 text-primary border border-primary/10 rounded px-1.5 py-0.5 text-[10px] font-semibold block leading-tight">
                                                         {change.trim()}
                                                      </span>
                                                   );
                                                })
                                             ) : (
                                                <span className="text-xs text-on-surface-variant italic">{t('admin_no_details')}</span>
                                             )}
                                          </div>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         )}

         {/* Users tab */}
         {activeTab === 'users' && (
            <div>
               <h2 className="text-lg font-bold font-headline mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant">people</span>
                  {t('admin_all_users')}
                  <span className="ml-1 text-on-surface-variant font-normal text-sm">({users.length})</span>
               </h2>
               <div className="bg-white rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden text-sm">
                  <div className="overflow-x-auto">
                     <table className="w-full text-left min-w-[500px] md:min-w-0">
                     <thead className="bg-surface-container-low text-on-surface-variant text-xs font-bold tracking-widest border-b border-outline-variant/20 uppercase">
                        <tr>
                           <th className="px-6 py-4">{t('admin_table_name')}</th>
                           <th className="px-6 py-4 hidden md:table-cell">{t('admin_table_email')}</th>
                           <th className="px-6 py-4">{t('admin_table_role')}</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-outline-variant/10">
                        {users.map(u => (
                           <tr key={u.id} className="hover:bg-surface-container-lowest transition-colors">
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                                       {u.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <span className="font-bold text-on-surface">{u.name}</span>
                                 </div>
                              </td>
                              <td className="px-6 py-4 text-on-surface-variant hidden md:table-cell">{u.email}</td>
                              <td className="px-6 py-4">
                                 <span className="px-2.5 py-1 rounded bg-secondary-container text-on-secondary-container font-bold text-xs uppercase tracking-wide">
                                    {u.role}
                                 </span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                  </div>
               </div>
            </div>
         )}

         {/* Feedbacks tab */}
         {activeTab === 'feedbacks' && (
            <div>
               <h2 className="text-lg font-bold font-headline mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant">feedback</span>
                  {t('admin_tab_feedback')}
                  <span className="ml-1 text-on-surface-variant font-normal text-sm">({feedbacks.length})</span>
               </h2>
               {feedbacks.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-xl border border-outline-variant/20">
                     <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-2 block">feedback</span>
                     <p className="text-on-surface-variant text-sm">{t('admin_no_feedback')}</p>
                  </div>
               ) : (
                  <div className="space-y-3">
                     {feedbacks.map(f => {
                        const isExpanded = expandedFeedbacks[f.id] || false;
                        const isLongMessage = f.message && f.message.length > 200;
                        const feedbackUser = f.userId ? userMap[f.userId] : null;

                        return (
                           <div
                              key={f.id}
                              className={`rounded-xl border overflow-hidden transition-all ${
                                 f.isResolved
                                    ? 'bg-surface-container-lowest border-outline-variant/10 opacity-75'
                                    : 'bg-white border-outline-variant/20 shadow-sm'
                              }`}
                           >
                              {/* Top bar */}
                              <div className={`px-6 py-3 flex flex-wrap items-center gap-3 border-b ${
                                 f.isResolved ? 'bg-green-50/50 border-green-100' : 'bg-surface-container-lowest border-outline-variant/10'
                              }`}>
                                 <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                    f.category === 'Report' ? 'bg-red-100 text-red-700' :
                                    f.category === 'Suggestion' ? 'bg-blue-100 text-blue-700' :
                                    'bg-surface-container-high text-on-surface'
                                 }`}>
                                    {f.category}
                                 </span>
                                 <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded ${
                                    f.isResolved ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                 }`}>
                                    <span className="material-symbols-outlined text-[14px]">
                                       {f.isResolved ? 'check_circle' : 'pending'}
                                    </span>
                                    {f.isResolved ? t('common_approved') : t('common_pending')}
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
                                          {t('admin_action_resolve')}
                                       </button>
                                    )}
                                 </div>
                              </div>

                              {/* Body */}
                              <div className="px-6 py-4">
                                 <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm text-primary font-bold uppercase flex-shrink-0">
                                       {(f.userName || feedbackUser?.name || '?').charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                       <span className="text-sm font-bold text-on-surface block truncate">
                                          {f.userName || feedbackUser?.name || `User #${f.userId}`}
                                       </span>
                                       {feedbackUser?.email && (
                                          <span className="text-xs text-on-surface-variant truncate block">{feedbackUser.email}</span>
                                       )}
                                    </div>
                                 </div>
                                 {f.subject && (
                                    <h4 className="font-bold text-on-surface mb-2 text-sm">{f.subject}</h4>
                                 )}
                                 <div className="text-sm text-on-surface-variant leading-relaxed" style={{ whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                                    {isLongMessage && !isExpanded ? (
                                       <>
                                          {f.message.substring(0, 200)}...
                                          <button onClick={() => toggleFeedbackExpand(f.id)} className="ml-1 text-primary font-bold hover:underline text-xs">
                                             Read More
                                          </button>
                                       </>
                                    ) : (
                                       <>
                                          {f.message}
                                          {isLongMessage && (
                                             <button onClick={() => toggleFeedbackExpand(f.id)} className="ml-1 text-primary font-bold hover:underline text-xs">
                                                Show Less
                                             </button>
                                          )}
                                       </>
                                    )}
                                 </div>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               )}
            </div>
         )}
      </div>
   );
};

export default AdminDashboard;
