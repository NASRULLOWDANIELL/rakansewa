import { useEffect, useState } from 'react';
import { getProperties, updateProperty, getAllUsers } from '../services/api';

const AdminDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('properties');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [props, usrs] = await Promise.all([getProperties(), getAllUsers()]);
      setProperties(props || []);
      setUsers(usrs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (property) => {
    try {
      await updateProperty(property.id, { ...property, availabilityStatus: 'Available' });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async (property) => {
    try {
      await updateProperty(property.id, { ...property, availabilityStatus: 'Rejected' });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="text-center py-32 text-on-surface">Loading data...</div>;

  const pendingApprovals = properties.filter(p => p.availabilityStatus === 'Pending');

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto space-y-8">
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

      <div className="flex gap-4 border-b border-surface-container-low">
         <button onClick={() => setActiveTab('properties')} className={`pb-4 font-bold ${activeTab === 'properties' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant'}`}>
            Property Listings
         </button>
         <button onClick={() => setActiveTab('users')} className={`pb-4 font-bold ${activeTab === 'users' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant'}`}>
            User Management
         </button>
      </div>

      {activeTab === 'properties' && (
         <div className="space-y-6">
            <h2 className="text-2xl font-bold font-headline">Pending Approvals ({pendingApprovals.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {pendingApprovals.length === 0 && <p className="text-on-surface-variant">All caught up!</p>}
               {pendingApprovals.map(p => (
                  <div key={p.id} className="bg-surface-container-low p-6 rounded-2xl border border-surface-container-high">
                     <h3 className="text-xl font-bold mb-1">{p.title}</h3>
                     <p className="text-sm text-on-surface-variant mb-4">{p.city}, {p.state}</p>
                     <div className="bg-white p-3 rounded-lg mb-4 text-sm font-medium">
                        RM {p.monthlyRent} | {p.propertyType}
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => handleApprove(p)} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700">Approve</button>
                        <button onClick={() => handleReject(p)} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700">Reject</button>
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
                     </tr>
                  </thead>
                  <tbody>
                     {properties.map(p => (
                        <tr key={p.id} className="border-b border-outline-variant/10 hover:bg-surface-container-lowest">
                           <td className="px-6 py-4 font-medium">{p.title}</td>
                           <td className="px-6 py-4">{p.city}, {p.state}</td>
                           <td className="px-6 py-4 text-primary font-bold">RM{p.monthlyRent}</td>
                           <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${p.availabilityStatus === 'Pending' ? 'bg-orange-100 text-orange-700' : p.availabilityStatus === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                 {p.availabilityStatus}
                              </span>
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
    </div>
  );
};

export default AdminDashboard;
