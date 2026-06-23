import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import * as db from "./db";
import * as youtube from "./youtube";
import * as ai from "./ai";
import type { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  videos: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getVideosByUserId(ctx.user.id);
    }),

    getById: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "id" in val) {
          return { id: (val as { id: unknown }).id };
        }
        throw new Error("Invalid input");
      })
      .query(async ({ input, ctx }) => {
        const video = await db.getVideoById(input.id as number);
        if (!video || video.userId !== ctx.user.id) {
          throw new Error("Video not found");
        }
        return video;
      }),

    add: protectedProcedure
      .input((val: unknown) => {
        if (
          typeof val === "object" &&
          val !== null &&
          "youtubeUrl" in val &&
          "description" in val
        ) {
          return val as { youtubeUrl: string; description: string };
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input, ctx }) => {
        // Extract video ID
        const videoId = youtube.extractYoutubeId(input.youtubeUrl);
        if (!videoId) {
          throw new Error("Invalid YouTube URL");
        }

        // Fetch metadata
        const metadata = await youtube.fetchYoutubeMetadata(videoId);

        // Generate AI categorization
        const categoryName = await ai.categorizeVideo(
          metadata.title,
          input.description,
          metadata.channelName
        );

        // Get or create category
        let categoryId: number | undefined;
        const categories = await db.getCategoriesByUserId(ctx.user.id);
        const existingCategory = categories.find((c) => c.name === categoryName);

        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          // Create new category with color
          const colors = [
            "#3B82F6",
            "#8B5CF6",
            "#10B981",
            "#F59E0B",
            "#EF4444",
            "#EC4899",
            "#14B8A6",
            "#F97316",
            "#6366F1",
            "#84CC16",
            "#06B6D4",
            "#0EA5E9",
            "#D946EF",
            "#6B7280",
          ];
          const colorIndex = ai.DEFAULT_CATEGORIES.indexOf(categoryName);
          const defaultColor = colorIndex !== -1 ? colors[colorIndex] : "#3B82F6";

        const result = await db.insertCategory({
          userId: ctx.user.id,
          name: categoryName,
          color: defaultColor,
          isDefault: ai.DEFAULT_CATEGORIES.includes(categoryName),
        });
        categoryId = (result as any)?.insertId as number | undefined;
        }

        // Generate AI summary
        const aiSummary = await ai.summarizeVideo(
          metadata.title,
          input.description,
          metadata.channelName
        );

        // Insert video
        const videoResult = await db.insertVideo({
          userId: ctx.user.id,
          youtubeId: videoId,
          title: metadata.title,
          description: input.description,
          channelName: metadata.channelName,
          channelUrl: metadata.channelUrl,
          thumbnailUrl: metadata.thumbnailUrl,
          youtubeUrl: youtube.constructYoutubeUrl(videoId),
          aiSummary,
          categoryId,
        });

        const newVideoId = ((videoResult as any)?.insertId as number) || 0;

        // Extract and insert tags
        const tags = await ai.extractTags(metadata.title, input.description);
        for (const tag of tags) {
          await db.insertVideoTag({
            videoId: newVideoId,
            tag,
          });
        }

        // Return the created video
        return db.getVideoById(newVideoId);
      }),

    toggleWatched: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "id" in val) {
          return { id: (val as { id: unknown }).id };
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input, ctx }) => {
        const video = await db.getVideoById(input.id as number);
        if (!video || video.userId !== ctx.user.id) {
          throw new Error("Video not found");
        }
        await db.updateVideo(input.id as number, { watched: !video.watched });
        return db.getVideoById(input.id as number);
      }),

    delete: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "id" in val) {
          return { id: (val as { id: unknown }).id };
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input, ctx }) => {
        const video = await db.getVideoById(input.id as number);
        if (!video || video.userId !== ctx.user.id) {
          throw new Error("Video not found");
        }
        await db.deleteVideo(input.id as number);
        return { success: true };
      }),

    search: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "query" in val) {
          return { query: (val as { query: unknown }).query };
        }
        throw new Error("Invalid input");
      })
      .query(async ({ input, ctx }) => {
        const videos = await db.getVideosByUserId(ctx.user.id);
        const videoData = videos.map((v) => ({
          id: v.id,
          title: v.title,
          description: v.description || "",
          channelName: v.channelName || "",
        }));

        const matchingIds = await ai.semanticSearch(input.query as string, videoData);
        return videos.filter((v) => matchingIds.includes(v.id));
      }),
  }),

  categories: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getCategoriesByUserId(ctx.user.id);
    }),

    create: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "name" in val && "color" in val) {
          return val as { name: string; color: string; description?: string };
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input, ctx }) => {
        const result = await db.insertCategory({
          userId: ctx.user.id,
          name: input.name as string,
          color: input.color as string,
          description: (input as { description?: string }).description,
        });
        return { id: (result as any)?.insertId };
      }),

    update: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "id" in val) {
          return val as { id: number; name?: string; color?: string; description?: string };
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input, ctx }) => {
        const category = await db.getCategoryById(input.id as number);
        if (!category || category.userId !== ctx.user.id) {
          throw new Error("Category not found");
        }
        const updates: Record<string, unknown> = {};
        if ((input as { name?: string }).name) updates.name = (input as { name?: string }).name;
        if ((input as { color?: string }).color) updates.color = (input as { color?: string }).color;
        if ((input as { description?: string }).description)
          updates.description = (input as { description?: string }).description;
        await db.updateCategory(input.id as number, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "id" in val) {
          return { id: (val as { id: unknown }).id };
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input, ctx }) => {
        const category = await db.getCategoryById(input.id as number);
        if (!category || category.userId !== ctx.user.id) {
          throw new Error("Category not found");
        }
        await db.deleteCategory(input.id as number);
        return { success: true };
      }),
  }),

  settings: router({
    getPreferences: protectedProcedure.query(async ({ ctx }) => {
      const prefs = await db.getUserPreferences(ctx.user.id);
      return prefs || { userId: ctx.user.id, viewMode: "grid" as const };
    }),

    updatePreferences: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "viewMode" in val) {
          const mode = (val as { viewMode: unknown }).viewMode;
          if (mode === "grid" || mode === "list") {
            return { viewMode: mode };
          }
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input, ctx }) => {
        await db.upsertUserPreferences(ctx.user.id, {
          viewMode: input.viewMode as "grid" | "list",
        });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
