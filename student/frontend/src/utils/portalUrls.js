/**
 * Utility to determine correct portal URLs across development and production (GitHub Pages) environments.
 */
export const getPortalUrl = (targetRole) => {
  if (typeof window === 'undefined') return '/';

  // In Vite Dev mode (npm run dev), redirect across individual dev server ports
  if (import.meta.env.DEV) {
    if (targetRole === 'consultancy') {
      return import.meta.env.VITE_CONSULTANCY_PORTAL_URL || 'http://localhost:5174';
    }
    if (targetRole === 'admin') {
      return import.meta.env.VITE_ADMIN_PORTAL_URL || 'http://localhost:5175';
    }
    return import.meta.env.VITE_STUDENT_PORTAL_URL || 'http://localhost:5173';
  }

  // In Production (GitHub Pages or unified static site deployment)
  const rawBase = import.meta.env.BASE_URL || '/';
  const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  const origin = window.location.origin;

  if (targetRole === 'consultancy') {
    return `${origin}${base}consultancy/`;
  }
  if (targetRole === 'admin') {
    return `${origin}${base}admin/`;
  }
  return `${origin}${base}`;
};
