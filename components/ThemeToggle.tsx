'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Check current theme from document
    setIsDark(document.documentElement.classList.contains('dark'));
    setIsMounted(true);
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  if (!isMounted) {
    return <div className="w-9 h-9" />;
  }

  return (
    <button
      onClick={toggleTheme}
      className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      aria-label="Toggle dark mode"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        // Sun icon for dark mode (click to switch to light)
        <svg
          className="w-5 h-5 text-yellow-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 1.78a1 1 0 011.39 0l.707.707a1 1 0 11-1.39 1.39l-.707-.707a1 1 0 010-1.39zm2.83 2.83a1 1 0 011.39 0l.707.707a1 1 0 11-1.39 1.39l-.707-.707a1 1 0 010-1.39zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm1.22 4.22a1 1 0 001.39-1.39l-.707-.707a1 1 0 10-1.39 1.39l.707.707zM11 17a1 1 0 102 0v-1a1 1 0 10-2 0v1zm3.78-1.22a1 1 0 001.39-1.39l-.707-.707a1 1 0 10-1.39 1.39l.707.707zM5.78 4.22a1 1 0 011.39 0l.707.707a1 1 0 01-1.39 1.39L5.78 5.61a1 1 0 010-1.39zM3 11a1 1 0 100-2H2a1 1 0 100 2h1zm1.22 4.22a1 1 0 01-1.39-1.39l.707-.707a1 1 0 011.39 1.39l-.707.707zM10 17a1 1 0 112 0v-1a1 1 0 11-2 0v1zm3-5.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        // Moon icon for light mode (click to switch to dark)
        <svg
          className="w-5 h-5 text-slate-700"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
}
