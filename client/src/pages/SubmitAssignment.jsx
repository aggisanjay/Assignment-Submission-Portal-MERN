import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import CountdownTimer from '../components/CountdownTimer';

export default function SubmitAssignment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [files, setFiles] = useState([]);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    axios.get(`/assignments/${id}`)
      .then(({ data }) => setAssignment(data))
      .catch(() => toast.error('Assignment not found'));
  }, [id]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = [...e.dataTransfer.files];
    setFiles(prev => [...prev, ...dropped]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error('Please attach at least one file');
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('assignmentId', id);
      fd.append('comments', comments);
      files.forEach(f => fd.append('files', f));

      const { data } = await axios.post('/submissions', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.isLate) {
        toast('Submitted successfully, but it was late!', { icon: '⚠️' });
      } else {
        toast.success('Assignment submitted successfully!');
      }
      navigate('/student');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!assignment) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  );

  const isPastDeadline = new Date() > new Date(assignment.deadline);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Submit Assignment</h1>
        <p className="text-gray-400 mt-1">Upload your work for grading</p>
      </div>

      {/* Assignment Info */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-xs text-indigo-400 bg-indigo-900/30 px-2 py-0.5 rounded">{assignment.subject}</span>
            <h2 className="text-xl font-bold text-white mt-2">{assignment.title}</h2>
            <p className="text-gray-400 text-sm mt-1">{assignment.description}</p>
          </div>
          <div className="text-right text-sm text-gray-400 whitespace-nowrap">
            <div>🎯 {assignment.maxMarks} marks</div>
            <div className="mt-1">📅 {format(new Date(assignment.deadline), 'MMM d, yyyy HH:mm')}</div>
          </div>
        </div>
      </div>

      {/* Countdown */}
      {!isPastDeadline ? (
        <CountdownTimer deadline={assignment.deadline} />
      ) : (
        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl px-5 py-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-yellow-400 font-medium">Deadline has passed</p>
            <p className="text-yellow-600 text-sm">Your submission will be marked as late</p>
          </div>
        </div>
      )}

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl border border-gray-800 p-8 space-y-6">
        {/* Drag & Drop Zone */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Upload Files *</label>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all ${
              dragOver ? 'border-indigo-500 bg-indigo-900/20' : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <input
              type="file"
              multiple
              onChange={e => setFiles(prev => [...prev, ...[...e.target.files]])}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="text-4xl mb-3">☁️</div>
            <p className="text-white font-medium">Drag & drop files here</p>
            <p className="text-gray-500 text-sm mt-1">or click to browse</p>
            <p className="text-gray-600 text-xs mt-3">PDF, DOC, DOCX, TXT, ZIP, PNG, JPG • Max 50MB</p>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-400 font-medium">{files.length} file(s) selected:</p>
            {files.map((file, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-3">
                <span className="text-lg">
                  {file.type.includes('pdf') ? '📄' : file.type.includes('image') ? '🖼️' : '📁'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-gray-500 hover:text-red-400 transition-colors ml-2"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Comments */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Comments <span className="text-gray-500">(optional)</span>
          </label>
          <textarea
            value={comments}
            onChange={e => setComments(e.target.value)}
            rows={3}
            placeholder="Any notes for your teacher..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm transition-colors"
          >
            ← Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || files.length === 0}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              isPastDeadline
                ? 'bg-yellow-700 hover:bg-yellow-600 text-yellow-100 disabled:opacity-50'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50'
            }`}
          >
            {submitting ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
            ) : (
              <>📤 {isPastDeadline ? 'Submit Late' : 'Submit Assignment'}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}