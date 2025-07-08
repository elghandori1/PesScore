import React, { useEffect } from 'react';

const ErrorMessage = ({ message, onClose }) => {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="bg-red-50 w-full max-w-md mx-auto text-red-600 p-2 rounded-md mb-3 text-xs sm:text-sm flex items-center justify-between">
      <span>{message}</span>
      <button
        type="button"
        className="text-red-400 hover:text-red-700 font-bold text-lg leading-none focus:outline-none"
        onClick={onClose}
        aria-label="close"
      >
        ×
      </button>
    </div>
  );
};

export default ErrorMessage;