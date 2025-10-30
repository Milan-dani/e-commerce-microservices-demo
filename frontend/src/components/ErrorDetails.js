"use client";

import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function ErrorDetails({ message }) {
  const [open, setOpen] = useState(false);

  if (!message) return null;

  return (
    <AnimatePresence>
    <div className="mt-4 text-left">
      <button
        onClick={() => setOpen((s) => !s)}
        className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {open ? 'Hide details' : 'Show details'}
      </button>

      <div className={`mt-3 p-3 bg-gray-100 rounded text-sm text-red-700 ${open ? 'block' : 'hidden'}`}>
        <pre className="whitespace-pre-wrap">{message}</pre>
        <p className="mt-2 text-xs text-gray-500">Be careful: error details may contain sensitive information. Only share with trusted parties.</p>
      </div>
    </div>
    </AnimatePresence>
  );
}
