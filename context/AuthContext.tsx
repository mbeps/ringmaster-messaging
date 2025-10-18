"use client";

import { SessionProvider } from "next-auth/react";

export interface AuthContextProps {
  children: React.ReactNode;
}

/**
 * Provides the authentication context for the application.
 * All the children will have access to the authentication context.
 * This is a client side component.
 *
 * @param param0 {children: React.ReactNode}: children which will have access to the authentication context.
 * @returns (React.ReactNode): children with access to the authentication context.
 */
export default function AuthContext({ children }: AuthContextProps) {
  return <SessionProvider>{children}</SessionProvider>;
}