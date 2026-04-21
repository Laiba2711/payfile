import React from 'react';

/**
 * Loader Component
 *
 * @param {'fullscreen' | 'inline' | 'spinner'} variant
 *   - fullscreen: covers the entire viewport with a backdrop
 *   - inline: small centered spinner (e.g. inside a card)
 *   - spinner: bare spinning ring, use inside buttons or tight spaces
 * @param {string} size  Tailwind size class pair, e.g. "w-8 h-8" (default varies by variant)
 * @param {string} label Optional accessible label / text shown below spinner
 */
const Loader = ({ variant = 'spinner', size, label, className = '' }) => {
  /* ── Spinner ring ─────────────────────────────────────────── */
  const SpinnerRing = ({ sz = 'w-7 h-7' }) => (
    <span className={`relative inline-flex ${sz}`}>
      {/* Outer glow pulse */}
      <span className="absolute inset-0 rounded-full bg-payfile-amber/20 animate-ping" />
      {/* Ring */}
      <svg
        className="w-full h-full animate-spin"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="18" cy="18" r="14"
          stroke="rgba(212,175,55,0.2)"
          strokeWidth="3"
        />
        <path
          d="M18 4 A14 14 0 0 1 32 18"
          stroke="url(#loaderGradient)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#800000" />
            <stop offset="100%" stopColor="#ffbf00" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );

  /* ── Variants ─────────────────────────────────────────────── */
  if (variant === 'fullscreen') {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
        <SpinnerRing sz={size || 'w-14 h-14'} />
        {label && (
          <p className="mt-5 text-[11px] font-black uppercase tracking-[0.25em] text-payfile-maroon/60 animate-pulse">
            {label}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 py-8 ${className}`}>
        <SpinnerRing sz={size || 'w-10 h-10'} />
        {label && (
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-payfile-maroon/50 animate-pulse">
            {label}
          </p>
        )}
      </div>
    );
  }

  /* Default: bare spinner for use inside buttons / compact UI */
  return <SpinnerRing sz={size || 'w-5 h-5'} />;
};

export default Loader;
