import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';

const tabs = ['overview', 'users', 'submissions'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userFilter, setUserFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'student' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, subsRes] = await Promise.all([
        axios.get('/admin/stats'),
        axios.get('/admin/users'),
        axios.get('/admin/submissions'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setSubmissions(subsRes.data);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = async (userId) => {
    try {
      const { data } = await axios.put(`/admin/users/${userId}/toggle`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: data.isActive } : u));
      toast.success(data.message);
    } catch {
      toast.error('Failed to update user');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure? This cannot be undone.')) return;
    try {
      await axios.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const addUser = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/admin/users', newUser);
      setUsers(prev => [data, ...prev]);
      setShowAddUser(false);
      setNewUser({ name: '', email: '', password: '', role: 'student' });
      toast.success('User created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesRole = !roleFilter || u.role === roleFilter;
    const matchesSearch = !userFilter ||
      u.name.toLowerCase().includes(userFilter.toLowerCase()) ||
      u.email.toLowerCase().includes(userFilter.toLowerCase());
    return matchesRole && matchesSearch;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400 mt-1">Manage users, assignments, and submissions</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-0">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium capitalize transition-all border-b-2 -mb-px ${
              activeTab === tab
                ? 'text-rose-400 border-rose-500'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            {tab === 'overview' ? '📊' : tab === 'users' ? '👥' : '📬'} {tab}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Students', value: stats.overview.totalStudents, icon: '🎓', color: 'indigo' },
              { label: 'Teachers', value: stats.overview.totalTeachers, icon: '👩‍🏫', color: 'emerald' },
              { label: 'Assignments', value: stats.overview.totalAssignments, icon: '📋', color: 'blue' },
              { label: 'Submissions', value: stats.overview.totalSubmissions, icon: '📤', color: 'purple' },
              { label: 'Graded', value: stats.overview.gradedSubmissions, icon: '✅', color: 'green' },
              { label: 'Pending Grading', value: stats.overview.pendingGrading, icon: '⏳', color: 'yellow' },
              { label: 'Late Submissions', value: stats.overview.lateSubmissions, icon: '⚠️', color: 'orange' },
              { label: 'Avg Score', value: `${stats.overview.averageMarks}`, icon: '🎯', color: 'rose' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className={`bg-gray-900 rounded-xl border border-gray-800 p-5 hover:border-${color}-700/40 transition-colors`}>
                <p className="text-gray-400 text-sm">{icon} {label}</p>
                <p className={`text-3xl font-bold text-${color}-400 mt-2`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Submissions */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <h3 className="font-bold text-white text-lg mb-4">Recent Submissions</h3>
              <div className="space-y-3">
                {stats.recentSubmissions.map(s => (
                  <div key={s._id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <div className="w-9 h-9 bg-indigo-900 rounded-full flex items-center justify-center font-bold text-sm">
                      {s.student?.name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{s.student?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{s.assignment?.title}</p>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Assignments */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <h3 className="font-bold text-white text-lg mb-4">Recent Assignments</h3>
              <div className="space-y-3">
                {stats.recentAssignments.map(a => (
                  <div key={a._id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-2xl">📋</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{a.title}</p>
                      <p className="text-xs text-gray-500">{a.teacher?.name} • {format(new Date(a.deadline), 'MMM d')}</p>
                    </div>
                    <span className="text-xs text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded">
                      {a.subject}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-4">
            <input
              value={userFilter}
              onChange={e => setUserFilter(e.target.value)}
              placeholder="Search by name or email..."
              className="flex-1 min-w-60 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-rose-500"
            />
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
            >
              <option value="">All Roles</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
              <option value="admin">Admins</option>
            </select>
            <button
              onClick={() => setShowAddUser(!showAddUser)}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-sm rounded-xl transition-colors"
            >
              + Add User
            </button>
          </div>

          {showAddUser && (
            <form onSubmit={addUser} className="bg-gray-900 rounded-xl border border-gray-800 p-6 grid gap-4 sm:grid-cols-2">
              <input required value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Full Name" className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none" />
              <input required type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Email" className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none" />
              <input required type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Password" className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none" />
              <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none">
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
              <div className="sm:col-span-2 flex gap-3">
                <button type="submit" className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm rounded-lg">Create</button>
                <button type="button" onClick={() => setShowAddUser(false)} className="px-5 py-2 bg-gray-800 text-gray-400 text-sm rounded-lg">Cancel</button>
              </div>
            </form>
          )}

          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    {['User', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredUsers.map(u => (
                    <tr key={u._id} className="hover:bg-gray-800/20">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center font-bold text-sm">
                            {u.name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-white">{u.name}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded capitalize font-medium ${
                          u.role === 'admin' ? 'bg-rose-900/40 text-rose-400' :
                          u.role === 'teacher' ? 'bg-emerald-900/40 text-emerald-400' :
                          'bg-indigo-900/40 text-indigo-400'
                        }`}>{u.role}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={u.isActive ? 'active' : 'inactive'} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleUser(u._id)}
                            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                              u.isActive
                                ? 'bg-yellow-900/40 text-yellow-400 hover:bg-yellow-900/60'
                                : 'bg-green-900/40 text-green-400 hover:bg-green-900/60'
                            }`}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => deleteUser(u._id)}
                            className="px-3 py-1 text-xs bg-red-900/40 text-red-400 hover:bg-red-900/60 rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-gray-500">No users found.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBMISSIONS TAB */}
      {activeTab === 'submissions' && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h2 className="font-bold text-white text-lg">All Submissions ({submissions.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  {['Student', 'Assignment', 'Submitted', 'Status', 'Marks'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {submissions.map(s => (
                  <tr key={s._id} className="hover:bg-gray-800/20">
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{s.student?.name}</p>
                      <p className="text-xs text-gray-500">{s.student?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">{s.assignment?.title}</p>
                      <p className="text-xs text-gray-500">{s.assignment?.subject}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {format(new Date(s.submittedAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={s.status} /></td>
                    <td className="px-6 py-4 text-sm">
                      {s.marks !== null ? (
                        <span className="text-green-400 font-bold">{s.marks} / {s.assignment?.maxMarks}</span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {submissions.length === 0 && (
              <div className="text-center py-12 text-gray-500">No submissions yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}