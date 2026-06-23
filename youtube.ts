/**
 * YouTube utilities for extracting video ID and metadata
 */

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYoutubeId(url: string): string | null {
  try {
    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  } catch (error) {
    console.error("[YouTube] Failed to extract video ID:", error);
    return null;
  }
}

/**
 * Fetch YouTube video metadata using oEmbed API
 */
export async function fetchYoutubeMetadata(videoId: string) {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

    const response = await fetch(oembedUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }

    const data = (await response.json()) as {
      title?: string;
      author_name?: string;
      author_url?: string;
      thumbnail_url?: string;
      thumbnail_width?: number;
      thumbnail_height?: number;
    };

    return {
      title: data.title || "Unknown Title",
      channelName: data.author_name || "Unknown Channel",
      channelUrl: data.author_url || "",
      thumbnailUrl: data.thumbnail_url || "",
    };
  } catch (error) {
    console.error("[YouTube] Failed to fetch metadata:", error);
    return {
      title: "Unknown Title",
      channelName: "Unknown Channel",
      channelUrl: "",
      thumbnailUrl: "",
    };
  }
}

/**
 * Construct YouTube URL from video ID
 */
export function constructYoutubeUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Validate YouTube URL format
 */
export function isValidYoutubeUrl(url: string): boolean {
  try {
    const videoId = extractYoutubeId(url);
    return videoId !== null && videoId.length === 11;
  } catch {
    return false;
  }
}
