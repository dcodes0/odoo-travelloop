// Session configuration for iron-session
// Used across all API routes that need authentication

export const sessionOptions = {
  password: process.env.SESSION_SECRET ?? 'traveloop-dev-secret-key-must-be-at-least-32-chars!!',
  cookieName: 'traveloop_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

/**
 * Shape of the session object stored in the cookie.
 * @typedef {{ id: string, email: string, name: string|null, role: string }} SessionUser
 */
