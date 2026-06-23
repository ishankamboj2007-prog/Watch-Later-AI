import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Sparkles, Zap, Search, Tag, BarChart3 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold gradient-text">VideoVault AI</span>
          </div>
          <Button asChild>
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Your AI-Powered <span className="gradient-text">YouTube Library</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            Save, organize, and rediscover your YouTube videos with intelligent AI categorization,
            smart summaries, and semantic search. Never lose track of important content again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700">
              <a href={getLoginUrl()}>Get Started Free</a>
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Everything you need to master your video library
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <Tag className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI Auto-Categorization</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Videos are automatically organized into smart categories using advanced AI analysis.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI Summaries</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Get concise AI-generated summaries of each video to quickly understand content.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Semantic Search</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Find videos using natural language. Search understands meaning, not just keywords.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Quick Add</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Paste a YouTube URL and let AI handle the rest. Instant categorization and summaries.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Smart Organization</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Manage categories, filter by topic, and track watch status with ease.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Elegant Interface</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Beautiful, intuitive design with grid and list views for your video library.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Organize Your Videos?</h2>
          <p className="text-lg mb-8 text-blue-100">
            Start using VideoVault AI today. It's free and takes less than a minute to get started.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <a href={getLoginUrl()}>Get Started Now</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-8">
        <div className="container text-center text-slate-600 dark:text-slate-400">
          <p>&copy; 2026 VideoVault AI. Built with elegance and powered by AI.</p>
        </div>
      </footer>
    </div>
  );
}
