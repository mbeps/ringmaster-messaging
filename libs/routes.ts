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
} as const;

/**
 * Protected routes that require authentication.
 * Used by middleware to enforce access control.
 */
export const PROTECTED_ROUTES = [ROUTES.USERS, ROUTES.CONVERSATIONS] as const;
