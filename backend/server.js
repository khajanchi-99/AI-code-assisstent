import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --------------------------------------------------
// Gemini Configuration
// --------------------------------------------------

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = "gemini-3.8-flash";

// --------------------------------------------------
// System Prompt
// --------------------------------------------------

const SYSTEM_PROMPT = `
You are a Senior C++ Software Engineer and Code Reviewer.

Your job is to review the user's C++ code and provide professional,
actionable feedback.

Focus strictly on:

1. Memory leaks and pointer mismanagement.
2. Inefficient STL container usage.
3. Multithreading race conditions or deadlocks.
4. Modern C++ best practices (C++11/14/17/20).

Instructions:

- Identify actual problems in the code.
- Highlight the exact lines or code sections that need fixing.
- Explain the root cause.
- Explain why the problem matters.
- Provide corrected code when necessary.
- If the code is already correct, explicitly say so.
- Do not invent bugs.
- Format the response using Markdown.
- Do NOT write introductory fluff.
- Start directly with the code review.
`;

// --------------------------------------------------
// Gemini Request With Retry
// --------------------------------------------------

async function generateWithRetry(prompt, maxRetries = 3) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `Gemini request: attempt ${attempt + 1}/${maxRetries + 1}`
      );

      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
      });

      return response;
    } catch (error) {
      lastError = error;

      console.error(
        `Gemini attempt ${attempt + 1} failed:`,
        error?.status || error?.message
      );

      // Don't retry errors that are probably caused by
      // an invalid request/API key/etc.
      const status = error?.status;

      const retryable =
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504;

      if (!retryable) {
        throw error;
      }

      // Don't wait after the final attempt
      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff:
      // 1 second
      // 2 seconds
      // 4 seconds
      const delay = 1000 * Math.pow(2, attempt);

      console.log(`Retrying in ${delay / 1000} seconds...`);

      await new Promise((resolve) => {
        setTimeout(resolve, delay);
      });
    }
  }

  throw lastError;
}

// --------------------------------------------------
// Health Check
// --------------------------------------------------

app.get("/", (req, res) => {
  res.json({
    message: "AI Code Assistant Backend is running",
    model: MODEL,
  });
});

// --------------------------------------------------
// Code Review API
// --------------------------------------------------

app.post("/api/review", async (req, res) => {
  const { code } = req.body;

  // Validate request
  if (!code || typeof code !== "string") {
    return res.status(400).json({
      error: "No valid code provided",
    });
  }

  // Optional protection against extremely large requests
  if (code.length > 100000) {
    return res.status(413).json({
      error: "Code is too large",
    });
  }

  try {
    // Build prompt
    const promptContext = `
${SYSTEM_PROMPT}

Review this C++ code:

\`\`\`cpp
${code}
\`\`\`
`;

    // Call Gemini
    const response = await generateWithRetry(promptContext);

    // Get generated text
    const review = response.text;

    if (!review) {
      return res.status(500).json({
        error: "Gemini returned an empty response",
      });
    }

    // Send response to frontend
    res.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error("Gemini API Error:", error);

    const status = error?.status;

    // Handle common Gemini errors
    if (status === 429) {
      return res.status(429).json({
        error: "Gemini API rate limit reached. Please try again later.",
      });
    }

    if (status === 503) {
      return res.status(503).json({
        error:
          "Gemini is temporarily unavailable. Please try again in a few seconds.",
      });
    }

    if (status === 401 || status === 403) {
      return res.status(500).json({
        error:
          "Gemini API authentication failed. Check your GEMINI_API_KEY.",
      });
    }

    // Generic error
    res.status(500).json({
      error: "Failed to generate code review.",
    });
  }
});

// --------------------------------------------------
// Start Server
// --------------------------------------------------

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Gemini model: ${MODEL}`);
});