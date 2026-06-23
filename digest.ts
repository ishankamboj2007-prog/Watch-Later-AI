import { getDb } from "./db";
import { notifyOwner } from "./_core/notification";
import { gte } from "drizzle-orm";
import { digestNotifications, videos, categories } from "../drizzle/schema";

/**
 * Generate and send a digest notification listing newly added videos
 * This should be called periodically (e.g., daily or weekly)
 */
export async function sendDigestNotification() {
  const db = await getDb();
  if (!db) {
    console.warn("[Digest] Database not available");
    return;
  }

  try {
    // Check if tables exist by attempting a simple query
    try {
      await db.select().from(videos).limit(1);
    } catch (tableError: any) {
      if (tableError?.message?.includes("doesn't exist")) {
        console.log("[Digest] Tables not yet created, skipping digest");
        return;
      }
      throw tableError;
    }
    // Get the last digest time (default to 7 days ago)
    const lastDigestResult = await db
      .select()
      .from(digestNotifications)
      .orderBy((t) => t.lastSentAt)
      .limit(1);

    const lastDigestTime = lastDigestResult[0]?.lastSentAt || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get new videos since last digest
    const newVideos = await db
      .select()
      .from(videos)
      .where(gte(videos.createdAt, lastDigestTime));

    if (newVideos.length === 0) {
      console.log("[Digest] No new videos to report");
      return;
    }

    // Fetch all categories for mapping
    const allCategories = await db.select().from(categories);
    const categoryMap = new Map(allCategories.map((c) => [c.id, c]));

    // Group videos by category
    const videosByCategory: Record<string, { name: string; videos: typeof newVideos }> = {};
    newVideos.forEach((video) => {
      const categoryId = video.categoryId || 0;
      const category = categoryMap.get(categoryId);
      const categoryName = category?.name || "Uncategorized";

      if (!videosByCategory[categoryName]) {
        videosByCategory[categoryName] = { name: categoryName, videos: [] };
      }
      videosByCategory[categoryName].videos.push(video);
    });

    // Build digest content
    let digestContent = `📺 **Your Weekly Video Digest**\n\n`;
    digestContent += `You've added **${newVideos.length}** new videos to your library!\n\n`;

    Object.entries(videosByCategory).forEach(([categoryName, { videos: categoryVideos }]) => {
      digestContent += `**${categoryName}** (${categoryVideos.length})\n`;
      categoryVideos.forEach((video) => {
        digestContent += `- ${video.title}\n`;
        if (video.aiSummary) {
          digestContent += `  *${video.aiSummary.substring(0, 100)}...*\n`;
        }
      });
      digestContent += "\n";
    });

    digestContent += `[View your library](${process.env.VITE_FRONTEND_URL || "https://app.example.com"})`;

    // Send notification to owner
    const notificationSent = await notifyOwner({
      title: `📺 Your Weekly Video Digest - ${newVideos.length} new video${newVideos.length !== 1 ? "s" : ""}`,
      content: digestContent,
    });

    if (notificationSent) {
      // Record the digest notification
      // Note: videosIncluded is a JSON array of video IDs
      const videoIds = newVideos.map((v) => v.id);
      await db.insert(digestNotifications).values({
        userId: newVideos[0]?.userId || 1, // Use first video's userId or default
        videosIncluded: videoIds,
        lastSentAt: new Date(),
      });

      console.log(`[Digest] Successfully sent digest for ${newVideos.length} video(s) to owner`);
    } else {
      console.warn("[Digest] Failed to send notification to owner");
    }
  } catch (error: any) {
    // Silently ignore table-not-found errors during development
    if (error?.message?.includes("doesn't exist")) {
      console.log("[Digest] Skipping digest - tables not ready");
      return;
    }
    console.error("[Digest] Error sending digest:", error instanceof Error ? error.message : error);
  }
}

/**
 * Schedule digest notifications
 * Call this from your server startup to set up periodic digests
 */
export function scheduleDigestNotifications() {
  // Run digest every 7 days (weekly)
  const DIGEST_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  // Run immediately on startup
  sendDigestNotification().catch((error) => {
    console.error("[Digest] Initial digest failed:", error);
  });

  // Schedule recurring digest
  setInterval(
    () => {
      sendDigestNotification().catch((error) => {
        console.error("[Digest] Scheduled digest failed:", error);
      });
    },
    DIGEST_INTERVAL
  );

  console.log("[Digest] Scheduled weekly digest notifications");
}
