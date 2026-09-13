import { userRepository } from "@/db/repositories/user-repository";

/**
 * Retrieves a user by their email address.
 *
 * @param email - User's email address
 * @returns User object or null if not found
 */
export default async function getUserByEmail(email: string) {
  try {
    const user = await userRepository.findByEmail(email);
    return user;
  } catch {
    return null;
  }
}
