import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format, isPast } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import CountdownTimer from '../components/CountdownTimer';
import StatusBadge from '../components/StatusBadge';

export default function StudentDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const { data } = await axios.get('/assignments');
      setAssignments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = assignments.filter(a => {
    if (filter === 'pending') return !a.mySubmission && !isPast(new Date(a.deadline));
    if (filter === 'submitted') return !!a.mySubmission;
    if (filter === 'overdue') return !a.mySubmission && isPast(new Date(a.deadline));
    return true;
  });

  const stats = {
    total: assignments.length,
    submitted: assignments.filter(a => a.mySubmission).length,
    pending: assignments.filter(a => !a.mySubmission && !isPast(new Date(a.deadline))).length,
    graded: assignments.filter(a => a.mySubmission?.status === 'graded').length,
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back, <span className="text-indigo-400">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-gray-400 mt-1">Here are your assignments and deadlines</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Assignments', value: stats.total, icon: '📋', color: 'indigo' },
          { label: 'Submitted', value: stats.submitted, icon: '✅', color: 'green' },
          { label: 'Pending', value: stats.pending, icon: '⏳', color: 'yellow' },
          { label: 'Graded', value: stats.graded, icon: '🎯', color: 'purple' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className={`bg-gray-900 rounded-xl border border-gray-800 p-5 hover:border-${color}-700/50 transition-colors`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm">{label}</p>
                <p className={`text-3xl font-bold text-${color}-400 mt-1`}>{value}</p>
              </div>
              <span className="text-2xl">{icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'submitted', label: 'Submitted' },
          { key: 'overdue', label: 'Overdue' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === key
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Assignment Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-xl">No assignments found</p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filtered.map(assignment => {
            const deadlinePast = isPast(new Date(assignment.deadline));
            const hasSubmission = !!assignment.mySubmission;

            return (
              <div
                key={assignment._id}
                className="bg-gray-900 rounded-xl border border-gray-800 hover:border-indigo-700/50 transition-all p-6 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-indigo-400 bg-indigo-900/30 px-2 py-0.5 rounded">
                        {assignment.subject}
                      </span>
                      {deadlinePast && !hasSubmission && (
                        <span className="text-xs text-red-400 bg-red-900/30 px-2 py-0.5 rounded">OVERDUE</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-white text-lg leading-tight">{assignment.title}</h3>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{assignment.description}</p>
                  </div>
                  <StatusBadge status={hasSubmission ? assignment.mySubmission.status : 'pending'} />
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>👤 {assignment.teacher?.name}</span>
                  <span>🎯 {assignment.maxMarks} marks</span>
                  <span>📅 {format(new Date(assignment.deadline), 'MMM d, yyyy HH:mm')}</span>
                </div>

                {/* Countdown (only if not submitted and not past) */}
                {!hasSubmission && !deadlinePast && (
                  <CountdownTimer deadline={assignment.deadline} />
                )}

                {/* Grade if graded */}
                {hasSubmission && assignment.mySubmission.marks !== null && (
                  <div className="bg-green-900/20 border border-green-800/50 rounded-lg px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-green-400">Your Score</span>
                    <span className="font-bold text-green-400 text-lg">
                      {assignment.mySubmission.marks} / {assignment.maxMarks}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-auto">
                  <Link
                    to={`/assignments/${assignment._id}`}
                    className="flex-1 text-center py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 transition-colors"
                  >
                    View Details
                  </Link>
                  {!hasSubmission && (
                    <Link
                      to={`/assignments/${assignment._id}/submit`}
                      className={`flex-1 text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        deadlinePast
                          ? 'bg-yellow-700/50 text-yellow-400 hover:bg-yellow-700'
                          : 'bg-indigo-600 text-white hover:bg-indigo-500'
                      }`}
                    >
                      {deadlinePast ? 'Submit Late' : 'Submit →'}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}