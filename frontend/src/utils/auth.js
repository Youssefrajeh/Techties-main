/**
 * TechTies Authentication Module
 * ─────────────────────────────────────────────────────
 * Dynamic user registration + login with localStorage
 * session management.
 */

const SESSION_KEY = "techties_session";

/* ── Social Login ─────────────────────────────────── */

/* ── Social Login ─────────────────────────────────── */
/**
 * Simulate a social OAuth login (1 s delay).
 * @param {'google'|'github'} provider
 * @returns {Promise<{success: boolean, user: object}>}
 */
export function mockSocialLogin(provider) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const names = { google: "Google User", github: "GitHub User" };
      const emails = { google: "user@gmail.com", github: "user@github.com" };

      const session = {
        email: emails[provider],
        name: names[provider],
        provider,
        loggedInAt: Date.now(),
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));

      resolve({ success: true, user: session });
    }, 1000);
  });
}

/* ── Session helpers ──────────────────────────────── */

/** Returns the stored session object, or null if not logged in. */
export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Returns true if a session exists in localStorage. */
export function isAuthenticated() {
  return getSession() !== null;
}

/** Clears the session and auth token from localStorage. */
export function logout() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("token");
}

/** Clear the isNewUser flag after profile setup */
export function clearNewUserFlag() {
  const session = getSession();
  if (session) {
    delete session.isNewUser;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}
