/**
 * Centralised route definitions for the application.
 * Follows the centralised-routes pattern:
 * - Base path constants
 * - Grouped by domain
 * - Static strings for static routes (`path`)
 * - Typed helper functions for dynamic routes
 * - Access control and auth concerns kept separate
 */

const USERS_BASE = "/users";
const CONVERSATIONS_BASE = "/conversations";
const PROFILE_BASE = "/profile";

const API_BASE = "/api";
const API_CONVERSATIONS_BASE = `${API_BASE}/conversations`;

/**
 * UI Routes - Client-side navigation paths grouped by domain.
 */
export const ROUTES = {
  AUTH: {
    path: "/",
  },
  USERS: {
    path: USERS_BASE,
  },
  CONVERSATIONS: {
    path: CONVERSATIONS_BASE,
    detail: (id: string) => `${CONVERSATIONS_BASE}/${id}`,
  },
  PROFILE: {
    path: PROFILE_BASE,
    account: `${PROFILE_BASE}/account`,
    security: `${PROFILE_BASE}/security`,
    sessions: `${PROFILE_BASE}/sessions`,
    accounts: `${PROFILE_BASE}/accounts`,
    danger: `${PROFILE_BASE}/danger`,
  },
} as const;

export type Routes = typeof ROUTES;

/**
 * API Routes - Backend endpoints grouped by domain.
 */
export const API_ROUTES = {
  CONVERSATIONS: {
    path: API_CONVERSATIONS_BASE,
    detail: (id: string) => `${API_CONVERSATIONS_BASE}/${id}`,
    seen: (id: string) => `${API_CONVERSATIONS_BASE}/${id}/seen`,
  },
  MESSAGES: {
    path: `${API_BASE}/messages`,
  },
  SETTINGS: {
    path: `${API_BASE}/settings`,
  },
  PUSHER: {
    auth: `${API_BASE}/pusher/auth`,
  },
  ACCOUNT: {
    delete: `${API_BASE}/account/delete`,
  },
} as const;

export type ApiRoutes = typeof API_ROUTES;
