"use client";

import type { AuthContextProps } from "@/types/auth/auth-context-props";

/**
 * Provides the authentication context for the application.
 * Formerly wrapped SessionProvider, now just a pass-through as Better Auth handles state via hooks internally.
 */
export default function AuthProvider({ children }: AuthContextProps) {
  return <>{children}</>;
}
