import React from 'react';

const configs = {
  submitted:  { label: 'Submitted',     color: 'blue',   icon: '📤' },
  late:       { label: 'Late',          color: 'yellow', icon: '⚠️' },
  graded:     { label: 'Graded',        color: 'green',  icon: '✅' },
  returned:   { label: 'Returned',      color: 'purple', icon: '↩️' },
  pending:    { label: 'Not Submitted', color: 'gray',   icon: '📭' },
  active:     { label: 'Active',        color: 'green',  icon: '🟢' },
  inactive:   { label: 'Inactive',      color: 'red',    icon: '🔴' },
};

const colorClasses = {
  blue:   'bg-blue-900/30 text-blue-400 border-blue-700/50',
  yellow: 'bg-yellow-900/30 text-yellow-400 border-yellow-700/50',
  green:  'bg-green-900/30 text-green-400 border-green-700/50',
  purple: 'bg-purple-900/30 text-purple-400 border-purple-700/50',
  gray:   'bg-gray-800 text-gray-400 border-gray-700',
  red:    'bg-red-900/30 text-red-400 border-red-700/50',
};

export default function StatusBadge({ status }) {
  const cfg = configs[status] || configs.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClasses[cfg.color]}`}>
      <span>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}