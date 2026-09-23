# AI Code Assistant

An AI-powered C++ code review assistant that analyzes source code and provides actionable feedback on memory management, STL usage, multithreading, and modern C++ best practices.

## Features

- AI-powered C++ code review
- Detects potential memory leaks and pointer mismanagement
- Identifies inefficient STL container usage
- Highlights possible multithreading race conditions and deadlocks
- Reviews code against modern C++ practices from C++11 to C++20
- Provides explanations of detected issues and their root causes
- Suggests corrected code when necessary
- Markdown-formatted review output
- React-based code editor interface
- Node.js + Express backend
- Gemini API integration
- Retry mechanism with exponential backoff
- CORS-enabled frontend/backend communication
- Environment-variable based API key configuration

## Tech Stack

### Frontend

- React.js
- JavaScript
- Vite
- CSS

### Backend

- Node.js
- Express.js
- JavaScript
- CORS
- dotenv

### AI

- Google Gemini API
- `@google/genai`

## Project Structure

```text
ai-code-assistant/
│
├── backend/
│   ├── node_modules/
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── frontend/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   └── CodeEditor.jsx
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## How It Works

The application follows this flow:

```text
User
  │
  ▼
React Frontend
  │
  │ C++ Source Code
  ▼
Express Backend
  │
  │ Review Request
  ▼
Google Gemini API
  │
  │ AI Code Analysis
  ▼
Express Backend
  │
  │ JSON Response
  ▼
React Frontend
  │
  ▼
Code Review
```

The frontend sends the user's C++ code to the backend through the `/api/review` endpoint. The backend builds a structured prompt and sends it to Gemini. The generated review is then returned to the frontend and displayed to the user.

## Backend API

### Health Check

```http
GET /
```

Example response:

```json
{
  "message": "AI Code Assistant Backend is running",
  "model": "gemini-3.8-flash"
}
```

### Code Review

```http
POST /api/review
```

Request body:

```json
{
  "code": "#include <iostream>\nint main() { ... }"
}
```

Successful response:

```json
{
  "success": true,
  "review": "## Code Review\n..."
}
```

### Error Responses

The backend handles common errors including:

- `400` — Invalid or missing code
- `413` — Code exceeds the configured size limit
- `429` — Gemini API rate limit
- `503` — Gemini service temporarily unavailable
- `401/403` — Authentication/API key problem
- `500` — Internal server or AI generation error

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ai-code-assistant.git
cd ai-code-assistant
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend` directory:

```env
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

Do not commit your `.env` file to GitHub.

### 4. Start the Backend

From the `backend` directory:

```bash
node server.js
```

The backend will run on:

```text
http://localhost:5000
```

### 5. Install Frontend Dependencies

Open another terminal:

```bash
cd frontend
npm install
```

### 6. Start the Frontend

```bash
npm run dev
```

Vite will provide a local development URL, usually:

```text
http://localhost:5173
```

## Gemini Configuration

The backend initializes Gemini using the API key stored in the environment:

```javascript
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
```

The application currently uses:

```text
gemini-3.8-flash
```

The model can be changed in `backend/server.js`.

## Code Review Criteria

The AI reviewer is instructed to focus on four major areas:

### 1. Memory Management

Examples:

- Memory leaks
- Incorrect use of `new` and `delete`
- Dangling pointers
- Double deletion
- Ownership problems
- Opportunities to use smart pointers

### 2. STL Usage

Examples:

- Inefficient container selection
- Unnecessary copies
- Poor lookup complexity
- Incorrect use of vectors, maps, sets, queues, etc.
- Opportunities to use references or move semantics

### 3. Multithreading

Examples:

- Race conditions
- Deadlocks
- Unsafe shared state
- Incorrect mutex usage
- Synchronization issues

### 4. Modern C++

Examples:

- RAII
- Smart pointers
- `const` correctness
- Range-based loops
- Move semantics
- `auto`
- `constexpr`
- STL algorithms
- C++11/14/17/20 practices

## Retry Mechanism

The backend includes retry handling for temporary Gemini API failures.

Retryable status codes include:

```text
429
500
502
503
504
```

The application uses exponential backoff:

```text
Attempt 1 → immediate
Attempt 2 → wait 1 second
Attempt 3 → wait 2 seconds
Attempt 4 → wait 4 seconds
```

This helps handle temporary rate limits and service interruptions without immediately failing the request.

## Security

- API keys are stored in environment variables.
- `.env` should not be committed to Git.
- The backend validates incoming code.
- Extremely large code submissions are rejected.
- Gemini API calls are performed from the backend so the API key is not exposed to the frontend.

Recommended `.gitignore` entries:

```gitignore
node_modules/
.env
dist/
```

## Future Improvements

- Syntax highlighting and language selection
- Support for Java, Python, and JavaScript
- Code quality scoring
- Complexity analysis
- Security vulnerability detection
- AI-generated optimized code
- Side-by-side original and corrected code
- Review history
- User authentication
- Downloadable code review reports
- Streaming AI responses
- GitHub repository/code review integration
- Automated test-case generation
- Static analysis integration with tools such as Clang-Tidy

## Example Use Case

A user submits:

```cpp
int* createArray() {
    int* arr = new int[100];
    return arr;
}
```

The AI reviewer can identify that the dynamically allocated memory requires explicit ownership management and recommend a safer modern C++ alternative such as `std::vector<int>` or an appropriate smart-pointer-based design.

## Development

Start both services during development:

```bash
# Terminal 1
cd backend
node server.js
```

```bash
# Terminal 2
cd frontend
npm run dev
```

Then open the frontend URL provided by Vite.

## License

This project is intended for educational and development purposes.

## Author

**Divyam Gupta**

Built as an AI-powered developer tool for improving C++ code quality and helping developers understand potential issues in their code.
