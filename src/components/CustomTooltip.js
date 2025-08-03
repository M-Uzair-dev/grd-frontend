"use client";

import { useState } from "react";

export default function CustomTooltip({ text, children, disabled = false }) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (disabled || !text) {
    return children;
  }

  return (
    <div
      className="relative inline-block w-full"
      style={{ opacity: "1 !important" }}
    >
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="cursor-pointer w-full"
      >
        {children}
      </div>
      {showTooltip && (
        <div className="absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap bottom-full left-1/2 transform -translate-x-1/2 mb-2" style={{ animation: 'none', opacity: '1' }}>
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}
