import React, { useState, useEffect } from 'react';
import { Search, Mail, Calendar, User, Shield, Loader2, MoreVertical } from 'lucide-react';
import Card from '../../components/ui/Card';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/admin/users?search=${search}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.status === 'success') {
        setUsers(response.data.data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  return (
    <div className="space-y-10 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-payfile-maroon tracking-tight">Active Users</h1>
          <p className="text-gray-500 mt-2 font-medium">Manage and monitor all platform participants.</p>
        </div>

        <div className="relative w-full md:w-[400px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-payfile-maroon/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-payfile-cream/30 border border-payfile-maroon/10 rounded-[20px] py-4 pl-14 pr-6 text-payfile-maroon focus:outline-none focus:border-payfile-gold/50 transition-all placeholder:text-gray-400 font-bold"
            placeholder="Search by name or email..."
          />
        </div>
      </div>

      <Card className="overflow-hidden border-payfile-maroon/5 p-0 shadow-2xl shadow-payfile-maroon/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-payfile-cream/30 border-b border-payfile-maroon/5">
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Identity</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Privileges</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Account Created</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-10 py-24 text-center">
                    <Loader2 className="w-10 h-10 text-payfile-maroon animate-spin mx-auto mb-4" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-10 py-24 text-center">
                    <p className="text-gray-500 font-bold">No system records found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="border-t border-payfile-maroon/5 group hover:bg-payfile-cream/10 transition-colors">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-payfile-maroon to-payfile-maroon-dark flex items-center justify-center text-payfile-gold font-black text-lg shadow-lg shadow-payfile-maroon/10">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div>
                          <p className="text-base font-black text-payfile-maroon group-hover:text-payfile-amber transition-colors">
                            {user.firstName} {user.lastName}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-1 font-bold">
                            <Mail className="w-3.5 h-3.5 text-payfile-gold/50" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                        user.role === 'admin' 
                          ? 'bg-payfile-maroon text-payfile-gold border-payfile-gold/20' 
                          : 'bg-payfile-amber/10 text-payfile-amber border-payfile-amber/20'
                      }`}>
                        {user.role === 'admin' ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                        {user.role}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-2.5 text-sm font-bold text-gray-500">
                        <Calendar className="w-4 h-4 text-payfile-gold" />
                        {new Date(user.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button className="p-3 text-gray-400 hover:text-payfile-maroon hover:bg-payfile-cream/50 rounded-xl transition-all">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminUsers;
