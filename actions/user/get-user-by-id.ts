import { userRepository } from "@/db/repositories/user-repository";

/**
 * Retrieves a user by their ID.
 *
 * @param id - User's unique identifier
 * @returns User object or null if not found
 */
export default async function getUserById(id: string) {
  try {
    const user = await userRepository.findById(id);
    return user;
  } catch {
    return null;
  }
}
