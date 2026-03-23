
import React, { useEffect, useState } from 'react';
import { getUsers, deleteUser } from '../services/storageService';
import { User, UserRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, UserCog, ShieldCheck, TrendingUp, Filter, Trash2, Building2, Download } from 'lucide-react';
import { allHotels } from '../data/hotelData';

const COLORS = ['#92400e', '#d97706', '#fcd34d']; // Maroon, Amber, Gold

interface Props {
  user: User; // Current admin user
}

const AdminDashboard: React.FC<Props> = ({ user: currentAdmin }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<UserRole | 'ALL'>('ALL');

  // Find the assigned hotel object if applicable
  const assignedHotel = allHotels.find(h => h.id === currentAdmin.assignedHotelId);

  // Simulate real-time data fetching
  useEffect(() => {
    const fetchData = () => {
      const allUsers = getUsers();
      setUsers(allUsers);
      setLoading(false);
    };

    fetchData();
    // Poll every 5 seconds to simulate real-time updates from other logins
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDeleteUser = (targetUserId: string) => {
    if (targetUserId === currentAdmin.id) {
        alert("You cannot delete your own Administrator account.");
        return;
    }
    
    if (window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) {
        deleteUser(targetUserId);
        // Update local state immediately for better UX
        setUsers(prev => prev.filter(u => u.id !== targetUserId));
    }
  };

  const handleDownloadCSV = () => {
      if (users.length === 0) {
          alert("No data to export.");
          return;
      }

      // 1. Define Headers
      const headers = [
          "User ID",
          "Name",
          "Email",
          "Role",
          "Joined Date",
          "Origin",
          "Location",
          "ID Type",
          "ID Number",
          "Face Image Data (Base64)" 
      ];

      // 2. Map Data to CSV Rows
      const rows = users.map(u => [
          u.id,
          u.name,
          u.email,
          u.role,
          u.joinedAt,
          u.origin || 'N/A',
          u.location || 'N/A',
          u.idProofType || 'N/A',
          u.idProofNumber || 'N/A',
          u.faceImage || 'No Biometric Data' // Stores the full base64 string
      ]);

      // 3. Construct CSV String (Handle commas and quotes)
      const csvContent = [
          headers.join(','),
          ...rows.map(row => row.map(field => {
              const stringValue = String(field);
              // Escape double quotes by doubling them and wrap field in quotes
              return `"${stringValue.replace(/"/g, '""')}"`;
          }).join(','))
      ].join('\n');

      // 4. Trigger Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rajvista_registry_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  if (loading) return <div className="p-8 text-center text-amber-800">Loading Royal Analytics...</div>;

  const totalUsers = users.filter(u => u.role === UserRole.USER).length;
  const totalStaff = users.filter(u => u.role === UserRole.STAFF).length;
  const totalAdmins = users.filter(u => u.role === UserRole.ADMIN).length;

  const roleData = [
    { name: 'Guests', value: totalUsers },
    { name: 'Staff', value: totalStaff },
    { name: 'Admins', value: totalAdmins },
  ];

  // Mock activity data for the bar chart
  const activityData = [
    { name: 'Mon', checkins: 12, bookings: 24 },
    { name: 'Tue', checkins: 19, bookings: 13 },
    { name: 'Wed', checkins: 3, bookings: 98 },
    { name: 'Thu', checkins: 5, bookings: 39 },
    { name: 'Fri', checkins: 22, bookings: 48 },
    { name: 'Sat', checkins: 35, bookings: 38 },
    { name: 'Sun', checkins: 10, bookings: 43 },
  ];

  const filteredUsers = filterRole === 'ALL' 
    ? users 
    : users.filter(u => u.role === filterRole);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-3xl font-serif font-bold text-amber-900">
             Royal Overview {assignedHotel ? <span className="text-amber-700 font-medium text-2xl">- {assignedHotel.name}</span> : ''}
           </h2>
           <p className="text-amber-800/70">
             {assignedHotel 
               ? `Command Center for ${assignedHotel.name}, ${assignedHotel.city}.` 
               : 'Real-time palace statistics and guest registry.'}
           </p>
        </div>
        <div className="flex flex-col items-end gap-2">
            <div className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold flex items-center gap-2 border border-green-200">
                <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-600"></span>
                </span>
                System Online
            </div>
            {assignedHotel && (
                <div className="text-xs font-serif text-amber-700 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                    <Building2 className="w-3 h-3" /> Managed Property
                </div>
            )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100 flex items-center gap-4">
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <Users className="w-8 h-8 text-amber-700" />
          </div>
          <div>
            <p className="text-sm text-amber-600 font-medium">Total Guests</p>
            <h3 className="text-2xl font-serif font-bold text-amber-900">{totalUsers}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100 flex items-center gap-4">
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <UserCog className="w-8 h-8 text-amber-700" />
          </div>
          <div>
            <p className="text-sm text-amber-600 font-medium">Active Staff</p>
            <h3 className="text-2xl font-serif font-bold text-amber-900">{totalStaff}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100 flex items-center gap-4">
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <ShieldCheck className="w-8 h-8 text-amber-700" />
          </div>
          <div>
            <p className="text-sm text-amber-600 font-medium">Administrators</p>
            <h3 className="text-2xl font-serif font-bold text-amber-900">{totalAdmins}</h3>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100">
          <h3 className="text-lg font-serif font-bold text-amber-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            Weekly Booking Activity
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fef3c7" />
                <XAxis dataKey="name" tick={{fill: '#92400e'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#92400e'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fffbf0', borderRadius: '8px', border: '1px solid #fcd34d', color: '#92400e' }}
                  cursor={{fill: 'transparent'}}
                />
                <Bar dataKey="checkins" fill="#d97706" radius={[4, 4, 0, 0]} name="Check-ins" />
                <Bar dataKey="bookings" fill="#78350f" radius={[4, 4, 0, 0]} name="New Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100">
          <h3 className="text-lg font-serif font-bold text-amber-900 mb-6">User Role Distribution</h3>
          <div className="h-64 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-serif font-bold text-amber-900">{users.length}</span>
              <span className="text-xs text-amber-600 uppercase tracking-wider">Total</span>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {roleData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                <span className="text-sm text-amber-800">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-amber-100 bg-amber-50/50 flex justify-between items-center">
            <div className="flex items-center gap-4">
                 <h3 className="font-serif font-bold text-amber-900">Total Registry Data ({filteredUsers.length})</h3>
                 <button 
                    onClick={handleDownloadCSV}
                    className="flex items-center gap-2 text-xs bg-amber-800 hover:bg-amber-900 text-white px-3 py-1.5 rounded transition-colors font-medium"
                    title="Download CSV including Face Data"
                 >
                    <Download className="w-3 h-3" /> Export CSV
                 </button>
            </div>
            
            {/* Filter Dropdown */}
            <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-amber-700" />
                <select 
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value as UserRole | 'ALL')}
                    className="bg-white border border-amber-200 text-amber-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2 outline-none font-serif"
                >
                    <option value="ALL">All Records</option>
                    <option value={UserRole.USER}>Guests Only</option>
                    <option value={UserRole.STAFF}>Staff Only</option>
                    <option value={UserRole.ADMIN}>Admins Only</option>
                </select>
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-amber-900">
                <thead className="bg-amber-100 text-amber-900 font-serif font-semibold">
                    <tr>
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3">Role</th>
                        <th className="px-6 py-3">Origin</th>
                        <th className="px-6 py-3">Location</th>
                        <th className="px-6 py-3">ID Proof</th>
                        <th className="px-6 py-3">Joined</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.slice().reverse().map(user => (
                            <tr key={user.id} className="hover:bg-amber-50 transition-colors">
                                <td className="px-6 py-3 font-medium text-amber-950">{user.name}</td>
                                <td className="px-6 py-3 text-amber-800">{user.email}</td>
                                <td className="px-6 py-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                        ${user.role === 'ADMIN' ? 'bg-red-50 text-red-800 border-red-200' : 
                                        user.role === 'STAFF' ? 'bg-purple-50 text-purple-800 border-purple-200' : 
                                        'bg-amber-50 text-amber-800 border-amber-200'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-amber-800">{user.origin || '-'}</td>
                                <td className="px-6 py-3 text-amber-800">{user.location || '-'}</td>
                                <td className="px-6 py-3 text-amber-800 font-mono text-xs">
                                    {user.idProofType ? (
                                        <span className="flex flex-col">
                                            <span className="font-bold text-[10px] uppercase text-amber-600">{user.idProofType}</span>
                                            <span>{user.idProofNumber}</span>
                                        </span>
                                    ) : '-'}
                                </td>
                                <td className="px-6 py-3 text-amber-800">{new Date(user.joinedAt).toLocaleDateString()}</td>
                                <td className="px-6 py-3 text-right">
                                    <button 
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-800 transition-colors"
                                        title="Delete User"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={8} className="px-6 py-8 text-center text-amber-800 italic">No records found for this filter.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
