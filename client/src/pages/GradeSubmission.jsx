import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';

export default function GradeSubmission() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get(`/submissions/${id}`)
      .then(({ data }) => {
        setSubmission(data);
        if (data.marks !== null) setMarks(data.marks);
        if (data.feedback) setFeedback(data.feedback);
      })
      .catch(() => toast.error('Submission not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleGrade = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`/submissions/${id}/grade`, { marks: Number(marks), feedback });
      toast.success('Submission graded successfully!');
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to grade');
    } finally {
      setSaving(false);
    }
  };

  const handleReturn = async () => {
    try {
      await axios.put(`/submissions/${id}/return`, { feedback });
      toast.success('Submission returned for revision');
      navigate(-1);
    } catch {
      toast.error('Failed to return submission');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full" />
    </div>
  );

  if (!submission) return <div className="text-center text-gray-400 py-20">Submission not found.</div>;

  const percentage = marks ? ((Number(marks) / submission.assignment.maxMarks) * 100).toFixed(1) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Grade Submission</h1>
        <p className="text-gray-400 mt-1">Review and assign marks to this submission</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Submission Info */}
        <div className="lg:col-span-3 space-y-5">
          {/* Student & Assignment Info */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="text-sm text-gray-400 mb-1">Student</p>
                <p className="text-xl font-bold text-white">{submission.student?.name}</p>
                <p className="text-sm text-gray-500">{submission.student?.email}</p>
              </div>
              <StatusBadge status={submission.status} />
            </div>
            <div className="border-t border-gray-800 pt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Assignment</p>
                <p className="text-white font-medium">{submission.assignment?.title}</p>
              </div>
              <div>
                <p className="text-gray-400">Subject</p>
                <p className="text-white font-medium">{submission.assignment?.subject}</p>
              </div>
              <div>
                <p className="text-gray-400">Submitted At</p>
                <p className="text-white">{format(new Date(submission.submittedAt), 'MMM d, yyyy HH:mm')}</p>
              </div>
              <div>
                <p className="text-gray-400">Max Marks</p>
                <p className="text-white font-medium">{submission.assignment?.maxMarks}</p>
              </div>
            </div>
          </div>

          {/* Student Comments */}
          {submission.comments && (
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Student's Comment</h3>
              <p className="text-white">{submission.comments}</p>
            </div>
          )}

          {/* Submitted Files */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h3 className="font-semibold text-white mb-4">📎 Submitted Files ({submission.files?.length})</h3>
            <div className="space-y-2">
              {submission.files?.map((file, i) => (
                <a
                  key={i}
                  href={`/${file.path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors group"
                >
                  <span className="text-2xl">
                    {file.mimetype?.includes('pdf') ? '📄' : file.mimetype?.includes('image') ? '🖼️' : '📁'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-indigo-400 group-hover:text-indigo-300 truncate">{file.originalName}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <span className="text-xs text-gray-500 group-hover:text-indigo-400">↗ Open</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Grading Panel */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 sticky top-6">
            <h3 className="font-bold text-white text-lg mb-6">✏️ Grading Panel</h3>

            <form onSubmit={handleGrade} className="space-y-5">
              {/* Marks Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Marks (out of {submission.assignment?.maxMarks})
                </label>
                <input
                  type="number"
                  min="0"
                  max={submission.assignment?.maxMarks}
                  required
                  value={marks}
                  onChange={e => setMarks(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-xl font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="0"
                />
                {marks !== '' && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Score</span>
                      <span className={`font-medium ${percentage >= 60 ? 'text-green-400' : percentage >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${percentage >= 60 ? 'bg-green-500' : percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Quick mark buttons */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Quick Set</p>
                <div className="flex gap-2 flex-wrap">
                  {[25, 50, 75, 100].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setMarks(Math.round(submission.assignment.maxMarks * pct / 100))}
                      className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg transition-colors"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Feedback</label>
                <textarea
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  rows={4}
                  placeholder="Write constructive feedback for the student..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none text-sm"
                />
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '✅'}
                  Save Grade
                </button>
                <button
                  type="button"
                  onClick={handleReturn}
                  className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-xl transition-colors"
                >
                  ↩️ Return for Revision
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}