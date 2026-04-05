import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout, isAuthenticated } from '../utils/auth';

/**
 * SecurityHandler Component
 * Implements:
 * 1. Auto-logout after 1 minute of inactivity.
 * 2. Auto-logout on page refresh.
 */
export default function SecurityHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const timeoutRef = useRef(null);
  
  // 1 Minute in milliseconds
  const INACTIVITY_LIMIT = 60 * 1000;

  const handleLogout = () => {
    if (isAuthenticated()) {
      logout();
      navigate('/login', { replace: true });
    }
  };

  // Reset inactivity timer
  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    if (isAuthenticated()) {
      timeoutRef.current = setTimeout(handleLogout, INACTIVITY_LIMIT);
    }
  };

  useEffect(() => {
    // Check if this was a page refresh (ONLY on initial mount)
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries.length > 0 && navEntries[0].type === 'reload') {
      if (isAuthenticated()) {
        logout();
        navigate('/login', { replace: true });
      }
    }
  }, []); // Run only ONCE per application lifecycle

  useEffect(() => {
    // Set up activity listeners
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const activityHandler = () => resetTimer();

    events.forEach(event => {
      window.addEventListener(event, activityHandler);
    });

    // Start initial timer
    resetTimer();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach(event => {
        window.removeEventListener(event, activityHandler);
      });
    };
  }, []); // Listeners are global, setup only once

  return null; // This component doesn't render any UI
}
