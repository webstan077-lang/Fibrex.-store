import React, { useState, useEffect } from 'react';
import fibrexLogoImg from '../assets/images/fibrex_app_icon_1790957656248.jpg';

interface WebsitePreloaderProps {
  onComplete?: () => void;
}

export const WebsitePreloader: React.FC<WebsitePreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState('Initializing Fibrex Store...');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Stage 1: Fast start
    const timer1 = setTimeout(() => {
      setProgress(45);
      setStatusText('Loading product catalog & deals...');
    }, 300);

    // Stage 2: Verification
    const timer2 = setTimeout(() => {
      setProgress(85);
      setStatusText('Preparing your shopping experience...');
    }, 700);

    // Stage 3: Complete
    const timer3 = setTimeout(() => {
      setProgress(100);
      setStatusText('Welcome to Fibrex!');
    }, 1100);

    // Stage 4: Trigger fade out
    const timer4 = setTimeout(() => {
      setIsFadingOut(true);
    }, 1350);

    // Stage 5: Unmount
    const timer5 = setTimeout(() => {
      setIsDone(true);
      onComplete?.();
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [onComplete]);

  if (isDone) return null;

  return (
    <div
      className={`fixed inset-0 z-9999 flex flex-col items-center justify-center bg-slate-950 text-white transition-all duration-500 ease-out select-none ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{ willChange: 'opacity, transform' }}
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/25 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
        {/* Animated Brand Icon with Glowing Ring */}
        <div className="relative mb-6">
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-3xl opacity-75 blur-md animate-pulse" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden shadow-2xl border border-cyan-500/40 bg-black flex items-center justify-center transform transition-transform duration-700 hover:scale-105">
            <img
              src={fibrexLogoImg}
              alt="Fibrex Store Icon"
              className="w-full h-full object-contain drop-shadow-md"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Brand Title */}
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-1 mb-1">
          Fibrex<span className="text-cyan-400">.</span> Store
        </h1>
        <p className="text-xs text-cyan-300/80 font-medium mb-6 tracking-wide uppercase">
          Next-Generation Marketplace
        </p>

        {/* Progress Bar Container */}
        <div className="w-56 sm:w-64 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5 shadow-inner mb-3">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-300 ease-out shadow-xs shadow-cyan-400/50"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Dynamic Status Text */}
        <div className="flex items-center justify-between w-56 sm:w-64 text-[11px] text-slate-400 font-medium">
          <span className="truncate pr-2">{statusText}</span>
          <span className="font-mono text-cyan-400 font-bold shrink-0">{progress}%</span>
        </div>
      </div>
    </div>
  );
};
