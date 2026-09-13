import type { User } from "@/types/db";
import {
  db,
  fromDoc,
  getUsersCollection,
  idFilter,
  toObjectId,
} from "@/utils/db/client";

export const userRepository = {
  /**
   * Retrieves a user by their unique ID.
   */
  async findById(id: string): Promise<User | null> {
    const collection = getUsersCollection();
    const doc = await collection.findOne({ _id: idFilter(id) as any });
    return doc ? fromDoc<User>(doc) : null;
  },

  /**
   * Retrieves a user by their email address.
   */
  async findByEmail(email: string): Promise<User | null> {
    const collection = getUsersCollection();
    const doc = await collection.findOne({ email });
    return doc ? fromDoc<User>(doc) : null;
  },

  /**
   * Gets all users except the user with the specified email, ordered by creation date descending.
   */
  async findManyExcludingEmail(email: string): Promise<User[]> {
    const collection = getUsersCollection();
    const docs = await collection
      .find({ email: { $ne: email } })
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map((doc) => fromDoc<User>(doc));
  },

  /**
   * Retrieves multiple users by their IDs.
   */
  async findManyByIds(ids: string[]): Promise<User[]> {
    if (!ids.length) return [];
    const collection = getUsersCollection();
    const objectIds = ids.map((id) => toObjectId(id));
    const docs = await collection
      .find({
        $or: [{ _id: { $in: objectIds as any } }, { _id: { $in: ids } }],
      })
      .toArray();
    return docs.map((doc) => fromDoc<User>(doc));
  },

  /**
   * Updates a user's profile settings (name and/or image).
   */
  async update(
    id: string,
    data: { name?: string | null; image?: string | null },
  ): Promise<User | null> {
    const collection = getUsersCollection();
    const filter = { _id: idFilter(id) as any };
    const updateDoc: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (data.name !== undefined) updateDoc.name = data.name;
    if (data.image !== undefined) updateDoc.image = data.image;

    await collection.updateOne(filter, { $set: updateDoc });
    return this.findById(id);
  },

  /**
   * Deletes a user by their ID and cascades to their sessions and accounts.
   */
  async delete(id: string): Promise<boolean> {
    const collection = getUsersCollection();
    const filter = { _id: idFilter(id) as any };
    const result = await collection.deleteOne(filter);

    // Also remove any sessions and accounts associated with this user
    await Promise.all([
      db.collection("Session").deleteMany({ userId: idFilter(id) as any }),
      db.collection("Account").deleteMany({ userId: idFilter(id) as any }),
    ]);

    return result.deletedCount > 0;
  },
};
