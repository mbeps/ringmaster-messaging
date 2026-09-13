import { ObjectId } from "mongodb";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockDb, MockMongoClient, mockMongoClientInstances } = vi.hoisted(() => {
  const instances: Array<Record<string, unknown>> = [];
  const db = {
    collection: vi.fn((name: string) => ({ name })),
  };
  const client = vi.fn(function (this: Record<string, unknown>, url: string) {
    this.url = url;
    this.db = vi.fn(() => db);
    instances.push(this);
  });
  return {
    mockDb: db,
    MockMongoClient: client,
    mockMongoClientInstances: instances,
  };
});

vi.mock("mongodb", async (importOriginal) => {
  const actual = await importOriginal<typeof import("mongodb")>();
  return {
    ...actual,
    MongoClient: MockMongoClient,
  };
});

describe("utils/db/client", () => {
  beforeEach(() => {
    vi.resetModules();
    MockMongoClient.mockClear();
    mockDb.collection.mockClear();
    mockMongoClientInstances.length = 0;
    delete (globalThis as any)._mongoClient;
    vi.stubEnv("NODE_ENV", "test");
  });

  it("creates and caches a mongo client in non-production environments", async () => {
    const { mongoClient, db } = await import("@/utils/db/client");

    expect(MockMongoClient).toHaveBeenCalledTimes(1);
    expect(mongoClient).toBe(mockMongoClientInstances[0]);
    expect((globalThis as any)._mongoClient).toBe(mongoClient);
    expect(db).toBe(mockDb);
  });

  it("reuses the cached mongo client when it exists", async () => {
    const cachedClient = { db: vi.fn(() => mockDb) };
    (globalThis as any)._mongoClient = cachedClient;

    const { mongoClient } = await import("@/utils/db/client");

    expect(mongoClient).toBe(cachedClient);
    expect(MockMongoClient).not.toHaveBeenCalled();
  });

  it("does not leak the client to the global scope in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { mongoClient } = await import("@/utils/db/client");

    expect(mongoClient).toBe(mockMongoClientInstances[0]);
    expect((globalThis as any)._mongoClient).toBeUndefined();
  });

  it("toObjectId correctly converts valid hex string to ObjectId and preserves others", async () => {
    const { toObjectId } = await import("@/utils/db/client");

    const validId = "507f1f77bcf86cd799439011";
    const converted = toObjectId(validId);
    expect(converted).toBeInstanceOf(ObjectId);
    expect(converted.toString()).toBe(validId);

    // If already ObjectId
    const objId = new ObjectId();
    expect(toObjectId(objId)).toBe(objId);

    // Non-ObjectId string
    expect(toObjectId("arbitrary-id")).toBe("arbitrary-id");
  });

  it("idFilter returns $in filter for valid 24-char ObjectId and string otherwise", async () => {
    const { idFilter } = await import("@/utils/db/client");

    const validId = "507f1f77bcf86cd799439011";
    const filter = idFilter(validId);
    expect(filter).toEqual({
      $in: [expect.any(ObjectId), validId],
    });

    expect(idFilter("not-an-obj-id")).toBe("not-an-obj-id");
  });

  it("fromDoc correctly normalizes _id to id", async () => {
    const { fromDoc } = await import("@/utils/db/client");

    expect(fromDoc(null)).toBeNull();
    expect(fromDoc(undefined)).toBeUndefined();

    const docWithObjId = {
      _id: new ObjectId("507f1f77bcf86cd799439011"),
      name: "Test",
    };
    expect(fromDoc(docWithObjId)).toEqual({
      id: "507f1f77bcf86cd799439011",
      name: "Test",
    });

    const docWithStringId = {
      _id: "str-id",
      name: "String ID",
    };
    expect(fromDoc(docWithStringId)).toEqual({
      id: "str-id",
      name: "String ID",
    });

    const docWithoutUnderId = {
      id: "existing-id",
      name: "No _id",
    };
    expect(fromDoc(docWithoutUnderId)).toEqual({
      id: "existing-id",
      name: "No _id",
    });
  });

  it("provides typed collection accessors", async () => {
    const {
      getUsersCollection,
      getConversationsCollection,
      getMessagesCollection,
      default: defaultDb,
    } = await import("@/utils/db/client");

    expect(defaultDb).toBe(mockDb);

    getUsersCollection();
    expect(mockDb.collection).toHaveBeenCalledWith("User");

    getConversationsCollection();
    expect(mockDb.collection).toHaveBeenCalledWith("Conversation");

    getMessagesCollection();
    expect(mockDb.collection).toHaveBeenCalledWith("Message");
  });
});
