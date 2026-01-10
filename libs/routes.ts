/**
 * Centralized route definitions for the application.
 * This ensures consistency across the codebase and makes refactoring easier.
 */

/**
 * UI Routes - Client-side navigation paths
 */
export const ROUTES = {
  AUTH: "/",
  USERS: "/users",
  CONVERSATIONS: "/conversations",
  CONVERSATION_ID: (id: string) => `/conversations/${id}`,
  PROFILE: "/profile",
  PROFILE_ACCOUNT: "/profile/account",
  PROFILE_SECURITY: "/profile/security",
  PROFILE_SESSIONS: "/profile/sessions",
  PROFILE_ACCOUNTS: "/profile/accounts",
  PROFILE_DANGER: "/profile/danger",
} as const;

/**
 * API Routes - Backend endpoints
 */
export const API_ROUTES = {
  REGISTER: "/api/register",
  CONVERSATIONS: "/api/conversations",
  CONVERSATION_ID: (id: string) => `/api/conversations/${id}`,
  CONVERSATION_SEEN: (id: string) => `/api/conversations/${id}/seen`,
  MESSAGES: "/api/messages",
  SETTINGS: "/api/settings",
  PUSHER_AUTH: "/api/pusher/auth",
  ACCOUNT_DELETE: "/api/account/delete",
} as const;

/**
 * Protected routes that require authentication.
 * Used by middleware to enforce access control.
 */
export const PROTECTED_ROUTES = [ROUTES.USERS, ROUTES.CONVERSATIONS, ROUTES.PROFILE] as const;
