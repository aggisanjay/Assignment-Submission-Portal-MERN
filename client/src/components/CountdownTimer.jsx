import React, { useState, useEffect } from 'react';

export default function CountdownTimer({ deadline }) {
  const [timeLeft, setTimeLeft] = useState({});
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime();
      const end = new Date(deadline).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setIsPast(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setIsPast(false);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  const isUrgent = !isPast && timeLeft.days === 0 && timeLeft.hours < 6;

  if (isPast) {
    return (
      <div className="flex items-center gap-2 text-red-400 bg-red-900/20 border border-red-800/50 rounded-lg px-4 py-2">
        <span className="text-lg">⏰</span>
        <span className="font-semibold text-sm">Deadline Passed</span>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border p-4 ${isUrgent ? 'bg-red-900/20 border-red-700/50' : 'bg-gray-800/50 border-gray-700/50'}`}>
      <p className={`text-xs font-medium mb-3 ${isUrgent ? 'text-red-400' : 'text-gray-400'}`}>
        {isUrgent ? '⚠️ DEADLINE APPROACHING!' : '⏳ Time Remaining'}
      </p>
      <div className="flex gap-3">
        {[
          { val: timeLeft.days, label: 'Days' },
          { val: timeLeft.hours, label: 'Hours' },
          { val: timeLeft.minutes, label: 'Mins' },
          { val: timeLeft.seconds, label: 'Secs' },
        ].map(({ val, label }) => (
          <div key={label} className="flex-1 text-center">
            <div className={`text-2xl font-bold font-mono ${isUrgent ? 'text-red-400' : 'text-indigo-400'}`}>
              {String(val).padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}