import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Eye, EyeOff, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function VideoDetails() {
  const params = useParams();
  const [, navigate] = useLocation();
  const videoId = params?.id ? parseInt(params.id) : null;

  const { data: video, isLoading } = trpc.videos.getById.useQuery(
    { id: videoId! },
    { enabled: !!videoId }
  );

  const { data: categories } = trpc.categories.list.useQuery();
  const toggleWatchedMutation = trpc.videos.toggleWatched.useMutation({
    onSuccess: () => {
      toast.success(video?.watched ? "Marked as unwatched" : "Marked as watched");
    },
  });

  const deleteVideoMutation = trpc.videos.delete.useMutation({
    onSuccess: () => {
      toast.success("Video deleted");
      navigate("/dashboard");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8">
        <div className="container">
          <Button onClick={() => navigate("/dashboard")} variant="outline" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-2">Video not found</h2>
            <p className="text-slate-600 dark:text-slate-400">This video may have been deleted.</p>
          </div>
        </div>
      </div>
    );
  }

  const category = categories?.find((c) => c.id === video.categoryId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container py-8">
        <Button onClick={() => navigate("/dashboard")} variant="outline" className="mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Thumbnail and Player */}
            <Card className="overflow-hidden">
              <div className="aspect-video bg-slate-900 flex items-center justify-center">
                <img
                  src={video.thumbnailUrl || ""}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>

            {/* Video Metadata */}
            <Card className="p-6">
              <h1 className="text-3xl font-bold mb-4">{video.title}</h1>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Channel</p>
                <a
                  href={video.channelUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium flex items-center gap-2"
                >
                  {video.channelName || "Unknown Channel"}
                  <ExternalLink className="w-4 h-4" />
                </a>
                </div>

                {category && (
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Category</p>
                    <div
                      className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.name}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {video.watched ? (
                      <>
                        <Eye className="w-4 h-4 text-green-600" />
                        <span className="text-green-600 font-medium">Watched</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">Unwatched</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* AI Summary */}
            {video.aiSummary && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">AI Summary</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{video.aiSummary}</p>
              </Card>
            )}

            {/* Description */}
            {video.description && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Description</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{video.description}</p>
              </Card>
            )}

            {/* Watch on YouTube */}
            <Card className="p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-900/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Ready to watch?</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Open this video on YouTube
                  </p>
                </div>
                <Button asChild className="bg-red-600 hover:bg-red-700">
                  <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer">
                    Watch on YouTube
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Actions</h3>
              <div className="space-y-3">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => toggleWatchedMutation.mutate({ id: video.id })}
                >
                  {video.watched ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Mark as Unwatched
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Mark as Watched
                    </>
                  )}
                </Button>

                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={() => deleteVideoMutation.mutate({ id: video.id })}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Video
                </Button>
              </div>
            </Card>

            {/* Video Info */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">Added</p>
                  <p className="font-medium">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">Video ID</p>
                  <p className="font-mono text-xs break-all">{video.youtubeId}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
