/**
 * Core User entity representing a registered user in the messaging system.
 */
export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  image: string | null;
  hashedPassword: string | null;
  createdAt: Date;
  updatedAt: Date;
  conversationIds: string[];
  seenMessageIds: string[];
}
