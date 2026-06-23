import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  videos,
  InsertVideo,
  Video,
  categories,
  InsertCategory,
  Category,
  userPreferences,
  UserPreference,
  InsertUserPreference,
  videoTags,
  InsertVideoTag,
  digestNotifications,
  InsertDigestNotification,
  DigestNotification,
  videoMoods,
  InsertVideoMood,
  VideoMood,
  collections,
  InsertCollection,
  Collection,
  collectionVideos,
  InsertCollectionVideo,
  CollectionVideo,
  shareLinks,
  InsertShareLink,
  ShareLink,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Video queries
export async function getVideosByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(videos).where(eq(videos.userId, userId)).orderBy(videos.createdAt);
}

export async function getVideoById(videoId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(videos).where(eq(videos.id, videoId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function insertVideo(video: InsertVideo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(videos).values(video);
  return result;
}

export async function updateVideo(videoId: number, updates: Partial<Video>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(videos).set(updates).where(eq(videos.id, videoId));
}

export async function deleteVideo(videoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(videos).where(eq(videos.id, videoId));
}

// Category queries
export async function getCategoriesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).where(eq(categories.userId, userId)).orderBy(categories.name);
}

export async function getCategoryById(categoryId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.id, categoryId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function insertCategory(category: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(categories).values(category);
  return result;
}

export async function updateCategory(categoryId: number, updates: Partial<Category>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(categories).set(updates).where(eq(categories.id, categoryId));
}

export async function deleteCategory(categoryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(categories).where(eq(categories.id, categoryId));
}

// User preferences queries
export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertUserPreferences(userId: number, prefs: Partial<UserPreference>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getUserPreferences(userId);
  if (existing) {
    return db.update(userPreferences).set(prefs).where(eq(userPreferences.userId, userId));
  } else {
    return db.insert(userPreferences).values({ userId, ...prefs });
  }
}

// Video tags queries
export async function getVideoTags(videoId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(videoTags).where(eq(videoTags.videoId, videoId));
}

export async function insertVideoTag(tag: InsertVideoTag) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(videoTags).values(tag);
}

// Digest notification queries
export async function getDigestNotification(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(digestNotifications).where(eq(digestNotifications.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertDigestNotification(userId: number, digest: Partial<DigestNotification>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getDigestNotification(userId);
  if (existing) {
    return db.update(digestNotifications).set(digest).where(eq(digestNotifications.userId, userId));
  } else {
    return db.insert(digestNotifications).values({ userId, ...digest });
  }
}

// Video moods queries
export async function getVideoMoods(videoId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(videoMoods).where(eq(videoMoods.videoId, videoId));
}

export async function insertVideoMood(mood: InsertVideoMood) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(videoMoods).values(mood);
}

export async function getVideosByMood(userId: number, mood: string) {
  const db = await getDb();
  if (!db) return [];
  const userVideos = await db.select().from(videos).where(eq(videos.userId, userId));
  const videoIds = userVideos.map(v => v.id);
  if (videoIds.length === 0) return [];
  return db.select().from(videoMoods).where(eq(videoMoods.mood, mood as any)).then(moods => 
    userVideos.filter(v => moods.some(m => m.videoId === v.id))
  );
}

// Collections queries
export async function getCollectionsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(collections).where(eq(collections.userId, userId)).orderBy(collections.createdAt);
}

export async function insertCollection(collection: InsertCollection) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(collections).values(collection);
}

export async function updateCollection(collectionId: number, updates: Partial<Collection>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(collections).set(updates).where(eq(collections.id, collectionId));
}

export async function deleteCollection(collectionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(collections).where(eq(collections.id, collectionId));
}

// Collection videos queries
export async function getCollectionVideos(collectionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(collectionVideos).where(eq(collectionVideos.collectionId, collectionId)).orderBy(collectionVideos.position);
}

export async function addVideoToCollection(collectionVideo: InsertCollectionVideo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(collectionVideos).values(collectionVideo);
}

export async function removeVideoFromCollection(collectionId: number, videoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(collectionVideos).where(
    eq(collectionVideos.collectionId, collectionId) && eq(collectionVideos.videoId, videoId)
  );
}

// Share links queries
export async function getShareLink(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(shareLinks).where(eq(shareLinks.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createShareLink(shareLink: InsertShareLink) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(shareLinks).values(shareLink);
}

export async function getShareLinksByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(shareLinks).where(eq(shareLinks.userId, userId));
}

// TODO: add feature queries here as your schema grows.
