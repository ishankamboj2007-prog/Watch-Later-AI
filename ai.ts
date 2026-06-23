import { invokeLLM } from "./_core/llm";

/**
 * Default categories for video organization
 */
export const DEFAULT_CATEGORIES = [
  "Programming",
  "Science",
  "Business",
  "Productivity",
  "Design",
  "Marketing",
  "Finance",
  "Education",
  "Entertainment",
  "Music",
  "Sports",
  "Health",
  "Travel",
  "Other",
];

/**
 * Categorize a video based on its metadata using LLM
 */
export async function categorizeVideo(
  title: string,
  description: string,
  channelName: string
): Promise<string> {
  try {
    const categoriesStr = DEFAULT_CATEGORIES.join(", ");
    const prompt = `You are a video categorization expert. Analyze the following video and assign it to EXACTLY ONE category from this list: ${categoriesStr}

Video Title: ${title}
Channel: ${channelName}
Description: ${description}

Respond with ONLY the category name, nothing else. Choose the most relevant single category.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a video categorization expert. Always respond with only a category name from the provided list.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message.content;
    const category = typeof content === "string" ? content.trim() : "Other";

    // Validate that the response is in our categories list
    if (DEFAULT_CATEGORIES.includes(category)) {
      return category;
    }

    // If not in list, find closest match or return "Other"
    return "Other";
  } catch (error) {
    console.error("[AI] Categorization error:", error);
    return "Other";
  }
}

/**
 * Generate a concise AI summary of a video
 */
export async function summarizeVideo(
  title: string,
  description: string,
  channelName: string
): Promise<string> {
  try {
    const prompt = `You are a video summary expert. Create a concise 1-2 sentence summary of this video based on its metadata.

Video Title: ${title}
Channel: ${channelName}
Description: ${description}

Provide a brief, informative summary that captures the main topic or value of the video.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a video summary expert. Create concise, informative summaries in 1-2 sentences.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message.content;
    const summary = typeof content === "string" ? content.trim() : "";
    return summary || "No summary available";
  } catch (error) {
    console.error("[AI] Summarization error:", error);
    return "No summary available";
  }
}

/**
 * Perform semantic search on videos using LLM understanding
 */
export async function semanticSearch(
  query: string,
  videos: Array<{ id: number; title: string; description: string; channelName: string }>
): Promise<number[]> {
  try {
    if (videos.length === 0) {
      return [];
    }

    const videosStr = videos
      .map(
        (v) =>
          `ID: ${v.id}, Title: ${v.title}, Channel: ${v.channelName}, Description: ${v.description}`
      )
      .join("\n");

    const prompt = `You are a semantic search expert. Given a search query, identify which videos from the list are relevant.

Search Query: "${query}"

Videos:
${videosStr}

Respond with ONLY a comma-separated list of video IDs that are relevant to the query. If no videos are relevant, respond with "none".`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a semantic search expert. Understand the intent of queries and find relevant videos. Respond with only video IDs or 'none'.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message.content;
    const result = typeof content === "string" ? content.trim() : "none";

    if (result.toLowerCase() === "none") {
      return [];
    }

    // Parse the comma-separated IDs
    const ids = result
      .split(",")
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id));

    return ids;
  } catch (error) {
    console.error("[AI] Semantic search error:", error);
    return [];
  }
}

/**
 * Extract tags from video metadata
 */
export async function extractTags(
  title: string,
  description: string
): Promise<string[]> {
  try {
    const prompt = `Extract 3-5 relevant tags from this video. Tags should be single words or short phrases (max 2 words).

Video Title: ${title}
Description: ${description}

Respond with ONLY a comma-separated list of tags, nothing else.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a tag extraction expert. Extract relevant, concise tags from video metadata.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message.content;
    const tagsStr = typeof content === "string" ? content.trim() : "";
    const tags = tagsStr
      .split(",")
      .map((tag: string) => tag.trim().toLowerCase())
      .filter((tag: string) => tag.length > 0 && tag.length < 50);

    return tags.slice(0, 5) as string[]; // Limit to 5 tags
  } catch (error) {
    console.error("[AI] Tag extraction error:", error);
    return [];
  }
}
