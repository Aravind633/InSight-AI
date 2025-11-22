import { useState, useEffect } from "react";
import {
  Search,
  TrendingUp,
  Zap,
  X,
  Loader2,
  ExternalLink,
  Sparkles,
} from "lucide-react";

const categories = [
  { name: "General", query: "general" },
  { name: "Business", query: "business" },
  { name: "Technology", query: "technology" },
  { name: "Sports", query: "sports" },
  { name: "Entertainment", query: "entertainment" },
  { name: "Health", query: "health" },
  { name: "Science", query: "science" },
  { name: "BBC News", query: "bbc" },
];

const captions = [
  "Smarter news, powered by AI.",
  "The future of news is here.",
  "Stay informed, stay ahead.",
];

function AnimatedCaption() {
  const [captionIndex, setCaptionIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCaptionIndex((prevIndex) => (prevIndex + 1) % captions.length);
        setIsFading(false);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <p
      className={`text-gray-400 text-sm transition-opacity duration-500 ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
    >
      {captions[captionIndex]}
    </p>
  );
}

function SummaryModal({
  article,
  onClose,
  onSummarize,
  summary,
  isSummarizing,
  summaryError,
}) {
  useEffect(() => {
    if (article && !summary && !isSummarizing && !summaryError) {
      onSummarize();
    }
  }, [article, summary, isSummarizing, summaryError, onSummarize]);

  if (!article) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-yellow-500/20 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-500/10 p-2 rounded-lg">
                <Sparkles className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Summary</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Powered by artificial intelligence
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors duration-200 p-2 hover:bg-white/5 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-300 line-clamp-2">
              {article.title}
            </p>
          </div>

          <div className="min-h-[200px]">
            {summary && !isSummarizing && (
              <div className="prose prose-invert max-w-none animate-fadeIn">
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {summary}
                </p>
              </div>
            )}

            {isSummarizing && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
                <span className="text-gray-400">Generating AI summary...</span>
              </div>
            )}

            {summaryError && !isSummarizing && (
              <div className="text-center py-12">
                <p className="text-red-400">{summaryError}</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-lg transition-all duration-200 border border-white/10"
            >
              <span>Read Full Article</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/20"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArticleCard({ article, onSummarizeClick }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageUrl =
    article.urlToImage ||
    "https://placehold.co/600x400/1a1a1a/ffd700?text=News";
  const description = article.description || "No description available.";
  const sourceName = article.source.name || "Unknown Source";

  return (
    <div className="group bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-lg overflow-hidden border border-gray-800 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/10 animate-fadeInUp">
      <div className="relative overflow-hidden h-52">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse"></div>
        )}
        <img
          src={imageUrl}
          alt={article.title}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.src =
              "https://placehold.co/600x400/1a1a1a/ffd700?text=Image+Not+Found";
            setImageLoaded(true);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute top-4 left-4">
          <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            {sourceName}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h2 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-yellow-500 transition-colors duration-200">
          {article.title}
        </h2>
        <p className="text-gray-400 text-sm mb-6 flex-grow line-clamp-3">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-auto">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
          >
            <span>Read Article</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={() => onSummarizeClick(article)}
            className="flex items-center justify-center space-x-2 flex-1 bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/30"
          >
            <Zap className="w-4 h-4" />
            <span>Summerize with AI</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCategory, setCurrentCategory] = useState("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [articleForSummary, setArticleForSummary] = useState(null);
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      let url = "";

      if (searchQuery) {
        url = `http://localhost:8000/api/search?q=${encodeURIComponent(
          searchQuery
        )}`;
      } else {
        url = `http://localhost:8000/api/news?category=${currentCategory}`;
      }

      try {
        const response = await fetch(url);
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setArticles(data.articles || []);
      } catch (err) {
        console.error("Failed to fetch news:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentCategory, searchQuery]);

  const handleSummarizeClick = (article) => {
    setArticleForSummary(article);
    setSummary("");
    setSummaryError("");
  };

  const handleCloseModal = () => {
    setArticleForSummary(null);
  };

  const handleDoSummary = async () => {
    if (!articleForSummary) return;

    setIsSummarizing(true);
    setSummaryError("");

    try {
      const response = await fetch("http://localhost:8000/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: articleForSummary.url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get summary");
      }
      setSummary(data.summary);
    } catch (err) {
      console.error("Failed to summarize:", err);
      setSummaryError(err.message);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setCurrentCategory("");
    setSearchQuery(searchInput);
  };

  const handleCategoryClick = (query) => {
    setSearchQuery("");
    setSearchInput("");
    setCurrentCategory(query);
  };

  function renderContent() {
    if (loading) {
      return (
        <div className="col-span-full flex justify-center items-center py-20">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
            <p className="text-gray-400 text-lg">Loading premium content...</p>
          </div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="col-span-full">
          <div className="bg-red-900/20 border border-red-500/50 text-red-300 px-6 py-4 rounded-xl backdrop-blur-sm">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">
              Could not fetch news. Ensure the backend server is running.
            </span>
          </div>
        </div>
      );
    }
    if (articles.length === 0) {
      return (
        <div className="col-span-full text-center py-20">
          <p className="text-gray-400 text-lg">No articles found.</p>
        </div>
      );
    }

    return articles.map((article, index) => (
      <ArticleCard
        key={article.url + index}
        article={article}
        onSummarizeClick={handleSummarizeClick}
      />
    ));
  }

  let headerText = "Top Headlines";
  if (searchQuery) {
    headerText = `Search Results for: "${searchQuery}"`;
  } else {
    const categoryObj = categories.find((c) => c.query === currentCategory);
    headerText = `${categoryObj ? categoryObj.name : "General"}`;
  }

  return (
    <div className="bg-black min-h-screen font-sans antialiased flex flex-col">
      <header className="bg-gradient-to-b from-gray-900 to-black border-b border-gray-800 sticky top-0 z-40 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-500 p-2 rounded-lg">
                <TrendingUp className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">InsightAI</h1>
                <AnimatedCaption />
              </div>
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors duration-200" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search for any topic..."
              className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/30"
            >
              Search
            </button>
          </form>
        </div>

        <nav className="border-t border-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex space-x-1 overflow-x-auto py-4 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category.query}
                  onClick={() => handleCategoryClick(category.query)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                    currentCategory === category.query && !searchQuery
                      ? "bg-yellow-500 text-black"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex items-center space-x-3 mb-8">
          <h2 className="text-3xl font-bold text-white">{headerText}</h2>
          {!searchQuery && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full">
              <span className="text-yellow-500 text-sm font-semibold">
                Trending
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderContent()}
        </div>
      </main>

      <footer className="bg-gray-900 border-t border-gray-800 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="bg-yellow-500 p-1.5 rounded">
                <TrendingUp className="w-4 h-4 text-black" />
              </div>
              <span className="text-white font-semibold">InsightAI</span>
            </div>
            <p className="text-gray-400 text-sm">
              &copy; 2025 InsightAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <SummaryModal
        article={articleForSummary}
        onClose={handleCloseModal}
        onSummarize={handleDoSummary}
        summary={summary}
        isSummarizing={isSummarizing}
        summaryError={summaryError}
      />
    </div>
  );
}

export default App;
