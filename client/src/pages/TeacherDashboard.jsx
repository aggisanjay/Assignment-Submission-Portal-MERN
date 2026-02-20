import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';

export default function TeacherDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '', description: '', subject: '', deadline: '', maxMarks: 100,
  });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const { data } = await axios.get('/assignments');
      setAssignments(data);
    } catch (err) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (assignmentId) => {
    try {
      const { data } = await axios.get(`/assignments/${assignmentId}/submissions`);
      setSubmissions(data.submissions);
      setSelectedAssignment(assignmentId);
    } catch (err) {
      toast.error('Failed to load submissions');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach(f => fd.append('attachments', f));

      const { data } = await axios.post('/assignments', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setAssignments(prev => [data, ...prev]);
      setShowCreate(false);
      setForm({ title: '', description: '', subject: '', deadline: '', maxMarks: 100 });
      setFiles([]);
      toast.success('Assignment created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await axios.delete(`/assignments/${id}`);
      setAssignments(prev => prev.filter(a => a._id !== id));
      toast.success('Assignment deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const stats = {
    total: assignments.length,
    totalSubmissions: assignments.reduce((acc, a) => acc, 0),
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Teacher Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage assignments and review submissions</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
        >
          {showCreate ? '✕ Cancel' : '+ New Assignment'}
        </button>
      </div>

      {/* Create Assignment Form */}
      {showCreate && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
          <h2 className="text-xl font-bold text-white mb-6">Create New Assignment</h2>
          <form onSubmit={handleCreate} className="grid gap-5 lg:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
              <input
                required value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="Assignment title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Subject *</label>
              <input
                required value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="e.g. Mathematics"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
              <textarea
                required value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                placeholder="Describe the assignment in detail..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Deadline *</label>
              <input
                type="datetime-local" required value={form.deadline}
                onChange={e => setForm({ ...form, deadline: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Maximum Marks *</label>
              <input
                type="number" min="1" required value={form.maxMarks}
                onChange={e => setForm({ ...form, maxMarks: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Attachments (optional)</label>
              <input
                type="file" multiple
                onChange={e => setFiles([...e.target.files])}
                className="w-full bg-gray-800 border border-gray-700 border-dashed rounded-xl px-4 py-3 text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-700 file:text-white file:text-sm file:cursor-pointer"
              />
              {files.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">{files.length} file(s) selected</p>
              )}
            </div>
            <div className="lg:col-span-2 flex gap-3">
              <button
                type="submit" disabled={submitting}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
              >
                {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</> : 'Create Assignment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assignments Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Your Assignments ({assignments.length})</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-4xl mb-3">📋</div>
            <p>No assignments yet. Create one above!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  {['Title', 'Subject', 'Deadline', 'Max Marks', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {assignments.map(a => (
                  <tr key={a._id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{a.title}</div>
                      <div className="text-xs text-gray-500 line-clamp-1 max-w-xs">{a.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded">{a.subject}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">
                      {format(new Date(a.deadline), 'MMM d, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{a.maxMarks}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => fetchSubmissions(a._id)}
                          className="px-3 py-1.5 text-xs bg-indigo-700/50 hover:bg-indigo-700 text-indigo-300 rounded-lg transition-colors"
                        >
                          📬 Submissions
                        </button>
                        <button
                          onClick={() => handleDelete(a._id)}
                          className="px-3 py-1.5 text-xs bg-red-900/40 hover:bg-red-900/60 text-red-400 rounded-lg transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submissions Panel */}
      {selectedAssignment && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              Submissions ({submissions.length})
            </h2>
            <button onClick={() => setSelectedAssignment(null)} className="text-gray-500 hover:text-gray-300">✕ Close</button>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No submissions yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    {['Student', 'Submitted At', 'Status', 'Marks', 'Action'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {submissions.map(s => (
                    <tr key={s._id} className="hover:bg-gray-800/30">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{s.student?.name}</div>
                        <div className="text-xs text-gray-500">{s.student?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {format(new Date(s.submittedAt), 'MMM d, HH:mm')}
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={s.status} /></td>
                      <td className="px-6 py-4 text-sm">
                        {s.marks !== null ? (
                          <span className="text-green-400 font-bold">{s.marks}</span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/submissions/${s._id}/grade`}
                          className="px-3 py-1.5 text-xs bg-emerald-700/50 hover:bg-emerald-700 text-emerald-300 rounded-lg transition-colors"
                        >
                          {s.status === 'graded' ? '✏️ Re-grade' : '📝 Grade'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}