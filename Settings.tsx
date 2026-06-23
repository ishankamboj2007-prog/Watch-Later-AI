import { useState } from "react";
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
import { Plus, Trash2, Edit2, Grid3x3, List } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const { user } = useAuth();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#3B82F6");

  const { data: preferences, refetch: refetchPreferences } = trpc.settings.getPreferences.useQuery();
  const { data: categories, refetch: refetchCategories } = trpc.categories.list.useQuery();

  const updatePreferencesMutation = trpc.settings.updatePreferences.useMutation({
    onSuccess: () => {
      refetchPreferences();
      toast.success("Preferences updated");
    },
  });

  const createCategoryMutation = trpc.categories.create.useMutation({
    onSuccess: () => {
      refetchCategories();
      setNewCategoryName("");
      setNewCategoryColor("#3B82F6");
      toast.success("Category created");
    },
  });

  const deleteCategoryMutation = trpc.categories.delete.useMutation({
    onSuccess: () => {
      refetchCategories();
      toast.success("Category deleted");
    },
  });

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    createCategoryMutation.mutate({
      name: newCategoryName,
      color: newCategoryColor,
    });
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Display Preferences */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">Display Preferences</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Default View Mode</label>
                  <Select
                    value={preferences?.viewMode || "grid"}
                    onValueChange={(value) => {
                      updatePreferencesMutation.mutate({
                        viewMode: value as "grid" | "list",
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">
                        <div className="flex items-center gap-2">
                          <Grid3x3 className="w-4 h-4" />
                          Grid View
                        </div>
                      </SelectItem>
                      <SelectItem value="list">
                        <div className="flex items-center gap-2">
                          <List className="w-4 h-4" />
                          List View
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 mt-2">
                    Choose how videos are displayed on your dashboard
                  </p>
                </div>
              </div>
            </Card>

            {/* Category Management */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">Manage Categories</h2>

              <div className="space-y-6">
                {/* Add New Category */}
                <div className="p-4 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700">
                  <h3 className="font-semibold mb-4">Create New Category</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Category Name</label>
                      <Input
                        placeholder="e.g., Web Development"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-3 block">Color</label>
                      <div className="grid grid-cols-7 gap-2">
                        {colors.map((color) => (
                          <button
                            key={color}
                            className={`w-8 h-8 rounded-lg transition-transform ${
                              newCategoryColor === color ? "ring-2 ring-offset-2 scale-110" : ""
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setNewCategoryColor(color)}
                          />
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={handleAddCategory}
                      className="w-full"
                      disabled={createCategoryMutation.isPending}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Category
                    </Button>
                  </div>
                </div>

                {/* Existing Categories */}
                <div>
                  <h3 className="font-semibold mb-4">Your Categories</h3>
                  <div className="space-y-2">
                    {categories && categories.length > 0 ? (
                      categories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-800"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <div>
                              <p className="font-medium">{category.name}</p>
                              {category.isDefault && (
                                <p className="text-xs text-slate-500">System Category</p>
                              )}
                            </div>
                          </div>
                          {!category.isDefault && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteCategoryMutation.mutate({ id: category.id })}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-center py-4">No categories yet</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Profile */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Account</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Name</p>
                  <p className="font-medium">{user?.name || "User"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Email</p>
                  <p className="font-medium">{user?.email || "Not set"}</p>
                </div>
              </div>
            </Card>

            {/* Statistics */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Statistics</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Videos</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Categories</p>
                  <p className="text-2xl font-bold">{categories?.length || 0}</p>
                </div>
              </div>
            </Card>

            {/* Help */}
            <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Check out our documentation for tips and tricks.
              </p>
              <Button variant="outline" className="w-full" size="sm">
                View Docs
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
