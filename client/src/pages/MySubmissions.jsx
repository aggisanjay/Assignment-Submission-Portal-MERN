import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import StatusBadge from '../components/StatusBadge';

export default function MySubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/submissions/my')
      .then(({ data }) => setSubmissions(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: submissions.length,
    graded: submissions.filter(s => s.status === 'graded').length,
    late: submissions.filter(s => s.status === 'late').length,
    avgScore: submissions.filter(s => s.marks !== null).length > 0
      ? (submissions.filter(s => s.marks !== null).reduce((acc, s) => acc + (s.marks / s.assignment.maxMarks * 100), 0)
        / submissions.filter(s => s.marks !== null).length).toFixed(1)
      : null,
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">My Submissions</h1>
        <p className="text-gray-400 mt-1">Track all your submitted assignments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Submitted', value: stats.total, icon: '📤', color: 'indigo' },
          { label: 'Graded', value: stats.graded, icon: '✅', color: 'green' },
          { label: 'Late', value: stats.late, icon: '⚠️', color: 'yellow' },
          { label: 'Avg Score', value: stats.avgScore ? `${stats.avgScore}%` : '—', icon: '🎯', color: 'purple' },
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

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-xl">No submissions yet</p>
          <p className="text-sm mt-2">Go to your dashboard to submit assignments</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map(s => {
            const percentage = s.marks !== null ? (s.marks / s.assignment.maxMarks * 100).toFixed(1) : null;

            return (
              <div key={s._id} className="bg-gray-900 rounded-xl border border-gray-800 hover:border-indigo-700/30 transition-all p-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs text-indigo-400 bg-indigo-900/30 px-2 py-0.5 rounded">
                        {s.assignment.subject}
                      </span>
                      <StatusBadge status={s.status} />
                    </div>
                    <h3 className="font-semibold text-white text-lg">{s.assignment.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>📅 Submitted {format(new Date(s.submittedAt), 'MMM d, yyyy HH:mm')}</span>
                      <span>📎 {s.files?.length} file(s)</span>
                    </div>
                  </div>

                  {/* Score */}
                  {s.status === 'graded' && (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400">{s.marks}</div>
                      <div className="text-xs text-gray-500">/ {s.assignment.maxMarks}</div>
                      <div className={`text-xs mt-1 ${percentage >= 60 ? 'text-green-400' : percentage >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {percentage}%
                      </div>
                    </div>
                  )}
                </div>

                {/* Score bar for graded */}
                {s.status === 'graded' && percentage !== null && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-800 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${percentage >= 60 ? 'bg-green-500' : percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Feedback */}
                {s.feedback && (
                  <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
                    <p className="text-xs text-gray-400 mb-1">Teacher's Feedback:</p>
                    <p className="text-sm text-white">{s.feedback}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}