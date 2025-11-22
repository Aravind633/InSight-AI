// // Import necessary packages
// import express from "express";
// import axios from "axios";
// import cors from "cors";
// import dotenv from "dotenv";

// // Load environment variables from .env file
// dotenv.config();

// // Initialize the Express app
// const app = express();
// const PORT = process.env.PORT || 8000;

// // Get the API key from environment variables
// const apiKey = process.env.NEWSAPI_API_KEY;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Check if the API key is available
// if (!apiKey) {
//   console.error(
//     "FATAL ERROR: NEWSAPI_API_KEY is not defined in your .env file."
//   );
//   process.exit(1); // Exit the process with an error
// }

// /**
//  * @route GET /api/news
//  * @description Fetches top headlines from NewsAPI.org by category or source
//  * @query {string} category - The news category (e.g., general, bbc)
//  */
// app.get("/api/news", async (req, res) => {
//   // Get the category from the query string, default to 'general'
//   const query = req.query.category || "general";
//   let url;

//   if (query === "bbc") {
//     // User wants BBC news.
//     // We must use 'sources' and CANNOT use 'country' or 'category'.
//     url = `https://newsapi.org/v2/top-headlines?sources=bbc-news&apiKey=${apiKey}`;
//   } else {
//     // User wants news by category.
//     url = `https://newsapi.org/v2/top-headlines?country=us&category=${query}&apiKey=${apiKey}`;
//   }

//   try {
//     const response = await axios.get(url);
//     res.json(response.data);
//   } catch (error) {
//     console.error("Error fetching top headlines:", error.message);
//     res.status(500).json({ message: "Error fetching news from external API" });
//   }
// });

// /**
//  * NEW: @route GET /api/search
//  * @description Fetches articles from NewsAPI.org's /everything endpoint
//  * @query {string} q - The user's search query
//  */
// app.get("/api/search", async (req, res) => {
//   const searchQuery = req.query.q;

//   if (!searchQuery) {
//     return res.status(400).json({ message: "Search query (q) is required" });
//   }

//   // Construct the URL for the /everything endpoint
//   // We add sortBy=popularity and language=en for better results
//   const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
//     searchQuery
//   )}&sortBy=popularity&language=en&apiKey=${apiKey}`;

//   try {
//     const response = await axios.get(url);
//     res.json(response.data);
//   } catch (error) {
//     console.error("Error searching news:", error.message);
//     res.status(500).json({ message: "Error searching news from external API" });
//   }
// });

// // Start the server
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
//   console.log("Press CTRL+C to stop the server.");
// });

// Import necessary packages
import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai"; // NEW: Import Gemini
import * as cheerio from "cheerio"; // NEW: Import Cheerio for scraping

// Load environment variables from .env file
dotenv.config();

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Get the API keys from environment variables
const newsApiKey = process.env.NEWSAPI_API_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY; // NEW: Get Gemini Key

// Middleware
app.use(cors());
app.use(express.json()); // Make sure this is present to parse JSON request bodies

// --- NEW: Initialize Gemini AI Client ---
if (!geminiApiKey) {
  console.error(
    "FATAL ERROR: GEMINI_API_KEY is not defined in your .env file."
  );
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(geminiApiKey);
const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-preview-09-2025",
});

// Check for NewsAPI key
if (!newsApiKey) {
  console.error(
    "FATAL ERROR: NEWSAPI_API_KEY is not defined in your .env file."
  );
  process.exit(1);
}

// --- Existing News Routes ---

/**
 * @route GET /api/news
 * @description Fetches top headlines from NewsAPI.org by category or source
 */
app.get("/api/news", async (req, res) => {
  const query = req.query.category || "general";
  let url;

  if (query === "bbc") {
    url = `https://newsapi.org/v2/top-headlines?sources=bbc-news&apiKey=${newsApiKey}`;
  } else {
    url = `https://newsapi.org/v2/top-headlines?country=us&category=${query}&apiKey=${newsApiKey}`;
  }

  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching top headlines:", error.message);
    res.status(500).json({ message: "Error fetching news from external API" });
  }
});

/**
 * @route GET /api/search
 * @description Fetches articles from NewsAPI.org's /everything endpoint
 */
app.get("/api/search", async (req, res) => {
  // ... (same as before, no changes)
  const searchQuery = req.query.q;
  if (!searchQuery) {
    return res.status(400).json({ message: "Search query (q) is required" });
  }
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
    searchQuery
  )}&sortBy=popularity&language=en&apiKey=${newsApiKey}`;
  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error("Error searching news:", error.message);
    res.status(500).json({ message: "Error searching news from external API" });
  }
});

// --- NEW: AI Summarization Route ---

/**
 * @route POST /api/summarize
 * @description Scrapes text from a URL and summarizes it using Gemini AI
 * @body {string} url - The URL of the article to summarize
 */
app.post("/api/summarize", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ message: "Article URL is required" });
  }

  let articleText = "";

  // --- Step 1: Scrape the article text ---
  try {
    const { data } = await axios.get(url, {
      // Add a user-agent header to mimic a browser
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
      },
    });
    const $ = cheerio.load(data);

    // Extract text from all paragraph <p> tags
    $("p").each((i, elem) => {
      articleText += $(elem).text() + "\n\n";
    });

    if (!articleText) {
      // This can happen on sites that block scraping or use different HTML structures
      return res
        .status(500)
        .json({
          message:
            "Could not extract article text. The website might be blocking scrapers or has an unusual format.",
        });
    }
  } catch (scrapeError) {
    console.error("Error scraping URL:", scrapeError.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch article from URL." });
  }

  // --- Step 2: Summarize the text with Gemini AI ---
  try {
    // The prompt for the AI
    const systemPrompt =
      "You are an expert news summarizer. Your task is to take the following news article and provide a concise, easy-to-understand summary. The summary must be between 5 and 6 lines long.";
    const fullPrompt = `${systemPrompt}\n\nHere is the article:\n\n${articleText}`;

    // Call the Gemini API
    const result = await geminiModel.generateContent(fullPrompt);
    const response = result.response;
    const summary = response.text();

    // Send the summary back to the client
    res.json({ summary: summary });
  } catch (aiError) {
    console.error("Error from Gemini AI:", aiError.message);
    res.status(500).json({ message: "Failed to generate AI summary." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log("Press CTRL+C to stop the server.");
});
