import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import CountdownTimer from '../components/CountdownTimer';
import StatusBadge from '../components/StatusBadge';

export default function AssignmentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/assignments/${id}`)
      .then(({ data }) => setAssignment(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  );

  if (!assignment) return (
    <div className="text-center py-20 text-gray-400">Assignment not found.</div>
  );

  const isStudent = user?.role === 'student';
  const isPastDeadline = new Date() > new Date(assignment.deadline);
  const hasSubmitted = !!assignment.mySubmission;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-medium text-indigo-400 bg-indigo-900/30 px-3 py-1 rounded-full">
                {assignment.subject}
              </span>
              {isPastDeadline && <span className="text-xs text-red-400 bg-red-900/30 px-3 py-1 rounded-full">PAST DEADLINE</span>}
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">{assignment.title}</h1>
            <p className="text-gray-400 leading-relaxed">{assignment.description}</p>
          </div>
          {isStudent && hasSubmitted && (
            <StatusBadge status={assignment.mySubmission.status} />
          )}
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-800">
          {[
            { label: 'Teacher', value: assignment.teacher?.name, icon: '👤' },
            { label: 'Max Marks', value: assignment.maxMarks, icon: '🎯' },
            { label: 'Deadline', value: format(new Date(assignment.deadline), 'MMM d, yyyy'), icon: '📅' },
            { label: 'Time', value: format(new Date(assignment.deadline), 'HH:mm'), icon: '🕐' },
          ].map(({ label, value, icon }) => (
            <div key={label}>
              <p className="text-xs text-gray-500 mb-1">{icon} {label}</p>
              <p className="text-white font-medium">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Countdown (for students) */}
      {isStudent && !hasSubmitted && (
        <CountdownTimer deadline={assignment.deadline} />
      )}

      {/* Submission Result */}
      {isStudent && hasSubmitted && assignment.mySubmission.marks !== null && (
        <div className="bg-green-900/20 border border-green-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-green-400 mb-4">📊 Your Result</h3>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400">{assignment.mySubmission.marks}</div>
              <div className="text-sm text-gray-400">/ {assignment.maxMarks}</div>
            </div>
            <div className="flex-1">
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{ width: `${(assignment.mySubmission.marks / assignment.maxMarks) * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {((assignment.mySubmission.marks / assignment.maxMarks) * 100).toFixed(1)}% scored
              </p>
            </div>
          </div>
          {assignment.mySubmission.feedback && (
            <div className="mt-4 bg-gray-800/50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Teacher Feedback:</p>
              <p className="text-white">{assignment.mySubmission.feedback}</p>
            </div>
          )}
        </div>
      )}

      {/* Attachments */}
      {assignment.attachments?.length > 0 && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h3 className="text-lg font-bold text-white mb-4">📎 Attachments</h3>
          <div className="space-y-2">
            {assignment.attachments.map((file, i) => (
              <a
                key={i}
                href={`/${file.path}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <span>📄</span>
                <span className="text-sm text-indigo-400">{file.originalName}</span>
                <span className="text-xs text-gray-500 ml-auto">{(file.size / 1024).toFixed(1)} KB</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {isStudent && (
        <div className="flex gap-4">
          <Link to="/student" className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm transition-colors">
            ← Back
          </Link>
          {!hasSubmitted && (
            <Link
              to={`/assignments/${id}/submit`}
              className={`flex-1 text-center py-3 rounded-xl text-sm font-medium transition-colors ${
                isPastDeadline
                  ? 'bg-yellow-700 hover:bg-yellow-600 text-yellow-100'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {isPastDeadline ? '⚠️ Submit Late' : '📤 Submit Assignment'}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}