import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Grid3x3, List, Plus, Search, Eye, EyeOff, Trash2 } from "lucide-react";
import AddVideoModal from "@/components/AddVideoModal";

export default function Dashboard() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchInput, setSearchInput] = useState("");
  const searchQuery = trpc.videos.search.useQuery(
    { query: searchInput as string },
    { enabled: searchInput.trim().length > 0 }
  );
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch data
  const { data: videos, isLoading: videosLoading, refetch: refetchVideos } = trpc.videos.list.useQuery();
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: preferences } = trpc.settings.getPreferences.useQuery();

  // Mutations
  const toggleWatchedMutation = trpc.videos.toggleWatched.useMutation({
    onSuccess: () => {
      refetchVideos();
    },
  });

  const deleteVideoMutation = trpc.videos.delete.useMutation({
    onSuccess: () => {
      refetchVideos();
    },
  });



  // Filter and search videos
  const filteredVideos = useMemo(() => {
    // Use semantic search results if available
    const baseVideos = searchInput.trim().length > 0 && searchQuery.data ? searchQuery.data : videos;
    if (!baseVideos) return [];

    let result = [...baseVideos];

    // Filter by category
    if (selectedCategory) {
      result = result.filter((v) => v.categoryId === selectedCategory);
    }

    return result;
  }, [videos, selectedCategory, searchInput, searchQuery.data]);

  if (videosLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8">
        <div className="container">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">My Video Library</h1>
            <Button onClick={() => setShowAddModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Video
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search videos..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory ? selectedCategory.toString() : "all"} onValueChange={(v) => setSelectedCategory(v === "all" ? null : parseInt(v))}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
            {filteredVideos.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No videos found</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {videos?.length === 0
                ? "Start by adding your first video"
                : searchInput.trim()
                ? "No videos match your search"
                : "Try adjusting your filters"}
            </p>
            {videos?.length === 0 && (
              <Button onClick={() => setShowAddModal(true)}>Add Your First Video</Button>
            )}
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredVideos.map((video: any) => (
              <VideoCard
                key={video.id}
                video={video}
                viewMode={viewMode}
                category={categories?.find((c) => c.id === video.categoryId)}
                onToggleWatched={() => toggleWatchedMutation.mutate({ id: video.id })}
                onDelete={() => deleteVideoMutation.mutate({ id: video.id })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Video Modal */}
      <AddVideoModal open={showAddModal} onOpenChange={setShowAddModal} onSuccess={refetchVideos} />
    </div>
  );
}

interface VideoCardProps {
  video: any;
  viewMode: "grid" | "list";
  category?: any;
  onToggleWatched: () => void;
  onDelete: () => void;
}

function VideoCard({ video, viewMode, category, onToggleWatched, onDelete }: VideoCardProps) {
  if (viewMode === "list") {
    return (
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex gap-4">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{video.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{video.channelName}</p>
            {category && (
              <div
                className="inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: category.color }}
              >
                {category.name}
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                onToggleWatched();
              }}
              title={video.watched ? "Mark unwatched" : "Mark watched"}
            >
              {video.watched ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
      <div className="relative aspect-video overflow-hidden bg-slate-200 dark:bg-slate-800">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <Button
            variant="secondary"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onToggleWatched}
          >
            {video.watched ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </Button>
        </div>
        {video.watched && (
          <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
            Watched
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold line-clamp-2 mb-2">{video.title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{video.channelName}</p>
        {category && (
          <div
            className="inline-block px-2 py-1 rounded-full text-xs font-medium text-white mb-3"
            style={{ backgroundColor: category.color }}
          >
            {category.name}
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1" onClick={onDelete}>
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
