"use client";

export interface AuthContextProps {
  children: React.ReactNode;
}

/**
 * Provides the authentication context for the application.
 * Formerly wrapped SessionProvider, now just a pass-through as Better Auth handles state via hooks internally.
 */
export default function AuthContext({ children }: AuthContextProps) {
  return <>{children}</>;
}