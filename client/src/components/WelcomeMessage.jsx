import React, { useEffect, useState } from 'react';
import useAuth from '../auth/useAuth';

const WelcomeMessage = () => {
  const { user, justLoggedIn, setJustLoggedIn } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (justLoggedIn && user) {
      setShowWelcome(true);
      const timer = setTimeout(() => {
        setShowWelcome(false);
        setJustLoggedIn(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [justLoggedIn, user]);

  if (!showWelcome || !user) return null;

  return (
    <div
    className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 mt-3 px-4 py-2 bg-white rounded-md shadow-md text-sm font-medium text-center animate-fade-in backdrop-blur-sm bg-opacity-90"
    dir="rtl"
  >
    <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
      مرحباً، {user.name}
    </span>
  </div>
  );
};

export default WelcomeMessage;
