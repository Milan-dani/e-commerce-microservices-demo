"use client";

import React from 'react';
import Button from './Button';

export default function ErrorResetButton({ reset }) {
  if (!reset) return null;
  return (
    // <button
    //   onClick={() => reset()}
    //   className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    // >
    //   Try again
    // </button>
     <Button
      onClick={() => reset()}
      // className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Try again
    </Button>
  );
}
